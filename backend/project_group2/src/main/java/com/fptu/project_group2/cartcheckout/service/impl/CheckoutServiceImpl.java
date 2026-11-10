package com.fptu.project_group2.cartcheckout.service.impl;

import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;
import com.fptu.project_group2.cartcheckout.repository.CartItemRepository;
import com.fptu.project_group2.cartcheckout.repository.CartRepository;
import com.fptu.project_group2.cartcheckout.service.ICheckoutService;
import com.fptu.project_group2.cartcheckout.service.CheckoutExpiryService;
import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.ordermanagement.common.*;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.service.InventoryReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements ICheckoutService {
    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final OrderRepository orders;
    private final CartServiceImpl cartService;
    private final InventoryReservationService reservations;
    private final CheckoutExpiryService expiry;
    private final JdbcTemplate jdbc;
    @Value("${app.checkout.hold-seconds:600}") private long holdSeconds;

    /** Legacy /validate now creates an immutable checkout and reserves its stock. */
    @Override
    @Transactional
    public CheckoutValidationResponse validateCheckout(UUID customerId, CheckoutRequest request) {
        var customer=cartService.requireCustomer(customerId);
        var cart=carts.findByCustomerIdForUpdate(customerId)
                .orElseThrow(() -> new BadRequestException("Giỏ hàng đang trống"));
        if(!Objects.equals(request.getCartRevision(),cart.getRevision()))
            throw conflict("Giỏ hàng đã thay đổi. Vui lòng tải lại trước khi đặt hàng.");
        expiry.expireForCart(cart.getId());
        var previous=orders.findByCartIdAndCartRevisionForUpdate(cart.getId(),cart.getRevision()).orElse(null);
        if(previous!=null) {
            // Lock after cart, just like payment. A different key cannot duplicate this revision.
            if(previous.getStatus()==OrderStatus.PENDING_PAYMENT) {
                if(!Objects.equals(previous.getReceiverName(),request.getReceiverName().strip())
                    || !Objects.equals(previous.getReceiverPhone(),request.getReceiverPhone().strip())
                    || !Objects.equals(previous.getReceiverAddress(),request.getReceiverAddress().strip())
                    || !Objects.equals(previous.getCustomerNote(),note(request.getCustomerNote())))
                    throw conflict("Đã có phiên thanh toán cho giỏ này. Hủy phiên cũ trước khi đổi thông tin.");
                return validation(previous);
            }
            if(previous.getPaymentStatus()==PaymentStatus.PAID) throw conflict("Giỏ hàng này đã được đặt; tải lại giỏ hàng");
            cart.setRevision(Math.addExact(cart.getRevision(),1L));
        }
        var items=cartItems.findByCartId(cart.getId());
        if(items.isEmpty() || items.size()>200) throw new BadRequestException("Giỏ hàng phải có từ 1 đến 200 SKU");
        if(holdSeconds<1 || holdSeconds>86400) throw new IllegalStateException("Invalid checkout hold-seconds");
        var order=new Order();
        order.setCustomer(customer);
        order.setCartId(cart.getId());
        order.setCartRevision(cart.getRevision());
        order.setCheckoutKey(UUID.randomUUID().toString());
        Long number=jdbc.queryForObject("SELECT nextval('shop.order_code_seq')",Long.class);
        order.setOrderCode(String.format(Locale.ROOT,"ORD-%012d",number));
        order.setReceiverName(request.getReceiverName().strip());
        order.setReceiverPhone(request.getReceiverPhone().strip());
        order.setReceiverAddress(request.getReceiverAddress().strip());
        order.setCustomerNote(note(request.getCustomerNote()));
        order.setShippingFee(BigDecimal.ZERO);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setPaymentMethod(PaymentMethod.SIMULATED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setPaymentExpiresAt(reservations.now().plusSeconds(holdSeconds));
        for(var item:items) {
            var variant=item.getVariant();
            var product=variant.getProduct();
            if(!variant.isActive() || product.getStatus()!=ProductStatus.ACTIVE || item.getQuantity()<=0)
                throw new BadRequestException("SKU không còn kinh doanh hoặc số lượng không hợp lệ: "+variant.getSku());
            var line=new OrderItem();
            line.setVariant(variant);
            line.setQuantity(item.getQuantity());
            line.setUnitPrice(variant.getPrice());
            line.setProductNameSnapshot(product.getName());
            line.setSkuSnapshot(variant.getSku());
            line.setColorSnapshot(variant.getColor());
            line.setSizeSnapshot(variant.getSize());
            line.setImageUrlSnapshot(product.getImages().stream().min(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(ProductImage::getImageUrl).orElse(null));
            order.addOrderItem(line);
        }
        orders.saveAndFlush(order);
        reservations.hold(order);
        return validation(order);
    }

    @Override
    @Transactional
    public OrderResultResponse simulatePayment(UUID customerId, SimulatePaymentRequest request) {
        cartService.requireCustomer(customerId);
        // Cart precedes order in every path that needs both; ownership is checked before taking a cart lock.
        requireCheckoutOwner(customerId,request.getCheckoutKey());
        var cart=carts.findByCustomerIdForUpdate(customerId).orElseThrow();
        var order=orders.findByCheckoutKeyForUpdate(request.getCheckoutKey()).orElseThrow();
        if(order.getStatus()!=OrderStatus.PENDING_PAYMENT) return result(order,"Phiên thanh toán đã được xử lý.");
        if(expiry.expireLocked(order)) return result(order,"Đã hết thời gian giữ hàng. Vui lòng tạo đơn mới.");
        if(!Objects.equals(cart.getId(),order.getCartId()) || cart.getRevision()!=order.getCartRevision())
            throw conflict("Phiên checkout không khớp giỏ hàng");
        if(!Boolean.TRUE.equals(request.getIsSuccess())) {
            cancelLocked(order,"Thanh toán mô phỏng thất bại");
            order.setPaymentStatus(PaymentStatus.FAILED);
            return result(order,"Thanh toán thất bại; hàng đã được giải phóng, giỏ hàng vẫn giữ nguyên.");
        }
        reservations.commit(order);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaidAt(reservations.now());
        order.setStatus(OrderStatus.PENDING_CONFIRMATION);
        cartItems.deleteAllByCartId(cart.getId());
        cart.getItems().clear();
        cart.setRevision(Math.addExact(cart.getRevision(),1L));
        return result(order,"Thanh toán mô phỏng thành công. Đơn hàng đang chờ xác nhận.");
    }

    @Override
    @Transactional
    public OrderResultResponse cancelCheckout(UUID customerId,String key) {
        cartService.requireCustomer(customerId);
        requireCheckoutOwner(customerId,key);
        carts.findByCustomerIdForUpdate(customerId).orElseThrow();
        var order=orders.findByCheckoutKeyForUpdate(key).orElseThrow();
        if(order.getStatus()==OrderStatus.CANCELLED || order.getStatus()==OrderStatus.EXPIRED)
            return result(order,"Phiên thanh toán đã kết thúc.");
        if(order.getStatus()!=OrderStatus.PENDING_PAYMENT) throw conflict("Không thể hủy phiên đã thanh toán");
        if(!expiry.expireLocked(order)) cancelLocked(order,"Khách hàng hủy phiên thanh toán");
        return result(order,"Đã hủy phiên thanh toán và giải phóng hàng.");
    }

    @Override
    @Transactional(readOnly=true)
    public OrderResultResponse getCheckout(UUID customerId,String key) {
        cartService.requireCustomer(customerId);
        return result(owned(customerId,key),"Thông tin phiên thanh toán");
    }

    private void requireCheckoutOwner(UUID customerId,String key) {
        var owners=jdbc.queryForList("SELECT customer_id FROM shop.orders WHERE checkout_key=?",UUID.class,key);
        if(owners.isEmpty()) throw new BadRequestException("Không tìm thấy phiên thanh toán");
        if(!owners.get(0).equals(customerId)) throw new BaseBusinessException(ErrorCode.ACCESS_DENIED);
    }

    private Order owned(UUID customerId,String key) {
        var order=orders.findByCheckoutKey(key).orElseThrow(() -> new BadRequestException("Không tìm thấy phiên thanh toán"));
        if(!order.getCustomer().getId().equals(customerId)) throw new BaseBusinessException(ErrorCode.ACCESS_DENIED);
        return order;
    }

    private void cancelLocked(Order order,String reason) {
        reservations.release(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledBy(order.getCustomer());
        order.setCancelledAt(reservations.now());
        order.setCancellationReason(reason);
    }

    private BigDecimal subtotal(Order order) {
        return order.getItems().stream().map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO,BigDecimal::add);
    }

    private CheckoutValidationResponse validation(Order order) {
        return CheckoutValidationResponse.builder().isValid(true).checkoutKey(order.getCheckoutKey())
                .paymentExpiresAt(order.getPaymentExpiresAt()).orderId(order.getId()).orderCode(order.getOrderCode())
                .receiverName(order.getReceiverName()).receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress()).customerNote(order.getCustomerNote())
                .totalItems(order.getItems().stream().mapToInt(OrderItem::getQuantity).sum())
                .subtotal(subtotal(order)).shippingFee(order.getShippingFee())
                .totalAmount(subtotal(order).add(order.getShippingFee())).outOfStockItems(List.of()).build();
    }

    private OrderResultResponse result(Order order,String message) {
        return OrderResultResponse.builder().success(order.getPaymentStatus()==PaymentStatus.PAID)
                .orderId(order.getId()).orderCode(order.getOrderCode()).checkoutKey(order.getCheckoutKey())
                .paymentExpiresAt(order.getPaymentExpiresAt()).orderStatus(order.getStatus()).paymentStatus(order.getPaymentStatus())
                .totalAmount(subtotal(order).add(order.getShippingFee())).receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone()).receiverAddress(order.getReceiverAddress())
                .createdAt(order.getCreatedAt()).serverTime(reservations.now()).message(message).build();
    }
    private String note(String value) { return value==null || value.isBlank()?null:value.strip(); }
    private BaseBusinessException conflict(String value) { return new BaseBusinessException(ErrorCode.CONFLICT,value); }
}
