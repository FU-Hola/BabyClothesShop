# BabyClothesShop

```text
BabyClothesShop/
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── layouts/
│       │   ├── auth/
│       │   └── pages/
│       │
│       ├── shared/
│       │   ├── api/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── utils/
│       │   ├── constants/
│       │   ├── assets/
│       │   └── styles/
│       │
│       └── modules/
│           ├── auth-account/              # Lý
│           │   ├── pages/
│           │   ├── components/
│           │   ├── context/
│           │   ├── hooks/
│           │   └── api/
│           │
│           ├── catalog-stock/             # Lâm
│           │   ├── pages/
│           │   ├── components/
│           │   ├── hooks/
│           │   ├── api/
│           │   └── styles/
│           │
│           ├── goods-receipt-packing/     # Hùng
│           │   ├── pages/
│           │   ├── components/
│           │   ├── hooks/
│           │   └── api/
│           │
│           ├── cart-checkout/             # Công
│           │   ├── pages/
│           │   ├── components/
│           │   ├── hooks/
│           │   └── api/
│           │
│           └── order-management/          # Hiếu
│               ├── pages/
│               ├── components/
│               ├── hooks/
│               └── api/
│
└── backend/
    ├── .mvn/
    │   └── wrapper/
    └── src/
        └── main/
            ├── java/
            │   └── com/
            │       └── clothesshop/
            │           ├── config/
            │           ├── common/
            │           │   ├── exception/
            │           │   ├── response/
            │           │   ├── security/
            │           │   └── utils/
            │           │
            │           └── modules/
            │               ├── authaccount/           # Lý
            │               │   ├── controller/
            │               │   ├── service/
            │               │   ├── repository/
            │               │   ├── entity/
            │               │   ├── dto/
            │               │   └── mapper/
            │               │
            │               ├── catalogstock/          # Lâm
            │               │   ├── controller/
            │               │   ├── service/
            │               │   ├── repository/
            │               │   ├── entity/
            │               │   ├── dto/
            │               │   └── mapper/
            │               │
            │               ├── goodsreceiptpacking/   # Hùng
            │               │   ├── controller/
            │               │   ├── service/
            │               │   ├── repository/
            │               │   ├── entity/
            │               │   ├── dto/
            │               │   └── mapper/
            │               │
            │               ├── cartcheckout/          # Công
            │               │   ├── controller/
            │               │   ├── service/
            │               │   ├── repository/
            │               │   ├── entity/
            │               │   ├── dto/
            │               │   └── mapper/
            │               │
            │               └── ordermanagement/       # Hiếu
            │                   ├── controller/
            │                   ├── service/
            │                   ├── repository/
            │                   ├── entity/
            │                   ├── dto/
            │                   └── mapper/
            │
            └── resources/
                └── db/
                    └── migration/
```
