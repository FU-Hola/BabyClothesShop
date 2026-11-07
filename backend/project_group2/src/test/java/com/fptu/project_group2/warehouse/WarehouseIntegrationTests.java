package com.fptu.project_group2.warehouse;

import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class WarehouseIntegrationTests extends IntegrationTestSupport {
    @Autowired
    private MockMvc mvc;

    @Test
    void warehouseListsExecuteQueriesAndKeepOneBasedPagination() throws Exception {
        for (String path : new String[]{"/stocks", "/receipts", "/receipt-options/products", "/issues"}) {
            mvc.perform(get("/api/v1/warehouse-staff" + path)
                            .with(user("warehouse").roles("WAREHOUSE_STAFF")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.page").value(1))
                    .andExpect(jsonPath("$.data.items").isArray());
        }
    }

    @Test
    void customerCannotReadWarehouseLists() throws Exception {
        for (String path : new String[]{"/stocks", "/receipts", "/receipt-options/products", "/issues"}) {
            mvc.perform(get("/api/v1/warehouse-staff" + path)
                            .with(user("customer").roles("CUSTOMER")))
                    .andExpect(status().isForbidden());
        }
    }
}
