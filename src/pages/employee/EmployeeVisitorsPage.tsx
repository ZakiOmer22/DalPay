// src/pages/employee/EmployeeVisitorsPage.tsx
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, Search, Loader2, CheckCircle, UserPlus,
  Eye, CheckSquare, DollarSign, Download, RefreshCw,
  UserCheck, Clock as ClockIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAccessToken, getUserRole, request } from '@/services/api';
import { downloadCSV } from '@/utils/export';
import toast from 'react-hot-toast';

// ─── Design tokens ──────────────────────────────────────────────────────
const C = {
  border: '#e5eae8', bg: '#ffffff', bgMuted: '#f7f9f8',
  text: '#111816', muted: '#7a918b', faint: '#a0b4ae', teal: '#0d9e75',
  tealBg: '#e8f7f2', tealText: '#0a7d5d', tealBorder: '#c3e8dc',
  amber: '#f59e0b', amberBg: '#fffbeb', amberText: '#92400e',
  red: '#e53e3e', redBg: '#fff5f5', redText: '#c53030',
  blue: '#3b82f6', blueBg: '#eff6ff', blueText: '#1d4ed8', purple: '#8b5cf6',
};

interface Visitor {
  id: string;
  full_name: string;
  phone: string;
  national_id: string;
  occupation: string;
  purpose: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'active' | 'completed' | 'pending';
  notes?: string;
  follow_up_date?: string;
  taxpayer_id?: string;
  taxpayer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  outstanding_amount?: number;
}

interface VisitorStats {
  total_today: number;
  completed: number;
  pending: number;
  active: number;
  average_time_minutes: number;
  revenue_today: number;
}

interface ApiResponse {
  data: {
    visitors: Visitor[];
    total: number;
    stats: VisitorStats;
  };
}

const purposeOptions = [
  'Check Balance',
  'Pay Tax',
  'File Dispute',
  'Register Business',
  'Update Profile',
  'Tax Consultation',
  'Document Submission',
  'General Inquiry'
];

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>{children}</div>;
}

function Badge({ label, color }: { label: string; color: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const colors = {
    green: { bg: C.tealBg, text: C.tealText },
    amber: { bg: C.amberBg, text: C.amberText },
    red: { bg: C.redBg, text: C.redText },
    blue: { bg: C.blueBg, text: C.blueText },
    gray: { bg: C.bgMuted, text: C.muted },
  }[color];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: colors.bg, color: colors.text }}>{label}</span>;
}

function KpiCard({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon: React.ElementType }) {
  return (
    <Card>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{label}</span>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginTop: 8 }}>{value}</p>
      </div>
    </Card>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null;
  const widthMap = { sm: 400, md: 600, lg: 800 };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <Card>
        <div style={{ width: widthMap[size], maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>×</button>
          </div>
          <div style={{ padding: '20px' }}>{children}</div>
        </div>
      </Card>
    </div>
  );
}

