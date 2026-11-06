package com.fptu.project_group2.cartcheckout.service;

import com.fptu.project_group2.cartcheckout.dto.request.AddToCartRequest;
import com.fptu.project_group2.cartcheckout.dto.request.UpdateCartItemRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CartResponse;

import java.util.UUID;

public interface ICartService {
    CartResponse getCart(UUID customerId);

    CartResponse addToCart(UUID customerId, AddToCartRequest request);

    CartResponse updateCartItem(UUID customerId, UUID cartItemId, UpdateCartItemRequest request);

    CartResponse removeCartItem(UUID customerId, UUID cartItemId);

    void clearCart(UUID customerId);
}

