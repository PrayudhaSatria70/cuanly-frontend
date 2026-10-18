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

#### 1.2.1 Glassmorphism & Gradient Card Specification
- **Card Shell**: `bg-gradient-to-b from-white/95 via-white/85 to-[#F4F8FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95` with `backdrop-blur-2xl` and `border-white/80 dark:border-[#4D8DBA]/30`.
- **Card Content Containers**: Nested demo cards and form input fields utilize `backdrop-blur-xl` / `backdrop-blur-md` with soft linear gradients, specular light borders, and subtle radial ambient background glows.
- **Interactive Action Buttons**: CTA buttons feature rich multi-stop gradients (`from-[#4D8DBA] via-[#3B7B9E] to-[#2E678E]`), glass specular borders (`border-white/20`), and glowing focus/hover states.

### 1.3 Official Brand Logo Assets & Browser Thumbnail
| Asset Type | File Path | Specifications | Usage Scenario |
|---|---|---|---|
| **Light Mode Full Logo** | `/images/logo-light.png` | Blue navy wallet + blue navy "Cuanly" typography | Light mode headers, auth screens |
| **Light Mode Icon Only** | `/images/logo-light-icon.png` | Blue navy wallet icon with teal gauge | Light mode compact view / mobile |
| **Dark Mode Full Logo** | `/images/logo-dark.png` | Pure white wallet + pure white "Cuanly" typography | Dark mode headers, auth screens |
| **Dark Mode Icon Only** | `/images/logo-dark-icon.png` | Pure white wallet icon with teal gauge | Dark mode compact view / mobile |
| **Browser Thumbnail (Favicon)** | `/favicon.png`, `/favicon.svg`, `/apple-touch-icon.png`, `/favicon.ico` | Deep blue background squircle (`#00193B`) with white wallet and teal accent dial | Browser tabs, bookmarks, mobile PWA home screen |

### 1.4 Session & Security Configuration

| Setting | Value | Description |
|---|---|---|
| `SESSION_TIMEOUT_MS` | `180000` (3 minutes) | Maximum user inactivity duration before session auto-termination |
| `cuanly_auth_user` | LocalStorage item | Encoded user session payload (cleared on timeout or logout) |
| `cuanly_last_activity` | LocalStorage item | Unix timestamp of the most recent user interaction |
| `cuanly_session_timed_out` | SessionStorage item | Transient alert flag triggering the high-visibility red notification banner on `/login` |

### 1.3 State Keys & Local Storage Registry
| Key | Storage Engine | Type | Description |
|---|---|---|---|
| `cuanly_auth_user` | `localStorage` | `User` | Authenticated user payload |
| `cuanly_credentials_override` | `localStorage` | `Record<string, string>` | Password overrides for users/admin across logins |
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
| `cuanly_subscription_tier` | `localStorage` | `'FREE' \| 'SILVER' \| 'GOLD' \| 'B2B'` | Active subscription plan tier (default `FREE`) |
| `cuanly_wallets` | `localStorage` | `Wallet[]` | Multi-wallet directory (Free capped at 2, Silver+ unlimited) |
| `cuanly_debts` | `localStorage` | `DebtItem[]` | Debt & receivables entries (Gold+ feature) |
| `cuanly_workspace_members` | `localStorage` | `WorkspaceMember[]` | Multi-user team workspace accounts (B2B feature) |
| `cuanly_custom_budget_threshold` | `localStorage` | `number` | Custom overbudget threshold percentage (Gold+ feature) |


### 1.4 Pre-Configured Demo Credentials & Simplified Action Buttons
The login screen features simplified, direct action buttons for both demo personas (no nested "Fill Form" or "1-Click Login" sub-buttons):
- **User Account (Personal):**
  - Identifier: `user` or `user@cuanly.com`
  - PIN: `123456`
  - Action: Single-click directly authenticates and routes to `/beranda`
- **Admin Account (Backoffice):**
  - Identifier: `admin` or `admin@cuanly.com`
  - PIN: `999999`
  - Action: Single-click directly authenticates and routes to `/admin/dashboard`

---

## 2. API Contract

