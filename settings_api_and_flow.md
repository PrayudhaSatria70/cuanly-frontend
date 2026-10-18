# Cuanly — Settings, API, and Flow Documentation (Revised)

Canonical documentation for the **Cuanly** Financial Web Application (Frontend Architecture, Contracts & Flows).

---

## 1. Settings

### 1.1 Environment Configuration
| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | `Cuanly` | Application display title |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | Default language (`en` for English by default, `id` optional) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | `IDR` | Primary default currency (Rupiah `Rp`), expandable with custom currencies |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api/v1` | Future backend API endpoint base URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | When true, uses the reactive LocalStorage Mock Engine |

### 1.2 Authentication Credentials (Demo Accounts)

#### 1. Demo User Account (Personal Finance)
- **Username:** `user`
- **Email:** `user@cuanly.com`
- **PIN / Password:** `123456`
- **Role:** `USER`
- **Access:** `/beranda`, `/transaksi`, `/transaksi/scan`, `/transaksi/tambah`, `/transaksi/[id]`, `/budget`, `/budget/[slug]`, `/profil`.
- **Preloaded Data:** 10 realistis transaksi pemasukan & pengeluaran, struk belanja Superindo, alokasi budget 6 kategori, peringatan overbudget belanja.

#### 2. Demo Admin Account (Platform Backoffice)
- **Username:** `admin`
- **Email:** `admin@cuanly.com`
- **PIN / Password:** `999999`
- **Role:** `ADMIN`
- **Access:** `/admin/dashboard`, `/admin/users`, `/admin/users/[id]`, `/admin/verification`, `/admin/verification/[id]`, `/admin/transactions`, `/admin/categories`, `/admin/complaints`, `/admin/complaints/[id]`.
- **Preloaded Data:** Metrik platform, 4 mitra usaha terdaftar, antrean verifikasi dokumen legalitas, audit log seluruh mutasi, dan tiket keluhan pelanggan.

---

## 2. API Contract

The frontend implements an abstracted API client layer (`src/lib/api-client.ts`) with identical signatures to the future backend REST service.

### 2.1 Authentication Endpoints
- **`POST /api/v1/auth/login`**
  - Request Body: `{ "identifier": "user" | "user@cuanly.com", "pin": "123456" }`
  - Response (200 OK): `{ "token": "...", "user": { "id": "usr_demo_01", "name": "Budi Santoso", "username": "user", "email": "user@cuanly.com", "role": "USER" } }`
- **`POST /api/v1/auth/register`**
  - Request Body: `{ "name": "...", "email": "...", "username": "...", "phone": "...", "pin": "..." }`
  - Response (201 Created): `{ "token": "...", "user": { ... } }`

---

## 3. Flow

### 3.1 Authentication & Route Guard Flow (`AppShell.tsx`)
```
User visits http://localhost:3000/
  │
  ├─► AppShell inspects `isAuthenticated` in `AuthContext`
  │
  ├─► If NOT logged in:
  │     ├── Redirects immediately to `/login`
  │     └── Renders clean, standalone Login Screen without topbar/bottombar
  │
  ├─► If User logs in via:
  │     ├── Option A: 1-Click "Demo User" button
  │     ├── Option B: 1-Click "Demo Admin" button
  │     └── Option C: Types username/email & 6-digit PIN manually
  │
  └─► Success Redirection:
        ├── Role `USER`  ──► Redirects to `/beranda`
        └── Role `ADMIN` ──► Redirects to `/admin/dashboard`
```

### 3.2 Registration & Auth Navigation Flow (`/register` & `/login`)
- **Login Screen Hierarchy:** Single centered card (`max-w-md`) presenting the primary login form, followed by the registration prompt ("Belum punya akun?"), with the dedicated Demo Account buttons (User & Admin) positioned neatly below the divider. The login screen acts as the root entry gateway with clean brand header and language switcher (no back button needed).
- **Back Navigation:** The `/register` screen provides a dynamic back button (`router.back()` with fallback to `/login`) at the top bar and card footer to return to the login screen.
- **Bilingual Labels:** All labels, buttons, placeholders, and error messages adapt dynamically to current locale (`en` default, `id` optional).
- **Footer Navigation:** Quick navigation toggle between registration and login forms.

### 3.3 Desktop Edge-to-Edge Layout Architecture (`AppShell.tsx` & `TopHeader.tsx`)
- **Full-Width Top Header:** Spans `w-full px-4 sm:px-6 lg:px-8` without boxed constraints, placing brand logo on the far left and action pills/profile on the far right.
- **Docked Sidebar (`DesktopNav`):** Anchored directly to the left screen edge (`sticky top-16 h-[calc(100vh-4rem)] lg:w-72`), eliminating floating void space on the left.
- **Fluid Content Area:** Main container occupies the full remaining viewport (`flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8`), hosting cards and analytics within an expansive, responsive `max-w-7xl` layout without cramped gutters.

### 3.4 Currency Management & Multi-Currency Flow
- **Default Currency:** Indonesian Rupiah (`IDR` / `Rp`) is the active currency for all financial computations and visualizations by default, uncoupled from the display language (e.g. English displays `Rp 11,304,500` rather than defaulting to `$`).
- **Dynamic Currency Addition:** In `/transaksi/tambah`, users can select existing currencies (`IDR`, `USD`, `EUR`, `SGD`, `JPY`, `MYR`) or tap **`+ Add New Currency`** to register custom currencies with ISO code, custom symbol, and name.
- **Per-Transaction Currency:** Individual transactions record their specific `currency` and `currencySymbol`, rendered accurately in transaction lists and detail records.

### 3.5 Monthly Allowance Editing Flow (`EditAllowanceModal.tsx`)
- **Allowance Architecture:** Users can adjust their overall monthly spending allowance (`monthlyAllowance`) directly from:
  1. **Home Dashboard Hero Card (`/beranda`):** Via inline "Edit Allowance" action next to remaining budget and progress bar.
  2. **Budget Page Header (`/budget`):** Via "Edit Overall Allowance" button next to total allocation.
  3. **Profile Settings (`/profil`):** Under Application Preferences.
- **Interactive Modal:** Shows real-time recalculations of spent vs remaining budget, preset increment buttons (`+500rb`, `+1 Juta`, presets), and instantaneous persistence to `FinanceContext` and `cuanly_monthly_allowance`.

---

## 4. Security & Operations
- Client-side route guards on `/admin/*` prevent unauthorized regular user access.
- LocalStorage keys scoped to Cuanly namespace (`cuanly_auth_user`, `cuanly_transactions`, `cuanly_budgets`, `cuanly_locale`, `cuanly_active_currency`, `cuanly_custom_currencies`, `cuanly_monthly_allowance`).
- Clean separation between frontend presentation and backend contract.
