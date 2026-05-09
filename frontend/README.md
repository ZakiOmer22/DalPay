<p align="center">
  <img src="public/logo.png" alt="DalPay Logo" width="200" />
</p>

<h1 align="center">DalPay Portal – Frontend Application</h1>
<h3 align="center">Government‑Grade Tax Payment Interface for the Somaliland Ministry of Finance</h3>

<p align="center">
  <strong>Citizens & Admins Accessible Portal</strong> – Built with React + Vite |
  Secure token‑based authentication | Real‑time dashboard | USSD simulator | AI‑informed alerts
</p>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [1. Overview](#1-overview)
- [2. Tech Stack](#2-tech-stack)
- [3. Project Structure](#3-project-structure)
  - [3.1 Root Configuration](#31-root-configuration)
  - [3.2 Public Assets](#32-public-assets)
  - [3.3 Source Code (`src/`)](#33-source-code-src)
    - [3.3.1 API Client (`api/`)](#331-api-client-api)
    - [3.3.2 Components (`components/`)](#332-components-components)
    - [3.3.3 Pages (`pages/`)](#333-pages-pages)
    - [3.3.4 Services (`services/`)](#334-services-services)
    - [3.3.5 Lib (`lib/`)](#335-lib-lib)
  - [3.4 Entry Points](#34-entry-points)
- [4. Communication with the Backend](#4-communication-with-the-backend)
  - [4.1 API Client Architecture](#41-api-client-architecture)
  - [4.2 Token Management \& User State](#42-token-management--user-state)
  - [4.3 Error Handling \& User Feedback](#43-error-handling--user-feedback)
- [5. Authentication \& Security on the Frontend](#5-authentication--security-on-the-frontend)
  - [5.1 Token Lifecycle](#51-token-lifecycle)
  - [5.2 Brute‑Force \& Lockout Feedback](#52-bruteforce--lockout-feedback)
  - [5.3 Self‑XSS Mitigation](#53-selfxss-mitigation)
  - [5.4 Content Security](#54-content-security)
- [6. Routing Architecture](#6-routing-architecture)
  - [6.1 Public Routes](#61-public-routes)
  - [6.2 Protected Dashboards](#62-protected-dashboards)
  - [6.3 Redirection Logic](#63-redirection-logic)
- [7. User Interface \& Styling](#7-user-interface--styling)
  - [7.1 Tailwind Configuration](#71-tailwind-configuration)
  - [7.2 Dark Mode](#72-dark-mode)
- [8. Key Components Deep‑Dive](#8-key-components-deepdive)
  - [8.1 Navbar](#81-navbar)
  - [8.2 Footer](#82-footer)
  - [8.3 Admin \& Taxpayer Dashboards](#83-admin--taxpayer-dashboards)
  - [8.4 USSDSimulatorPage](#84-ussdsimulatorpage)
- [9. Deployment](#9-deployment)
- [10. Testing](#10-testing)
  - [Manual Testing](#manual-testing)
  - [Automated Testing (Future)](#automated-testing-future)
- [11. Team](#11-team)
- [12. License](#12-license)
- [13. Data Flow \& State Management](#13-data-flow--state-management)
  - [13.1 API → UI Pipeline](#131-api--ui-pipeline)
  - [13.2 Global User State](#132-global-user-state)
  - [13.3 Local Component State](#133-local-component-state)
- [14. Component Interaction Patterns](#14-component-interaction-patterns)
  - [14.1 Props \& Composition](#141-props--composition)
  - [14.2 Custom Events](#142-custom-events)
  - [14.3 Context Providers](#143-context-providers)
- [15. Environment Variables Explained](#15-environment-variables-explained)
- [16. Error Handling Strategy](#16-error-handling-strategy)
  - [16.1 Network Errors](#161-network-errors)
  - [16.2 Backend Validation Errors](#162-backend-validation-errors)
  - [16.3 Global Error Boundary](#163-global-error-boundary)
- [17. Performance \& Optimization](#17-performance--optimization)
  - [17.1 Lazy Loading \& Code Splitting](#171-lazy-loading--code-splitting)
  - [17.2 Asset Optimization](#172-asset-optimization)
  - [17.3 Rendering Optimizations](#173-rendering-optimizations)
- [18. Accessibility](#18-accessibility)
- [19. Build Configuration \& Development Workflow](#19-build-configuration--development-workflow)
  - [19.1 Vite Proxy \& Aliases](#191-vite-proxy--aliases)
  - [19.2 Multiple Environments](#192-multiple-environments)
  - [19.3 Scripts \& Tooling](#193-scripts--tooling)
- [20. Testing Strategy](#20-testing-strategy)
  - [20.1 Unit \& Integration Tests](#201-unit--integration-tests)
  - [20.2 End‑to‑End Tests](#202-endtoend-tests)
  - [20.3 Manual Test Checklist](#203-manual-test-checklist)
- [21. Monitoring \& Logging](#21-monitoring--logging)
- [22. API Versioning \& Compatibility](#22-api-versioning--compatibility)

---

## 1. Overview

The DalPay frontend is the public‑facing web portal for the DalPay Digital Tax Payment System. It serves two primary user groups:

- **Taxpayers** – register, log in, view tax assessments, initiate payments via mobile money (simulated), check balance & payment history, download forms, and use the USSD simulator.
- **Administrators** – manage taxpayer profiles, generate tax assessments, monitor revenue, review fraud alerts, and access audit logs.

The application communicates exclusively with the DalPay backend API (`/api/v1`) over HTTPS (or HTTP in development). It handles token‑based authentication, maps backend error codes into user‑friendly messages, and applies a consistent security‑conscious design – from login lockout feedback to a console self‑XSS warning in production.

---

## 2. Tech Stack

| Layer          | Technology                                       |
|----------------|--------------------------------------------------|
| **Framework**  | React 18 (with React Router v6)                  |
| **Build Tool** | Vite 5+                                          |
| **Language**   | TypeScript                                       |
| **Styling**    | Tailwind CSS 3.4 (custom theme, dark mode)      |
| **Icons**      | Lucide React                                     |
| **HTTP**       | Fetch (wrapped in typed `api.ts` client)         |
| **State**      | React hooks + localStorage                      |
| **Stripe**     | @stripe/stripe-js, @stripe/react-stripe-js (conditional) |
| **Deployment** | Vercel (static, SPA)                             |

---

## 3. Project Structure

```
frontend/
├── public/                         # Static assets served at /
│   ├── logo.png                    # DalPay brand logo
│   └── icon.png                    # Favicon / mobile icon
├── src/
│   ├── api/                        # Typed API endpoint definitions
│   │   ├── auth.ts                 # Auth API functions (login, register, refresh, logout, OTP)
│   │   ├── tax.ts                  # Tax assessments & disputes API
│   │   ├── payment.ts              # Payment initiation, confirmation, history
│   │   ├── verification.ts         # Stripe Identity verification endpoints
│   │   ├── client.ts              # Base HTTP client (fetch wrapper)
│   │   └── index.ts               # Re‑exports all API modules
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── layout/                 # Layout containers for different sections
│   │   │   ├── Navbar.tsx          # Primary navigation bar
│   │   │   ├── Footer.tsx          # Global footer
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboardLayout.tsx  # Shell for admin pages (sidebar + topbar + content)
│   │   │   │   ├── AdminSidebar.tsx          # Admin navigation sidebar
│   │   │   │   └── AdminTopbar.tsx           # Admin header with user info and actions
│   │   │   └── taxpayer/
│   │   │       ├── TaxpayerDashboardLayout.tsx
│   │   │       ├── TaxpayerSidebar.tsx
│   │   │       └── TaxpayerTopbar.tsx
│   │   └── shared/                 # Shared utilities and presentational components
│   │       ├── ScrollToTop.tsx     # Resets scroll position on route change
│   │       ├── StripeProvider.tsx  # Conditional Stripe.js context
│   │       ├── Providers.tsx       # Composition of global context providers
│   │       ├── ThemeToggle.tsx     # Dark/Light mode toggle
│   │       ├── FooterTeamSection.tsx # Team member links in footer
│   │       └── SponsoredByUOH.tsx  # University of Hargeisa sponsor badge
│   │
│   ├── pages/                      # Page components (one per route)
│   │   ├── HomePage.tsx            # Landing page
│   │   ├── LoginPage.tsx           # Login (email/phone, error mapping)
│   │   ├── RegisterPage.tsx        # New taxpayer registration
│   │   ├── DashboardPage.tsx       # Role‑based splash / redirect
│   │   ├── PayTaxPage.tsx          # Initiate tax payment
│   │   ├── CheckBalancePage.tsx    # View outstanding tax balances
│   │   ├── TaxCalculatorPage.tsx   # Estimate tax amounts
│   │   ├── PaymentHistoryPage.tsx  # Paginated payment records
│   │   ├── TaxTypeIncomePage.tsx   # Income tax details
│   │   ├── TaxTypeBusinessPage.tsx # Business tax details
│   │   ├── TaxTypePropertyPage.tsx # Property tax details
│   │   ├── TaxTypeConsumptionPage.tsx # Consumption tax details
│   │   ├── FaqPage.tsx             # Frequently asked questions
│   │   ├── TaxRatesPage.tsx        # Current tax rate tables
│   │   ├── DownloadFormsPage.tsx   # Downloadable tax forms
│   │   ├── AboutPage.tsx           # About DalPay
│   │   ├── ContactPage.tsx         # Contact form / info
│   │   ├── MobilePage.tsx          # Mobile money guide
│   │   ├── OurTeamPage.tsx         # Development team
│   │   ├── USSDSimulatorPage.tsx   # Interactive USSD phone emulator
│   │   ├── HowToPayPage.tsx        # Step‑by‑step payment guide
│   │   ├── NotFoundPage.tsx        # 404 error page
│   │   ├── admin/
│   │   │   └── AdminDashboardPage.tsx   # Admin KPIs, charts, recent payments, fraud flags
│   │   └── taxpayer/
│   │       └── TaxpayerDashboardPage.tsx # Taxpayer overview, assessments, quick pay
│   │
│   ├── services/                   # Business logic & state management
│   │   └── api.ts                  # Centralised API client, token storage, helpers
│   │
│   ├── lib/                        # Static configuration / metadata
│   │   └── metadata.ts             # App title, description, Open Graph defaults
│   │
│   ├── App.tsx                     # Root component – router, providers, layout
│   ├── main.tsx                    # Entry point – mounts React, injects console security warning
│   ├── index.css                   # Tailwind directives + custom utilities
│   └── App.css                     # Legacy global styles (if any)
│
├── .env                            # Environment variables (example)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 3.1 Root Configuration

- **package.json** – defines npm scripts (`dev`, `build`, `preview`, `lint`), dependencies (react, vite, tailwind, lucide, stripe, etc.), and metadata.
- **vite.config.ts** – Vite configuration, includes the `@tailwindcss/vite` plugin and any path aliases (e.g. `@/` mapped to `src/`).
- **tsconfig.json** – TypeScript compiler settings, path mappings, strict mode enabled.
- **.env** – local environment variables (not committed):
  - `VITE_API_URL` – backend base URL (e.g., `http://localhost:5000/api/v1`).
  - `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe test/live publishable key (optional).
  - `VITE_GEMINI_API_KEY` – for any AI features exposed on the frontend (if used).

### 3.2 Public Assets

| File       | Purpose |
|------------|---------|
| `logo.png` | Main DalPay brand logo, used in Navbar, login sidebar, and footer. |
| `icon.png` | Small‑scale icon, typically used as favicon or mobile shortcut icon. |

### 3.3 Source Code (`src/`)

#### 3.3.1 API Client (`api/`)

Each file in `api/` defines a typed interface for a specific backend module. They all rely on a shared base client (`client.ts`).

- **client.ts** – Core `request<T>()` function.
  - Constructs the full URL (`${API_BASE}${endpoint}`).
  - Attaches `Authorization: Bearer <accessToken>` header if a token exists in localStorage.
  - Sends the request and parses the JSON response.
  - On HTTP errors (e.g. 401, 403, 429), it throws a structured error `{ message, status, data }`.
  - Fully typed: expects an `ApiResponse<T>` envelope with `success`, `message`, and `data`.
- **auth.ts** – functions `login`, `register`, `refreshToken`, `logout`, `sendOtp`, `verifyOtp`.
- **tax.ts** – `getAssessments`, `getAssessmentTypes`, `getSummary`, `generateAssessments`, `createDispute`, etc.
- **payment.ts** – `initiatePayment`, `confirmPayment`, `getHistory`, `getStatus`, `getProviders`.
- **verification.ts** – `createVerificationSession`, `checkStatus` (Stripe Identity).
- **index.ts** – re‑exports everything from the above modules.

#### 3.3.2 Components (`components/`)

**Layout**
- **Navbar.tsx** – Sticky top navigation bar.
  - Dynamically shows “Sign In / Register” buttons or an avatar with dropdown (Dashboard, Admin Panel, Profile, Settings, Logout) based on user state derived from `localStorage`.
  - Implements a mega‑menu dropdown for Services, Tax Types, Resources, About, and Contact.
  - Theme toggle (dark/light).
  - Mobile drawer with identical navigation and user info.
  - Listens to a custom `dalpay-user-updated` event for instant updates.
- **Footer.tsx** – Global footer with links, social icons, copyright, and sponsor badge.
- **Admin/AdminDashboardLayout.tsx** – Wraps admin routes with `AdminSidebar`, `AdminTopbar`, and an `<Outlet />` for content.
- **Admin/AdminSidebar.tsx** – Collapsible vertical navigation for admin sections.
- **Admin/AdminTopbar.tsx** – Admin header with search, notifications, and admin profile dropdown.
- **taxpayer/TaxpayerDashboardLayout.tsx** – Same pattern for taxpayer routes.
- **taxpayer/TaxpayerSidebar.tsx** – Taxpayer‑specific sidebar links.
- **taxpayer/TaxpayerTopbar.tsx** – Taxpayer header.

**Shared**
- **ScrollToTop.tsx** – Uses `useLocation()` to reset `window.scrollTo(0, 0)` on every path change. Placed inside `<BrowserRouter>`.
- **StripeProvider.tsx** – Conditionally loads Stripe.js only if `VITE_STRIPE_PUBLISHABLE_KEY` is set. Renders children without Stripe context if key is missing.
- **Providers.tsx** – Composes multiple context providers (Stripe, etc.) to avoid wrapper hell.
- **ThemeToggle.tsx** – Reusable dark/light switch.
- **FooterTeamSection.tsx** – Displays team member names and roles in the footer.
- **SponsoredByUOH.tsx** – University of Hargeisa logo/badge in the footer.

#### 3.3.3 Pages (`pages/`)

Every file corresponds to a route defined in `App.tsx`. Each page is a self‑contained React component.

| Page                             | Description |
|----------------------------------|-------------|
| HomePage.tsx                     | Hero section, service cards, trusted partners, call‑to‑action. |
| LoginPage.tsx                    | Dual‑mode login (email/phone), password visibility toggle, error messages for lockout/rate‑limit/invalid credentials, success message from registration redirect. |
| RegisterPage.tsx                 | Multi‑step registration form (personal info, contact, documents). |
| DashboardPage.tsx                | Splash screen with spinner, determines role from stored user object, then redirects to `/admin/dashboard` or `/taxpayer/dashboard`. |
| PayTaxPage.tsx                   | Select assessment, enter amount, optional idempotency key, initiate payment. |
| CheckBalancePage.tsx             | Lists outstanding assessments with amounts and due dates. |
| TaxCalculatorPage.tsx            | Input salary/property value, show estimated tax. |
| PaymentHistoryPage.tsx           | Paginated table of past payments with status, amount, date. |
| TaxTypeIncomePage.tsx            | Information about income tax rates and rules. |
| TaxTypeBusinessPage.tsx          | Business tax details. |
| TaxTypePropertyPage.tsx          | Property tax details. |
| TaxTypeConsumptionPage.tsx       | Consumption tax (VAT) details. |
| FaqPage.tsx                      | Accordion FAQ. |
| TaxRatesPage.tsx                 | Tax rate tables for all types. |
| DownloadFormsPage.tsx            | Links to PDF forms. |
| AboutPage.tsx                    | Mission, vision, and project background. |
| ContactPage.tsx                  | Contact form (can post to backend). |
| MobilePage.tsx                   | Guide to paying via mobile money. |
| OurTeamPage.tsx                  | Developer profiles. |
| USSDSimulatorPage.tsx            | Interactive phone mockup that communicates with the backend USSD endpoint. |
| HowToPayPage.tsx                 | Visual step‑by‑step guide. |
| NotFoundPage.tsx                 | 404 illustration and link home. |
| admin/AdminDashboardPage.tsx     | Admin overview cards (total revenue, outstanding, user counts, recent fraud alerts), charts, latest payments. |
| taxpayer/TaxpayerDashboardPage.tsx | Taxpayer overview: due now, paid this year, upcoming deadlines, quick pay button. |

#### 3.3.4 Services (`services/`)

- **api.ts** – **Centralised frontend API client**. This is the **main bridge to the backend**.
  - Re‑exports all typed API functions from `api/` for easy imports.
  - Manages tokens: `setTokens(accessToken, refreshToken, user?)`, `clearTokens()`, `getAccessToken()`, `getUserRole()`, `getUser()`.
  - `setTokens` stores the user object (`{ fullName, role }`) in `localStorage` and dispatches a `dalpay-user-updated` custom event, instantly updating the Navbar without a page reload.
  - Exports the `LoginResponseData` and `RegisterPayload` types.

#### 3.3.5 Lib (`lib/`)

- **metadata.ts** – Static app metadata (title, description, Open Graph tags) used for SEO and social sharing.

### 3.4 Entry Points

- **main.tsx** – Creates the React root, renders `<App />`.
  - In production (`import.meta.env.PROD`), it prints a **console security warning** in English and Somali, mimicking Discord's anti‑self‑XSS message. This warns users not to paste code into the console if they don’t understand it.
- **App.tsx** – Sets up `BrowserRouter`, wraps everything in `<StripeProvider>` and `<ScrollToTop />`, defines all routes with nested `<Routes>`.
- **index.css** – Tailwind directives (`@tailwind base; components; utilities;`) plus any custom layer styles.

---

## 4. Communication with the Backend

### 4.1 API Client Architecture

All HTTP requests go through the `api.ts` client, which builds the URL by combining the base path `/api/v1` (proxied in dev by Vite) with the endpoint string. The client:

1. Reads the `accessToken` from `localStorage`.
2. Attaches an `Authorization: Bearer <token>` header if present.
3. Sends the request with `Content-Type: application/json`.
4. Parses the JSON response and checks `ok`.
5. If not `ok`, it throws a structured error `{ message, status, data }`. The error's `data` field contains the backend response body (e.g., `{ code: 'ACCOUNT_LOCKED', message: '...', retryAfterMinutes: 15 }`).
6. On success, returns the API response envelope (`ApiResponse<T>`).

### 4.2 Token Management & User State

- After login or registration, the backend returns an `accessToken`, `refreshToken`, and a `user` object.
- The frontend calls `setTokens()` with the user's `fullName` and `role`.
- This stores the user object under `dalpay_user` in localStorage and fires a custom event `dalpay-user-updated`.
- The Navbar listens for this event and updates its UI immediately.
- The `getAccessToken()` helper is used by the HTTP client and any protected fetch.
- `clearTokens()` removes all auth‑related localStorage keys on logout.

### 4.3 Error Handling & User Feedback

The login page and other critical forms use a `getErrorMessage(error: unknown)` helper that interprets the thrown error’s status and data:

| Status | Condition                     | User Message |
|--------|-------------------------------|--------------|
| 429    | Rate limited                  | "Too many login attempts. Please wait a moment and try again." |
| 403    | `code: 'ACCOUNT_LOCKED'` or message containing "lock" | "Account temporarily locked. Please try again in X minute(s)." |
| 401    | Invalid credentials           | "Invalid phone number/email or password. Please check your credentials." |
| Any    | `data.message` present        | The actual server message |
| Any    | Network / generic             | "Login failed. Please check your connection and try again." |

This design ensures that **every backend security decision** (lockout, rate limit, step‑up) is **immediately understood by the user**.

---

## 5. Authentication & Security on the Frontend

### 5.1 Token Lifecycle

- Access tokens are short‑lived (15 min). Refresh tokens live 1 day.
- The frontend **does not yet implement an automatic refresh interceptor**, but the API client is prepared for one. A planned Axios interceptor will:
  - On 401, attempt a silent refresh using the stored refresh token.
  - If the refresh succeeds, retry the original request.
  - If the refresh fails (e.g., token reuse detected), clear all tokens and redirect to login with a security message.
- Currently, a 401 on any authenticated page triggers a manual token check in some components (like DashboardPage).

### 5.2 Brute‑Force & Lockout Feedback

- The login page explicitly handles 429, 401, and 403 errors with actionable messages.
- After 5 failed attempts, the backend locks the account. The frontend will display the exact lockout message returned by the server, including the remaining minutes.

### 5.3 Self‑XSS Mitigation

In production builds, `main.tsx` prints a styled console message:

```
⚠️ STOP ⚠️
Dib u eeg – If someone told you to paste something here, it’s a scam.
Ha ku shubin wax halkan ku yaal haddii aanad hubin.
This is a government tax portal – never share your financial details.
```

This mimics Discord’s security measure and deters social engineering attacks targeting non‑technical users.

### 5.4 Content Security

- The backend sets CSP headers, but the frontend avoids inline scripts entirely (except the console message, which is not executable code).
- All assets are served from the same origin or trusted sources.
- The application never exposes sensitive data in the URL bar (no access tokens in query strings).

---

## 6. Routing Architecture

Routes are defined in `App.tsx` using React Router v6.

### 6.1 Public Routes

Wrapped in `<Layout />` (which includes `Navbar` and `Footer`):

- `/` – Home
- `/pay`, `/balance`, `/calculator`, `/history`
- `/tax-types/income`, `/tax-types/business`, `/tax-types/property`, `/tax-types/consumption`
- `/faq`, `/resources/tax-rates`, `/resources/forms`
- `/about`, `/contact`, `/mobile`, `/our-team`, `/ussd`
- `/register`, `/login`, `/dashboard`, `*` (404)

### 6.2 Protected Dashboards

- `/admin` → `<AdminDashboardLayout />` wraps admin routes:
  - `dashboard` – AdminDashboardPage
  - `taxpayers`, `assessments`, `payments` (placeholder pages)
- `/taxpayer` → `<TaxpayerDashboardLayout />` wraps taxpayer routes:
  - `dashboard` – TaxpayerDashboardPage

**Note:** Route guards are not yet implemented on the frontend (the backend enforces RBAC). Adding a `RequireAuth` wrapper is planned.

### 6.3 Redirection Logic

`DashboardPage` acts as a smart redirect:

1. Reads `accessToken` and the user object from `localStorage`.
2. If missing, it clears stale data and navigates to `/login`.
3. Based on the user’s role (`admin` / `super_admin` → `/admin/dashboard`, else `/taxpayer/dashboard`), it redirects after a 2.5‑second loading animation.

---

## 7. User Interface & Styling

### 7.1 Tailwind Configuration

- Custom theme extended in `tailwind.config.ts` (if present) or directly in `index.css` using `@theme`.
- Primary color palette: `#0F7B8C` (teal), `#0A5D6B` (dark teal), `#3BA7BC` (light teal), `#10B981` (emerald accent).
- Dark mode uses the `class` strategy – toggled by adding/removing `dark` class on `<html>`.

### 7.2 Dark Mode

- Initial theme is set from `localStorage.getItem("theme")` or the system preference (`prefers-color-scheme`).
- The `Navbar` contains a toggle button that adds/removes the `dark` class and persists the preference.
- All components use `dark:` variants for seamless switching.

---

## 8. Key Components Deep‑Dive

### 8.1 Navbar

- Reads `dalpay_user` from localStorage to decide between guest and authenticated states.
- Authenticated state shows user initials, name, role, and a dropdown menu with:
  - Dashboard (links to admin or taxpayer dashboard based on role)
  - Admin Panel (only if role is `admin`)
  - Profile, Settings, and Sign out.
- Mega‑menus for desktop, accordion menus for mobile.
- Custom event listener ensures it updates immediately after login/logout, even without navigation.

### 8.2 Footer

- Contains quick links, contact info, social media icons, sponsor badge (UOH), and the team section.
- Responsive grid layout.

### 8.3 Admin & Taxpayer Dashboards

- Use their own layout components with sidebars and topbars.
- Admin dashboard fetches `/dashboard/overview` (revenue, users, etc.) and displays cards, charts, recent payments, and fraud flags.
- Taxpayer dashboard fetches `/tax/summary` and displays personalised tax summary and quick actions.

### 8.4 USSDSimulatorPage

- A complete React phone UI that allows developers and testers to simulate USSD sessions without a real phone.
- Sends sequential POST requests to `/api/v1/ussd` with the user’s phone number, text input, and a sticky session ID.
- Displays the USSD menu responses in a phone‑screen‑like interface.
- Used for testing the entire USSD flow (balance check, payment, statement).

---

## 9. Deployment

The frontend is deployed as a static site on **Vercel**:

1. Push the `Frontend-production` branch (or the `frontend/` folder via subtree) to GitHub.
2. On Vercel, import the project and point it to the `Frontend-production` branch.
3. Set the following environment variables in Vercel:
   - `VITE_API_URL` = `https://dalpay-api.onrender.com/api/v1` (or your backend URL)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your Stripe test/live key
   - `VITE_GEMINI_API_KEY` = optional
4. Build command: `npm run build`, output directory: `dist`.
5. After deployment, add the deployed URL to the backend’s CORS whitelist.

The app is a single‑page application, so all routes must fallback to `index.html`.

---

## 10. Testing

### Manual Testing

- Register a new taxpayer and verify redirection to login.
- Log in with correct credentials; confirm Navbar shows user name and role.
- Attempt login with wrong password 5 times; verify lockout message appears and retry after 15 minutes succeeds.
- Test the USSD simulator by navigating to `/ussd`, entering a registered phone number, and following the prompts to check balance and make a payment.
- Log in as admin, navigate to `/admin/dashboard`, generate assessments, and review fraud flags.

### Automated Testing (Future)

- Use Vitest + React Testing Library to test components and API client helpers.
- Cypress for end‑to‑end flows.

---

## 11. Team

| Name | Role |
|------|------|
| Abdulmajid A. Ahmed | Frontend Lead Developer |
| Zacki A. Omer | Lead Developer & System Architect |
| Abdulkadir I. Abdi | Backend & Database Engineer / QA Lead |
| Arafat Osman Aden | Documentation Lead |
| Abdiqadir Ismacil | Methodology & System Design Writer |
| Abdiraxem Khadar | Testing, Evaluation & Results Writer |

**Supervisor:** Mohamed Ahmed Ali  
**Institution:** University of Hargeisa  
**Faculty:** Faculty of Engineering & Computing of IT  

---

## 12. License

This project is proprietary software developed for the **Somaliland Ministry of Finance** and **Ministry of Communication and ICT**. All rights reserved. Unauthorized copying, distribution, or use of this software, in whole or in part, is strictly prohibited.

For licensing inquiries, contact the project team.

---

## 13. Data Flow & State Management

### 13.1 API → UI Pipeline

1. **Page mounts** (e.g., `AdminDashboardPage`).
2. A `useEffect` calls an API function (e.g., `dashboardApi.getOverview()`).
3. The API function invokes the central `request()` client, which attaches authentication headers and sends the HTTP request.
4. On success, the response `data` is stored in local component state (`useState`).
5. The component renders UI elements (cards, tables, charts) using that state.
6. On failure, the error is caught and displayed via the `getErrorMessage` helper (or a generic alert).

### 13.2 Global User State

User authentication data is stored in `localStorage` under the key `dalpay_user` (a JSON object `{ fullName, role }`). This is the **only global state** that multiple components rely on (Navbar, DashboardPage, etc.). It is updated exclusively via `setTokens()` in `api.ts` and cleared via `clearTokens()`. A custom event `dalpay-user-updated` allows components to react instantly.

### 13.3 Local Component State

- **Forms** (login, register, pay) use multiple `useState` hooks for field values, loading states, and error messages.
- **Dashboards** maintain state for fetched data, pagination offsets, filter selections, etc.
- **Dark mode** preference is persisted in `localStorage` and synced with a `useSyncExternalStore` hook (in `DashboardPage`) or via MutationObserver (in `Navbar`).

No complex state management library (Redux, Zustand) is required – the combination of React hooks and localStorage is sufficient for the current architecture.

---

## 14. Component Interaction Patterns

### 14.1 Props & Composition

- Layout components (`Layout`, `AdminDashboardLayout`, `TaxpayerDashboardLayout`) receive children (via `<Outlet />` from React Router).
- Shared components (`StripeProvider`, `ScrollToTop`) receive children or rely on React context.
- Pure presentational components (e.g., cards, buttons) receive data through props.

### 14.2 Custom Events

- The `dalpay-user-updated` event is dispatched from `setTokens()` and `clearTokens()`. Components that need to update user state listen for this event. For example, `Navbar` attaches a listener and rerenders its avatar section when the event fires.
- This pattern avoids prop drilling or context for auth state and works across separate parts of the component tree.

### 14.3 Context Providers

- `StripeProvider` wraps the app in Stripe’s `<Elements>` context, but only if a publishable key is set. This makes Stripe hooks available to payment pages without crashing the app when Stripe is not configured.
- `Providers.tsx` is prepared to compose multiple providers (Stripe, possibly theme, notification) to keep `App.tsx` clean.

---

## 15. Environment Variables Explained

| Variable                        | Required? | Default                  | Description |
|---------------------------------|-----------|--------------------------|-------------|
| `VITE_API_URL`                  | Yes       | `http://localhost:5000/api/v1` | Base URL of the DalPay backend API. The Vite dev server proxies `/api` requests here. |
| `VITE_STRIPE_PUBLISHABLE_KEY`   | No        | (empty)                  | Stripe publishable key. If empty, Stripe components are not loaded and payments cannot be processed. |
| `VITE_GEMINI_API_KEY`           | No        | (empty)                  | Google Gemini API key (used by admin dashboard to display AI insights). |
| `VITE_GEMINI_MODEL`             | No        | `gemini-1.5-flash`       | Gemini model name. |

All `VITE_` variables are embedded at build time and must be supplied in the hosting environment (Vercel dashboard). Never commit real values to the repository.

---

## 16. Error Handling Strategy

### 16.1 Network Errors

Captured in the `catch` block of each API call. The shared `getErrorMessage` function identifies generic network failures (no response, CORS errors) and returns a user‑friendly message like `"Login failed. Please check your connection and try again."`.

### 16.2 Backend Validation Errors

When the backend returns a non‑2xx status, the thrown error object contains:
- `status` (HTTP code)
- `message` (text from the server, often user‑readable)
- `data` (full response body, including `code` and additional details)

Forms parse this structure to show field‑level errors (if any) or a global alert.

### 16.3 Global Error Boundary

A React error boundary (not yet implemented) will be added to catch unhandled exceptions in the component tree and display a fallback UI (e.g., "Something went wrong") while logging the error to the console (and eventually to an external service). This prevents white screens in production.

---

## 17. Performance & Optimization

### 17.1 Lazy Loading & Code Splitting

Vite automatically code‑splits by route when using dynamic `import()`. We will implement `React.lazy` and `<Suspense>` for admin and taxpayer dashboards to reduce the initial bundle size. Smaller pages can be eagerly loaded.

### 17.2 Asset Optimization

- All images in `public/` are served directly. The logo is an optimized PNG.
- Tailwind’s purgeable classes ensure minimal CSS.
- Fonts are loaded from Google Fonts or locally.

### 17.3 Rendering Optimizations

- `useMemo` and `useCallback` are used sparingly where expensive calculations or stable references are needed.
- `React.memo` can be applied to pure presentational components.
- Excessive re‑renders are avoided by proper state colocation (keeping state as close to where it’s used as possible).

---

## 18. Accessibility

The application strives to meet WCAG 2.1 AA standards:

- **Semantic HTML**: `<nav>`, `<main>`, `<header>`, `<footer>`, `<button>`, `<label>` are used appropriately.
- **Keyboard navigation**: All interactive elements are focusable and operable via keyboard. Dropdown menus, modals, and forms include proper focus management.
- **ARIA attributes**: `aria-label`, `aria-expanded`, `role`, etc. are used where necessary (e.g., mobile menu toggle, expandable panels).
- **Color contrast**: Tailwind’s default palette meets contrast requirements; custom colors are verified.
- **Screen reader announcements**: Dynamic content changes (e.g., loading states, error messages) are communicated via `aria-live` regions or equivalent.

Accessibility audits using Lighthouse and axe DevTools are planned before final release.

---

## 19. Build Configuration & Development Workflow

### 19.1 Vite Proxy & Aliases

In `vite.config.ts`, the `@` alias maps to `./src` for clean imports. The dev server is configured to proxy `/api` requests to the backend, avoiding CORS issues during development.

```ts
// vite.config.ts snippet
export default defineConfig({
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    proxy: { '/api': 'http://localhost:5000' }
  }
});
```

### 19.2 Multiple Environments

- **Development**: Vite runs on `localhost:5173` with Hot Module Replacement. The backend is assumed to run on `localhost:5000`.
- **Preview**: `npm run preview` mimics production build locally.
- **Production**: Built with `npm run build` and hosted on Vercel. Environment variables are set via Vercel’s UI.

### 19.3 Scripts & Tooling

| Script             | Purpose |
|--------------------|---------|
| `npm run dev`      | Start development server |
| `npm run build`    | TypeScript check + Vite build to `dist/` |
| `npm run preview`  | Serve production build locally |
| `npm run lint`     | ESLint across `src/` |
| `npm run typecheck`| TypeScript compiler check (no emit) |

Husky + lint‑staged can be added to enforce linting and formatting before commits.

---

## 20. Testing Strategy

### 20.1 Unit & Integration Tests

- **Vitest** is the recommended test runner.
- **React Testing Library** for component testing (render, fire events, assert on DOM).
- API client functions are tested with MSW (Mock Service Worker) to intercept HTTP requests and return fixture data.

Example structure:
```
src/__tests__/
  api/
    auth.test.ts
  components/
    Navbar.test.tsx
  pages/
    LoginPage.test.tsx
```

### 20.2 End‑to‑End Tests

- **Cypress** will automate critical user journeys:
  - Registration → Login → Redirect to dashboard.
  - Login as admin → Create assessment → View on taxpayer dashboard.
  - USSD simulation flow.
  - Lockout after 5 failed logins.

### 20.3 Manual Test Checklist

See Section 10 for the detailed manual testing steps.

---

## 21. Monitoring & Logging

Currently, all errors are logged to the browser console. In production, a service like **Sentry** or **LogRocket** will be integrated to capture:

- Unhandled exceptions and promise rejections.
- API failures with status codes.
- Performance metrics (Core Web Vitals).

This will provide real‑time insight into user‑facing issues without exposing sensitive data.

---

## 22. API Versioning & Compatibility

The frontend expects the backend to serve the API at `/api/v1`. All endpoints are hardcoded with the `v1` prefix. If a new API version is introduced, the frontend will be updated to point to `/api/v2` (or the appropriate version) after ensuring backward compatibility. The API client’s base URL is centralised, making the switch straightforward.

---