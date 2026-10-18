# Cuanly — Settings, API, and Flow Documentation (Comprehensive Master Specification)

Canonical engineering documentation for the **Cuanly** Financial Web Application (Architecture, Settings, API Contracts, System Flows, Data Schemas, Security Controls, and Operational Specifications).

---

## 1. System Overview & Architecture

**Cuanly** is a high-performance personal financial management and business backoffice platform built with Next.js 16 (App Router + Turbopack), TypeScript, and Tailwind CSS. The application adheres to Hick's Law for cognitive load reduction (simplifying budgeting into 6 core expense categories), implements smart AI OCR receipt scanning, supports dynamic multi-currency management, defaults to English (`en`) with Indonesian (`id`) localization, enforces an inactivity session timeout of 3 minutes, and provides a dual-role access model (`USER` for personal wealth tracking, `ADMIN` for partner verification, platform monitoring, and dispute resolution).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                 │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐ │
│  │   Auth & RBAC Guards  │  │  Language & Currency  │  │ Inactivity      │ │
│  │   (AppShell / Route)  │  │  (LanguageContext)    │  │ Timer (3 Min)   │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘ │
│              │                          │                       │          │
│              ▼                          ▼                       ▼          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      APPLICATION CONTEXT LAYER                        │ │
│  │   • AuthContext      • FinanceContext     • AdminContext              │ │
│  │   • NotificationContext                   • LanguageContext           │ │
│  └──────────────────────────────────┬────────────────────────────────────┘ │
│                                     │                                      │
│                                     ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     API CLIENT & OCR SIMULATOR                        │ │
│  │   • Typed REST Signatures   • Async OCR Inference Engine              │ │
│  └──────────────────────────────────┬────────────────────────────────────┘ │
│                                     │                                      │
│                                     ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    REACTIVE LOCALSTORAGE MOCK ENGINE                  │ │
│  │   • Scoped cuanly_* Keys    • Preloaded Seed Data & Migrations        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Settings & Configuration

### 2.1 Environment Variables
| Variable | Type | Default Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | `string` | `Cuanly` | Brand and header display title |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `string` | `en` | Default UI language (`en` for English, `id` for Indonesian) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | `string` | `IDR` | Primary base currency (Indonesian Rupiah `Rp`) |
| `NEXT_PUBLIC_API_BASE_URL` | `string` | `http://localhost:5000/api/v1` | Base URL for the future REST backend API |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `boolean` | `true` | When true, activates reactive client-side storage mock engine |

### 2.2 Brand Design System & Color Palette
The application UI is styled using a curated, harmonious 3-tier color palette:

| Role | Hex Code | Swatch Name | UI Application |
|---|---|---|---|
| **Primer** | `#4D8DBA` | Oceanic Steel Blue | Primary brand identity, main CTA buttons, active navigation states, dominant wallet logo body, focus rings |
| **Sekunder** | `#8AD6D1` | Fresh Mint Cyan | Secondary accents, positive cashflow indicators, progress bars, active icons, glowing highlights, peeking logo bill |
| **Tersier** | `#AEC4D4` | Slate Ice Blue | Glassmorphism panel borders, canvas gradient tinting, subtle chip backgrounds, neutral table outlines, muted labels |

### 2.3 Security & Session Inactivity Settings
| Setting | Value | Implementation Scope |
|---|---|---|
| `SESSION_TIMEOUT_MS` | `180000` (3 Minutes) | Global inactivity threshold before auto-logout |
| `ACTIVITY_THROTTLE_MS` | `2000` (2 Seconds) | Inactivity write throttle for user interaction events |
| Inactivity Events Monitored | `mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll` | Window-level passive event listeners |
| Session Validation on Cold Start | Strict | Checks `cuanly_last_activity`; purges session if older than 3 minutes |
| Root URL Entry (`/`) | Forced Login | Visiting root domain always clears session and replaces path to `/login` |

