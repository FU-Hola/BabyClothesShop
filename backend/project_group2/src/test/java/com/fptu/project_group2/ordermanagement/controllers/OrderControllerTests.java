package com.fptu.project_group2.ordermanagement.controllers;

import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.dto.response.OrderDetailResponse;
import com.fptu.project_group2.ordermanagement.services.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OrderControllerTests {
    private final OrderService service = mock(OrderService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new OrderController(service)).build();

    @Test
    void confirmReturnsUpdatedOrder() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.confirmOrder(id)).thenReturn(OrderDetailResponse.builder()
                .id(id.toString()).status("CONFIRMED").build());

        mvc.perform(patch("/api/v1/store-staff/orders/{id}/confirm", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }

    @Test
    void missingOrderReturns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.confirmOrder(id)).thenThrow(new NotFoundException("Order", "id", id));

        mvc.perform(patch("/api/v1/store-staff/orders/{id}/confirm", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void invalidOrderStateReturns409() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.confirmOrder(id)).thenThrow(new OrderConflictException("Invalid state"));

        mvc.perform(patch("/api/v1/store-staff/orders/{id}/confirm", id))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void malformedIdReturns400WithoutCallingService() throws Exception {
        mvc.perform(patch("/api/v1/store-staff/orders/invalid-id/confirm"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
