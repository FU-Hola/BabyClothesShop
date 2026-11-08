package com.fptu.project_group2.catalogstock;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.catalogstock.dto.response.CloudinaryUploadResponse;
import com.fptu.project_group2.catalogstock.entity.Category;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.catalogstock.repository.CategoryRepository;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.catalogstock.service.impl.CloudinaryService;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.support.IntegrationTestSupport;
import com.fptu.project_group2.warehouse.common.PackagingType;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CreateGoodsIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.ExportIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueVersionRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.PackIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.UpdatePickingRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptDetailResponse;
import com.fptu.project_group2.warehouse.service.IGoodsIssue;
import com.fptu.project_group2.warehouse.service.IGoodsReceipt;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CatalogStockIntegrationTests extends IntegrationTestSupport {
    private static final String PRODUCTS = "/api/v1/store-staff/products";
    private static final String STOCKS = "/api/v1/warehouse-staff/stocks";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private IGoodsReceipt goodsReceiptService;
    @Autowired
    private IGoodsIssue goodsIssueService;
    @Autowired
    private JdbcTemplate jdbc;
    @MockitoBean
    private CloudinaryService cloudinaryService;

    private AuthenticatedUser storeStaff;
    private AuthenticatedUser warehouseStaff;
    private User customer;
    private UUID categoryId;

    @DynamicPropertySource
    static void useShopSchema(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.hikari.connection-init-sql", () -> "SET search_path TO shop");
    }

    @BeforeEach
    void setUp() {
        storeStaff = AuthenticatedUser.from(saveUser(UserRole.STORE_STAFF));
        warehouseStaff = AuthenticatedUser.from(saveUser(UserRole.WAREHOUSE_STAFF));
        customer = saveUser(UserRole.CUSTOMER);

        String suffix = randomCode();
        Category category = new Category();
        category.setName("Danh mục " + suffix);
        category.setSlug("danh-muc-" + suffix);
        categoryId = categoryRepository.save(category).getId();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void publicCatalogReturnsOrderedImagesWithTheirColors() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo có thư viện ảnh",
                newVariant(sku + "-RED", "Đỏ", "S", 199000),
                newVariant(sku + "-BLUE", "Xanh", "S", 199000)));
        for (int sortOrder : new int[]{2, 0, 1, 3}) {
            jdbc.update("""
                    INSERT INTO shop.product_images (id, product_id, image_url, color, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                    """, UUID.randomUUID(), productId, "/images/test-" + sortOrder + ".jpg",
                    sortOrder == 3 ? "Xanh" : "Đỏ", sortOrder);
        }

        mvc.perform(get("/api/v1/catalog/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageUrl").value("/images/test-0.jpg"))
                .andExpect(jsonPath("$.data.images.length()").value(4))
                .andExpect(jsonPath("$.data.images[0].imageUrl").value("/images/test-0.jpg"))
                .andExpect(jsonPath("$.data.images[1].sortOrder").value(1))
                .andExpect(jsonPath("$.data.images[2].color").value("Đỏ"))
                .andExpect(jsonPath("$.data.images[3].color").value("Xanh"));
    }

    @Test
    void createProductIsActiveAndEverySkuStartsWithZeroStock() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo cotton",
                newVariant(sku + "-1", "Đỏ", "M", 150000),
                newVariant(sku + "-2", "Đỏ", "L", 160000)));

        mvc.perform(get(PRODUCTS + "/" + productId).with(user(storeStaff)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.variants.length()").value(2));

        assertEquals(0L, stockOf(sku + "-1"));
        assertEquals(0L, stockOf(sku + "-2"));

        mvc.perform(get(STOCKS).param("keyword", sku + "-1").with(user(warehouseStaff)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].quantity").value(0))
                .andExpect(jsonPath("$.data.items[0].stockStatus").value("OUT_OF_STOCK"));
    }

    @Test
    void createProductReturnsVietnameseErrorForEachField() throws Exception {
        String body = """
                {"name": "", "description": "%s", "categoryId": null,
                 "variants": [{"sku": "", "color": "Đỏ", "size": "M", "price": 0.5}]}
                """.formatted("a".repeat(1001));

        postProduct(body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Tên sản phẩm không được để trống"))
                .andExpect(jsonPath("$.errors.description").value("Mô tả sản phẩm tối đa 1000 ký tự"))
                .andExpect(jsonPath("$.errors.categoryId").value("Vui lòng chọn danh mục"))
                .andExpect(jsonPath("$.errors['variants[0].sku']").value("SKU không được để trống"))
                .andExpect(jsonPath("$.errors['variants[0].price']")
                        .value("Giá bán phải là số nguyên, tối đa 17 chữ số"));
    }

    @Test
    void createProductRejectsDuplicateSkuDuplicateColorSizeAndWrongOriginalPrice() throws Exception {
        String sku = randomCode();
        createProduct(createBody("Áo gốc", newVariant(sku, "Đỏ", "M", 100000)));

        postProduct(createBody("Áo khác", newVariant(sku.toLowerCase(), "Xanh", "M", 100000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("SKU đã tồn tại")));

        String other = randomCode();
        postProduct(createBody("Áo trùng SKU", newVariant(other, "Đỏ", "M", 100000), newVariant(other, "Đỏ", "L", 100000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("SKU bị trùng trong danh sách biến thể")));

        postProduct(createBody("Áo trùng màu size",
                newVariant(randomCode(), "Đỏ", "M", 100000),
                newVariant(randomCode(), " đỏ ", "m", 100000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Biến thể bị trùng màu và size"));

        String wrongPrice = """
                {"sku": "%s", "color": "Đỏ", "size": "M", "price": 200000, "originalPrice": 100000}
                """.formatted(randomCode());
        postProduct(createBody("Áo sai giá", wrongPrice))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Giá trước giảm không được nhỏ hơn giá bán"));
    }

    @Test
    void invalidJsonValueOrIdReturnsBadRequestInsteadOfServerError() throws Exception {
        String body = updateBody("Áo", "ABC", variant(null, randomCode(), "Đỏ", "M", 100000, true));

        putProduct(UUID.randomUUID(), body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dữ liệu đầu vào không hợp lệ"));

        mvc.perform(get(PRODUCTS + "/not-a-uuid").with(user(storeStaff)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateAppendsNewVariantKeepsOldIdAndSkuAndUpdatesPriceAndActive() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo cũ", newVariant(sku + "-1", "Đỏ", "M", 100000)));
        UUID oldId = variantIdOf(sku + "-1");

        putProduct(productId, updateBody("Áo mới", "INACTIVE",
                variant(oldId, sku + "-1", "Đỏ", "M", 120000, false),
                variant(null, sku + "-2", "Xanh", "M", 130000, true)))
                .andExpect(status().isOk());

        mvc.perform(get(PRODUCTS + "/" + productId).with(user(storeStaff)))
                .andExpect(jsonPath("$.data.name").value("Áo mới"))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"))
                .andExpect(jsonPath("$.data.variants.length()").value(2));

        assertEquals(oldId, variantIdOf(sku + "-1"));
        ProductVariant oldVariant = productVariantRepository.findById(oldId).orElseThrow();
        assertEquals(0, new BigDecimal("120000").compareTo(oldVariant.getPrice()));
        assertEquals(false, oldVariant.isActive());
        assertEquals(0L, stockOf(sku + "-2"));
    }

    @Test
    void updateRejectsSkuChangeAndKeepsDataUnchanged() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Tên cũ", newVariant(sku, "Đỏ", "M", 100000)));
        UUID variantId = variantIdOf(sku);

        putProduct(productId, updateBody("Tên mới", "ACTIVE", variant(variantId, sku + "-X", "Đỏ", "M", 100000, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Không được thay đổi SKU của biến thể"));

        assertEquals("Tên cũ", jdbc.queryForObject("select name from shop.products where id = ?", String.class, productId));
        assertEquals(sku, jdbc.queryForObject("select sku from shop.product_variants where id = ?", String.class, variantId));
    }

    @Test
    void updateRejectsNewVariantWithSameColorSizeAsInactiveVariant() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo", newVariant(sku, "Đỏ", "M", 100000)));
        UUID variantId = variantIdOf(sku);

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Đỏ", "M", 100000, false)))
                .andExpect(status().isOk());

        putProduct(productId, updateBody("Áo", "ACTIVE",
                variant(variantId, sku, "Đỏ", "M", 100000, false),
                variant(null, randomCode(), "Đỏ", "M", 100000, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Biến thể bị trùng màu và size"));
    }

    @Test
    void updateRejectsSwappingColorSizeBetweenVariants() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo",
                newVariant(sku + "-1", "Đỏ", "M", 100000),
                newVariant(sku + "-2", "Xanh", "M", 100000)));

        putProduct(productId, updateBody("Áo", "ACTIVE",
                variant(variantIdOf(sku + "-1"), sku + "-1", "Xanh", "M", 100000, true),
                variant(variantIdOf(sku + "-2"), sku + "-2", "Đỏ", "M", 100000, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("đang thuộc biến thể " + sku + "-2")));
    }

    @Test
    void colorSizeCanChangeWithoutHistoryButIsLockedAfterPendingReceipt() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo", newVariant(sku, "Đỏ", "M", 100000)));
        UUID variantId = variantIdOf(sku);

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Hồng", "M", 100000, true)))
                .andExpect(status().isOk());

        createPendingReceipt(variantId, 5);

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Vàng", "M", 100000, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Không được thay đổi màu hoặc size của biến thể đã phát sinh nghiệp vụ"));

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Hồng", "M", 90000, true)))
                .andExpect(status().isOk());
    }

    @Test
    void colorSizeIsLockedAfterOrder() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo", newVariant(sku, "Đỏ", "M", 100000)));
        UUID variantId = variantIdOf(sku);
        saveOrder(variantId, sku, 1, OrderStatus.PENDING_CONFIRMATION);

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Đỏ", "L", 100000, true)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Không được thay đổi màu hoặc size của biến thể đã phát sinh nghiệp vụ"));
    }

    @Test
    void stockIncreasesOnlyWhenReceiptCompletedAndDecreasesWhenIssueExported() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo", newVariant(sku, "Đỏ", "M", 100000)));
        UUID variantId = variantIdOf(sku);

        UUID receiptId = createPendingReceipt(variantId, 10);
        assertEquals(0L, stockOf(sku));

        GoodsReceiptDetailResponse receipt = goodsReceiptService.getReceipt(receiptId);
        goodsReceiptService.confirmReceipt(new ConfirmReceiptRequest(receipt.version(), null, "COMPLETED",
                        List.of(new ConfirmReceiptRequest.Line(receipt.items().get(0).goodsReceiptItemId(), 10))),
                warehouseStaff.id(), receiptId);

        mvc.perform(get(STOCKS).param("keyword", sku).with(user(warehouseStaff)))
                .andExpect(jsonPath("$.data.items[0].quantity").value(10))
                .andExpect(jsonPath("$.data.items[0].stockStatus").value("IN_STOCK"));

        Order order = saveOrder(variantId, sku, 3, OrderStatus.CONFIRMED);
        exportOrder(order.getId());

        assertEquals(7L, stockOf(sku));
        mvc.perform(get(STOCKS).param("keyword", sku).with(user(warehouseStaff)))
                .andExpect(jsonPath("$.data.items[0].quantity").value(7));

        putProduct(productId, updateBody("Áo", "ACTIVE", variant(variantId, sku, "Đỏ", "M", 150000, true)))
                .andExpect(status().isOk());
        BigDecimal orderedPrice = jdbc.queryForObject(
                "select unit_price from shop.order_items where order_id = ?", BigDecimal.class, order.getId());
        assertEquals(0, new BigDecimal("100000").compareTo(orderedPrice));
    }

    @Test
    void imagesAreGroupedByVariantColorSortedAndDeleted() throws Exception {
        String sku = randomCode();
        UUID productId = createProduct(createBody("Áo",
                newVariant(sku + "-1", "Đỏ", "M", 100000),
                newVariant(sku + "-2", "Đỏ", "L", 100000)));
        String images = PRODUCTS + "/" + productId + "/images";
        when(cloudinaryService.uploadImage(any()))
                .thenReturn(uploaded("first"))
                .thenReturn(uploaded("second"));

        uploadImage(images, "Tím", 0)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Màu ảnh không thuộc các biến thể của sản phẩm"));

        uploadImage(images, "đỏ", 1)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.color").value("Đỏ"));
        String secondBody = uploadImage(images, "Đỏ", 0)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        String secondId = JsonPath.read(secondBody, "$.data.id");

        mvc.perform(get(images).with(user(storeStaff)))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].imageUrl").value("https://img.test/second.png"));

        mvc.perform(patch(images + "/" + secondId + "/sort-order").with(user(storeStaff)).with(csrf())
                        .contentType(APPLICATION_JSON).content("{\"sortOrder\": 5}"))
                .andExpect(status().isOk());
        mvc.perform(get(images).with(user(storeStaff)))
                .andExpect(jsonPath("$.data[0].imageUrl").value("https://img.test/first.png"))
                .andExpect(jsonPath("$.data[1].sortOrder").value(5));

        mvc.perform(delete(images + "/" + secondId).with(user(storeStaff)).with(csrf()))
                .andExpect(status().isOk());
        verify(cloudinaryService).deleteImage("second");
        mvc.perform(get(images).with(user(storeStaff)))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void eachColorAcceptsAtMostThreeImages() throws Exception {
        UUID productId = createProduct(createBody("Áo",
                newVariant(randomCode(), "Đỏ", "M", 100000),
                newVariant(randomCode(), "Xanh", "M", 100000)));
        String images = PRODUCTS + "/" + productId + "/images";
        when(cloudinaryService.uploadImage(any()))
                .thenReturn(uploaded("one"), uploaded("two"), uploaded("three"), uploaded("four"));

        for (int order = 0; order < 3; order++) {
            uploadImage(images, "Đỏ", order).andExpect(status().isCreated());
        }

        uploadImage(images, "đỏ", 3)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Mỗi màu chỉ được tối đa 3 ảnh"));
        verify(cloudinaryService, times(3)).uploadImage(any());

        uploadImage(images, "Xanh", 0).andExpect(status().isCreated());
    }

    @Test
    void onlyStoreStaffManagesProductsAndOnlyWarehouseStaffViewsStock() throws Exception {
        mvc.perform(post(PRODUCTS).with(user(warehouseStaff)).with(csrf())
                        .contentType(APPLICATION_JSON).content(createBody("Áo", newVariant(randomCode(), "Đỏ", "M", 100000))))
                .andExpect(status().isForbidden());

        mvc.perform(get(STOCKS).with(user(storeStaff)))
                .andExpect(status().isForbidden());

        mvc.perform(get(PRODUCTS))
                .andExpect(status().isUnauthorized());
    }

    private User saveUser(UserRole role) {
        User user = new User();
        user.setEmail(randomCode().toLowerCase() + "@test.local");
        user.setPasswordHash("hash");
        user.setFullName("Người dùng test");
        user.setRole(role);
        return userRepository.save(user);
    }

    private String randomCode() {
        return "T" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String createBody(String name, String... variants) {
        return """
                {"name": "%s", "description": "Mô tả sản phẩm", "categoryId": "%s", "variants": [%s]}
                """.formatted(name, categoryId, String.join(",", variants));
    }

    private String newVariant(String sku, String color, String size, long price) {
        return """
                {"sku": "%s", "color": "%s", "size": "%s", "price": %d}
                """.formatted(sku, color, size, price);
    }

    private String updateBody(String name, String status, String... variants) {
        return """
                {"name": "%s", "description": "Mô tả sản phẩm", "categoryId": "%s", "status": "%s", "variants": [%s]}
                """.formatted(name, categoryId, status, String.join(",", variants));
    }

    private String variant(UUID id, String sku, String color, String size, long price, boolean active) {
        String idJson = id == null ? "null" : "\"" + id + "\"";
        return """
                {"id": %s, "sku": "%s", "color": "%s", "size": "%s", "price": %d, "active": %b}
                """.formatted(idJson, sku, color, size, price, active);
    }

    private ResultActions postProduct(String body) throws Exception {
        return mvc.perform(post(PRODUCTS).with(user(storeStaff)).with(csrf())
                .contentType(APPLICATION_JSON).content(body));
    }

    private ResultActions putProduct(UUID productId, String body) throws Exception {
        return mvc.perform(put(PRODUCTS + "/" + productId).with(user(storeStaff)).with(csrf())
                .contentType(APPLICATION_JSON).content(body));
    }

    private UUID createProduct(String body) throws Exception {
        String response = postProduct(body)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return UUID.fromString(JsonPath.read(response, "$.data"));
    }

    private ResultActions uploadImage(String path, String color, int sortOrder) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1, 2, 3});
        return mvc.perform(multipart(path).file(file)
                .param("color", color)
                .param("sortOrder", String.valueOf(sortOrder))
                .with(user(storeStaff)).with(csrf()));
    }

    private CloudinaryUploadResponse uploaded(String publicId) {
        return CloudinaryUploadResponse.builder()
                .imageUrl("https://img.test/" + publicId + ".png")
                .publicId(publicId)
                .build();
    }

    private UUID variantIdOf(String sku) {
        return jdbc.queryForObject("select id from shop.product_variants where sku = ?", UUID.class, sku);
    }

    private Long stockOf(String sku) {
        return jdbc.queryForObject("""
                select i.quantity from shop.inventory i
                join shop.product_variants v on v.id = i.variant_id
                where v.sku = ?
                """, Long.class, sku);
    }

    private UUID createPendingReceipt(UUID variantId, int quantity) {
        goodsReceiptService.createGoodsReceipt(new CreateReceiptRequest("Nhà cung cấp test", LocalDate.now(), null,
                List.of(new CreateReceiptRequest.Line(variantId, quantity))), warehouseStaff.id());
        return jdbc.queryForObject("select goods_receipt_id from shop.goods_receipt_items where variant_id = ?",
                UUID.class, variantId);
    }

    private Order saveOrder(UUID variantId, String sku, int quantity, OrderStatus status) {
        ProductVariant variant = productVariantRepository.findById(variantId).orElseThrow();
        Order order = new Order();
        order.setOrderCode("OD-" + randomCode());
        order.setCustomer(customer);
        order.setCheckoutKey(UUID.randomUUID().toString());
        order.setReceiverName("Khách test");
        order.setReceiverPhone("0900000000");
        order.setReceiverAddress("TP. Hồ Chí Minh");
        order.setStatus(status);

        OrderItem item = new OrderItem();
        item.setVariant(variant);
        item.setQuantity(quantity);
        item.setUnitPrice(variant.getPrice());
        item.setProductNameSnapshot("Áo");
        item.setSkuSnapshot(sku);
        item.setColorSnapshot(variant.getColor());
        item.setSizeSnapshot(variant.getSize());
        order.addOrderItem(item);
        return orderRepository.save(order);
    }

    private void exportOrder(UUID orderId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(warehouseStaff, null, warehouseStaff.getAuthorities()));

        GoodsIssueDetailResponse issue = goodsIssueService.createGoodsIssue(new CreateGoodsIssueRequest(orderId));
        issue = goodsIssueService.startPicking(issue.id(), new IssueVersionRequest(issue.version()));
        List<UpdatePickingRequest.Line> lines = issue.items().stream()
                .map(item -> new UpdatePickingRequest.Line(item.issueItemId(), item.orderedQuantity()))
                .toList();
        issue = goodsIssueService.updatePicking(issue.id(), new UpdatePickingRequest(issue.version(), lines));
        issue = goodsIssueService.pack(issue.id(), new PackIssueRequest(issue.version(), PackagingType.CARTON));
        goodsIssueService.export(issue.id(), new ExportIssueRequest(issue.version(), "GHN", "TRACK-" + randomCode(), null));
    }
}