### 2.3 LocalStorage & SessionStorage State Schema
| Storage Key | Storage Engine | Type | Description |
|---|---|---|---|
| `cuanly_auth_user` | `localStorage` | `User` (JSON) | Current authenticated user payload |
| `cuanly_last_activity` | `localStorage` | `number` (Unix ms) | Timestamp of the most recent user action |
| `cuanly_session_timed_out` | `sessionStorage` | `boolean` (`"true"`) | Flag triggering the amber session expiration notice |
| `cuanly_transactions` | `localStorage` | `Transaction[]` | Persistent transaction history |
| `cuanly_budgets` | `localStorage` | `BudgetLimit[]` | Per-category monthly budget limits |
| `cuanly_categories` | `localStorage` | `Category[]` | Dynamic category registry |
| `cuanly_monthly_allowance` | `localStorage` | `number` | Total overall monthly budget allowance |
| `cuanly_locale` | `localStorage` | `'en' \| 'id'` | User-selected UI locale |
| `cuanly_active_currency` | `localStorage` | `string` (`"IDR"`) | User-selected primary currency code |
| `cuanly_custom_currencies` | `localStorage` | `Currency[]` | Custom currencies added by the user |
| `cuanly_theme` | `localStorage` | `'light' \| 'dark'` | Active display theme, toggles `.dark` class on root `<html>` |
| `cuanly_notifications` | `localStorage` | `NotificationItem[]` | Notifications and system alerts |
| `cuanly_admin_mitra` | `localStorage` | `Mitra[]` | Admin registered partner records |
| `cuanly_admin_complaints` | `localStorage` | `Complaint[]` | Admin user support & complaint tickets |
| `cuanly_admin_users` | `localStorage` | `User[]` | Platform user directory |


### 2.4 Pre-Configured Demo Credentials
| Persona | Role | Username / Identifier | Email | PIN (6 Digits) | Landing Route | Preloaded Data & Scope |
|---|---|---|---|---|---|---|
| **Personal User** | `USER` | `user` | `user@cuanly.com` | `123456` | `/beranda` | 10 realistic cashflow transactions, Superindo OCR receipt, 6 budget limits, active overbudget warning |
| **Admin Backoffice** | `ADMIN` | `admin` | `admin@cuanly.com` | `999999` | `/admin/dashboard` | Platform metrics, 4 registered business partners, legal documents verification queue, transaction audit trail, complaint tickets |

---

## 3. API Contract & Endpoint Specifications

All endpoints follow REST conventions and are typed via TypeScript interfaces in `src/types/index.ts`. The frontend interacts with these signatures through `src/lib/api-client.ts` and the reactive mock engine in `src/contexts/`.

### 3.1 Authentication & Session Endpoints

#### 1. Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "identifier": "user",
    "pin": "123456"
  }
  ```
  *(Identifier accepts either username e.g. `user`/`admin` or email e.g. `user@cuanly.com`/`admin@cuanly.com`)*
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_demo_01",
      "name": "Budi Santoso",
      "username": "user",
      "email": "user@cuanly.com",
      "role": "USER",
      "avatarUrl": "https://images.unsplash.com/...",
      "phone": "0812-3456-7890",
      "createdAt": "2026-01-15T00:00:00Z"
    }
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "Username atau Email serta PIN wajib diisi / Kredensial tidak sesuai."
  }
  ```

