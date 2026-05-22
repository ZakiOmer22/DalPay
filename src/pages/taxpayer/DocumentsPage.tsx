// src/pages/taxpayer/DocumentsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Upload, Eye, Download, Trash2, AlertCircle, CheckCircle,
  Clock, Loader2,
} from "lucide-react";
import { request } from "@/services/api";
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

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <Card>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.faint, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={13} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>{sub}</p>}
      </div>
    </Card>
  );
}

interface Document {
  id: string;
  document_type: string;
  file_url: string;
  verified: boolean;
  reviewed_by?: string;
  created_at: string;
}

// ─── Upload Modal – uses native fetch for multipart/form-data ─────────
function UploadModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("id_card");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selected.type)) {
        setError("Only JPEG, PNG, or PDF files are allowed.");
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        setFile(null);
        return;
      }
      setError("");
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    setUploading(true);
    try {
      const token = localStorage.getItem("dalpay_access_token");
      const response = await fetch("/api/v1/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Upload failed");
      toast.success("Document uploaded successfully");
      onSuccess();
      onClose();
      setFile(null);
      setDocumentType("id_card");
      setError("");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card style={{ width: "90%", maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Upload Document</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ padding: 8, background: C.redBg, borderRadius: 8, color: C.redText, fontSize: 12 }}>{error}</div>}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Document Type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}>
              <option value="id_card">National ID Card</option>
              <option value="address_proof">Proof of Address</option>
              <option value="business_license">Business License</option>
              <option value="tax_clearance">Tax Clearance Certificate</option>
              <option value="property_title">Property Title Deed</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>File (PDF, JPEG, PNG, max 10MB)</label>
            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} style={{ width: "100%", padding: "6px", border: `1px solid ${C.border}`, borderRadius: 8 }} />
            {file && <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={handleUpload} disabled={uploading} style={{ flex: 1, padding: "10px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── View/Download Modal with fixed image preview ────────────────────
function ViewDocumentModal({ document, isOpen, onClose }: { document: Document | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !document) return null;

  const fileUrl = document.file_url.startsWith('http') 
    ? document.file_url 
    : `${window.location.origin}${document.file_url}`;
  const isImage = /\.(jpeg|jpg|png)$/i.test(fileUrl);
  const isPdf = /\.pdf$/i.test(fileUrl);

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <Card style={{ width: "90%", maxWidth: 800, maxHeight: "90vh", overflow: "auto" }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Document Preview</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          {isImage && (
            <img src={fileUrl} alt="Document" style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", border: `1px solid ${C.border}`, borderRadius: 8 }} onError={(e) => {
              e.currentTarget.style.display = 'none';
              toast.error("Failed to load image preview. Try downloading.");
            }} />
          )}
          {isPdf && (
            <iframe src={fileUrl} style={{ width: "100%", height: "60vh", border: `1px solid ${C.border}`, borderRadius: 8 }} title="PDF Viewer" />
          )}
          {!isImage && !isPdf && (
            <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
              <FileText size={48} style={{ margin: "0 auto 16px" }} />
              <p>Preview not available for this file type.</p>
              <button onClick={handleDownload} style={{ marginTop: 16, padding: "8px 16px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}>Download</button>
            </div>
          )}
        </div>
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 12 }}>
          <button onClick={handleDownload} style={{ flex: 1, padding: "10px", background: C.blue, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Download size={14} /> Download</button>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function TaxPayerDocumentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-documents"],
    queryFn: () => request("/documents"),
  });

  const documents: Document[] = (data as any)?.data || [];

  const stats = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter(d => d.verified).length;
    const pending = total - verified;
    return { total, verified, pending };
  }, [documents]);

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await request(`/documents/${docId}`, { method: "DELETE" });
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["user-documents"] });
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // ✅ Fixed: handles null/undefined document_type safely
  const getDocumentTypeLabel = (type: string | null | undefined) => {
    if (!type) return "Document";
    const labels: Record<string, string> = {
      id_card: "National ID Card",
      address_proof: "Proof of Address",
      business_license: "Business License",
      tax_clearance: "Tax Clearance Certificate",
      property_title: "Property Title Deed",
      other: "Other",
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (isError && (error as any)?.status === 401) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={40} style={{ margin: "0 auto 16px", color: C.amber }} />
        <p style={{ fontSize: 16, fontWeight: 700 }}>Session Expired</p>
        <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", background: C.teal, color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>My Documents</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Upload and manage your identity and tax documents</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.teal, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Upload size={13} /> Upload Document
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total Documents" value={stats.total} icon={FileText} color={C.blue} />
        <StatCard label="Verified" value={stats.verified} icon={CheckCircle} color={C.teal} />
        <StatCard label="Pending Verification" value={stats.pending} icon={Clock} color={C.amber} />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          {documents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <FileText size={32} color={C.border} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No documents uploaded</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Upload your first document to get started</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", gap: 8, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {["Document Type", "Uploaded", "Status", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", gap: 8,
                    padding: "12px 20px", borderBottom: idx < documents.length - 1 ? `1px solid ${C.border}` : "none",
                    alignItems: "center", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{getDocumentTypeLabel(doc.document_type)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>{new Date(doc.created_at).toLocaleDateString()}</span>
                  <div>
                    <Badge label={doc.verified ? "Verified" : "Pending"} color={doc.verified ? "green" : "amber"} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleView(doc)} style={{ background: "none", border: "none", cursor: "pointer", color: C.blue }}><Eye size={14} /></button>
                    <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["user-documents"] })} />
      <ViewDocumentModal document={selectedDocument} isOpen={showViewModal} onClose={() => setShowViewModal(false)} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}