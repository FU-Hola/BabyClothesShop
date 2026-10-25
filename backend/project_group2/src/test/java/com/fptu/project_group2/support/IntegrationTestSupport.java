package com.fptu.project_group2.support;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.sql.DriverManager;

@SpringBootTest(properties = "spring.config.import=")
@ActiveProfiles("test")
@AutoConfigureMockMvc
public abstract class IntegrationTestSupport {
    private static final Database DATABASE = startDatabase();

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::url);
        registry.add("spring.datasource.username", DATABASE::username);
        registry.add("spring.datasource.password", DATABASE::password);
    }

    private static Database startDatabase() {
        try {
            Database database;
            if ("embedded".equals(System.getProperty("test.database"))) {
                EmbeddedPostgres postgres = EmbeddedPostgres.builder().setPort(0).start();
                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    try {
                        postgres.close();
                    } catch (Exception exception) {
                        throw new IllegalStateException("Cannot stop test PostgreSQL", exception);
                    }
                }));
                database = new Database(postgres.getJdbcUrl("postgres", "postgres"), "postgres", "");
            } else {
                PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");
                postgres.start();
                database = new Database(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
            }
            try (var connection = DriverManager.getConnection(database.url(), database.username(), database.password());
                    var statement = connection.createStatement()) {
                statement.execute("CREATE SCHEMA shop");
            }
            return database;
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot start isolated PostgreSQL for tests", exception);
        }
    }

    private record Database(String url, String username, String password) {
    }
}
