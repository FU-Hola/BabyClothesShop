package com.fptu.project_group2.cartcheckout.service.impl;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;
import com.fptu.project_group2.cartcheckout.dto.response.StockCheckItemResponse;
import com.fptu.project_group2.cartcheckout.entity.Cart;
import com.fptu.project_group2.cartcheckout.entity.CartItem;
import com.fptu.project_group2.cartcheckout.repository.CartItemRepository;
import com.fptu.project_group2.cartcheckout.repository.CartRepository;
import com.fptu.project_group2.cartcheckout.service.ICheckoutService;
import com.fptu.project_group2.cartcheckout.service.IStockService;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.PaymentMethod;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.repository.OrderItemRepository;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements ICheckoutService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final IStockService stockService;
    private final CartServiceImpl cartService;

    @Override
    @Transactional(readOnly = true)
    public CheckoutValidationResponse validateCheckout(UUID customerId, CheckoutRequest request) {
        User customer = cartService.requireCustomer(customerId);
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Giỏ hàng của bạn đang trống"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống, không thể thực hiện đặt hàng");
        }

        List<StockCheckItemResponse> outOfStockItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cartItems) {
            ProductVariant variant = item.getVariant();
            Product product = variant.getProduct();
            long available = stockService.getAvailableStock(variant.getId());

            subtotal = subtotal.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            totalItems += item.getQuantity();

            if (item.getQuantity() > available) {
                outOfStockItems.add(StockCheckItemResponse.builder()
                        .variantId(variant.getId())
                        .productName(product.getName())
                        .size(variant.getSize())
                        .color(variant.getColor())
                        .requestedQuantity(item.getQuantity())
                        .availableStock(available)
                        .isAvailable(false)
                        .message("Sản phẩm " + product.getName() + " (" + variant.getSize()
                                + ") chỉ còn " + available + " sản phẩm có thể bán.")
                        .build());
            }
        }

        boolean isValid = outOfStockItems.isEmpty();
        String checkoutKey = UUID.randomUUID().toString();
        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(shippingFee);

        return CheckoutValidationResponse.builder()
                .isValid(isValid)
                .checkoutKey(checkoutKey)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .receiverAddress(request.getReceiverAddress())
                .customerNote(request.getCustomerNote())
                .totalItems(totalItems)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .outOfStockItems(outOfStockItems)
                .build();
    }

    @Override
    @Transactional
    public OrderResultResponse simulatePayment(UUID customerId, SimulatePaymentRequest request) {
        User customer = cartService.requireCustomer(customerId);

        // Trường hợp 1: Khách hàng chọn "Thanh toán thất bại"
        if (!Boolean.TRUE.equals(request.getIsSuccess())) {
            return OrderResultResponse.builder()
                    .success(false)
                    .checkoutKey(request.getCheckoutKey())
                    .message(
                            "Thanh toán mô phỏng thất bại. Đơn hàng chưa được tạo và giỏ hàng của bạn vẫn được giữ nguyên.")
                    .build();
        }

        // Kiểm tra xem checkoutKey này đã được tạo đơn trước đó chưa (idempotency
        // check)
        Optional<Order> existingOrder = orderRepository.findByCheckoutKey(request.getCheckoutKey());
        if (existingOrder.isPresent()) {
            Order o = existingOrder.get();
            if (!o.getCustomer().getId().equals(customer.getId())) {
                throw new BaseBusinessException(
                        ErrorCode.ACCESS_DENIED,
                        "Bạn không có quyền xem đơn hàng này");
            }
            return mapToOrderResultResponse(o, "Đơn hàng này đã được thanh toán thành công trước đó.");
        }

        // Trường hợp 2: Khách hàng chọn "Thanh toán thành công"
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Giỏ hàng của bạn đang trống"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống, không thể thanh toán");
        }

        // Kiểm tra lại tồn kho có thể bán một lần nữa trước khi tạo đơn và giữ hàng
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getVariant();
            long available = stockService.getAvailableStock(variant.getId());
            if (item.getQuantity() > available) {
                throw new BadRequestException("Rất tiếc, sản phẩm " + variant.getProduct().getName()
                        + " (" + variant.getSize() + ") hiện chỉ còn " + available
                        + " sản phẩm có thể bán. Vui lòng điều chỉnh lại giỏ hàng.");
            }
        }

        // Tạo Đơn hàng mới
        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setCustomer(customer);
        order.setCheckoutKey(request.getCheckoutKey());
        order.setReceiverName(request.getReceiverName() != null ? request.getReceiverName() : customer.getFullName());
        order.setReceiverPhone(request.getReceiverPhone() != null ? request.getReceiverPhone() : customer.getPhone());
        order.setReceiverAddress(
                request.getReceiverAddress() != null ? request.getReceiverAddress() : "Địa chỉ mặc định");
        order.setCustomerNote(request.getCustomerNote());
        order.setShippingFee(BigDecimal.ZERO);
        order.setStatus(OrderStatus.PENDING_CONFIRMATION);
        order.setPaymentMethod(PaymentMethod.SIMULATED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaidAt(Instant.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            ProductVariant variant = item.getVariant();
            Product product = variant.getProduct();

            String imageUrl = product.getImages().stream()
                    .min(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(ProductImage::getImageUrl)
                    .orElse(null);

            OrderItem orderItem = new OrderItem();
            orderItem.setVariant(variant);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(variant.getPrice());
            orderItem.setProductNameSnapshot(product.getName());
            orderItem.setSkuSnapshot(variant.getSku());
            orderItem.setColorSnapshot(variant.getColor());
            orderItem.setSizeSnapshot(variant.getSize());
            orderItem.setImageUrlSnapshot(imageUrl);

            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Lưu đơn hàng và các order_items (đơn PENDING_CONFIRMATION sẽ giữ hàng tự
        // động)
        Order savedOrder = orderRepository.save(order);
        for (OrderItem oi : order.getItems()) {
            orderItemRepository.save(oi);
        }

        // Xóa giỏ hàng sau khi đặt thành công theo đúng spec UC12
        cartItemRepository.deleteAllByCartId(cart.getId());

        return mapToOrderResultResponse(savedOrder,
                "Đặt hàng và thanh toán mô phỏng thành công! Đơn hàng đang chờ cửa hàng xác nhận.");
    }

    private OrderResultResponse mapToOrderResultResponse(Order order, String message) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        total = total.add(order.getShippingFee());

        return OrderResultResponse.builder()
                .success(true)
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .checkoutKey(order.getCheckoutKey())
                .orderStatus(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(total)
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress())
                .createdAt(order.getCreatedAt())
                .message(message)
                .build();
    }

    private String generateOrderCode() {
        return "ORD-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 900 + 100);
    }
}