#### 2. Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Rian Pratama",
    "email": "rian@gmail.com",
    "username": "rianp",
    "phone": "0812-1111-2222",
    "pin": "654321"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1792289123456",
      "name": "Rian Pratama",
      "username": "rianp",
      "email": "rian@gmail.com",
      "role": "USER",
      "phone": "0812-1111-2222",
      "createdAt": "2026-10-18T03:00:00.000Z"
    }
  }
  ```

#### 3. Logout & Inactivity Termination
- **Endpoint:** `POST /api/v1/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Session invalidated successfully."
  }
  ```

---

### 3.2 Transaction Management Endpoints

#### 1. List Transactions
- **Endpoint:** `GET /api/v1/transactions`
- **Query Parameters:**
  - `type` (optional): `'EXPENSE' | 'INCOME'`
  - `category` (optional): Category slug (e.g., `'makanan'`, `'belanja'`, `'transportasi'`)
  - `search` (optional): Substring query for notes, merchant, or amount
  - `period` (optional): `'YYYY-MM'` (defaults to current month)
- **Response (200 OK):**
  ```json
  [
    {
      "id": "tx_01",
      "userId": "usr_demo_01",
      "type": "EXPENSE",
      "amount": 45000,
      "currency": "IDR",
      "currencySymbol": "Rp",
      "categoryId": "cat_food",
      "categoryName": "Makanan & Minuman",
      "categorySlug": "makanan",
      "date": "2026-10-17",
      "notes": "Makan siang ayam geprek",
      "createdAt": "2026-10-17T12:30:00Z"
    }
  ]
  ```

#### 2. Get Transaction Details (with Receipt)
- **Endpoint:** `GET /api/v1/transactions/:id`
- **Response (200 OK):**
  ```json
  {
    "id": "tx_02",
    "userId": "usr_demo_01",
    "type": "EXPENSE",
    "amount": 148500,
    "currency": "IDR",
    "currencySymbol": "Rp",
    "categoryId": "cat_shopping",
    "categoryName": "Belanja",
    "categorySlug": "belanja",
    "date": "2026-10-17",
    "notes": "Belanja mingguan Superindo",
    "receipt": {
      "merchant": "PT Lion Super Indo",
      "date": "2026-10-17",
      "totalAmount": 148500,
      "receiptImageUrl": "https://images.unsplash.com/photo-1554415707-9e49016a3505?w=600",
      "lineItems": [
        { "id": "item_1", "name": "Beras Premium Ramos 5kg", "price": 74000, "quantity": 1 },
        { "id": "item_2", "name": "Minyak Goreng Sania 2L", "price": 38500, "quantity": 1 },
        { "id": "item_3", "name": "Telur Ayam Negeri 1kg", "price": 36000, "quantity": 1 }
      ],
      "suggestedCategoryId": "cat_shopping",
      "confidenceScore": 98
    },
    "createdAt": "2026-10-17T10:15:00Z"
  }
  ```

#### 3. Create Transaction
- **Endpoint:** `POST /api/v1/transactions`
- **Request Body:**
  ```json
  {
    "type": "EXPENSE",
    "amount": 85000,
    "currency": "IDR",
    "currencySymbol": "Rp",
    "categoryId": "cat_food",
    "categoryName": "Makanan & Minuman",
    "categorySlug": "makanan",
    "date": "2026-10-18",
    "notes": "Starbucks Reserve Caffe Latte",
    "receipt": { ... }
  }
  ```
- **Response (201 Created):** Returns the persisted `Transaction` object.

#### 4. Update / Delete Transaction
- **Update:** `PUT /api/v1/transactions/:id` — updates partial fields (`amount`, `notes`, `categoryId`, etc.)
- **Delete:** `DELETE /api/v1/transactions/:id` — removes transaction and recalculates monthly spending.

---

### 3.3 Smart Receipt Scanner AI OCR Endpoint

- **Endpoint:** `POST /api/v1/ocr/scan`
- **Payload:** `multipart/form-data` with `file: Binary(image/jpeg, image/png, image/webp)` or `{ "sampleId": "sample_supermarket" }`
- **Response (200 OK):**
  ```json
  {
    "merchant": "PT Lion Super Indo",
    "date": "2026-10-17",
    "totalAmount": 148500,
    "receiptImageUrl": "https://images.unsplash.com/photo-1554415707-9e49016a3505?w=600",
    "lineItems": [
      { "id": "item_1", "name": "Beras Premium Ramos 5kg", "price": 74000, "quantity": 1 },
      { "id": "item_2", "name": "Minyak Goreng Sania 2L", "price": 38500, "quantity": 1 },
      { "id": "item_3", "name": "Telur Ayam Negeri 1kg", "price": 36000, "quantity": 1 }
    ],
    "suggestedCategoryId": "cat_shopping",
    "confidenceScore": 98
  }
  ```

---

### 3.4 Budgeting & Monthly Allowance Endpoints

#### 1. Get Financial Summary
- **Endpoint:** `GET /api/v1/finance/summary`
- **Response (200 OK):**
  ```json
  {
    "totalBalance": 11304500,
    "thisMonthIncome": 15000000,
    "thisMonthExpense": 3695500,
    "totalBudgetLimit": 6700000,
    "totalBudgetSpent": 3695500,
    "remainingBudget": 3004500,
    "monthlyAllowance": 6700000
  }
  ```

#### 2. Update Category Budget Limit
- **Endpoint:** `PUT /api/v1/budgets/:categoryId`
- **Request Body:** `{ "limitAmount": 1500000 }`
- **Response (200 OK):** `{ "success": true, "categoryId": "cat_food", "newLimit": 1500000 }`

#### 3. Update Monthly Allowance
- **Endpoint:** `PUT /api/v1/finance/allowance`
- **Request Body:** `{ "monthlyAllowance": 7500000 }`
- **Response (200 OK):** `{ "success": true, "monthlyAllowance": 7500000 }`

---

### 3.5 Admin Backoffice & Operational Endpoints

#### 1. Platform KPI Statistics
- **Endpoint:** `GET /api/v1/admin/stats`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "totalUsers": 1248,
    "totalVolume": 1425000000,
    "activeMitraCount": 84,
    "pendingVerificationsCount": 3,
    "openComplaintsCount": 2
  }
  ```

