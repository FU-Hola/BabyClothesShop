# Database migrations

Add reviewed migrations as V1__description.sql, V2__description.sql, etc.
Use the shop schema. Flyway runs as baby_clothes_migrator; the runtime
role baby_clothes_app receives DML privileges through default privileges.
Do not edit applied migrations or use Hibernate update/create in production.
No business tables are invented here; implement the agreed domain model first.
