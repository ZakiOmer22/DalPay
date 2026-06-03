// src/pages/taxpayer/TaxCalculatorPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, Briefcase, Home, Building2, AlertCircle,
  ChevronRight, FileText, BarChart3, Info,
  RotateCcw, Zap, Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { request } from "@/services/api";

const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8", blueBorder: "#bfdbfe",
  green: "#10b981", greenBg: "#ecfdf5", greenText: "#065f46",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

// Somaliland Tax Rates (USD Currency)
const SOMALILAND_TAX_RATES = {
  income_tax: {
    name: "Income Tax",
    description: "Progressive tax on annual income",
    icon: DollarSign,
    color: C.teal,
    brackets: [
      { min: 0, max: 3600000, rate: 0.05 }, // 5% on first 3M USD
      { min: 3600000, max: 7200000, rate: 0.10 }, // 10% on 3M-7M USD
      { min: 7200000, max: Infinity, rate: 0.15 }, // 15% above 7M USD
    ],
  },
  business_tax: {
    name: "Business/Trading Tax",
    description: "Tax on net business profit",
    icon: Briefcase,
    color: C.purple,
    rate: 0.12, // Flat 12% on business profit
  },
  property_tax: {
    name: "Property Tax",
    description: "Tax on real estate value",
    icon: Home,
    color: C.amber,
    rate: 0.025, // 2.5% annually on property value
  },
  consumption_tax: {
    name: "Consumption/VAT",
    description: "Value Added Tax on goods and services",
    icon: Building2,
    color: C.blue,
    rate: 0.08, // 8% VAT standard rate
  },
};

