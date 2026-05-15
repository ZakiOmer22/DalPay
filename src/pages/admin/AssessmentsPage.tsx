/* eslint-disable react-hooks/purity */
// src/pages/admin/AssessmentsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Search, FileText, AlertCircle, Plus, X,
    CheckCircle, Clock, Filter, BarChart3, FileSpreadsheet,
    MapPin, Landmark,
} from "lucide-react";
import { taxApi, adminApi } from "@/services/api";
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

interface RawAssessment {
    assessment_id: string;
    user_id?: string;
    tax_type: string;
    assessment_year: number;
    assessed_amount: string;
    payment_due_date: string;
    status: string;
}

interface Assessment {
    id: string;
    user_id: string;
    tax_type: string;
    year: number;
    amount: number;
    due_date: string;
    status: string;
}

interface TaxpayerProfile {
    id: string;
    full_name: string;
    phone: string;
    region: string;
    district: string;
}

// Group types for region view
interface RegionAssessmentGroup {
    region: string;
    displayName: string;
    taxpayers: TaxpayerAssessmentGroup[];
    totalAmount: number;
    paidAmount: number;
    paidCount: number;
    unpaidCount: number;
    overdueCount: number;
    partiallyPaidCount: number;
}

interface TaxpayerAssessmentGroup {
    userId: string;
    fullName: string;
    phone: string;
    region: string;
    assessments: Assessment[];
    totalAmount: number;
    paidAmount: number;
}

const REGIONS: Record<string, string> = {
    maroodi_jeex: "Maroodi Jeex (Hargeisa)",
    awdal: "Awdal (Borama)",
    sahil: "Sahil (Berbera)",
    togdheer: "Togdheer (Burao)",
    sanaag: "Sanaag (Erigavo)",
    sool: "Sool (Las Anod)",
};

function Card({ children, style, ...rest }: { children: React.ReactNode; style?: React.CSSProperties;[key: string]: unknown }) {
    return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }} {...rest}>{children}</div>;
}

function Badge({ label, color }: { label: string; color: "green" | "amber" | "red" | "blue" | "gray" | "purple" }) {
    const map: Record<string, { bg: string; text: string; border: string }> = {
        green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
        amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
        red: { bg: C.redBg, text: C.redText, border: C.redBorder },
        blue: { bg: C.blueBg, text: C.blueText, border: "#bfdbfe" },
        gray: { bg: C.bgMuted, text: C.muted, border: C.border },
        purple: { bg: C.purpleBg, text: C.purpleText, border: "#d8c9f0" },
    };
    const m = map[color];
    return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: m.bg, color: m.text, border: `1px solid ${m.border}`, whiteSpace: "nowrap", textTransform: "capitalize", display: "inline-block" }}>{label.replace(/_/g, " ")}</span>;
}

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
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

