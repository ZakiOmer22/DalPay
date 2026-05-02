import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import HowToPayPage from "./pages/HowToPayPage";
import FaqPage from "./pages/FaqPage";
import TaxRatesPage from "./pages/TaxRatesPage";
import DownloadFormsPage from "./pages/DownloadFormsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import MobilePage from "./pages/MobilePage";
import OurTeamPage from "./pages/OurTeamPage";
import USSDSimulatorPage from "./pages/USSDSimulatorPage";

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

            {/* auth Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* admin */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="taxpayers" element={<div>Taxpayers Management</div>} />
            <Route path="assessments" element={<div>Assessments Management</div>} />
            <Route path="payments" element={<div>Payments Overview</div>} />
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