function Card({ children, style, elevation = false }: any) {
  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: elevation ? "0 4px 12px rgba(17,24,22,0.08)" : "none",
      transition: "all 0.2s",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Badge({ label, color }: { label?: string | null; color: string }) {
  const safe = label || "—";
  const map: Record<string, any> = {
    green: { bg: C.greenBg, text: C.greenText, border: "#a7f3d0" },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: "#bfdbfe" },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
    purple: { bg: C.purpleBg, text: C.purpleText, border: "#d8c9f0" },
    teal: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
  };
  const m = map[color] || map.gray;
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      padding: "4px 10px",
      borderRadius: 100,
      background: m.bg,
      color: m.text,
      border: `1px solid ${m.border}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      display: "inline-block",
    }}>
      {safe.replace(/_/g, " ")}
    </span>
  );
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  disabled = false,
  color,
  step = 10000,
  helper,
}: any) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.text,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={14} color={color} strokeWidth={2.2} />
        </div>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        disabled={disabled}
        step={step}
        min={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: focused ? `2px solid ${color}` : `1px solid ${C.border}`,
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "inherit",
          background: disabled ? C.bgMuted : C.bg,
          color: C.text,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text",
          transition: "all 0.15s",
          outline: "none",
        }}
      />
      {helper && (
        <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>
          {helper}
        </p>
      )}
    </div>
  );
}

function TaxBreakdownRow({
  label,
  rate,
  amount,
  color,
  icon: Icon,
  show = true,
}: any) {
  if (!show) return null;

  return (
    <div style={{
      padding: "12px 14px",
      background: C.bgMuted,
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s",
      cursor: "pointer",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color + "08";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = C.bgMuted;
        e.currentTarget.style.borderColor = C.border;
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={18} color={color} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
            {label}
          </p>
          <p style={{ fontSize: 10, color: C.faint }}>
            {typeof rate === "number" ? (rate * 100).toFixed(1) : "Progressive"} rate
          </p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          USD {amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  color,
}: any) {
  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      background: C.bgMuted,
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      cursor: "pointer",
      transition: "all 0.15s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color + "08";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = C.bgMuted;
        e.currentTarget.style.borderColor = C.border;
      }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 18,
          height: 18,
          cursor: "pointer",
          accentColor: color,
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>
        {label}
      </span>
      <Badge label={checked ? "Included" : "Excluded"} color={checked ? "green" : "gray"} />
    </label>
  );
}

// Progressive tax calculator for income tax
function calculateProgressiveTax(income: number): number {
  const brackets = SOMALILAND_TAX_RATES.income_tax.brackets;
  let tax = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInThisBracket * bracket.rate;
    }
  }

  return tax;
}

// 🔧 FIXED TYPE for API response
interface TaxpayerProfileResponse {
  profile: {
    monthly_income: number;
    property_value?: number;
    business_type?: string;
  } | null;
}

export default function TaxPayerTaxCalculatorPage() {
  const navigate = useNavigate();
  const [income, setIncome] = useState<number>(3600000);
  const [businessProfit, setBusinessProfit] = useState<number>(5000000);
  const [propertyValue, setPropertyValue] = useState<number>(50000000);
  const [consumption, setConsumption] = useState<number>(2000000);
  const [includeBusiness, setIncludeBusiness] = useState(true);
  const [includeProperty, setIncludeProperty] = useState(true);
  const [includeConsumption, setIncludeConsumption] = useState(false);

  // Fetch user's taxpayer profile from backend - FIXED TYPES
  const { data: profileRes } = useQuery({
    queryKey: ["taxpayer-profile"],
    queryFn: () => request<TaxpayerProfileResponse>("/tax/profile"),
    staleTime: 300000,
  });

  // Update default values when profile is loaded
  useEffect(() => {
    const profile = profileRes?.data?.profile;
    if (profile) {
      const monthlyIncome = profile.monthly_income || 3600000;
      const annualIncome = monthlyIncome * 12;
      setIncome(annualIncome);
      if (profile.property_value) {
        setPropertyValue(profile.property_value);
      }
    }
  }, [profileRes?.data]);

  const calculations = useMemo(() => {
    // Calculate progressive income tax
    const incomeTax = calculateProgressiveTax(income);

    // Business tax (12% flat on profit)
    const businessTax = includeBusiness ? businessProfit * SOMALILAND_TAX_RATES.business_tax.rate : 0;

    // Property tax (2.5% annually)
    const propertyTax = includeProperty ? propertyValue * SOMALILAND_TAX_RATES.property_tax.rate : 0;

    // Consumption tax (8% VAT)
    const consumptionTax = includeConsumption ? consumption * SOMALILAND_TAX_RATES.consumption_tax.rate : 0;

    const totalTax = incomeTax + businessTax + propertyTax + consumptionTax;
    const totalBase = income + (includeBusiness ? businessProfit : 0) + (includeProperty ? propertyValue : 0) + (includeConsumption ? consumption : 0);
    const effectiveRate = totalBase > 0 ? (totalTax / totalBase) * 100 : 0;
    const monthlyPayment = totalTax / 12;

    return {
      incomeTax: Math.round(incomeTax),
      businessTax: Math.round(businessTax),
      propertyTax: Math.round(propertyTax),
      consumptionTax: Math.round(consumptionTax),
      totalTax: Math.round(totalTax),
      totalBase,
      effectiveRate: isNaN(effectiveRate) ? 0 : effectiveRate,
      monthlyPayment: Math.round(monthlyPayment),
    };
  }, [income, businessProfit, propertyValue, consumption, includeBusiness, includeProperty, includeConsumption]);

  const handleReset = () => {
    setIncome(3600000);
    setBusinessProfit(5000000);
    setPropertyValue(50000000);
    setConsumption(2000000);
    setIncludeBusiness(true);
    setIncludeProperty(true);
    setIncludeConsumption(false);
    toast.success("Calculator reset to defaults");
  };

  const handleProceedToPay = async () => {
    try {
      toast.success("Redirecting to payment page");
      navigate("/taxpayer/pay");
    } catch (error) {
      toast.error("Failed to proceed");
    }
  };

  const taxBreakdown = [
    {
      label: "Income Tax",
      amount: calculations.incomeTax,
      rate: "Progressive",
      color: C.teal,
      icon: DollarSign,
      show: true,
    },
    {
      label: "Business Tax",
      amount: calculations.businessTax,
      rate: SOMALILAND_TAX_RATES.business_tax.rate,
      color: C.purple,
      icon: Briefcase,
      show: includeBusiness,
    },
    {
      label: "Property Tax",
      amount: calculations.propertyTax,
      rate: SOMALILAND_TAX_RATES.property_tax.rate,
      color: C.amber,
      icon: Home,
      show: includeProperty,
    },
    {
      label: "Consumption/VAT",
      amount: calculations.consumptionTax,
      rate: SOMALILAND_TAX_RATES.consumption_tax.rate,
      color: C.blue,
      icon: Building2,
      show: includeConsumption,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card-entrance { animation: slideUp 0.4s ease both; }
      `}</style>

      {/* Header Section */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            Tax Liability Calculator
          </h1>
          <p style={{ fontSize: 14, color: C.faint, marginTop: 6, maxWidth: 600, lineHeight: 1.5 }}>
            Calculate your estimated annual tax liability based on Somaliland tax law. Adjust your income, business profit, property value, and consumption to see a real-time estimate.
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            background: C.bgMuted,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
            transition: "all 0.15s",
            color: C.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.tealBg;
            e.currentTarget.style.borderColor = C.teal;
            e.currentTarget.style.color = C.teal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.bgMuted;
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.text;
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* LEFT PANEL - Input Form */}
        <div className="card-entrance" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Income Card */}
          <Card elevation>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.tealBg }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.tealText, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={16} /> Annual Income
              </h2>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <InputField
                label="Annual Income (USD)"
                icon={DollarSign}
                value={income}
                onChange={setIncome}
                color={C.teal}
                step={100000}
                helper="Enter your total annual income from all sources in USD"
              />
              <div style={{ padding: "10px 12px", background: C.tealBg, borderRadius: 8, borderLeft: `4px solid ${C.teal}` }}>
                <p style={{ fontSize: 10, color: C.tealText, margin: 0 }}>
                  Monthly: USD {Math.round(income / 12).toLocaleString()}
                </p>
              </div>
              <div style={{ padding: "10px 12px", background: C.blueBg, borderRadius: 8, borderLeft: `4px solid ${C.blue}` }}>
                <p style={{ fontSize: 10, color: C.blueText, margin: 0 }}>
                  Progressive rates: 5% (0-3M), 10% (3M-7M), 15% (7M+)
                </p>
              </div>
            </div>
          </Card>

          {/* Business & Assets Card */}
          <Card elevation>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.purpleBg }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.purpleText, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <Briefcase size={16} /> Business & Assets
              </h2>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <ToggleField
                label="Include Business Income"
                checked={includeBusiness}
                onChange={setIncludeBusiness}
                color={C.purple}
              />
              {includeBusiness && (
                <InputField
                  label="Business Net Profit (USD)"
                  icon={Briefcase}
                  value={businessProfit}
                  onChange={setBusinessProfit}
                  color={C.purple}
                  step={100000}
                  helper="Net profit after business expenses (12% tax rate)"
                />
              )}

              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />

              <ToggleField
                label="Include Property Value"
                checked={includeProperty}
                onChange={setIncludeProperty}
                color={C.amber}
              />
              {includeProperty && (
                <InputField
                  label="Total Property Value (USD)"
                  icon={Home}
                  value={propertyValue}
                  onChange={setPropertyValue}
                  color={C.amber}
                  step={1000000}
                  helper="Total estimated value of all real estate owned (2.5% annual rate)"
                />
              )}

              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />

              <ToggleField
                label="Include Consumption Tax"
                checked={includeConsumption}
                onChange={setIncludeConsumption}
                color={C.blue}
              />
              {includeConsumption && (
                <InputField
                  label="Annual Consumption (USD)"
                  icon={Building2}
                  value={consumption}
                  onChange={setConsumption}
                  color={C.blue}
                  step={100000}
                  helper="Estimated annual consumption of taxable goods and services (8% VAT)"
                />
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                background: C.bg,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                color: C.text,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.bgMuted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.bg;
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleProceedToPay}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealText})`,
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(13, 158, 117, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Zap size={14} /> Proceed to Pay
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - Results */}
        <div className="card-entrance" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Total Tax Card */}
          <Card elevation style={{
            background: `linear-gradient(135deg, ${C.teal}08, ${C.teal}04)`,
            border: `2px solid ${C.teal}30`,
          }}>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Total Annual Tax Liability
                </p>
                <Target size={18} color={C.teal} />
              </div>
              <p style={{ fontSize: 40, fontWeight: 800, color: C.teal, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                USD {calculations.totalTax.toLocaleString()}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Effective Tax Rate</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                    {calculations.effectiveRate.toFixed(2)}%
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Monthly Payment</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                    USD {calculations.monthlyPayment.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tax Breakdown */}
          <Card elevation>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <BarChart3 size={16} color={C.teal} /> Tax Breakdown by Category
              </h2>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {taxBreakdown.map((item) => (
                item.show && (
                  <TaxBreakdownRow
                    key={item.label}
                    label={item.label}
                    amount={item.amount}
                    rate={typeof item.rate === "number" ? item.rate : null}
                    color={item.color}
                    icon={item.icon}
                  />
                )
              ))}
            </div>
          </Card>

          {/* Tax Information */}
          <Card elevation style={{
            background: C.amberBg,
            border: `1px solid ${C.amberBorder}`,
          }}>
            <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertCircle size={16} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.amberText, margin: 0, marginBottom: 2 }}>
                  Important Notice
                </p>
                <p style={{ fontSize: 10, color: C.amberText, margin: 0, lineHeight: 1.5, opacity: 0.9 }}>
                  This calculation is an estimate based on Somaliland tax law. Actual tax liability may differ based on applicable deductions, exemptions, credits, and official government assessment. Use this as a planning tool only.
                </p>
              </div>
            </div>
          </Card>

          {/* View Assessments Button */}
          <button
            onClick={() => navigate("/taxpayer/assessments")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: C.bg,
              border: `2px solid ${C.teal}40`,
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
              color: C.teal,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.tealBg;
              e.currentTarget.style.borderColor = C.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.bg;
              e.currentTarget.style.borderColor = C.teal + "40";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={14} /> View Your Official Tax Assessments
            </span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Information Section */}
      <Card elevation style={{ background: C.blueBg, border: `1px solid ${C.blueBorder}` }}>
        <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.teal + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <BarChart3 size={18} color={C.teal} />
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.blueText, margin: 0 }}>Real-Time Calculation</h3>
            </div>
            <p style={{ fontSize: 11, color: C.blueText, margin: 0, lineHeight: 1.5 }}>
              See your estimated tax instantly as you adjust income and asset values
            </p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.purple + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Target size={18} color={C.purple} />
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.purpleText, margin: 0 }}>Somaliland Tax Law</h3>
            </div>
            <p style={{ fontSize: 11, color: C.purpleText, margin: 0, lineHeight: 1.5 }}>
              Based on current tax regulations with progressive income tax brackets
            </p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.green + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Info size={18} color={C.green} />
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.greenText, margin: 0 }}>Transparent & Accurate</h3>
            </div>
            <p style={{ fontSize: 11, color: C.greenText, margin: 0, lineHeight: 1.5 }}>
              Detailed breakdown showing how each tax type is calculated for full transparency
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}