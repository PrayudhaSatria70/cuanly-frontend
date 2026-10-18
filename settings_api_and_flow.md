# Settings, API, and Flow Documentation

Canonical architectural and operational specification for **Cuanly** Financial Web Application (Authentication, Multi-Currency, Inactivity Timeout, OCR Scanner, Budgeting, Admin Backoffice, and Security Flows).

---

## 1. Settings

### 1.1 Environment Configuration
| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | `Cuanly` | Application display title |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | Default language (`en` for English default, `id` for Indonesian) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | `IDR` | Primary default currency (Rupiah `Rp`), expandable with custom currencies |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api/v1` | Future backend API endpoint base URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | LocalStorage Mock Engine enabled |

### 1.2 Brand Design System & Color Palette
| Role | Hex Code | Swatch Name | UI Application |
|---|---|---|---|
| **Primer** | `#4D8DBA` | Oceanic Steel Blue | Primary brand identity, main CTA buttons, active navigation states, dominant wallet logo body, focus rings |
| **Sekunder** | `#8AD6D1` | Fresh Mint Cyan | Secondary accents, positive cashflow indicators, progress bars, active icons, glowing highlights, peeking logo bill |
| **Tersier** | `#AEC4D4` | Slate Ice Blue | Glassmorphism panel borders, canvas gradient tinting, subtle chip backgrounds, neutral table outlines, muted labels |

### 1.3 Session & Security Configuration
| Setting | Value | Description |
|---|---|---|
| `SESSION_TIMEOUT_MS` | `180000` (3 minutes) | Maximum user inactivity duration before session auto-termination |
| `cuanly_auth_user` | LocalStorage item | Encoded user session payload (cleared on timeout or logout) |
| `cuanly_last_activity` | LocalStorage item | Unix timestamp of the most recent user interaction |
| `cuanly_session_timed_out` | SessionStorage item | Transient alert flag triggering the amber notification banner on `/login` |

### 1.3 State Keys & Local Storage Registry
| Key | Storage Engine | Type | Description |
|---|---|---|---|
| `cuanly_auth_user` | `localStorage` | `User` | Authenticated user payload |
| `cuanly_last_activity` | `localStorage` | `number` | Unix timestamp of latest interaction |
| `cuanly_session_timed_out` | `sessionStorage` | `string` | Transient timeout alert flag |
| `cuanly_transactions` | `localStorage` | `Transaction[]` | Stored transaction records |
| `cuanly_budgets` | `localStorage` | `BudgetLimit[]` | Per-category budget limits |
| `cuanly_categories` | `localStorage` | `Category[]` | Dynamic category registry |
| `cuanly_monthly_allowance` | `localStorage` | `number` | Overall monthly budget allowance |
| `cuanly_locale` | `localStorage` | `'en' \| 'id'` | Active localization locale |
| `cuanly_active_currency` | `localStorage` | `string` | Active selected currency code (`IDR`) |
| `cuanly_custom_currencies` | `localStorage` | `Currency[]` | Custom user-created currencies |
| `cuanly_theme` | `localStorage` | `'light' \| 'dark'` | Active theme selection, toggles `.dark` class on root `<html>` |
| `cuanly_notifications` | `localStorage` | `NotificationItem[]` | System notifications |
| `cuanly_admin_mitra` | `localStorage` | `Mitra[]` | Business partner verification records |
| `cuanly_admin_complaints` | `localStorage` | `Complaint[]` | User support complaints |
| `cuanly_admin_users` | `localStorage` | `User[]` | Registered users directory |


### 1.4 Pre-Configured Demo Credentials
- **Demo User (Personal Finance):**
  - Identifier: `user` or `user@cuanly.com`
  - PIN: `123456`
  - Target Path: `/beranda`
- **Demo Admin (Platform Management):**
  - Identifier: `admin` or `admin@cuanly.com`
  - PIN: `999999`
  - Target Path: `/admin/dashboard`

---

## 2. API Contract

### 2.1 Authentication Endpoints
- **`POST /api/v1/auth/login`**
  - Request Body: `{ "identifier": "user" | "user@cuanly.com", "pin": "123456" }`
  - Headers: `Content-Type: application/json`
  - Response (200 OK): `{ "token": "jwt_...", "user": { "id": "usr_demo_01", "name": "Budi Santoso", "username": "user", "email": "user@cuanly.com", "role": "USER" } }`
  - Response (401 Unauthorized): `{ "statusCode": 401, "message": "Invalid credentials." }`

- **`POST /api/v1/auth/register`**
  - Request Body: `{ "name": "...", "email": "...", "username": "...", "phone": "...", "pin": "..." }`
  - Response (201 Created): `{ "token": "jwt_...", "user": { ... } }`

- **`POST /api/v1/auth/logout`**
  - Headers: `Authorization: Bearer <token>`
  - Response (200 OK): `{ "success": true, "message": "Session invalidated." }`

### 2.2 Transactions & Cashflow Endpoints
- **`GET /api/v1/transactions`**
  - Query Params: `type`, `category`, `search`, `period`
  - Response (200 OK): `Transaction[]`
