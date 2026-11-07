package com.fptu.project_group2.cartcheckout.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart")
public class CartController {

    private final ICartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        CartResponse cart = cartService.getCart(principal.id());
        return ResponseBuilder.ok(cart, "Lấy giỏ hàng thành công");
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(principal.id(), request);
        return ResponseBuilder.ok(cart, "Thêm sản phẩm vào giỏ hàng thành công");
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable UUID cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateCartItem(principal.id(), cartItemId, request);
        return ResponseBuilder.ok(cart, "Cập nhật số lượng sản phẩm thành công");
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable UUID cartItemId) {
        CartResponse cart = cartService.removeCartItem(principal.id(), cartItemId);
        return ResponseBuilder.ok(cart, "Đã xóa sản phẩm khỏi giỏ hàng");
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        cartService.clearCart(principal.id());
        return ResponseBuilder.ok(null, "Đã làm rỗng giỏ hàng");
    }
}
