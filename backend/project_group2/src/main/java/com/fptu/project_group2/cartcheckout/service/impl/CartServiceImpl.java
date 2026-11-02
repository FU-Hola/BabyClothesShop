package com.fptu.project_group2.cartcheckout.service.impl;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.cartcheckout.dto.request.AddToCartRequest;
import com.fptu.project_group2.cartcheckout.dto.request.UpdateCartItemRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CartItemResponse;
import com.fptu.project_group2.cartcheckout.dto.response.CartResponse;
import com.fptu.project_group2.cartcheckout.entity.Cart;
import com.fptu.project_group2.cartcheckout.entity.CartItem;
import com.fptu.project_group2.cartcheckout.repository.CartItemRepository;
import com.fptu.project_group2.cartcheckout.repository.CartRepository;
import com.fptu.project_group2.cartcheckout.service.ICartService;
import com.fptu.project_group2.cartcheckout.service.IStockService;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements ICartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final IStockService stockService;

    @Override
    @Transactional
    public CartResponse getCart(UUID customerId) {
        User customer = getOrCreateCustomer(customerId);
        Cart cart = getOrCreateCart(customer);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(UUID customerId, AddToCartRequest request) {
        User customer = getOrCreateCustomer(customerId);
        Cart cart = getOrCreateCart(customer);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy biến thể sản phẩm yêu cầu"));

        if (!variant.isActive()) {
            throw new BadRequestException("Biến thể sản phẩm này hiện không còn kinh doanh");
        }

        long availableStock = stockService.getAvailableStock(variant.getId());
        if (availableStock <= 0) {
            throw new BadRequestException("Sản phẩm đã hết hàng");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElse(null);

        int targetQuantity = request.getQuantity();
        if (existingItem != null) {
            targetQuantity = existingItem.getQuantity() + request.getQuantity();
        }

        if (targetQuantity > availableStock) {
            throw new BadRequestException("Số lượng yêu cầu (" + targetQuantity
                    + ") vượt quá số lượng có thể bán (hiện còn " + availableStock + " sản phẩm)");
        }

        if (existingItem != null) {
            existingItem.setQuantity(targetQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(targetQuantity);
            cart.addCartItem(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(UUID customerId, UUID cartItemId, UpdateCartItemRequest request) {
        User customer = getOrCreateCustomer(customerId);
        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm không thuộc giỏ hàng của bạn");
        }

        long availableStock = stockService.getAvailableStock(item.getVariant().getId());
        if (request.getQuantity() > availableStock) {
            throw new BadRequestException("Số lượng yêu cầu (" + request.getQuantity()
                    + ") vượt quá số lượng có thể bán (hiện còn " + availableStock + " sản phẩm)");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(UUID customerId, UUID cartItemId) {
        User customer = getOrCreateCustomer(customerId);
        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm không thuộc giỏ hàng của bạn");
        }

        cartItemRepository.delete(item);
        cart.getItems().remove(item);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(UUID customerId) {
        User customer = getOrCreateCustomer(customerId);
        Cart cart = getOrCreateCart(customer);
        cartItemRepository.deleteAllByCartId(cart.getId());
        cart.getItems().clear();
    }

    public User getOrCreateCustomer(UUID customerId) {
        if (customerId != null) {
            return userRepository.findById(customerId)
                    .orElseGet(this::resolveDefaultCustomer);
        }
        return resolveDefaultCustomer();
    }

    private User resolveDefaultCustomer() {
        return userRepository.findFirstByRole(UserRole.CUSTOMER)
                .orElseGet(() -> {
                    User demo = new User();
                    demo.setEmail("customer.demo@shop.com");
                    demo.setPasswordHash("demo123");
                    demo.setFullName("Khách Hàng Mặc Định");
                    demo.setPhone("0987654321");
                    demo.setRole(UserRole.CUSTOMER);
                    demo.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(demo);
                });
    }

    private Cart getOrCreateCart(User customer) {
        return cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomer(customer);
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : items) {
            ProductVariant variant = item.getVariant();
            Product product = variant.getProduct();
            long availableStock = stockService.getAvailableStock(variant.getId());

            String imageUrl = product.getImages().stream()
                    .min(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(ProductImage::getImageUrl)
                    .orElse(null);

            BigDecimal subtotal = variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalPrice = totalPrice.add(subtotal);
            totalItems += item.getQuantity();

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .variantId(variant.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .sku(variant.getSku())
                    .color(variant.getColor())
                    .size(variant.getSize())
                    .price(variant.getPrice())
                    .originalPrice(variant.getOriginalPrice())
                    .imageUrl(imageUrl)
                    .quantity(item.getQuantity())
                    .availableStock(availableStock)
                    .subtotal(subtotal)
                    .build());
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}
