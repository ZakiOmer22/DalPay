// src/pages/admin/PaymentsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search, FileText, AlertCircle, X, CheckCircle, Clock,
  CreditCard, Filter, FileSpreadsheet,
  Settings, Plus,
} from "lucide-react";
import { paymentApi } from "@/services/api";
import toast from "react-hot-toast";

const C = {
  border: "#e5eae8", bg: "#ffffff", bgPage: "#f0f2f1", bgMuted: "#f7f9f8",
  text: "#111816", muted: "#7a918b", faint: "#a0b4ae",
  teal: "#0d9e75", tealBg: "#e8f7f2", tealText: "#0a7d5d", tealBorder: "#c3e8dc",
  amber: "#f59e0b", amberBg: "#fffbeb", amberText: "#92400e", amberBorder: "#fde68a",
  red: "#e53e3e", redBg: "#fff5f5", redText: "#c53030", redBorder: "#fed7d7",
  blue: "#3b82f6", blueBg: "#eff6ff", blueText: "#1d4ed8",
  purple: "#8b5cf6", purpleBg: "#f5f3ff", purpleText: "#5b21b6",
};

// ---------- badge ----------
function Badge({ label, color }: { label?: string | null; color: string }) {
  const safe = label || "—";
  const map: Record<string, { bg: string; text: string; border: string }> = {
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

// ---------- card ----------
function Card({ children, style, ...rest }: any) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}

// ---------- stat card ----------
function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <Card>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.faint, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={13} color={color} strokeWidth={1.8} /></div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>{sub}</p>}
      </div>
    </Card>
  );
}

