import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TaxpayerDashboardPage from "@/pages/taxpayer/TaxpayerDashboardPage";
import TaxpayerDashboardLayout from "@/components/layout/taxpayer/TaxpayerDashboardLayout";
import { StripeProvider } from "@/components/shared/StripeProvider";
import AdminDashboardLayout from "./components/layout/Admin/AdminDashboardLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import PayTaxPage from "./pages/PayTaxPage";
import CheckBalancePage from "./pages/CheckBalancePage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import TaxTypeIncomePage from "./pages/TaxTypeIncomePage";
import TaxTypeBusinessPage from "./pages/TaxTypeBusinessPage";
import TaxTypePropertyPage from "./pages/TaxTypePropertyPage";
import TaxTypeConsumptionPage from "./pages/TaxTypeConsumptionPage";
import FaqPage from "./pages/FaqPage";
import TaxRatesPage from "./pages/TaxRatesPage";
import DownloadFormsPage from "./pages/DownloadFormsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import MobilePage from "./pages/MobilePage";
import OurTeamPage from "./pages/OurTeamPage";
import USSDSimulatorPage from "./pages/USSDSimulatorPage";
import ProfilePage from "./pages/ProfilePage";
import HelpPage from "./pages/HelpPage";
import ReportPage from "./pages/ReportPage";
import SecurityPage from "./pages/SecurityPage";
import ReportFraudPage from "./pages/ReportFraudPage";
import DataProtectionPage from "./pages/DataProtectionPage";
import CareersPage from "./pages/CareersPage";
import CareerDetailPage from "./pages/CareerDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TaxpayersPage from "./pages/admin/TaxpayersPage";
import TaxpayerDetailPage from "./pages/admin/TaxpayerDetailPage";
import AssessmentsPage from "./pages/admin/AssessmentsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ReconciliationPage from "./pages/admin/ReconciliationPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import DisputesPage from "./pages/admin/DisputesPage";
import DocumentsPage from "./pages/admin/DocumentsPage";
import FraudPage from "./pages/admin/FraudPage";
import LedgerPage from "./pages/admin/LedgerPage";
import SettingsPage from "./pages/admin/SettingsPage";

function App() {
  // Set dark class immediately from localStorage/system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <StripeProvider>
      <BrowserRouter>
        <ScrollToTop /> {/* Scroll to top on route change */}
        <Routes>
          {/* public */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pay" element={<PayTaxPage />} />
            <Route path="/balance" element={<CheckBalancePage />} />
            <Route path="/calculator" element={<TaxCalculatorPage />} />
            <Route path="/history" element={<PaymentHistoryPage />} />
            <Route path="/tax-types/income" element={<TaxTypeIncomePage />} />
            <Route path="/tax-types/business" element={<TaxTypeBusinessPage />} />
            <Route path="/tax-types/property" element={<TaxTypePropertyPage />} />
            <Route path="/tax-types/consumption" element={<TaxTypeConsumptionPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/resources/tax-rates" element={<TaxRatesPage />} />
            <Route path="/resources/forms" element={<DownloadFormsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mobile" element={<MobilePage />} />
            <Route path="/our-team" element={<OurTeamPage />} />
            <Route path="/ussd" element={<USSDSimulatorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/report-fraud" element={<ReportFraudPage />} />
            <Route path="/data-protection" element={<DataProtectionPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<CareerDetailPage />} />

            {/* auth Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* admin */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="taxpayers" element={<TaxpayersPage />} />
            <Route path="taxpayers/:id" element={<TaxpayerDetailPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="reconciliation" element={<ReconciliationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="fraud" element={<FraudPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* taxpayer */}
          <Route path="/taxpayer" element={<TaxpayerDashboardLayout />}>
            <Route path="dashboard" element={<TaxpayerDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StripeProvider>
  );
}

export default App;