#### 2. Partner (Mitra) Verification
- **List Mitra:** `GET /api/v1/admin/mitra`
- **Update Verification Status:** `PUT /api/v1/admin/mitra/:id/verify`
- **Request Body:**
  ```json
  {
    "status": "VERIFIED",
    "notes": "Legalitas NIB dan SIUP telah divalidasi lengkap oleh tim compliance."
  }
  ```

#### 3. Support & Dispute Complaints
- **List Complaints:** `GET /api/v1/admin/complaints`
- **Update Complaint Status:** `PUT /api/v1/admin/complaints/:id/status`
- **Request Body:**
  ```json
  {
    "status": "RESOLVED",
    "resolutionNote": "Kategori transaksi telah disesuaikan dan cache pengguna telah direset."
  }
  ```

---

## 4. Complete Application Flows

### 4.1 Root Domain & Authentication Flow (`cuanly.vercel.app` / `/`)
```
User navigates to https://cuanly.vercel.app/ (Root URL `/`)
  │
  ├─► RootPage (`src/app/page.tsx`) mounts
  │     ├── Executes `logout()` (Clears active session & reset auth state)
  │     └── Issues `router.replace('/login')`
  │
  └─► User arrives on `/login`
        ├── Shows official Cuanly branding & language switcher
        ├── Presents username/email & 6-digit PIN fields
        ├── Provides 1-Click Demo User & Admin buttons
        └── User must authenticate before accessing `/beranda` or `/admin/dashboard`
```