- **`GET /api/v1/transactions/:id`**
  - Response (200 OK): `Transaction` (including parsed `receipt` object)
- **`POST /api/v1/transactions`**
  - Request Body: `Omit<Transaction, 'id' | 'createdAt'>`
  - Response (201 Created): `Transaction`
- **`PUT /api/v1/transactions/:id`**
  - Request Body: `Partial<Transaction>`
  - Response (200 OK): `Transaction`
- **`DELETE /api/v1/transactions/:id`**
  - Response (200 OK): `{ "success": true, "id": "tx_01" }`

### 2.3 Smart OCR Scanner Endpoint
- **`POST /api/v1/ocr/scan`**
  - Payload: `multipart/form-data` with `file` or JSON `{ "sampleId": "sample_supermarket" }`
  - Response (200 OK):
    ```json
    {
      "merchant": "PT Lion Super Indo",
      "date": "2026-10-17",
      "totalAmount": 148500,
      "receiptImageUrl": "https://images.unsplash.com/...",
      "lineItems": [
        { "id": "item_1", "name": "Beras Premium Ramos 5kg", "price": 74000, "quantity": 1 }
      ],
      "suggestedCategoryId": "cat_shopping",
      "confidenceScore": 98
    }
    ```

### 2.4 Budget & Monthly Allowance Endpoints
- **`GET /api/v1/finance/summary`**
  - Response (200 OK): `FinancialSummary` (balances, expenses, income, limits, allowance)
- **`PUT /api/v1/budgets/:categoryId`**
  - Request Body: `{ "limitAmount": 1500000 }`
  - Response (200 OK): `{ "success": true, "newLimit": 1500000 }`
- **`PUT /api/v1/finance/allowance`**
  - Request Body: `{ "monthlyAllowance": 7500000 }`
  - Response (200 OK): `{ "success": true, "monthlyAllowance": 7500000 }`

### 2.5 Admin Operations Endpoints
- **`GET /api/v1/admin/stats`**: Platform KPI metrics.
- **`GET /api/v1/admin/mitra`**: Registered partner applications.
- **`PUT /api/v1/admin/mitra/:id/verify`**: Approve or reject partner documents with notes.
- **`GET /api/v1/admin/complaints`**: Dispute & support tickets.
- **`PUT /api/v1/admin/complaints/:id/status`**: Update ticket resolution note and status (`RESOLVED`).

---

## 3. Flow

### 3.1 Root Entrypoint Flow (`cuanly.vercel.app` / `/`)
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

### 3.2 3-Minute Inactivity Session Timeout Flow
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

### 3.3 Route Protection Flow (`AppShell.tsx`)
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

### 3.4 Financial Dashboard & Overbudget Alert Flow (`/beranda`)
- Financial summaries computed reactively.
- Hick's Law 6 core categories evaluated; if spending reaches >= 80% of limit, warning banner displayed.
- Cashflow and Category Donut charts rendered.
- Floating quick-action buttons for Add Expense and Scan Receipt.

### 3.5 AI Receipt Scanner Flow (`/transaksi/scan`)
- Input via camera, file drag & drop, or preset samples (Superindo, Starbucks, Pertamina).
- 1.2s OCR inference latency simulation extracts merchant, date, total, item breakdown, and category.
- Review screen enables verification before one-click saving to transaction ledger.

### 3.6 Multi-Currency & Allowance Editing Flows
- Currency selector defaults to `IDR`, expandable via custom currency creation modal.
- Monthly allowance adjustable via interactive modal on home, budget, and profile pages.

### 3.7 Dark Mode Theme Switching Flow
```
User clicks Moon/Sun button (TopHeader: directly to the left of Smart Receipt)
  → toggleTheme() executed in ThemeContext
  → class 'dark' toggled on document.documentElement (<html className="dark">)
  → Selection persisted to localStorage ('cuanly_theme': 'dark' | 'light')
  → Inline head anti-FOUC script guarantees zero flashing upon page refresh
  → Global CSS tokens (.dark .glass-*, .dark body) + Tailwind dark:* classes update
  → Visual effect immediately reflected across all menus (/beranda, /transaksi, /budget, /profil, /admin/*, modals)
```


---

## 4. Data

- **Primary Source:** Browser `localStorage` and `sessionStorage`.
- **Validation:** Strict typing via TypeScript interfaces, positive numeric constraints on monetary values, 4–6 digit transaction PIN rules.
- **Persistence Lifecycle:** Reactive state subscriptions persist changes immediately upon dispatch.

---

## 5. Security

- **Inactivity Protection:** 3-minute inactivity timer cleanses session keys and redirects to `/login`.
- **Root Entrypoint Lockdown:** Directing to domain root `/` always invalidates session and forces re-login.
- **Role Isolation:** Admin backoffice (`/admin/*`) strictly isolated from regular users via `AppShell` guards.
- **Credential Safety:** Client code is sanitized and free of private API keys or hardcoded secrets.

---

## 6. Operations

- **Build Target:** Next.js 16.4.2 (App Router + Turbopack).
- **Deployment:** Vercel Serverless / Edge Network.
- **Static Optimization:** All 17 routes compile statically (`○ Static`).
