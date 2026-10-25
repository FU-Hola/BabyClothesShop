import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Body Chip Cotton Sơ Sinh Cổ Tròn",
    category: "quần áo sơ sinh",
    price: 140000,
    maxStock: 3,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&auto=format&fit=crop&q=80",
    sizes: ["0-3M", "3-6M", "6-9M"],
    sku: "BC-COTTON-01",
  },
  {
    id: 2,
    name: "Váy Xòe Công Chúa Họa Tiết Hoa Nhí",
    category: "thời trang bé gái",
    price: 180000,
    maxStock: 5,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=80",
    sizes: ["1-2Y", "2-3Y", "3-4Y"],
    sku: "VX-HOA-02",
  },
  {
    id: 3,
    name: "Set Bộ Cộc Tay Bé Trai Họa Tiết Khủng Long",
    category: "thời trang bé trai",
    price: 165000,
    maxStock: 4,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80",
    sizes: ["9-12M", "1-2Y", "2-3Y"],
    sku: "SB-KL-03",
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const CartDemoProducts = () => {
  const { addToCart } = useCart();

  // Quản lý size và số lượng đang chọn cho từng sản phẩm
  const [selectedSizes, setSelectedSizes] = useState({
    1: "3-6M",
    2: "2-3Y",
    3: "1-2Y",
  });

  const [quantities, setQuantities] = useState({
    1: 1,
    2: 1,
    3: 1,
  });

  // State cho thông báo Toast sau khi Thêm vào giỏ (UC10)
  const [toast, setToast] = useState(null);

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQtyChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // UC10: Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id] || product.sizes[0];
    const qty = quantities[product.id] || 1;

    const res = addToCart(product, size, qty);

    if (res.success) {
      setToast({
        type: "success",
        message: res.message,
        productName: `${product.name} (Size: ${size})`,
        qty: qty,
      });
    } else {
      setToast({
        type: "error",
        message: res.message,
      });
    }

    // Tự động tắt toast sau 4 giây
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 24px 60px 24px" }}>
      {/* TOAST THÔNG BÁO PHẢN HỒI KHI THÊM VÀO GIỎ (UC10) */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1.5px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
            borderRadius: 8,
            padding: "16px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            maxWidth: 380,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 color="#16a34a" size={24} style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle color="#dc2626" size={24} style={{ flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, fontSize: 14 }}>
            <strong style={{ color: toast.type === "success" ? "#166534" : "#991b1b" }}>
              {toast.type === "success" ? "Đã thêm vào giỏ hàng!" : "Không thể thêm!"}
            </strong>
            <p style={{ margin: "4px 0 8px 0", color: "#4a4a4a" }}>
              {toast.type === "success"
                ? `${toast.productName} × ${toast.qty}`
                : toast.message}
            </p>
            {toast.type === "success" && (
              <Link
                to="/cart"
                style={{
                  display: "inline-block",
                  color: "#284e70",
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: "underline",
                }}
              >
                Xem giỏ hàng ngay &rarr;
              </Link>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              color: "#888",
            }}
          >
            &times;
          </button>
        </div>
      )}
      {/* DANH SÁCH SẢN PHẨM MẪU (TEST UC10) */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, color: "#8b8b8b" }}>
          (Chọn Size, chọn Số lượng rồi bấm "Thêm vào giỏ")
        </span>
      </div>

      <div className="row g-4">
        {SAMPLE_PRODUCTS.map((prod) => {
          const currentSize = selectedSizes[prod.id] || prod.sizes[0];
          const currentQty = quantities[prod.id] || 1;

          return (
            <div className="col-md-4" key={prod.id}>
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{ width: "100%", height: 230, objectFit: "cover" }}
                />
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "#8b8b8b", textTransform: "uppercase" }}>
                    {prod.category}
                  </span>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#284e70",
                      margin: "6px 0 10px 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {prod.name}
                  </h3>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", marginBottom: 14 }}>
                    {formatCurrency(prod.price)}
                    <span style={{ fontSize: 12, color: "#8b8b8b", fontWeight: 400, marginLeft: 8 }}>
                      (Tồn kho: {prod.maxStock})
                    </span>
                  </div>

                  {/* Chọn biến thể Size */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#4a4a4a" }}>
                      Chọn Size cho bé:
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {prod.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSizeChange(prod.id, s)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 4,
                            border: `1.5px solid ${currentSize === s ? "#284e70" : "#d1d5db"}`,
                            backgroundColor: currentSize === s ? "#284e70" : "#fff",
                            color: currentSize === s ? "#fff" : "#4a4a4a",
                            cursor: "pointer",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chọn Số lượng */}
                  <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#4a4a4a" }}>Số lượng:</span>
                    <div style={{ display: "inline-flex", border: "1px solid #d1d5db", borderRadius: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod.id, -1)}
                        style={{
                          border: "none",
                          background: "#f3f4f6",
                          width: 28,
                          height: 28,
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        style={{
                          width: 32,
                          textAlign: "center",
                          lineHeight: "28px",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod.id, 1)}
                        style={{
                          border: "none",
                          background: "#f3f4f6",
                          width: 28,
                          height: 28,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Nút Thêm vào giỏ hàng */}
                  <div style={{ marginTop: "auto" }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        backgroundColor: "#284e70",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2e5069")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#284e70")}
                    >
                      <ShoppingBag size={16} />
                      <span>Thêm vào giỏ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartDemoProducts;
