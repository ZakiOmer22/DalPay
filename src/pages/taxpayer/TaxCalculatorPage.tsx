// src/pages/taxpayer/TaxCalculatorPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Home, DollarSign,
  Building2, AlertCircle, ChevronRight, FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8", blueBorder: "#bfdbfe",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

function Card({ children, style, ...rest }: any) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}

function Badge({ label, color }: { label?: string | null; color: string }) {
  const safe = label || "—";
  const map: Record<string, any> = {
    green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: "#bfdbfe" },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
    purple: { bg: C.purpleBg, text: C.purpleText, border: "#d8c9f0" },
  };
  const m = map[color] || map.gray;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: m.bg, color: m.text, border: `1px solid ${m.border}`, whiteSpace: "nowrap", textTransform: "capitalize", display: "inline-block" }}>
      {safe.replace(/_/g, " ")}
    </span>
  );
}

interface TaxRate {
  type: string;
  rate: number;
  description: string;
}

// Tax rates – adjust as needed
const TAX_RATES: TaxRate[] = [
  { type: "income_tax", rate: 0.10, description: "10% of annual income" },
  { type: "business_tax", rate: 0.15, description: "15% of net profit" },
  { type: "property_tax", rate: 0.01, description: "1% of property value" },
  { type: "consumption_tax", rate: 0.05, description: "5% of consumption (estimate)" },
];