function BarChart({ data, maxValue, height }: { data: { label: string; value: number; color: string }[]; maxValue: number; height?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map((item) => (
                <div key={`bar-${item.label}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: C.text, minWidth: 90, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    <div style={{ flex: 1, height: height || 20, background: C.bgMuted, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%", height: "100%", background: item.color, borderRadius: 4, transition: "width .4s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, minWidth: item.value > 0 ? 24 : 0 }}>
                            {item.value > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{item.value.toLocaleString()}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function getStatusColor(status: string): "green" | "amber" | "red" | "blue" | "gray" | "purple" {
    if (status === "paid") return "green";
    if (status === "partially_paid") return "purple";
    if (status === "overdue") return "red";
    if (status === "unpaid" || status === "pending") return "amber";
    return "gray";
}

export default function AssessmentsPage() {
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [showCharts, setShowCharts] = useState(true);
    const [selectedTaxpayer, setSelectedTaxpayer] = useState<TaxpayerAssessmentGroup | null>(null);
    const [viewMode, setViewMode] = useState<"regions" | "years">("years");
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch all assessments (admin endpoint includes user_id)
    const { data: assessmentsData, isLoading, isError, error } = useQuery({
        queryKey: ["assessments"],
        queryFn: () => taxApi.getAssessments(),
        retry: 1,
    });

    // Fetch all taxpayers for mapping
    const { data: taxpayersData } = useQuery({
        queryKey: ["taxpayers", { page: 1, limit: 1000 }],
        queryFn: () => adminApi.getTaxpayers({ page: 1, limit: 1000 }),
        staleTime: 60000,
    });

    const rawAssessments = assessmentsData?.data as RawAssessment[] | undefined;
    const allAssessments: Assessment[] = Array.isArray(rawAssessments)
        ? rawAssessments.map((item) => ({
            id: item.assessment_id,
            user_id: item.user_id || "",
            tax_type: item.tax_type,
            year: item.assessment_year,
            amount: parseFloat(item.assessed_amount) || 0,
            due_date: item.payment_due_date,
            status: item.status,
        }))
        : [];

    let taxpayers: TaxpayerProfile[] = [];
    if (taxpayersData) {
        if (Array.isArray(taxpayersData.data)) {
            taxpayers = taxpayersData.data;
        } else if (taxpayersData.data?.taxpayers) {
            taxpayers = taxpayersData.data.taxpayers;
        }
    }

    const taxpayerMap = useMemo(() => {
        const map: Record<string, TaxpayerProfile> = {};
        taxpayers.forEach((tp) => { map[tp.id] = tp; });
        return map;
    }, [taxpayers]);

    const formatCurrency = (val: number): string => {
        if (val === undefined || val === null || isNaN(val)) return "USD 0";
        return `USD ${val.toLocaleString()}`;
    };

    const totalAmount = allAssessments.reduce((sum, a) => sum + a.amount, 0);
    const totalPaid = allAssessments.filter((a) => a.status === "paid").reduce((sum, a) => sum + a.amount, 0);
    const paidCount = allAssessments.filter((a) => a.status === "paid").length;
    const unpaidCount = allAssessments.filter((a) => a.status === "unpaid" || a.status === "pending").length;
    const overdueCount = allAssessments.filter((a) => a.status === "overdue").length;
    const partiallyPaidCount = allAssessments.filter((a) => a.status === "partially_paid").length;
    const unpaidAmount = allAssessments.filter((a) => a.status === "unpaid" || a.status === "pending").reduce((s, a) => s + a.amount, 0);
    const overdueAmount = allAssessments.filter((a) => a.status === "overdue").reduce((s, a) => s + a.amount, 0);
    const collectionRate = totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : "0";

    // Year grouping
    const yearGroups = useMemo(() => {
        const groups: Record<number, Assessment[]> = {};
        allAssessments.forEach((a) => {
            if (!groups[a.year]) groups[a.year] = [];
            groups[a.year].push(a);
        });
        return Object.entries(groups)
            .map(([year, assessments]) => ({
                year: Number(year),
                assessments,
                totalAmount: assessments.reduce((s, a) => s + a.amount, 0),
                paidAmount: assessments.filter((a) => a.status === "paid").reduce((s, a) => s + a.amount, 0),
                paidCount: assessments.filter((a) => a.status === "paid").length,
                unpaidCount: assessments.filter((a) => a.status === "unpaid").length,
                overdueCount: assessments.filter((a) => a.status === "overdue").length,
                partiallyPaidCount: assessments.filter((a) => a.status === "partially_paid").length,
            }))
            .sort((a, b) => b.year - a.year);
    }, [allAssessments]);

    // Region grouping (only if user_id is present)
    const hasUserIds = allAssessments.some((a) => a.user_id && a.user_id !== "");

    const regionGroups = useMemo(() => {
        if (!hasUserIds) return [];
        const grouped: Record<string, RegionAssessmentGroup> = {};
        allAssessments.forEach((assessment) => {
            const taxpayerProfile = taxpayerMap[assessment.user_id];
            if (!taxpayerProfile) return;
            const region = taxpayerProfile.region || "unknown";
            if (!grouped[region]) {
                grouped[region] = {
                    region,
                    displayName: REGIONS[region] || region,
                    taxpayers: [],
                    totalAmount: 0,
                    paidAmount: 0,
                    paidCount: 0,
                    unpaidCount: 0,
                    overdueCount: 0,
                    partiallyPaidCount: 0,
                };
            }
            let tpGroup = grouped[region].taxpayers.find((tp) => tp.userId === assessment.user_id);
            if (!tpGroup) {
                tpGroup = {
                    userId: assessment.user_id,
                    fullName: taxpayerProfile.full_name,
                    phone: taxpayerProfile.phone,
                    region,
                    assessments: [],
                    totalAmount: 0,
                    paidAmount: 0,
                };
                grouped[region].taxpayers.push(tpGroup);
            }
            tpGroup.assessments.push(assessment);
            tpGroup.totalAmount += assessment.amount;
            if (assessment.status === "paid") tpGroup.paidAmount += assessment.amount;
            grouped[region].totalAmount += assessment.amount;
            if (assessment.status === "paid") { grouped[region].paidAmount += assessment.amount; grouped[region].paidCount++; }
            else if (assessment.status === "unpaid") grouped[region].unpaidCount++;
            else if (assessment.status === "overdue") grouped[region].overdueCount++;
            else if (assessment.status === "partially_paid") grouped[region].partiallyPaidCount++;
        });
        return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [allAssessments, taxpayerMap, hasUserIds]);

    const selectedRegionData = selectedRegion ? regionGroups.find((r) => r.region === selectedRegion) : null;

    const filteredTaxpayers = useMemo(() => {
        if (!selectedRegionData) return [];
        return selectedRegionData.taxpayers.filter((tp) => {
            if (search && !tp.fullName.toLowerCase().includes(search.toLowerCase()) && !tp.phone.includes(search)) return false;
            if (statusFilter !== "all" && !tp.assessments.some((a) => a.status === statusFilter)) return false;
            if (typeFilter !== "all" && !tp.assessments.some((a) => a.tax_type === typeFilter)) return false;
            if (yearFilter !== "all" && !tp.assessments.some((a) => a.year === Number(yearFilter))) return false;
            return true;
        });
    }, [selectedRegionData, search, statusFilter, typeFilter, yearFilter]);

    const limit = 20;
    const paginatedTaxpayers = filteredTaxpayers.slice((page - 1) * limit, page * limit);

    // Generate assessments handler
    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            await adminApi.generateAssessments(generateYear);
            toast.success(`Assessments generated for ${generateYear}`);
            setShowGenerateModal(false);
        } catch (err: any) {
            toast.error(err.message || "Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = () => {
        const w = window.open("", "_blank");
        if (!w) { toast.error("Please allow popups"); return; }
        const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        let h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DalPay Tax Assessment Report</title><style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111816; font-size: 10px; }
        .header { border-bottom: 3px solid #0d9e75; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .header .logo-area { display: flex; align-items: center; gap: 12px; }
        .header img { height: 40px; }
        .header h1 { font-size: 18px; margin: 0; color: #0d9e75; }
        .header .sub { font-size: 10px; color: #7a918b; margin: 2px 0 0; }
        .header .badge { background: #e8f7f2; color: #0a7d5d; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; }
        .summary { display: flex; gap: 12px; margin-bottom: 16px; }
        .summary-box { flex: 1; background: #f7f9f8; padding: 10px 14px; border-radius: 8px; border: 1px solid #e5eae8; }
        .summary-box .label { font-size: 8px; color: #7a918b; text-transform: uppercase; letter-spacing: .05em; }
        .summary-box .value { font-size: 16px; font-weight: 700; color: #111816; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #0d9e75; color: white; padding: 8px 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; text-align: left; }
        td { padding: 7px 10px; font-size: 9px; border-bottom: 1px solid #e5eae8; }
        tr:nth-child(even) td { background: #f7f9f8; }
        .total-row td { font-weight: 700; background: #e8f7f2 !important; border-top: 2px solid #0d9e75; }
        .paid { color: #0d9e75; font-weight: 600; } .unpaid { color: #f59e0b; font-weight: 600; } .overdue { color: #e53e3e; font-weight: 600; }
        .footer { border-top: 1px solid #e5eae8; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 8px; color: #a0b4ae; }
    </style></head><body>
    <div class="header">
        <div class="logo-area">
            <img src="/icon.png" alt="DalPay Logo" />
            <div>
                <h1>DalPay Tax Assessment Report</h1>
                <p class="sub">Republic of Somaliland • Ministry of Finance • ${now} at ${time}</p>
            </div>
        </div>
        <div class="badge">OFFICIAL</div>
    </div>
    <div class="summary">
        <div class="summary-box"><div class="label">Total Assessed</div><div class="value">${formatCurrency(totalAmount)}</div></div>
        <div class="summary-box"><div class="label">Collected</div><div class="value paid">${formatCurrency(totalPaid)}</div></div>
        <div class="summary-box"><div class="label">Rate</div><div class="value">${collectionRate}%</div></div>
        <div class="summary-box"><div class="label">Assessments</div><div class="value">${allAssessments.length}</div></div>
        <div class="summary-box"><div class="label">Overdue</div><div class="value overdue">${overdueCount}</div></div>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Taxpayer</th>
                <th>Type</th>
                <th>Year</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody>`;

        // List every assessment individually
        allAssessments.forEach((a) => {
            const taxpayer = taxpayerMap[a.user_id];
            const name = taxpayer ? taxpayer.full_name : (a.user_id ? "Unknown" : "—");
            const taxType = a.tax_type.replace(/_/g, ' ');
            const statusClass = a.status === 'paid' ? 'paid' : (a.status === 'overdue' ? 'overdue' : 'unpaid');
            const due = a.due_date ? new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            h += `<tr>
            <td style="font-size:8px;">${a.id.slice(0, 8)}</td>
            <td>${name}</td>
            <td style="text-transform:capitalize;">${taxType}</td>
            <td>${a.year}</td>
            <td style="font-weight:600;">${formatCurrency(a.amount)}</td>
            <td class="${statusClass}">${a.status.replace(/_/g, ' ')}</td>
            <td>${due}</td>
        </tr>`;
        });

        // Totals row
        h += `<tr class="total-row">
        <td colspan="4"><strong>TOTAL</strong></td>
        <td>${formatCurrency(totalAmount)}</td>
        <td colspan="2"></td>
    </tr>`;

        h += `</tbody></table>
    <div class="footer">
        <span>DalPay Digital Tax System v2.0</span>
        <span>DAL-${Date.now().toString(36).toUpperCase()}</span>
    </div></body></html>`;

        w.document.write(h);
        w.document.close();
        setTimeout(() => w.print(), 500);
        toast.success("Report generated");
    };

    const err = error as { status?: number } | undefined;
    if (isError && err?.status === 401) {
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Tax Assessments</h1>
                    <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>{allAssessments.length} total • {yearGroups.length} years {hasUserIds && `• ${regionGroups.length} regions`}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {hasUserIds && (
                        <div style={{ display: "flex", borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                            <button onClick={() => setViewMode("years")} style={{ padding: "7px 14px", fontSize: 11, fontWeight: viewMode === "years" ? 600 : 500, background: viewMode === "years" ? C.tealBg : C.bg, color: viewMode === "years" ? C.tealText : C.muted, border: "none", cursor: "pointer", fontFamily: "inherit" }}>By Year</button>
                            <button onClick={() => setViewMode("regions")} style={{ padding: "7px 14px", fontSize: 11, fontWeight: viewMode === "regions" ? 600 : 500, background: viewMode === "regions" ? C.tealBg : C.bg, color: viewMode === "regions" ? C.tealText : C.muted, border: "none", borderLeft: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit" }}>By Region</button>
                        </div>
                    )}
                    <button onClick={() => setShowCharts(!showCharts)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><BarChart3 size={13} /> {showCharts ? "Hide" : "Charts"}</button>
                    <button onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.blue + "15", border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><FileSpreadsheet size={13} /> Export PDF</button>
                    <button onClick={() => setShowGenerateModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.teal, border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Plus size={13} /> Generate Assessments</button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                <StatCard label="Total Assessed" value={formatCurrency(totalAmount)} icon={Landmark} color={C.blue} sub={`${allAssessments.length} assessments`} />
                <StatCard label="Collected" value={formatCurrency(totalPaid)} icon={CheckCircle} color={C.teal} sub={`${collectionRate}% rate`} />
                <StatCard label="Unpaid" value={unpaidCount} icon={Clock} color={C.amber} sub={`${formatCurrency(unpaidAmount)} outstanding`} />
                <StatCard label="Overdue" value={overdueCount} icon={AlertCircle} color={C.red} sub={`${formatCurrency(overdueAmount)} at risk`} />
                <StatCard label="Years" value={yearGroups.length} icon={MapPin} color={C.purple} sub={`${taxpayers.length} taxpayers`} />
            </div>

            {showCharts && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Card>
                        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Status Breakdown</p></div>
                        <div style={{ padding: "14px 16px" }}>
                            <BarChart data={[
                                { label: "Paid", value: paidCount, color: C.teal },
                                { label: "Unpaid", value: unpaidCount, color: C.amber },
                                { label: "Overdue", value: overdueCount, color: C.red },
                                { label: "Partial", value: partiallyPaidCount, color: C.purple },
                            ]} maxValue={Math.max(paidCount, unpaidCount, overdueCount, partiallyPaidCount, 1)} />
                        </div>
                    </Card>
                    <Card>
                        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Revenue by Year</p></div>
                        <div style={{ padding: "14px 16px" }}>
                            <BarChart data={yearGroups.slice(0, 5).map((g, i) => ({ label: String(g.year), value: g.totalAmount, color: ["#0d9e75", "#3b82f6", "#8b5cf6", "#f59e0b", "#e53e3e"][i % 5] }))} maxValue={Math.max(...yearGroups.map(g => g.totalAmount), 1)} height={18} />
                        </div>
                    </Card>
                </div>
            )}

            {hasUserIds && viewMode === "regions" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
                    <MapPin size={13} color={C.faint} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Region:</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => { setSelectedRegion(null); setPage(1); }} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${selectedRegion === null ? C.teal : C.border}`, background: selectedRegion === null ? C.tealBg : C.bg, color: selectedRegion === null ? C.tealText : C.text, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: selectedRegion === null ? 600 : 500 }}>All ({regionGroups.length})</button>
                        {regionGroups.map((region) => (
                            <button key={`region-btn-${region.region}`} onClick={() => { setSelectedRegion(region.region); setPage(1); }} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${selectedRegion === region.region ? C.teal : C.border}`, background: selectedRegion === region.region ? C.tealBg : C.bg, color: selectedRegion === region.region ? C.tealText : C.text, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: selectedRegion === region.region ? 600 : 500 }}>{region.displayName.split(" ")[0]} ({region.taxpayers.length})</button>
                        ))}
                    </div>
                </div>
            )}

            {/* YEAR VIEW */}
            {(viewMode === "years" || !hasUserIds) && (
                <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, alignItems: "center" }}>
                        <Filter size={13} color={C.faint} />
                        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
                            <input type="text" placeholder="Search by year..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
                        </div>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 110 }}>
                            <option value="all">All Statuses</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="partially_paid">Partially Paid</option><option value="overdue">Overdue</option>
                        </select>
                        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 120 }}>
                            <option value="all">All Types</option><option value="income_tax">Income Tax</option><option value="property_tax">Property Tax</option><option value="business_tax">Business Tax</option><option value="sales_tax">Sales Tax</option><option value="customs_tax">Customs Tax</option>
                        </select>
                        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 11, outline: "none", background: C.bgPage, color: C.text, fontFamily: "inherit", cursor: "pointer", minWidth: 80 }}>
                            <option value="all">All Years</option>
                            {yearGroups.map((g) => <option key={`yf-${g.year}`} value={g.year}>{g.year}</option>)}
                        </select>
                        {(search || statusFilter !== "all" || typeFilter !== "all" || yearFilter !== "all") && (
                            <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setYearFilter("all"); setPage(1); }} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>Clear</button>
                        )}
                    </div>

                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                        {isLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} /></div>
                        ) : yearGroups.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px" }}><FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} /><p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No assessments found</p></div>
                        ) : (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 60px 60px 60px 60px 60px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                                    {["Year", "Total", "Paid", "Remaining", "Paid#", "Unpaid", "Overdue", "Partial", ""].map((h) => <span key={`th-${h}`} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", textAlign: h === "Year" ? "left" : "right" }}>{h}</span>)}
                                </div>
                                {yearGroups.map((group) => {
                                    const remaining = group.totalAmount - group.paidAmount;
                                    return (
                                        <div key={`yg-${group.year}`}
                                            style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 60px 60px 60px 60px 60px", gap: 8, padding: "12px 20px", borderBottom: "1px solid " + C.border, alignItems: "center" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{group.year}</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: "right" }}>{formatCurrency(group.totalAmount)}</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: C.teal, textAlign: "right" }}>{formatCurrency(group.paidAmount)}</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: remaining > 0 ? C.red : C.teal, textAlign: "right" }}>{formatCurrency(remaining)}</span>
                                            <span style={{ fontSize: 11, color: C.teal, textAlign: "right" }}>{group.paidCount}</span>
                                            <span style={{ fontSize: 11, color: C.amber, textAlign: "right" }}>{group.unpaidCount}</span>
                                            <span style={{ fontSize: 11, color: C.red, textAlign: "right" }}>{group.overdueCount}</span>
                                            <span style={{ fontSize: 11, color: C.purple, textAlign: "right" }}>{group.partiallyPaidCount}</span>
                                            <span style={{ fontSize: 16, color: C.faint, textAlign: "center" }}></span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </>
            )}

            {/* REGION VIEW */}
            {hasUserIds && viewMode === "regions" && (
                <>
                    {!selectedRegion ? (
                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                            {regionGroups.map((region) => (
                                <div key={`region-${region.region}`} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <div style={{ padding: "16px 20px", background: C.bgMuted, cursor: "pointer" }} onClick={() => setSelectedRegion(region.region)} onMouseEnter={(e) => (e.currentTarget.style.background = C.bgPage)} onMouseLeave={(e) => (e.currentTarget.style.background = C.bgMuted)}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div><p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{region.displayName}</p><p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{region.taxpayers.length} taxpayers</p></div>
                                            <div style={{ textAlign: "right" }}><p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{formatCurrency(region.totalAmount)}</p><div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10 }}><span style={{ color: C.teal }}>Paid: {region.paidCount}</span><span style={{ color: C.amber }}>Unpaid: {region.unpaidCount}</span><span style={{ color: C.red }}>Overdue: {region.overdueCount}</span></div></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                            {paginatedTaxpayers.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 20px" }}><FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} /><p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No taxpayers in this region</p></div>
                            ) : (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 80px 80px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                                        {["Taxpayer", "Total", "Paid", "Remaining", "Paid#", "Unpaid#", "Overdue#", ""].map((h) => <span key={`rh-${h}`} style={{ fontSize: 9, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", textAlign: h === "Taxpayer" ? "left" : h === "" ? "center" : "right" }}>{h}</span>)}
                                    </div>
                                    {paginatedTaxpayers.map((taxpayer) => {
                                        const remaining = taxpayer.totalAmount - taxpayer.paidAmount;
                                        const pCount = taxpayer.assessments.filter((a) => a.status === "paid").length;
                                        const uCount = taxpayer.assessments.filter((a) => a.status === "unpaid").length;
                                        const oCount = taxpayer.assessments.filter((a) => a.status === "overdue").length;
                                        return (
                                            <div key={`tp-${taxpayer.userId}`} onClick={() => setSelectedTaxpayer(taxpayer)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 80px 80px", gap: 8, padding: "12px 20px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background .15s", alignItems: "center" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                                <div><p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{taxpayer.fullName}</p><p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{taxpayer.phone}</p></div>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: "right" }}>{formatCurrency(taxpayer.totalAmount)}</span>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: C.teal, textAlign: "right" }}>{formatCurrency(taxpayer.paidAmount)}</span>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: remaining > 0 ? C.red : C.teal, textAlign: "right" }}>{formatCurrency(remaining)}</span>
                                                <span style={{ fontSize: 11, color: C.teal, textAlign: "right" }}>{pCount}</span>
                                                <span style={{ fontSize: 11, color: C.amber, textAlign: "right" }}>{uCount}</span>
                                                <span style={{ fontSize: 11, color: C.red, textAlign: "right" }}>{oCount}</span>
                                                <span style={{ fontSize: 16, color: C.faint, textAlign: "center" }}>→</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Detail Modal for a specific taxpayer (from region view) */}
            {selectedTaxpayer && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedTaxpayer(null)}>
                    <Card style={{ width: "90%", maxWidth: 750, maxHeight: "85vh", overflow: "auto" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div><h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{selectedTaxpayer.fullName}</h2><p style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{selectedTaxpayer.assessments.length} assessments • {formatCurrency(selectedTaxpayer.totalAmount)} total</p></div>
                            <button onClick={() => setSelectedTaxpayer(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                            <div><p style={{ fontSize: 9, color: C.faint }}>Total</p><p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{formatCurrency(selectedTaxpayer.totalAmount)}</p></div>
                            <div><p style={{ fontSize: 9, color: C.faint }}>Paid</p><p style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{formatCurrency(selectedTaxpayer.paidAmount)}</p></div>
                            <div><p style={{ fontSize: 9, color: C.faint }}>Remaining</p><p style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{formatCurrency(selectedTaxpayer.totalAmount - selectedTaxpayer.paidAmount)}</p></div>
                        </div>
                        <div style={{ padding: "10px 20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                                {["Type / Taxpayer", "Amount", "Status", "Due Date"].map((h) => <span key={`dh-${h}`} style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", fontWeight: 700 }}>{h}</span>)}
                            </div>
                            {selectedTaxpayer.assessments.map((a) => {
                                const taxpayer = a.user_id ? taxpayerMap[a.user_id] : null;
                                return (
                                    <div key={`da-${a.id}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "9px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                                        <div>
                                            <span style={{ fontSize: 11, color: C.text, textTransform: "capitalize", fontWeight: 500 }}>{a.tax_type.replace(/_/g, " ")}</span>
                                            {taxpayer && (
                                                <span style={{ fontSize: 9, color: C.faint, display: "block" }}>{taxpayer.full_name}</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: C.teal }}>{formatCurrency(a.amount)}</span>
                                        <Badge label={a.status} color={getStatusColor(a.status)} />
                                        <span style={{ fontSize: 10, color: C.faint }}>{a.due_date ? new Date(a.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Generate Assessments Modal */}
            {showGenerateModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowGenerateModal(false)}>
                    <Card style={{ width: "90%", maxWidth: 400 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Generate Assessments</h2>
                            <button onClick={() => setShowGenerateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.faint }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 11, color: C.faint, marginBottom: 4, display: "block" }}>Tax Year *</label>
                                <input
                                    type="number"
                                    value={generateYear}
                                    onChange={(e) => setGenerateYear(parseInt(e.target.value) || new Date().getFullYear())}
                                    min={2000}
                                    max={2100}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <button onClick={() => setShowGenerateModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                <button onClick={handleGenerate} disabled={isGenerating} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: isGenerating ? 0.7 : 1 }}>
                                    {isGenerating ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}