### 4.2 3-Minute Inactivity Session Timeout Flow
```
User is authenticated and active on `/beranda` or `/admin/*`
  │
  ├─► User Interaction Tracking:
  │     ├── Monitored events: `mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`
  │     └── Throttled activity updates written to `cuanly_last_activity` (max once every 2 seconds)
  │
  ├─► Periodic Inactivity Polling:
  │     └── Polling interval runs every 2,000ms checking `Date.now() - cuanly_last_activity`
  │
  ├─► Inactivity threshold exceeded (>= 3 minutes / 180,000ms):
  │     ├── `AuthContext.handleTimeout()` triggers
  │     ├── Session cleared: `localStorage.removeItem('cuanly_auth_user')`
  │     ├── Activity cleared: `localStorage.removeItem('cuanly_last_activity')`
  │     ├── Timeout marker set: `sessionStorage.setItem('cuanly_session_timed_out', 'true')`
  │     └── Hard redirect: `window.location.href = '/login?reason=timeout'`
  │
  └─► Login Screen (`/login`):
        ├── Detects `cuanly_session_timed_out` or `reason=timeout` in URL
        └── Renders prominent amber notification banner:
              "Session Expired (3-Minute Timeout) / Sesi Berakhir (Timeout 3 Menit)"
              "Your account session timed out after 3 minutes of inactivity for security reasons. Please log in again."
```

### 4.3 Route Protection & RBAC Flow (`AppShell.tsx`)
```
Route Navigation Triggered
  │
  ├─► Route is Auth Page (`/login` or `/register`):
  │     └── Render Auth Layout immediately (no auto-bouncing to beranda)
  │
  ├─► Route is Protected (`/beranda`, `/transaksi`, `/budget`, `/profil`, `/admin/*`):
  │     ├── If `!isAuthenticated`:
  │     │     └── `router.replace('/login')`
  │     ├── If `isAuthenticated` and regular `USER` attempts `/admin/*`:
  │     │     └── `router.replace('/beranda')`
  │     └── If `isAuthenticated` with valid role:
  │           └── Render page with AppShell layout (TopHeader, DesktopNav, BottomNav)
```

### 4.4 Financial Dashboard & Overbudget Alert Flow (`/beranda`)
```
Dashboard Loaded (`/beranda`)
  │
  ├─► FinanceContext computes:
  │     ├── Total Balance = Total Income - Total Expense
  │     ├── Monthly Allowance vs Total Expense
  │     └── Spending per category vs Budget Limits
  │
  ├─► Overbudget Rule Evaluation (Hick's Law 6 Core Categories):
  │     ├── If any Category Spent >= 80% of Category Limit:
  │     │     └── Trigger `activeBudgetWarning`
  │     └── Render High-Visibility Warning Banner:
  │           "Spending Warning! Your spending for Belanja has reached 106% of your budget limit."
  │
  ├─► Interactive Visualizations:
  │     ├── Monthly Cashflow Area/Bar Chart (Income vs Expense)
  │     └── Category Donut Breakdown Chart (Percentage per category)
  │
  └─► Inline Allowance Modal:
        └── User taps "Edit Allowance" to adjust overall monthly ceiling
```

### 4.5 Smart Receipt Scanner AI OCR Flow (`/transaksi/scan`)
```
Receipt Scan Initiated (`/transaksi/scan`)
  │
  ├─► User Input Option:
  │     ├── Option A: Drag & drop / upload JPG, PNG, WebP image (max 5MB)
  │     └── Option B: Tap 1-Click Sample (Superindo Market, Starbucks, Pertamina Gas)
  │
  ├─► AI OCR Simulation (`simulateOcrExtraction` in `src/lib/ocr-simulator.ts`):
  │     ├── Simulates 1,200ms neural inference latency
  │     ├── Extracts Store Name / Merchant
  │     ├── Parses Date & Total Transaction Amount
  │     ├── Dissects Individual Line Items (Item Name, Price, Quantity)
  │     └── Matches Suggested Category (Confidence Score: 98%)
  │
  ├─► User Review Screen:
  │     ├── Editable fields (Merchant, Date, Amount, Category)
  │     ├── Itemized receipt breakdown list
  │     └── Attached image preview thumbnail
  │
  └─► Save Transaction:
        ├── Appends new Transaction with attached `receipt` payload
        ├── Automatically deducts from category budget and overall allowance
        └── Redirects to `/transaksi` with instant state update
```

### 4.6 Multi-Currency & Custom Currency Addition Flow
```
User opens Transaction Form (`/transaksi/tambah`)
  │
  ├─► Currency Selector displays available currencies:
  │     ├── Preset: `IDR` (Rp), `USD` ($), `EUR` (€), `SGD` (S$), `JPY` (¥), `MYR` (RM)
  │     └── User-added Custom Currencies from `cuanly_custom_currencies`
  │
  ├─► User taps "+ Add New Currency":
  │     ├── Modal prompts: Currency ISO Code (e.g. "AUD"), Symbol (e.g. "A$"), Name ("Australian Dollar")
  │     ├── Input validated against duplicate codes
  │     └── Persisted to `LanguageContext` and `cuanly_custom_currencies`
  │
  └─► Transaction Saved with Specific Currency:
        └── Displays formatted amounts with the transaction's native symbol throughout the app
```

### 4.7 Monthly Allowance Adjustment Flow (`EditAllowanceModal.tsx`)
```
Allowance Modal Triggered from:
  • Hero Card on `/beranda` ("Edit Allowance" button)
  • Page Header on `/budget` ("Edit Overall Allowance")
  • Settings on `/profil` ("Monthly Budget Allowance")
  │
  ├─► Modal displays:
  │     ├── Current Allowance, Spent This Month, and Calculated Remaining Budget
  │     ├── Interactive Quick-Add preset buttons (+500rb, +1 Juta, Reset to 5 Juta, 10 Juta)
  │     └── Real-time remaining percentage progress ring
  │
  └─► Submit ("Simpan Alokasi"):
        ├── Writes new amount to `FinanceContext.setMonthlyAllowance()`
        ├── Persists to `localStorage.setItem('cuanly_monthly_allowance')`
        └── Instantly updates progress bars across all dashboard and budget views
```

### 4.8 Admin Backoffice Verification & Dispute Flow (`/admin/*`)
```
Admin Navigates to `/admin`
  │
  ├─► Dashboard (`/admin/dashboard`):
  │     ├── Platform KPI cards (Total Users, Transacted Volume, Active Mitra, Pending Tasks)
  │     └── Quick Action queues for pending mitra and open tickets
  │
  ├─► Mitra Verification (`/admin/verification` & `/admin/verification/[id]`):
  │     ├── Inspect business details, owner name, category, NIB, SIUP, and NPWP
  │     ├── Actions: "Approve / Verifikasi" (Status -> `VERIFIED`) or "Reject / Tolak" (Status -> `REJECTED`)
  │     └── Audit note recorded with timestamp
  │
  └─► Complaints & Dispute Resolution (`/admin/complaints` & `/admin/complaints/[id]`):
        ├── Filter by priority (`HIGH`, `MEDIUM`, `LOW`) and status (`OPEN`, `IN_PROGRESS`, `RESOLVED`)
        ├── Admin inputs official resolution explanation
        └── Status transitions to `RESOLVED`, archiving the ticket
```

### 4.9 Dark Mode Theme System & Universal Menu Styling Flow
```
User clicks Moon/Sun Toggle Button (TopHeader: strictly positioned to the left of Smart Receipt)
  │
  ├─► ThemeContext.toggleTheme() invoked:
  │     ├── Flips active theme ('light' <-> 'dark')
  │     ├── Persists setting to `localStorage.setItem('cuanly_theme', nextTheme)`
  │     └── Adds or removes `dark` class from `document.documentElement` (<html className="dark">)
  │
  ├─► Anti-FOUC Head Script (RootLayout):
  │     └── Checks `cuanly_theme` synchronously on page boot before CSS rendering to prevent visual flicker
  │
  └─► Universal Visual Effect Across Every Menu:
        ├── Top Header: Deep slate glass (`rgba(7, 16, 24, 0.92)`), dynamic Sun/Moon icon, white Cuanly logo
        ├── Beranda (/beranda): High-contrast balance card, dark cashflow & donut chart surfaces, glowing indicators
        ├── Transaksi (/transaksi): Dark glass cards, dark category filters, emerald/rose transaction badges
        ├── Tambah Transaksi (/transaksi/tambah): Dark modal inputs, dark currency dropdown, high-contrast numeric typography
        ├── Scan Receipt (/transaksi/scan): Dark camera preview, dark sample receipt cards, dark OCR breakdown table
        ├── Budget (/budget): High-contrast progress indicators, glowing amber/rose overspending warnings
        ├── Profil (/profil): Display Theme setting row with live theme toggle alongside Language & Currency
        ├── Admin Backoffice (/admin/*): Dark metrics cards, partner verification queues, dark audit tables
        ├── Modals & Drawers: EditAllowanceModal & NotificationDrawer with dark surfaces and cyan focus highlights
        └── Navigation: DesktopNav & BottomNav with dark glass styling, active cyan icon glow, and floating CTA
```

---


## 5. Data Models & TypeScript Type Definitions

Source: [src/types/index.ts](file:///c:/Users/muhas/Desktop/WORK%20Projects/cuanly-frontend/src/types/index.ts)

```typescript
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: Role;
  pin?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ReceiptLineItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  receiptImageUrl: string;
  lineItems: ReceiptLineItem[];
  suggestedCategoryId: string;
  confidenceScore: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  currencySymbol?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  date: string;
  notes?: string;
  receipt?: ReceiptData;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameKey: string;
  fallbackName: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface BudgetLimit {
  id: string;
  userId: string;
  categoryId: string;
  categorySlug: string;
  limitAmount: number;
  period: string; // YYYY-MM
}

export interface FinancialSummary {
  totalBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  totalBudgetLimit: number;
  totalBudgetSpent: number;
  remainingBudget: number;
  monthlyAllowance: number;
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Mitra {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  verificationStatus: VerificationStatus;
  submissionDate: string;
  documentType: string;
  documentNumber: string;
  notes?: string;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Complaint {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVolume: number;
  activeMitraCount: number;
  pendingVerificationsCount: number;
  openComplaintsCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
```

---

## 6. Security & Compliance Architecture

1. **Inactivity Session Hardening (3-Minute Rule)**:
   - Eliminates risks of unauthorized access on unattended public or shared terminals.
   - Automatically cleanses `localStorage` tokens upon timeout and renders an explicit amber alert.
2. **Forced Entry Authentication on Root URL**:
   - Visiting `https://cuanly.vercel.app/` unconditionally executes `logout()` and points to `/login`.
   - Prevents stale sessions from immediately loading user financial balances when opening the public link.
3. **Role-Based Access Control (RBAC)**:
   - Guarded at the component shell level ([src/components/layout/AppShell.tsx](file:///c:/Users/muhas/Desktop/WORK%20Projects/cuanly-frontend/src/components/layout/AppShell.tsx)).
   - Regular users attempting to navigate to `/admin/*` are automatically bounced to `/beranda`.
4. **Input Sanitization & Validation**:
   - All monetary amounts are validated strictly as positive numbers.
   - PINs require minimum length (4–6 numeric digits) before submission.
5. **No Secret Exposure**:
   - Client code contains zero hardcoded API secrets, private encryption keys, or private backend tokens.

---

## 7. Operations & Build Verification

- **Runtime & Framework**: Next.js 16.4.2 (App Router with Turbopack).
- **TypeScript**: Strict compilation (`tsc --noEmit`).
- **Build Output**: Clean static generation (`○ Static`) for all 17 public and authenticated routes.
- **Verification Command**:
  ```bash
  npm run build
  ```
- **Deployment Platform**: Vercel Serverless / Edge Network.