export default function TaxPayerTaxCalculatorPage() {
  const navigate = useNavigate();
  const [income, setIncome] = useState<number>(25000);
  const [businessProfit, setBusinessProfit] = useState<number>(50000);
  const [propertyValue, setPropertyValue] = useState<number>(100000);
  const [consumption, setConsumption] = useState<number>(20000);
  const [includeBusiness, setIncludeBusiness] = useState(true);
  const [includeProperty, setIncludeProperty] = useState(true);
  const [includeConsumption, setIncludeConsumption] = useState(true);

  const formatCurrency = (val: number) => `USD ${val.toLocaleString()}`;

  const calculations = useMemo(() => {
    const incomeTax = income * (TAX_RATES.find(r => r.type === "income_tax")?.rate || 0);
    const businessTax = includeBusiness ? businessProfit * (TAX_RATES.find(r => r.type === "business_tax")?.rate || 0) : 0;
    const propertyTax = includeProperty ? propertyValue * (TAX_RATES.find(r => r.type === "property_tax")?.rate || 0) : 0;
    const consumptionTax = includeConsumption ? consumption * (TAX_RATES.find(r => r.type === "consumption_tax")?.rate || 0) : 0;
    const totalTax = incomeTax + businessTax + propertyTax + consumptionTax;
    const totalBase = income + (includeBusiness ? businessProfit : 0) + (includeProperty ? propertyValue : 0) + (includeConsumption ? consumption : 0);
    const effectiveRate = totalBase > 0 ? (totalTax / totalBase) * 100 : 0;

    return {
      incomeTax, businessTax, propertyTax, consumptionTax, totalTax,
      effectiveRate: isNaN(effectiveRate) ? 0 : effectiveRate,
    };
  }, [income, businessProfit, propertyValue, consumption, includeBusiness, includeProperty, includeConsumption]);

  const handleReset = () => {
    setIncome(25000);
    setBusinessProfit(50000);
    setPropertyValue(100000);
    setConsumption(20000);
    setIncludeBusiness(true);
    setIncludeProperty(true);
    setIncludeConsumption(true);
  };

  const handleApplyToProfile = () => {
    toast.success("This is a calculator only. Use the Pay Tax page to pay actual taxes.");
    navigate("/taxpayer/pay");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Tax Calculator</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Estimate your tax liability based on income, business, property, and consumption.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Inputs Card */}
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Your Details</h2>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Income */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <DollarSign size={16} color={C.teal} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Annual Income (USD)</span>
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value) || 0)}
                min={0}
                step={1000}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
              />
              <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Based on your declared monthly income × 12</p>
            </div>

            {/* Business */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase size={16} color={C.purple} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Business Net Profit (USD)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={includeBusiness}
                    onChange={(e) => setIncludeBusiness(e.target.checked)}
                  />
                  <span style={{ fontSize: 11 }}>Include</span>
                </label>
              </div>
              <input
                type="number"
                value={businessProfit}
                onChange={(e) => setBusinessProfit(Number(e.target.value) || 0)}
                min={0}
                step={1000}
                disabled={!includeBusiness}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: includeBusiness ? C.bg : C.bgMuted }}
              />
            </div>

            {/* Property */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Home size={16} color={C.amber} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Property Value (USD)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={includeProperty}
                    onChange={(e) => setIncludeProperty(e.target.checked)}
                  />
                  <span style={{ fontSize: 11 }}>Include</span>
                </label>
              </div>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value) || 0)}
                min={0}
                step={10000}
                disabled={!includeProperty}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: includeProperty ? C.bg : C.bgMuted }}
              />
            </div>

            {/* Consumption */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Building2 size={16} color={C.blue} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Estimated Annual Consumption (USD)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={includeConsumption}
                    onChange={(e) => setIncludeConsumption(e.target.checked)}
                  />
                  <span style={{ fontSize: 11 }}>Include</span>
                </label>
              </div>
              <input
                type="number"
                value={consumption}
                onChange={(e) => setConsumption(Number(e.target.value) || 0)}
                min={0}
                step={1000}
                disabled={!includeConsumption}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: includeConsumption ? C.bg : C.bgMuted }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={handleReset} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600 }}>Reset</button>
              <button onClick={handleApplyToProfile} style={{ flex: 1, padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Proceed to Pay</button>
            </div>
          </div>
        </Card>

        {/* Results Card */}
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Estimated Tax</h2>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Income Tax */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <div><span style={{ fontSize: 12, color: C.muted }}>Income Tax</span><span style={{ marginLeft: 8 }}><Badge label="10%" color="gray" /></span></div>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{formatCurrency(calculations.incomeTax)}</span>
            </div>
            {includeBusiness && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                <div><span style={{ fontSize: 12, color: C.muted }}>Business Tax</span><span style={{ marginLeft: 8 }}><Badge label="15%" color="gray" /></span></div>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{formatCurrency(calculations.businessTax)}</span>
              </div>
            )}
            {includeProperty && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                <div><span style={{ fontSize: 12, color: C.muted }}>Property Tax</span><span style={{ marginLeft: 8 }}><Badge label="1%" color="gray" /></span></div>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{formatCurrency(calculations.propertyTax)}</span>
              </div>
            )}
            {includeConsumption && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                <div><span style={{ fontSize: 12, color: C.muted }}>Consumption Tax</span><span style={{ marginLeft: 8 }}><Badge label="5%" color="gray" /></span></div>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{formatCurrency(calculations.consumptionTax)}</span>
              </div>
            )}

            {/* Total */}
            <div style={{ background: C.tealBg, padding: "12px 16px", borderRadius: 8, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.tealText }}>Total Estimated Tax</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.tealText }}>{formatCurrency(calculations.totalTax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.tealText, opacity: 0.8 }}>Effective Tax Rate</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.tealText }}>{calculations.effectiveRate.toFixed(1)}%</span>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "12px", background: C.amberBg, borderRadius: 8, border: `1px solid ${C.amberBorder}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertCircle size={14} color={C.amber} style={{ marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 11, color: C.amberText, fontWeight: 500 }}>This is an estimate only.</p>
                  <p style={{ fontSize: 10, color: C.amberText, opacity: 0.8 }}>Actual tax may vary based on deductions, exemptions, and official assessments.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/taxpayer/assessments")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12 }}
            >
              <FileText size={14} /> View Your Actual Assessments <ChevronRight size={12} />
            </button>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}