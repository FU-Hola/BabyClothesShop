package com.fptu.project_group2.entity;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.entity.AuthSession;
import com.fptu.project_group2.common.entity.BaseEntity;
import com.fptu.project_group2.cartcheckout.entity.Cart;
import com.fptu.project_group2.cartcheckout.entity.CartItem;
import com.fptu.project_group2.catalogstock.entity.Category;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.warehouse.entity.*;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.Test;

import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.*;

class DomainEntityMappingTests {

    @Test
    void allEntitiesBootstrapAndGeneratePostgresConstraintsWithoutDatabaseAccess() {
        var ddl = new StringWriter();
        var registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", false)
                .applySetting("hibernate.hbm2ddl.auto", "none")
                .applySetting("hibernate.physical_naming_strategy",
                        "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy")
                .applySetting("hibernate.cache.use_second_level_cache", false)
                .applySetting("jakarta.persistence.schema-generation.database.action", "none")
                .applySetting("jakarta.persistence.schema-generation.scripts.action", "create")
                .applySetting("jakarta.persistence.schema-generation.scripts.create-target", ddl)
                .build();
        try {
            var sources = new MetadataSources(registry);
            for (var type : new Class<?>[]{User.class, AuthSession.class, Category.class, Product.class,
                    ProductVariant.class, ProductImage.class, Cart.class, CartItem.class,
                    Order.class, OrderItem.class, GoodsIssue.class, GoodsIssueItem.class,
                    GoodsReceipt.class, GoodsReceiptItem.class, Inventory.class}) {
                sources.addAnnotatedClass(type);
            }
            var metadata = sources.buildMetadata();
            try (var factory = metadata.buildSessionFactory()) {
                assertEquals(15, factory.getMetamodel().getEntities().size());
                for (var entity : factory.getMetamodel().getEntities()) {
                    assertTrue(BaseEntity.class.isAssignableFrom(entity.getJavaType()));
                    for (var attribute : new String[]{"id", "createdAt", "updatedAt"}) {
                        assertEquals(BaseEntity.class,
                                entity.getAttribute(attribute).getJavaMember().getDeclaringClass());
                    }
                }
                var sql = ddl.toString().toLowerCase();
                assertTrue(sql.contains("customer_id uuid not null unique"), sql);
                assertTrue(sql.contains("order_id uuid not null unique"), sql);
                assertTrue(sql.contains("order_item_id uuid not null unique"), sql);
                assertTrue(sql.contains("unique (cart_id, variant_id)"), sql);
                assertTrue(sql.contains("foreign key (variant_id) references product_variants"), sql);
                assertTrue(sql.contains("foreign key (created_by) references users"), sql);
                assertTrue(sql.contains("quantity > 0"), sql);
                assertTrue(sql.contains("picked_quantity >= 0"), sql);
                assertTrue(sql.contains("numeric(19,2)"), sql);
                assertTrue(sql.contains("id uuid"), sql);
                assertNotNull(metadata.getEntityBinding(Order.class.getName()).getVersion());
                assertNotNull(metadata.getEntityBinding(GoodsIssue.class.getName()).getVersion());
            }
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    void aggregateHelpersSetOwningSideAndPreventAccidentalReparenting() {
        var product = new Product();
        var variant = new ProductVariant();
        var image = new ProductImage();
        product.addProductVariant(variant);
        product.addProductImage(image);
        assertSame(product, variant.getProduct());
        assertSame(product, image.getProduct());
        assertThrows(IllegalArgumentException.class, () -> new Product().addProductVariant(variant));

        var cart = new Cart();
        var cartItem = new CartItem();
        cart.addCartItem(cartItem);
        cart.addCartItem(cartItem);
        assertSame(cart, cartItem.getCart());
        assertEquals(1, cart.getItems().size());
        assertThrows(IllegalArgumentException.class, () -> new Cart().addCartItem(cartItem));

        var order = new Order();
        var orderItem = new OrderItem();
        order.addOrderItem(orderItem);
        assertSame(order, orderItem.getOrder());
        assertThrows(IllegalArgumentException.class, () -> new Order().addOrderItem(orderItem));

        var issue = new GoodsIssue();
        var issueItem = new GoodsIssueItem();
        issue.addGoodsIssueItem(issueItem);
        assertSame(issue, issueItem.getGoodsIssue());
        assertThrows(IllegalArgumentException.class, () -> new GoodsIssue().addGoodsIssueItem(issueItem));
        assertThrows(NullPointerException.class, () -> issue.addGoodsIssueItem(null));
    }
}