function VisitorDetailModal({ visitor, isOpen, onClose, onCheckOut }: { visitor: Visitor | null; isOpen: boolean; onClose: () => void; onCheckOut: (id: string, notes: string, followUp: string) => void }) {
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  if (!visitor) return null;

  const handleCheckOut = async () => {
    setCheckingOut(true);
    await onCheckOut(visitor.id, notes, followUpDate);
    setCheckingOut(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visitor Details" size="lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.teal + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color={C.teal} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{visitor.full_name}</h3>
            <p style={{ fontSize: 12, color: C.faint }}>Checked in: {new Date(visitor.check_in_time).toLocaleString()}</p>
          </div>
          <Badge label={visitor.status} color={visitor.status === 'active' ? 'blue' : visitor.status === 'completed' ? 'green' : 'amber'} />
        </div>

        <div><p style={{ fontSize: 10, color: C.faint }}>Phone</p><p style={{ fontSize: 13, fontWeight: 600 }}>{visitor.phone}</p></div>
        <div><p style={{ fontSize: 10, color: C.faint }}>National ID</p><p style={{ fontSize: 13 }}>{visitor.national_id || '—'}</p></div>
        <div><p style={{ fontSize: 10, color: C.faint }}>Occupation</p><p style={{ fontSize: 13 }}>{visitor.occupation || '—'}</p></div>
        <div><p style={{ fontSize: 10, color: C.faint }}>Purpose</p><p style={{ fontSize: 13 }}>{visitor.purpose}</p></div>

        <div style={{ gridColumn: '1 / -1', background: C.tealBg, padding: 12, borderRadius: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.tealText, marginBottom: 8 }}>Tax Summary</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: C.tealText }}>Outstanding Amount</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.tealText }}>${visitor.outstanding_amount?.toLocaleString() || 0}</span>
          </div>
        </div>

        {visitor.status === 'active' && (
          <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Check-out Visitor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / Remarks..." rows={2} style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: 'inherit' }} />
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <button onClick={handleCheckOut} disabled={checkingOut} style={{ padding: '10px', borderRadius: 8, background: C.teal, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {checkingOut ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : 'Check Out Visitor'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}

function AddVisitorModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    national_id: '',
    occupation: '',
    purpose: 'Check Balance',
    taxpayer_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTaxpayer, setSearchTaxpayer] = useState('');
  const [taxpayers, setTaxpayers] = useState<any[]>([]);

  const searchForTaxpayer = async () => {
    if (!searchTaxpayer) return;
    try {
      const response = await request(`/admin/taxpayers?search=${searchTaxpayer}&limit=10`);
      const data = response as any;
      setTaxpayers(data?.data?.taxpayers || []);
    } catch {
      setTaxpayers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.phone) {
      setError('Name and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      await request('/admin/visitors', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      toast.success('Visitor checked in successfully');
      onSuccess();
      onClose();
      setForm({ full_name: '', phone: '', national_id: '', occupation: '', purpose: 'Check Balance', taxpayer_id: '' });
      setSearchTaxpayer('');
    } catch (err: any) {
      setError(err.message || 'Failed to check in visitor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check In Visitor" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ padding: '8px 12px', background: C.redBg, borderRadius: 8, fontSize: 13, color: C.redText }}>{error}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Full Name *</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Phone Number *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>National ID</label>
            <input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Occupation</label>
            <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Purpose *</label>
          <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} required>
            {purposeOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Link to Existing Taxpayer (Optional)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={searchTaxpayer} onChange={(e) => setSearchTaxpayer(e.target.value)} placeholder="Search by name or ID..." style={{ flex: 1, height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }} />
            <button type="button" onClick={searchForTaxpayer} style={{ padding: '0 12px', borderRadius: 8, background: C.blue, color: 'white', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
          {taxpayers.length > 0 && (
            <select onChange={(e) => setForm(prev => ({ ...prev, taxpayer_id: e.target.value }))} style={{ width: '100%', marginTop: 8, height: 36, padding: '0 10px', border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <option value="">Select taxpayer</option>
              {taxpayers.map(t => <option key={t.id} value={t.id}>{t.full_name} - {t.email}</option>)}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: 8, background: C.teal, color: 'white', border: 'none', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : 'Check In'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function EmployeeVisitorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const limit = 20;

  const token = getAccessToken();
  const role = getUserRole();
  
  if (!token || (role !== 'employee' && role !== 'admin')) {
    return <Navigate to="/login?expired=true" replace />;
  }

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['visitors', search, statusFilter, purposeFilter, dateFilter, page],
    queryFn: async () => {
      let url = `/admin/visitors?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (purposeFilter) url += `&purpose=${purposeFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      const response = await request(url);
      return response as ApiResponse;
    },
  });

  const visitors: Visitor[] = data?.data?.visitors || [];
  const stats: VisitorStats = data?.data?.stats || {
    total_today: 0,
    completed: 0,
    pending: 0,
    active: 0,
    average_time_minutes: 0,
    revenue_today: 0,
  };

  const handleViewVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setDetailModalOpen(true);
  };

  const handleCheckOut = async (id: string, notes: string, followUpDate: string) => {
    try {
      await request(`/admin/visitors/${id}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ notes, follow_up_date: followUpDate }),
      });
      toast.success('Visitor checked out successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to check out visitor');
    }
  };

  const handleExport = () => {
    if (visitors.length === 0) {
      toast.error('No data to export');
      return;
    }
    const exportData = visitors.map((v: Visitor) => ({
      Name: v.full_name,
      Phone: v.phone,
      'National ID': v.national_id,
      Purpose: v.purpose,
      'Check In': new Date(v.check_in_time).toLocaleString(),
      'Check Out': v.check_out_time ? new Date(v.check_out_time).toLocaleString() : '—',
      Status: v.status,
      'Outstanding Amount': v.outstanding_amount || 0,
    }));
    downloadCSV(exportData, 'visitors.csv');
    toast.success('Export started');
  };

  const getStatusColor = (status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' => {
    switch (status) {
      case 'active': return 'blue';
      case 'completed': return 'green';
      case 'pending': return 'amber';
      default: return 'gray';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, marginBottom: 4 }}>Office Visitors</h1>
          <p style={{ fontSize: 13, color: C.faint }}>Manage walk-in visitors and track their activity</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: C.blue + '15', border: 'none', color: C.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={12} /> Export
          </button>
          <button onClick={() => setAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: C.teal, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <UserPlus size={12} /> Check In Visitor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        <KpiCard label="Today's Visitors" value={stats.total_today} color={C.teal} icon={Users} />
        <KpiCard label="Active Now" value={stats.active} color={C.blue} icon={UserCheck} />
        <KpiCard label="Completed" value={stats.completed} color={C.teal} icon={CheckCircle} />
        <KpiCard label="Avg Time" value={`${stats.average_time_minutes} min`} color={C.amber} icon={ClockIcon} />
        <KpiCard label="Revenue Today" value={`$${stats.revenue_today?.toLocaleString() || 0}`} color={C.purple} icon={DollarSign} />
      </div>

      {/* Filters */}
      <Card>
        <div style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 250 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or phone..." style={{ width: '100%', height: 36, padding: '0 12px 0 30px', border: `1px solid ${C.border}`, borderRadius: 8 }} />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ height: 36, padding: '0 12px', border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <select value={purposeFilter} onChange={(e) => { setPurposeFilter(e.target.value); setPage(1); }} style={{ height: 36, padding: '0 12px', border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <option value="">All Purposes</option>
            {purposeOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} style={{ height: 36, padding: '0 12px', border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <button onClick={() => refetch()} style={{ padding: '0 16px', height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </Card>

      {/* Visitors Table */}
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 600 }}>Visitors ({visitors.length})</span>
        </div>
        
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : isError ? (
          <div style={{ padding: 60, textAlign: 'center', color: C.red }}>Failed to load visitors. <button onClick={() => refetch()} style={{ color: C.teal, cursor: 'pointer' }}>Try again</button></div>
        ) : visitors.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: C.faint }}>
            <Users size={32} style={{ marginBottom: 12 }} />
            <p>No visitors found</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Click "Check In Visitor" to register a new visitor</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.5fr 1fr 80px', gap: 8, padding: '10px 18px', background: C.bgMuted, borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 600 }}>
              <span>Visitor Name</span><span>Phone</span><span>Check In Time</span><span>Purpose</span><span>Status</span><span>Actions</span>
            </div>
            {visitors.map((visitor: Visitor, i: number) => (
              <div key={visitor.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.5fr 1fr 80px', gap: 8, padding: '12px 18px', borderBottom: i < visitors.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13, alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{visitor.full_name}</span>
                  {visitor.national_id && <p style={{ fontSize: 10, color: C.faint }}>ID: {visitor.national_id}</p>}
                </div>
                <span>{visitor.phone}</span>
                <span style={{ fontSize: 12 }}>{new Date(visitor.check_in_time).toLocaleTimeString()}</span>
                <span>{visitor.purpose}</span>
                <Badge label={visitor.status} color={getStatusColor(visitor.status)} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleViewVisitor(visitor)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.teal }}><Eye size={14} /></button>
                  {visitor.status === 'active' && (
                    <button onClick={() => handleViewVisitor(visitor)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.blue }}><CheckSquare size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Modals */}
      <VisitorDetailModal visitor={selectedVisitor} isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedVisitor(null); }} onCheckOut={handleCheckOut} />
      <AddVisitorModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => refetch()} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}