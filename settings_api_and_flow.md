# Cuanly — Settings, API, and Flow Documentation (Revised)

Canonical documentation for the **Cuanly** Financial Web Application (Frontend Architecture, Contracts & Flows).

---

## 1. Settings

### 1.1 Environment Configuration
| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | `Cuanly` | Application display title |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `id` | Default language (`id` for Indonesian, `en` for English) |
| `NEXT_PUBLIC_CURRENCY` | `IDR` | Primary transaction currency (Indonesian Rupiah) |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api/v1` | Future backend API endpoint base URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | When true, uses the reactive LocalStorage Mock Engine |

### 1.2 Permissions & Role-Based Access Control (RBAC)
- **Role `USER` (Pengguna):**
  - Access to `/beranda`, `/transaksi`, `/transaksi/tambah`, `/transaksi/scan`, `/transaksi/[id]`, `/budget`, `/budget/[slug]`, `/profil`.
  - Restricted from accessing any `/admin/*` routes.
- **Role `ADMIN` (Pengelola):**
  - Full access to `/admin/dashboard`, `/admin/users`, `/admin/users/[id]`, `/admin/verification`, `/admin/verification/[id]`, `/admin/transactions`, `/admin/categories`, `/admin/complaints`, `/admin/complaints/[id]`.
  - Can switch to view `/beranda` simulation.

### 1.3 Preloaded Demo Credentials
- **Demo User:** `user@cuanly.com` / PIN: `123456`
- **Demo Admin:** `admin@cuanly.com` / PIN: `999999`

---

## 2. API Contract

The frontend implements an abstracted API client layer (`src/lib/api-client.ts`) with identical signatures to the future backend REST service.

### 2.1 Authentication Endpoints
- **`POST /api/v1/auth/login`**
  - Request Body: `{ "email": "user@cuanly.com", "pin": "123456" }`
  - Response (200 OK): `{ "token": "...", "user": { "id": "usr_01", "name": "Budi Santoso", "email": "user@cuanly.com", "role": "USER" } }`
- **`POST /api/v1/auth/register`**
  - Request Body: `{ "name": "...", "email": "...", "password": "...", "pin": "..." }`
  - Response (201 Created): `{ "token": "...", "user": { ... } }`

### 2.2 Transactions & Receipts Endpoints
- **`GET /api/v1/transactions`**
  - Query Params: `type=INCOME|EXPENSE`, `categoryId=...`, `search=...`, `startDate=...`, `endDate=...`
- **`GET /api/v1/transactions/:id`**
  - Response (200 OK): `{ "transaction": { "id": "tx_01", "amount": 45000, "receiptUrl": "...", "lineItems": [...] } }`
- **`POST /api/v1/transactions`**
  - Request Body: `{ "type": "EXPENSE", "amount": 45000, "categoryId": "cat_food", "date": "...", "notes": "...", "receiptImage": "..." }`
- **`POST /api/v1/receipts/ocr-parse`**
  - Request Body: `FormData` with image file
  - Response (200 OK):
    ```json
    {
      "merchantName": "Superindo Supermarket",
      "date": "2026-10-17",
      "totalAmount": 148500,
      "suggestedCategoryId": "cat_shopping",
      "lineItems": [
        { "name": "Beras Premium 5kg", "price": 74000 },
        { "name": "Minyak Goreng 2L", "price": 38500 },
        { "name": "Telur Ayam 1kg", "price": 36000 }
      ],
      "receiptImageUrl": "data:image/..."
    }
    ```

### 2.3 Budget Endpoints
- **`GET /api/v1/budgets`**
- **`GET /api/v1/budgets/:categorySlug`**
  - Response (200 OK): `{ "category": "makanan", "limitAmount": 2000000, "spentAmount": 1650000, "transactions": [...] }`
- **`PUT /api/v1/budgets/:categorySlug`**

### 2.4 Admin Management Endpoints
- **`GET /api/v1/admin/stats`**
- **`GET /api/v1/admin/users/:id`**
- **`POST /api/v1/admin/mitra/:id/verify`**
- **`GET /api/v1/admin/complaints/:id`**
- **`PATCH /api/v1/admin/complaints/:id`**

---

## 3. Flow

### 3.1 Smart Receipt Photo Scanner Flow
```
User (UI)
  │
  ├─► Taps "Scan Struk" (Scan Receipt) in Top Header or Transaksi page
  │
  ├─► Uploads or captures receipt image (camera / file input)
  │
  ├─► System triggers OCR Simulator (`src/lib/ocr-simulator.ts`)
  │     ├── Detects merchant (e.g., "Kopi Kenangan", "Indomaret", "Pertamina")
  │     ├── Extracts total nominal, date, and suggested category
  │     └── Extracts individual items list
  │
  ├─► Shows Interactive Review Form with receipt image side-by-side:
  │     ├── Pre-filled Nominal, Date, Category, and Merchant Note
  │     └── User can freely edit/correct values
  │
  ├─► Taps "Simpan Transaksi"
  │
  └─► Saved into FinanceContext & LocalStorage with receipt image link
        ├── Updates Total Saldo & Category chart
        └── Navigates to Transaction Detail `/transaksi/[id]`
```

### 3.2 Bilingual Switching Flow
```
User (UI)
  │
  ├─► Clicks Language Switcher (ID / EN) in Top Header or Profil
  │
  ├─► LanguageContext updates activeLocale in State & LocalStorage
  │
  └─► All UI strings, dates, and currency formatting re-render instantaneously
```

---

## 4. Data Normalization & Glassmorphism Styling

- **Glassmorphism Spec:**
  - Cards: `bg-white/80 backdrop-blur-md border border-white/40 shadow-sm`
  - Sticky Headers: `bg-white/80 backdrop-blur-lg border-b border-gray-200/50`
  - Gradients: Subtle neutral and semantic financial gradients for cards and charts.
- **Language Support:**
  - Standard keys in `src/i18n/id.ts` and `src/i18n/en.ts`.

---

## 5. Security & Operations
- Client-side route guards on `/admin/*` and dynamic routes (`[id]`, `[slug]`).
- Clean separation between frontend presentation and backend contract.