### 2.1 Authentication Endpoints
- **`POST /api/v1/auth/login`**
  - Request Body: `{ "identifier": "user" | "admin" | "...", "password": "..." }`
  - Headers: `Content-Type: application/json`
  - Response (200 OK): `{ "token": "jwt_...", "user": { "id": "usr_demo_01", "name": "Budi Santoso", "username": "user", "email": "user@cuanly.com", "role": "USER" } }`
  - Response (401 Unauthorized): `{ "statusCode": 401, "message": "Invalid credentials." }`

- **`PUT /api/v1/auth/password` (Settings -> Security & Timeout)**
  - Request Body: `{ "oldPassword": "...", "newPassword": "...", "confirmPassword": "..." }`
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Validation: `newPassword.length >= 6`, `newPassword === confirmPassword`, `newPassword !== oldPassword`
  - Response (200 OK): `{ "success": true, "message": "Login password updated successfully." }`
  - Response (400 Bad Request): `{ "statusCode": 400, "message": "New password confirmation does not match or length < 6." }`
  - Response (401 Unauthorized): `{ "statusCode": 401, "message": "Current password incorrect." }`

- **`PUT /api/v1/auth/profile` (Settings -> Account & Profile)**
  - Request Body: `{ "name": "...", "username": "...", "email": "...", "phone": "...", "avatarUrl": "..." }`
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Validation: `name.trim().length > 0`, email format regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Response (200 OK): `{ "success": true, "user": { ... } }`
  - Response (400 Bad Request): `{ "statusCode": 400, "message": "Full Name is required or invalid email format." }`
  - Response (401 Unauthorized): `{ "statusCode": 401, "message": "Unauthorized" }`

- **`POST /api/v1/auth/register`**
  - Request Body: `{ "name": "...", "email": "...", "username": "...", "phone": "...", "password": "..." }`
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
  │     └── Render Auth Layout immediately (centered modal view)
  │
  ├─► Route is Standalone Public Page (`/pricing`):
  │     └── Render Standalone Full-Width Layout (accessible without authentication)
  │
  ├─► Route is Protected (`/beranda`, `/transaksi`, `/budget`, `/profil`, `/admin/*`):
  │     ├── If `!isAuthenticated`:
  │     │     └── `router.replace('/login')`
  │     ├── If `isAuthenticated` and regular `USER` attempts `/admin/*`:
  │     │     └── `router.replace('/beranda')`
  │     └── If `isAuthenticated` with valid role:
  │           └── Render page with AppShell layout (TopHeader, DesktopNav, BottomNav)
```

### 3.4 Pricing Plan & Subscription Flow (`/pricing`)
```
Login Screen (`/login`)
  │
  ├─► User clicks "Pricing Plan" button in top-left corner (`fixed top-4 left-4 sm:top-6 sm:left-6 z-30`)
  │     └── Routed to `/pricing` via Next.js client-side navigation (`Link href="/pricing"`)
  │
  ├─► Pricing Plan Screen (`/pricing`):
  │     ├── Top Header: Back button (to `/login` or `/beranda`), Cuanly Logo, Theme Toggle, Language Switcher
  │     │
  │     ├── Hero Section:
  │     │     ├── Summary Cuanly ("Apa itu Cuanly?"):
  │     │     │     Comprehensive explanation of Cuanly as an all-in-one financial and budgeting platform.
  │     │     ├── Subscription Hook ("Tingkatkan Kemampuan Finansial Anda ke Level Berikutnya"):
  │     │     │     Compelling subscription value proposition highlighting unlimited wallets, CSV exports,
  │     │     │     smart threshold budgeting, priority cloud backups, and shared team workspaces.
  │     │     └── Billing Cycle Toggle: "Tagihan Bulanan" vs. "Tagihan Tahunan" (with up to 34% savings badge)
  │     │
  │     ├── 4 Pricing Plan Cards (derived from existing Cuanly feature matrix):
  │     │     1. Basic (Free):
  │     │        • Target: Pengguna Baru / Kasual
  │     │        • Price: Rp0 (Selamanya)
  │     │        • Features: Pencatatan manual dasar, maksimal 2 Wallets, laporan grafik bulanan standar, sinkronisasi cloud dasar.
  │     │     2. Silver Plan:
  │     │        • Target: Active User Personal
  │     │        • Price: Rp10.000 / bulan (atau Rp89.000/tahun)
  │     │        • Features: Unlimited Wallets, ekspor laporan ke CSV/Excel, akses filter grafik kustom (by rentang tanggal), bebas iklan.
  │     │     3. Gold Plan (Best Value / Recommended):
  │     │        • Target: Power User / Kreator
  │     │        • Price: Rp25.000 / bulan (atau Rp199.000/tahun)
  │     │        • Features: Semua fitur Silver + Fitur Budgeting (Custom Threshold), manajemen utang/piutang manual, prioritas cloud backup.
  │     │     4. B2B Plan (Team / Business):
  │     │        • Target: UMKM / Keuangan Bersama
  │     │        • Price: Rp59.000 / bulan (Maks. 3-5 akun)
  │     │        • Features: Semua fitur Gold + Shared Workspace (Satu database dompet bersama yang bisa diakses & diedit beberapa akun tim).
  │     │
  │     ├── Comparative Table ("📊 Tabel Pricelist Berdasarkan Fitur Eksisting Cuanly"):
  │     │     Full tabular view matching the canonical pricelist specifications verbatim.
  │     │
  │     ├── FAQ Section:
  │     │     Collapsible accordion answering core questions regarding pricing, security, and workspaces.
  │     │
  │     └── Action Handling:
  │           ├── Unauthenticated users clicking CTA -> routes to `/register?plan={id}&billing={cycle}`
  │           └── Authenticated users clicking CTA -> opens interactive plan confirmation modal with simulated activation