// ---------- bar chart ----------
function BarChart({ data, maxValue }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((item: any) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: C.text, minWidth: 90, fontWeight: 500 }}>{item.label}</span>
          <div style={{ flex: 1, height: 18, background: C.bgMuted, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%", height: "100%", background: item.color, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, minWidth: item.value > 0 ? 24 : 0 }}>
              {item.value > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{item.value.toLocaleString()}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"payments" | "providers">("payments");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({ provider_id: "", provider_name: "" });

  const { data: paymentsResp, isLoading, isError, error } = useQuery({
    queryKey: ["admin-all-payments", page],
    queryFn: () => paymentApi.getAllPaymentsAdmin(page, limit),
    retry: 1,
  });

  const { data: providersResp, refetch: refetchProviders } = useQuery({
    queryKey: ["payment-providers"],
    queryFn: () => paymentApi.getProviders(),
    staleTime: 60000,
  });

  const addProviderMutation = useMutation({
    mutationFn: (data: { provider_id: string; provider_name: string }) =>
      paymentApi.createProvider(data),
    onSuccess: () => {
      toast.success("Provider added");
      setShowAddProvider(false);
      setNewProvider({ provider_id: "", provider_name: "" });
      refetchProviders();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add provider");
    },
  });

  // Extract total from API response
  const totalPayments = (paymentsResp?.data as any)?.total ?? 0;

  const payments = useMemo(() => {
    const raw = paymentsResp?.data as Record<string, any>;
    let list: any[] = [];
    if (raw?.payments) list = raw.payments;
    else if (Array.isArray(raw)) list = raw;
    else if (raw?.data) list = raw.data;
    return list.map((item: any) => ({
      id: item.id ?? item.payment_id ?? "",
      amount: Number(item.amount ?? 0),
      provider: item.provider ?? "",
      transaction_ref: item.transaction_ref ?? "",
      status: item.status ?? "pending",
      fraud_status: item.fraud_status ?? "none",
      created_at: item.created_at ?? new Date().toISOString(),
    }));
  }, [paymentsResp]);

  const providers = useMemo(() => {
    const raw = providersResp?.data as Record<string, any>;
    let list: any[] = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw?.providers) list = raw.providers;
    else if (raw?.data) list = raw.data;
    return list.map((item: any) => ({
      id: item.id ?? item.provider_id ?? "",
      provider_id: item.provider_id ?? item.id ?? "",
      provider_name: item.provider_name ?? item.name ?? "Unknown",
      is_active: (item.status ?? item.is_active ?? false) === "active" || item.is_active === true,
      created_at: item.created_at ?? "",
    }));
  }, [providersResp]);

  const fmt = (val: number) => `USD ${val.toLocaleString()}`;

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const confirmedAmount = payments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === "pending" || p.status === "processing").length;
  const failedCount = payments.filter(p => p.status === "failed").length;
  const confirmedCount = payments.filter(p => p.status === "confirmed").length;

  const statusCounts = [
    { label: "Confirmed", value: confirmedCount, color: C.teal },
    { label: "Pending", value: pendingCount, color: C.amber },
    { label: "Failed", value: failedCount, color: C.red },
  ];

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (search && !p.id?.includes(search) && !p.transaction_ref?.includes(search)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (providerFilter !== "all" && p.provider !== providerFilter) return false;
      return true;
    });
  }, [payments, search, statusFilter, providerFilter]);

  // Pagination based on TOTAL, not current page length
  const totalPages = Math.ceil(totalPayments / limit);

  const handleExportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("Please allow popups"); return; }
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Payment Report</title><style>
      @page { size: A4 landscape; margin: 15mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 10px; }
      .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .header .logo-area { display: flex; align-items: center; gap: 12px; }
      .header img { height: 40px; }
      .header h1 { font-size: 18px; margin: 0; color: #0d9e75; }
      .header .sub { font-size: 10px; color: #7a918b; margin: 2px 0 0; }
      .header .badge { background: #e8f7f2; color: #0a7d5d; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #0d9e75; color: white; padding: 8px 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; text-align: left; }
      td { padding: 7px 10px; font-size: 9px; border-bottom: 1px solid #e5eae8; }
      tr:nth-child(even) td { background: #f7f9f8; }
      .total-row td { font-weight: 700; background: #e8f7f2 !important; border-top: 2px solid #0d9e75; }
      .paid { color: #0d9e75; } .unpaid { color: #f59e0b; } .overdue { color: #e53e3e; }
      .footer { border-top: 1px solid #e5eae8; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 8px; color: #a0b4ae; }
    </style></head><body>
    <div class="header">
      <div class="logo-area"><img src="/icon.png" alt="DalPay Logo" /><div><h1>DalPay Payment Report</h1><p class="sub">Republic of Somaliland • Ministry of Finance • ${now} at ${time}</p></div></div>
      <div class="badge">OFFICIAL</div>
    </div>
    <table><thead><tr><th>ID</th><th>Amount</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
    payments.forEach(p => {
      h += `<tr><td style="font-size:8px;">${(p.id || "?").slice(0, 8)}</td><td style="font-weight:600;">${fmt(p.amount)}</td><td>${p.provider}</td><td class="${p.status === 'confirmed' ? 'paid' : (p.status === 'failed' ? 'overdue' : 'unpaid')}">${(p.status || "").replace(/_/g, ' ')}</td><td>${new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>`;
    });
    h += `<tr class="total-row"><td colspan="2"><strong>TOTAL</strong></td><td>${fmt(totalAmount)}</td><td colspan="2"></td></tr></tbody></table>
    <div class="footer"><span>DalPay Digital Tax System v2.0</span><span>DAL-${Date.now().toString(36).toUpperCase()}</span></div></body></html>`;
    w.document.write(h); w.document.close();
    setTimeout(() => w.print(), 500);
    toast.success("Report generated");
  };

  if (isError && (error as any)?.status === 401) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={40} style={{ margin: "0 auto 16px", color: C.amber }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Session Expired</p>
        <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Payments</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            {totalPayments} total • {confirmedCount} confirmed • {pendingCount + failedCount} pending/failed
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><FileSpreadsheet size={13} /> Export PDF</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden", width: "fit-content" }}>
        <button onClick={() => { setActiveTab("payments"); setPage(1); }} style={{ padding: "8px 20px", fontSize: 12, fontWeight: activeTab === "payments" ? 600 : 500, background: activeTab === "payments" ? C.tealBg : C.bg, color: activeTab === "payments" ? C.tealText : C.muted, border: "none", cursor: "pointer", fontFamily: "inherit" }}><CreditCard size={13} style={{ marginRight: 6 }} /> Payments</button>
        <button onClick={() => { setActiveTab("providers"); setPage(1); }} style={{ padding: "8px 20px", fontSize: 12, fontWeight: activeTab === "providers" ? 600 : 500, background: activeTab === "providers" ? C.tealBg : C.bg, color: activeTab === "providers" ? C.tealText : C.muted, border: "none", borderLeft: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit" }}><Settings size={13} style={{ marginRight: 6 }} /> Payment Methods</button>
      </div>

      {activeTab === "payments" && (
        <>
          {/* stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <StatCard label="Total Volume" value={fmt(totalAmount)} icon={CreditCard} color={C.blue} sub={`${totalPayments} transactions`} />
            <StatCard label="Confirmed" value={fmt(confirmedAmount)} icon={CheckCircle} color={C.teal} sub={`${confirmedCount} payments`} />
            <StatCard label="Pending" value={pendingCount} icon={Clock} color={C.amber} />
            <StatCard label="Failed" value={failedCount} icon={AlertCircle} color={C.red} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Status Breakdown</p></div>
              <div style={{ padding: "14px 16px" }}><BarChart data={statusCounts} maxValue={Math.max(...statusCounts.map(s => s.value), 1)} /></div>
            </Card>
            <Card>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Provider Volume</p></div>
              <div style={{ padding: "14px 16px" }}>
                <BarChart
                  data={Object.entries(payments.reduce((acc: Record<string, number>, p) => { acc[p.provider] = (acc[p.provider] || 0) + p.amount; return acc; }, {})).map(([label, value]) => ({ label, value, color: C.purple }))}
                  maxValue={Math.max(...Object.values(payments.reduce((acc: Record<string, number>, p) => { acc[p.provider] = (acc[p.provider] || 0) + p.amount; return acc; }, {})), 1)}
                />
              </div>
            </Card>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
            <Filter size={13} color={C.faint} />
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
              <input type="text" placeholder="Search ID or reference..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
              <option value="all">All Statuses</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option><option value="reversed">Reversed</option>
            </select>
            <select value={providerFilter} onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 130 }}>
              <option value="all">All Providers</option>
              {providers.map(prov => <option key={prov.provider_id} value={prov.provider_id}>{prov.provider_name}</option>)}
            </select>
            {(search || statusFilter !== "all" || providerFilter !== "all") && (
              <button onClick={() => { setSearch(""); setStatusFilter("all"); setProviderFilter("all"); setPage(1); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>Clear</button>
            )}
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} /></div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}><FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} /><p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No payments found</p></div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 120px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                  {["ID", "Amount", "Provider", "Status", "Date", "Fraud"].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>)}
                </div>
                {filteredPayments.map(p => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 120px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgMuted)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: C.text }}>{(p.id || "?").slice(0, 8)}…</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.teal }}>{fmt(p.amount)}</span>
                    <span style={{ fontSize: 11, color: C.text }}>{p.provider}</span>
                    <Badge label={p.status} color={p.status === "confirmed" ? "green" : p.status === "failed" ? "red" : "amber"} />
                    <span style={{ fontSize: 10, color: C.faint }}>{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <Badge label={p.fraud_status} color={p.fraud_status === "suspicious" ? "amber" : p.fraud_status === "high_risk" ? "red" : "gray"} />
                  </div>
                ))}
              </>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Prev</button>
              <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>Next</button>
            </div>
          )}
        </>
      )}

      {activeTab === "providers" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>Mobile Money Providers</h2>
            <button onClick={() => setShowAddProvider(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.teal, border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Plus size={13} /> Add Provider</button>
          </div>
          <Card>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {providers.length === 0 ? (
                <p style={{ fontSize: 12, color: C.faint }}>No providers configured.</p>
              ) : (
                providers.map(prov => (
                  <div key={prov.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.bgMuted, borderRadius: 8 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{prov.provider_name}</p>
                      <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>ID: {prov.provider_id}</p>
                    </div>
                    <Badge label={prov.is_active ? "active" : "inactive"} color={prov.is_active ? "green" : "gray"} />
                  </div>
                ))
              )}
            </div>
          </Card>
          {showAddProvider && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowAddProvider(false)}>
              <Card style={{ width: "90%", maxWidth: 400 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Add Provider</h2>
                  <button onClick={() => setShowAddProvider(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
                </div>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Provider ID *</label>
                    <input type="text" value={newProvider.provider_id} onChange={e => setNewProvider({ ...newProvider, provider_id: e.target.value })} placeholder="e.g. zaad" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Provider Name *</label>
                    <input type="text" value={newProvider.provider_name} onChange={e => setNewProvider({ ...newProvider, provider_name: e.target.value })} placeholder="e.g. Zaad" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button onClick={() => setShowAddProvider(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={() => addProviderMutation.mutate(newProvider)} disabled={addProviderMutation.isPending} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: addProviderMutation.isPending ? 0.7 : 1 }}>{addProviderMutation.isPending ? "Adding..." : "Add Provider"}</button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}