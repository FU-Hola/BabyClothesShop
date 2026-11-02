package com.fptu.project_group2.cartcheckout.controller;

import com.fptu.project_group2.cartcheckout.dto.request.AddToCartRequest;
import com.fptu.project_group2.cartcheckout.dto.request.UpdateCartItemRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CartResponse;
import com.fptu.project_group2.cartcheckout.service.ICartService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart")
public class CartController {

    private final ICartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId) {
        CartResponse cart = cartService.getCart(customerId);
        return ResponseBuilder.ok(cart, "Lấy giỏ hàng thành công");
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(customerId, request);
        return ResponseBuilder.ok(cart, "Thêm sản phẩm vào giỏ hàng thành công");
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId,
            @PathVariable UUID cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateCartItem(customerId, cartItemId, request);
        return ResponseBuilder.ok(cart, "Cập nhật số lượng sản phẩm thành công");
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId,
            @PathVariable UUID cartItemId) {
        CartResponse cart = cartService.removeCartItem(customerId, cartItemId);
        return ResponseBuilder.ok(cart, "Đã xóa sản phẩm khỏi giỏ hàng");
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId) {
        cartService.clearCart(customerId);
        return ResponseBuilder.ok(null, "Đã làm rỗng giỏ hàng");
    }
}