```

### 3.4 Financial Dashboard & Overbudget Alert Flow (`/beranda`)
- Financial summaries computed reactively.
- Hick's Law 6 core categories evaluated; if spending reaches >= 80% of limit, high-visibility red spending warning banner is displayed.
- Cashflow and Category Donut charts rendered.
- Floating quick-action buttons for Add Expense and Scan Receipt.

### 3.5 AI Receipt Scanner Flow (`/transaksi/scan`)
- **Action Selection Modal**:
  - Clicking "Open Camera / Choose File" or the dashed receipt dropzone opens an interactive Action Modal asking *"Choose What You Want to Do / Pilih Tindakan yang Ingin Dilakukan"*.
  - **Option 1 ("Open Device Camera / Buka Kamera Perangkat")**:
    - Launches a live in-browser Camera Viewfinder Modal utilizing `navigator.mediaDevices.getUserMedia`.
    - Features a receipt alignment guideline overlay, camera switcher (front/back), live circular shutter button, instant photo preview review (*Use This Photo* vs. *Retake Photo*), and graceful error fallback for blocked/unsupported camera hardware.
    - Captured photos are encoded as Blobs and processed directly through the OCR engine.
  - **Option 2 ("Choose File from Device / Pilih File dari Perangkat")**:
    - Opens the system native file dialog for JPG, PNG, and WebP images.
- **Drag & Drop**: Direct drag-and-drop of receipt images onto the dropzone immediately initiates processing.
- **OCR Engine & Latency**: 1.2s OCR inference latency simulation extracts merchant name, date, total amount, itemized line items, and smart category assignment with confidence scoring.
- **Review Screen**: Allows inline editing of merchant, total, date, category, and notes before one-click confirmation into the user's expense ledger.

### 3.6 Multi-Currency & Allowance Editing Flows
- **Currency-Specific Decimal Precision & Separator Conventions**:
  - **IDR (Indonesian Rupiah)**: 0 decimals with dot thousands separator (`Rp 1.250.000`).
  - **USD (US Dollar)**: 2 decimals with comma thousands and dot decimal separator (`$1,250.00`).
  - **EUR (Euro)**: 2 decimals with dot thousands and comma decimal separator (`€1.250,00`).
  - **JPY (Japanese Yen)**: 0 decimals with comma thousands separator (`¥1,250`).
  - **SGD (Singapore Dollar)**: 2 decimals (`S$ 1,250.00`).
  - **MYR (Malaysian Ringgit)**: 2 decimals (`RM 1,250.00`).
  - **BHD / KWD / OMR**: 3 decimals (`KWD 1,250.000`).
  - **Custom Currencies**: User can explicitly select decimal precision (0, 2, or 3 decimal places) when creating custom currencies in `/settings` or `/transaksi/tambah`.
- **Reactive History Synchronization**: Changing the currency in the Add Transaction menu (`/transaksi/tambah`) immediately updates the active currency globally via `LanguageContext`. All transaction histories on the Transaction Ledger (`/transaksi`), Recent Transactions on Dashboard (`/beranda`), and Transaction Details (`/transaksi/[id]`) reactively synchronize and display using the newly selected currency and its specific decimal format.
- **Monthly Allowance**: Adjustable via interactive modal on home, budget, and profile pages.

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


### 3.8 Comprehensive Settings & Preferences Flow (`/settings`)
```
User navigates to Settings (DesktopNav: directly below Profile, or via Shortcut in /profil)
  → Tabs: Appearance, Language & Currency, Budget & Warning, Smart OCR Scanner, Security & Timeout, Notifications, Backup & Reset, Account & Access
  → Appearance: Dark / Light mode toggle, live palette cards (#4D8DBA, #8AD6D1, #AEC4D4)
  → Localization: EN (default) / ID switcher, dynamic date/currency formatter
  → Multi-Currency: Active currency selection, currency catalog, integrated "Add Custom Currency" modal
  → Budget & Warning: Monthly allowance editor (setMonthlyAllowance), spending warning red banner threshold slider (70% - 90%)
  → Smart OCR: Latency speed selection (Fast 0.6s / Standard 1.2s / Thorough 2.0s), auto-categorization toggle, review before saving toggle
  → Security & Sesi: Inactivity timeout duration selector (1m, 3m, 5m, 10m) via setSessionTimeoutDuration; Account Login Password update form (Current Password, New Password min. 6 chars, Confirm Password, eye visibility toggles, and immediate credential override synchronization)
  → Notifications: Spending warning banner toggle, critical overbudget alert toggle, sound toggle, clear all notifications button
  → Backup & Data: Export full state backup to JSON, export ledger to CSV, restore JSON backup file, factory reset demo data modal
  → Account & Profile: Dual-mode View/Edit interface. View Mode presents read-only fields with locked badges and "Edit Profile" CTAs; Edit Mode enables form inputs, avatar upload/presets, "Cancel" revert, and "Save Profile Changes" persistence; role indicator (USER / ADMIN), demo role switcher, Backoffice link (ADMIN), logout
```

### 3.9 Profile Shortcut Modal Flow (`TopHeader` Avatar Popover)
```
User clicks Profile Avatar Icon in TopHeader
  → Popover modal toggles directly beneath the icon (absolute right-0 top-full mt-2.5 z-50)
  → Identity Header: Renders user avatar photo, display name, user email, and role badge (USER / ADMIN)
  → Shortcut 1 (Edit Profile): Links to `/settings?tab=account&edit=true` to directly open interactive profile in Edit Mode; closes popover on click
  → Shortcut 2 (Settings): Links to `/settings` with preferences subtitle; closes popover on click
  → Shortcut 3 (Bahasa / Language Switcher): Inline 2-column switcher (English vs Indonesia)
       - Immediate reactive language change via `setLocale('en' | 'id')`
       - Visual checkmark indicator on the active language
  → Shortcut 4 (Logout): Invokes `logout()`, clears session keys, redirects to `/login`
  → Outside Click & Keyboard Accessibility:
       - Clicking anywhere outside `profileMenuRef` automatically closes the modal
       - Pressing `Escape` key closes the modal
```

### 3.10 Profile View & Edit Dual-Mode Workflow (`/settings?tab=account`)
```
User opens Account Tab in Settings (or arrives from /profil or TopHeader with `?tab=account&edit=true`)
  │
  ├── 1. Default State: VIEW MODE (Locked / Read-Only)
  │     ├── Form inputs (Full Name, Username, Email, Phone) have `disabled={true}` with Read-only tags
  │     ├── Profile picture is locked in display mode; file upload trigger, URL input, and presets are hidden
  │     ├── Mode indicator banner: "Mode Lihat (Terkunci)" with lock icon
  │     └── Primary action displayed: "Edit Profile" ("Edit Profil") with Edit3 icon in header & bottom row
  │
  ├── 2. User Clicks "Edit Profile" Button
  │     ├── `isEditingProfile` state transitions to `true`
  │     ├── Mode indicator banner switches to active pulse: "Mode Edit (Aktif)" with Sparkles icon
  │     ├── All form inputs unlock (`disabled={false}`) with focus ring highlights and required indicators
  │     ├── Avatar management tools appear: "Upload Photo", "Photo URL", "Remove Photo", and 6 Preset Avatars
  │     └── Action buttons update to:
  │           - "Cancel" ("Batal"): Discards changes, reverts fields to saved user data, returns to View Mode
  │           - "Save Profile Changes" ("Simpan Perubahan Profil"): Primary submit button with Check icon
  │
  ├── 3. User Clicks "Cancel" ("Batal")
  │     ├── Form fields revert to existing `user` snapshot in AuthContext
  │     ├── `isEditingProfile` transitions to `false` (returns to View Mode)
  │     └── Cancellation feedback toast displayed
  │
  └── 4. User Clicks "Save Profile Changes" ("Simpan Perubahan Profil")
        ├── Client-side validation: Name required, valid email regex pattern
        ├── Calls `updateUserProfile({ name, username, email, phone, avatarUrl })`
        ├── AuthContext synchronizes:
        │     - `user` state updated
        │     - `localStorage.setItem('cuanly_auth_user', ...)`
        │     - `localStorage.setItem('cuanly_registered_users', ...)`
        ├── System notification dispatched: "Profil dan foto profil berhasil diperbarui!"
        ├── Feedback toast displayed
        └── `isEditingProfile` transitions to `false` (smoothly returns to locked View Mode with updated data)
```

### 3.11 Complete Bilingual Localization & Notification Flow (`en` / `id`)
```
User changes Language (via LanguageSwitcher in TopHeader, Login, Settings, or Profile Shortcut)
  │
  ├── 1. Context Update & State Persistence:
  │     ├── `setLocale('en' | 'id')` triggers in LanguageContext
  │     ├── Local storage key `cuanly_locale` is immediately updated
  │     └── Translation dictionary `t` dynamically shifts between `src/i18n/id.ts` and `src/i18n/en.ts`
  │
  ├── 2. Core Translation Dictionary Parity:
  │     ├── 100% key parity enforced via TypeScript `TranslationDictionary = typeof id`
  │     ├── Strict compiler validation guarantees zero missing keys in English or Indonesian
  │     └── Includes: Common, Auth, Navigation, Home, Transactions, Receipt/Scanner, Budget,
  │         Allowance, Currency, Profile, Settings, Notifications, Categories, and Admin
  │
  ├── 3. Dynamic Category Localization:
  │     ├── Default categories use stable identifiers (`cat_food`, `cat_transport`, `cat_shopping`, etc.)
  │     ├── All components and views render `(t.categories as Record<string, string>)[cat.id] || cat.fallbackName`
  │     └── Guarantees instantaneous title updates across Budget cards, Transaction ledger, Donut Charts, and Category Management without database migrations
  │
  ├── 4. Notifications & Popups Bilingual Handling:
  │     ├── Notification items support dual-language schemas (`title` + `titleEn`, `message` + `messageEn`)
  │     ├── Drawer rendering evaluates `locale === 'en' && item.titleEn ? item.titleEn : item.title`
  │     ├── Toast feedback banners evaluate current active locale for real-time messages
  │     ├── Camera / Choice / Allowance / Custom Currency / Reset Data modals utilize localized dictionary keys
  │     └── Date and currency formatters automatically switch formats (`id-ID` with Rupiah vs `en-US` with USD/EUR/GBP/etc.)
```


---

## 4. Data

- **Primary Source:** Browser `localStorage` and `sessionStorage`.
- **Validation:** Strict typing via TypeScript interfaces, positive numeric constraints on monetary values, minimum 6 characters for login passwords with confirmation match validation.
- **Persistence Lifecycle:** Reactive state subscriptions persist changes immediately upon dispatch.

---

## 5. Security

- **Inactivity Protection:** Dynamic inactivity timer (1m, 3m default, 5m, 10m) cleanses session keys and redirects to `/login`.
- **Root Entrypoint Lockdown:** Directing to domain root `/` always invalidates session and forces re-login.
- **Password & Credential Security:**
  - Login passwords enforce a minimum length of 6 characters.
  - Interactive password visibility toggles (Eye/EyeOff) allow verification without exposing plain text in HTML source.
  - Credential updates in `/settings?tab=security` synchronize immediately with `cuanly_credentials_override`, updating `cuanly_auth_user` and user registries so subsequent logins require the new password.
  - Backwards-compatible PIN aliasing ensures existing PIN workflows gracefully resolve to the updated password.
- **Role Isolation & Strict RBAC Navigation Visibility:**
  - When logged in with Demo User (`USER` role), the Admin Backoffice navigation section in `DesktopNav` is completely hidden from the sidebar, and no admin indicators appear in `TopHeader`.
  - When logged in with Demo Admin (`ADMIN` role), the Admin Backoffice navigation section appears in `DesktopNav` with full access to Dashboard, Users, Verification, All Transactions, Categories, and Complaints.
  - Route guard in `AppShell` strictly checks `user?.role === 'ADMIN'`; any attempt by non-admins to access `/admin/*` directly via URL is intercepted and redirected to `/beranda`.
- **Credential Safety:** Client code is sanitized and free of private API keys or hardcoded secrets.
- **CSV Formula Injection Mitigation (CWE-1236):**
  - Both `/transaksi` and `/settings` CSV export engines execute automated cell prefix sanitization (`sanitizeCsvCell`).
  - Cells starting with dangerous formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a leading single quote (`'`), preventing remote code execution or spreadsheet formula exploitation when exported files are opened in MS Excel or LibreOffice Calc.
- **XSS & Injection Protection (OWASP Top 10):**
  - Zero dynamic HTML string interpolation into DOM sinks.
  - The single static usage of `dangerouslySetInnerHTML` in `src/app/layout.tsx` is confined to static dark-mode anti-flicker initialization without external or user parameters.
- **Input Validation & Sanitization:**
  - Strict RegExp boundary verification for emails, non-negative numbers for monetary transactions, and defensive array bounds.
- **SonarQube Quality Gate & Static Analysis:**
  - 0 syntax/runtime errors, strict TypeScript compiler check (`tsc --noEmit`), and 0 broken links across 19 static/dynamic Next.js routes.

## 6. Subscription & Pricing Plan Architecture

### 6.1 Pricing Plan Matrix
The subscription model adheres strictly to the canonical pricing tier structure:
| Plan Tier | Price / Month | Key Features Included | Restrictions / Gates |
|---|---|---|---|
| **Basic (Free)** | Rp0 | Pencatatan manual, grafik bulanan standar, cloud sync dasar | Maksimal **2 dompet/rekening**, tidak ada ekspor CSV, filter tanggal standar |
| **Silver Plan** | Rp10.000 | **Unlimited dompet**, Ekspor CSV & Excel, Filter grafik rentang tanggal kustom, Bebas iklan | Bebas iklan, tidak termasuk custom threshold, utang/piutang, atau workspace |
| **Gold Plan** | Rp25.000 | Seluruh fitur Silver + **Budgeting custom threshold alert**, **Manajemen utang & piutang manual**, **Prioritas cloud backup** | Tidak termasuk shared team workspace multi-user |
| **B2B Plan** | Rp59.000 | Seluruh fitur Gold + **Shared workspace tim kecil (3-5 user)**, **Multi-user role permissions**, **Dompet bersama (shared pool)** | Akses penuh tanpa batasan fitur |

### 6.2 Canva-Style Premium Thumbnail Badges (`PremiumCrownBadge`)
In alignment with Canva's Pro visual language, premium feature triggers display a gold crown thumbnail badge:
- **Visual Spec:** Lucide `Crown` icon with rich amber gradient fill (`fill-amber-400 text-amber-500` or gold pill gradient `from-amber-400 to-amber-500`).
- **Placement Locations:**
  - `src/components/finance/WalletManagerModal.tsx`: Rendered on "+ Tambah Dompet Baru" button when free quota (2 wallets) is reached.
  - `src/app/(user)/transaksi/page.tsx`:
    - "Ekspor CSV" button (`PremiumCrownBadge plan="SILVER"`)
    - "Rentang Tanggal" filter button (`PremiumCrownBadge plan="SILVER"`)
  - `src/app/(user)/budget/page.tsx`:
    - "Threshold: X%" custom alert button (`PremiumCrownBadge plan="GOLD"`)
  - `src/app/(user)/beranda/page.tsx`:
    - "Kelola Dompet" quick action
    - "Utang & Piutang" feature button (`PremiumCrownBadge plan="GOLD"`)
    - "Shared Workspace" feature button (`PremiumCrownBadge plan="B2B"`)
  - `src/components/layout/TopHeader.tsx`:
    - Header plan badge pill with Canva gold crown
    - Profile shortcut modal subscription card
  - `src/components/layout/DesktopNav.tsx`:
    - "Fitur Berlangganan" sidebar items
    - Bottom sidebar upgrade card with Canva crown thumbnail button
  - `src/app/(user)/settings/page.tsx`:
    - Data tab "Export CSV" button (`PremiumCrownBadge plan="SILVER"`)
    - Data tab "Prioritas Cloud Backup" card (`PremiumCrownBadge plan="GOLD"`)
    - Budget tab "Custom Threshold" button (`PremiumCrownBadge plan="GOLD"`)

### 6.3 Upgrade Modal Flow (`UpgradeModal.tsx`)
When an unauthorized user clicks on any locked feature:
1. `openUpgradeModal(featureName, requiredPlan, description, benefits)` is invoked via `SubscriptionContext`.
2. The modal pops up globally above the UI with title:
   > **"Upgrade Plan untuk Mengakses Fitur Lebih Lanjut"**
3. It presents:
   - Feature name badge with required plan tier (`Silver`, `Gold`, or `B2B`).
   - Feature description explaining why the feature is locked and how it benefits the user.
   - Comprehensive checklist of included benefits in the target tier.
   - Monthly and annual pricing comparison (`Rp10.000/bln` for Silver, `Rp25.000/bln` for Gold, `Rp59.000/bln` for B2B).
   - Primary CTA: **"Lihat Halaman Pricing Plan"** (navigates user to `/pricing`).
   - Secondary Instant Simulation CTA: **"Aktifkan [Plan] (Simulasi Instan)"** (allows immediate client-side unlocking for testing).

### 6.4 Role-Based Pricing Exemption Policy (Admin Full Feature Access)
Strict role-based segregation governs pricing plan enforcement:
- **Pengguna Personal (`USER` & Demo User):**
  - Tunduk pada sistem kuota dan tier paket berlangganan (`FREE` secara default).
  - Dibatasi maksimal 2 dompet pada akun Free.
  - Tombol fitur premium (Ekspor CSV, Filter Rentang Tanggal, Custom Threshold, Utang & Piutang, Shared Workspace, Prioritas Backup) menampilkan **Canva-style gold crown badge** (`PremiumCrownBadge`).
  - Mengklik fitur terkunci akan memicu kemunculan modal *"Upgrade Plan untuk Mengakses Fitur Lebih Lanjut"*.
  - Menampilkan banner/pill ajakan upgrade di `TopHeader`, `DesktopNav`, dan `beranda`.
- **Pengguna Admin (`ADMIN` & Demo Admin):**
  - **TIDAK KENA** pricing plan apapun dan **WAJIB FULL FEATURE** secara permanen.
  - Evaluasi `isAdmin = role === 'ADMIN' || user?.role === 'ADMIN'`.
  - `effectivePlan` otomatis di-set ke level tertinggi (`B2B`).
  - `hasAccess(tier)` mengembalikan nilai `true` tanpa syarat untuk seluruh tier (`SILVER`, `GOLD`, `B2B`).
  - Batas 2 dompet pada `addWallet()` di-bypass; admin bebas membuat dompet tanpa batas (*unlimited wallets*).
  - Bebas ekspor laporan CSV/Excel, filter tanggal kustom, manajemen utang/piutang, shared team workspace, dan custom threshold alert.
  - Pemanggilan `openUpgradeModal()` langsung di-bypass (`if (isAdmin) return;`) sehingga pop-up upgrade **tidak akan pernah muncul**.
  - Komponen `PremiumCrownBadge` me-return `null` jika `isAdmin === true`, sehingga seluruh tombol di aplikasi bersih dari icon gembok/mahkota untuk akun admin.
  - Indikator profil di `TopHeader` menampilkan badge `FULL` dengan keterangan *"Admin Full Access (Full Feature • Tanpa Kuota)"*, serta banner upgrade di sidebar `DesktopNav` disembunyikan.


---

## 7. Operations

- **Build Target:** Next.js 16.4.2 (App Router + Turbopack).
- **Deployment:** Vercel Serverless / Edge Network.
- **Static Optimization:** All 19 routes compile cleanly (`○ Static` / `ƒ Dynamic`).
- **Zero-Bug Verification:** `npx tsc --noEmit` and `next build` executed with exit code 0.
