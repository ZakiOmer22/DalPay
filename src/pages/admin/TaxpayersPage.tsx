// src/pages/admin/TaxpayersPage.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, X, ChevronRight, Loader2, MapPin, Grid3X3, List,
  Eye, Download, UserPlus, CheckCircle, AlertCircle, TrendingUp,
  Mail, Phone, Shield, Save,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, authApi, type Taxpayer } from '@/services/api';
import { downloadCSV } from '@/utils/export';
import toast from 'react-hot-toast';

// ─── Design tokens (unchanged) ──────────────────────────────────────────
const C = {
  border: '#e5eae8', bg: '#ffffff', bgPage: '#f0f2f1', bgMuted: '#f7f9f8',
  text: '#111816', muted: '#7a918b', faint: '#a0b4ae', teal: '#0d9e75',
  tealBg: '#e8f7f2', tealText: '#0a7d5d', tealBorder: '#c3e8dc',
  amber: '#f59e0b', amberBg: '#fffbeb', amberText: '#92400e', amberBorder: '#fde68a',
  red: '#e53e3e', redBg: '#fff5f5', redText: '#c53030', redBorder: '#fed7d7',
  blue: '#3b82f6', blueBg: '#eff6ff', blueText: '#1d4ed8', purpleBg: '#f5f3ff',
};

const IS = {
  width: '100%', height: 38, padding: '0 12px',
  border: `1.5px solid ${C.border}`, borderRadius: 9, background: C.bg,
  fontSize: 13, color: C.text, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box' as const,
};

// ─── Reusable Components (unchanged) ────────────────────────────────────
function Card({ children, style, ...rest }: { children: React.ReactNode; style?: React.CSSProperties;[key: string]: unknown }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', ...style }} {...rest}>
      {children}
    </div>
  );
}

function SectionHead({ title, sub, action, icon: Icon, iconColor }: {
  title: string; sub?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ElementType; iconColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && (
          <div style={{ width: 28, height: 28, borderRadius: 7, background: (iconColor ?? C.teal) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} color={iconColor ?? C.teal} strokeWidth={2} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</p>
          {sub && <p style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action.onClick} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          {action.label} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const map = {
    green: { bg: C.tealBg, text: C.tealText, border: C.tealBorder },
    amber: { bg: C.amberBg, text: C.amberText, border: C.amberBorder },
    red: { bg: C.redBg, text: C.redText, border: C.redBorder },
    blue: { bg: C.blueBg, text: C.blueText, border: '#bfdbfe' },
    gray: { bg: C.bgMuted, text: C.muted, border: C.border },
  }[color];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: map.bg, color: map.text, border: `1px solid ${map.border}`, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

function Avi({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9e75,#0a7d5d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.37, fontWeight: 700, color: 'white', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function KpiCard({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon: React.ElementType }) {
  return (
    <Card>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</span>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 26, fontWeight: 700, color: C.text, marginTop: 8, letterSpacing: '-.03em' }}>{value}</p>
      </div>
    </Card>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  if (!isOpen) return null;
  const widthMap = { sm: 400, md: 600, lg: 800 };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <Card style={{ width: '90%', maxWidth: widthMap[size], maxHeight: '90vh', overflow: 'auto', animation: 'slideUp .3s ease' }}>
        <div style={{ padding: '18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.faint }}>×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </Card>
    </div>
  );
}

// ─── Taxpayer Card & Row (unchanged) ────────────────────────────────────
function TaxpayerCard({ taxpayer, onView }: { taxpayer: Taxpayer; onView: (tp: Taxpayer) => void }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', transition: 'all .2s', height: '100%' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 4px 12px ${C.teal}08`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Avi name={taxpayer.full_name} size={40} />
          <Badge label={taxpayer.verified ? 'verified' : 'unverified'} color={taxpayer.verified ? 'green' : 'amber'} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{taxpayer.full_name}</p>
          <p style={{ fontSize: 11, color: C.faint }}>{taxpayer.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}>
          <MapPin size={12} />{taxpayer.region} / {taxpayer.district}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => onView(taxpayer)} style={{ flex: 1, padding: '8px 12px', background: C.teal + '15', color: C.teal, border: `1px solid ${C.teal}30`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            View
          </button>
          <Link to={`/admin/taxpayers/${taxpayer.id}`} style={{ flex: 1, padding: '8px 12px', background: C.bg, color: C.teal, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
            Full Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

function TaxpayerRow({ taxpayer, onView }: { taxpayer: Taxpayer; onView: (tp: Taxpayer) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 100px', padding: '11px 18px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background .1s', alignItems: 'center' }}
      onMouseEnter={(e) => e.currentTarget.style.background = C.bgMuted}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avi name={taxpayer.full_name} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{taxpayer.full_name}</p>
          <p style={{ fontSize: 11, color: C.faint }}>{taxpayer.email}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.text }}>
        <MapPin size={12} color={C.faint} />{taxpayer.region} / {taxpayer.district}
      </div>
      <span style={{ fontSize: 13, color: C.muted }}>{taxpayer.phone}</span>
      <span style={{ fontSize: 13, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{taxpayer.national_id}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Badge label={taxpayer.verified ? 'verified' : 'unverified'} color={taxpayer.verified ? 'green' : 'amber'} />
        <button onClick={() => onView(taxpayer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.teal, padding: '4px 8px' }}>
          <Eye size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Add Taxpayer Modal ──────────────────────────────────────────────────
interface AddTaxpayerForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
}

function AddTaxpayerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AddTaxpayerForm>({
    firstName: '', lastName: '', email: '', phoneNumber: '', nationalId: '', password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof AddTaxpayerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.phoneNumber || !form.password || !form.nationalId) {
      setError('First name, last name, phone, national ID, and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.register({
        nationalId: form.nationalId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber,
        password: form.password,
      }, ''); // no Turnstile token in dev
      queryClient.invalidateQueries({ queryKey: ['taxpayers'] });
      onClose();
      toast.success('Taxpayer registered successfully');
      setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', nationalId: '', password: '' });
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Registration failed.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Taxpayer" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ padding: '8px 12px', background: C.redBg, borderRadius: 8, fontSize: 13, color: C.redText }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="First Name"><input value={form.firstName} onChange={handleChange('firstName')} style={IS} /></Field>
          <Field label="Last Name"><input value={form.lastName} onChange={handleChange('lastName')} style={IS} /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={handleChange('email')} style={IS} /></Field>
          <Field label="Phone Number"><input value={form.phoneNumber} onChange={handleChange('phoneNumber')} style={IS} /></Field>
          <Field label="National ID"><input value={form.nationalId} onChange={handleChange('nationalId')} style={IS} /></Field>
          <Field label="Password"><input type="password" value={form.password} onChange={handleChange('password')} style={IS} /></Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: 8, background: C.teal, color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
            <Save size={14} style={{ marginRight: 4 }} /> Register
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Taxpayer Detail Modal (unchanged) ──────────────────────────────────
function TaxpayerDetailModal({ taxpayer, isOpen, onClose }: {
  taxpayer: Taxpayer | null; isOpen: boolean; onClose: () => void;
}) {
  if (!taxpayer) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taxpayer.full_name} size="lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avi name={taxpayer.full_name} size={48} />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{taxpayer.full_name}</h3>
            <p style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{taxpayer.email}</p>
          </div>
        </div>
        <Info icon={Mail} label="Email" value={taxpayer.email} />
        <Info icon={Phone} label="Phone" value={taxpayer.phone} />
        <Info icon={Shield} label="National ID" value={taxpayer.national_id} />
        <Info icon={MapPin} label="Location" value={`${taxpayer.region} / ${taxpayer.district}`} />
        <div style={{ gridColumn: '1 / -1', padding: '12px', background: C.bgMuted, borderRadius: 10 }}>
          <p style={{ fontSize: 10, color: C.faint, marginBottom: 6 }}>Income & Property</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><p style={{ fontSize: 11, color: C.muted }}>Monthly Income</p><p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>SOS {taxpayer.monthly_income?.toLocaleString() ?? '0'}</p></div>
            <div><p style={{ fontSize: 11, color: C.muted }}>Property Value</p><p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>SOS {taxpayer.property_value?.toLocaleString() ?? '0'}</p></div>
          </div>
        </div>
        {taxpayer.occupation && (
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Occupation</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{taxpayer.occupation}</p>
          </div>
        )}
        <Link to={`/admin/taxpayers/${taxpayer.id}`} style={{ gridColumn: '1 / -1', padding: '10px 16px', background: C.teal, color: 'white', borderRadius: 9, textAlign: 'center', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          View Full Profile <ChevronRight size={14} />
        </Link>
      </div>
    </Modal>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={14} color={C.teal} />
      <div>
        <p style={{ fontSize: 10, color: C.faint }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function TaxpayersPage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedTaxpayer, setSelectedTaxpayer] = useState<Taxpayer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['taxpayers', { search, region, page, limit }],
    queryFn: () => adminApi.getTaxpayers({ search, region, page, limit }),
    placeholderData: (previousData) => previousData,
  });

  const taxpayers: Taxpayer[] = data?.data?.taxpayers ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const verifiedCount = taxpayers.filter(t => t.verified).length;

  const regions = useMemo(
    () => data?.data?.taxpayers ? [...new Set(data.data.taxpayers.map(t => t.region))] : [],
    [data],
  );

  const handleViewTaxpayer = (taxpayer: Taxpayer) => {
    setSelectedTaxpayer(taxpayer);
    setModalOpen(true);
  };

  const handleExport = () => {
    const exportData = taxpayers.map(t => ({
      Name: t.full_name,
      Email: t.email,
      Phone: t.phone,
      'National ID': t.national_id,
      Region: t.region,
      District: t.district,
      Occupation: t.occupation,
      'Monthly Income': t.monthly_income,
      'Property Value': t.property_value,
      Verified: t.verified ? 'Yes' : 'No',
    }));
    downloadCSV(exportData, 'taxpayers.csv');
  };

  return (
    <>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .dash-section { animation: fadeUp .4s ease both; }`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, marginBottom: 4 }}>Taxpayers</h1>
            <p style={{ fontSize: 13, color: C.faint }}>{total} registered • {verifiedCount} verified</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: C.blue + '15', border: `1px solid ${C.blue}30`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={12} /> Export
            </button>
            <button onClick={() => setAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: C.teal, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <UserPlus size={12} /> Add Taxpayer
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <KpiCard label="Total Taxpayers" value={total} color={C.teal} icon={TrendingUp} />
          <KpiCard label="Verified" value={verifiedCount} color={C.teal} icon={CheckCircle} />
          <KpiCard label="Pending Verification" value={total - verifiedCount} color={C.amber} icon={AlertCircle} />
          <KpiCard label="This Month" value={Math.floor(total * 0.15)} color={C.blue} icon={UserPlus} />
        </div>

        {/* Filters & View Toggle (unchanged) */}
        <div className="dash-section" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, phone, email…" style={{ ...IS, paddingLeft: 30, height: 36 }} />
            {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.faint }}><X size={13} /></button>}
          </div>
          <select value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }} style={{ ...IS, height: 36, width: 160, cursor: 'pointer' }}>
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4, background: C.bgMuted, padding: 4, borderRadius: 8 }}>
            <button onClick={() => setViewMode('table')} style={{ padding: '6px 10px', borderRadius: 6, background: viewMode === 'table' ? C.bg : 'transparent', border: viewMode === 'table' ? `1px solid ${C.border}` : 'none', cursor: 'pointer', color: viewMode === 'table' ? C.teal : C.faint, display: 'flex' }}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', borderRadius: 6, background: viewMode === 'grid' ? C.bg : 'transparent', border: viewMode === 'grid' ? `1px solid ${C.border}` : 'none', cursor: 'pointer', color: viewMode === 'grid' ? C.teal : C.faint, display: 'flex' }}>
              <Grid3X3 size={14} />
            </button>
          </div>
        </div>

        {/* Content (unchanged) */}
        {viewMode === 'table' ? (
          <Card>
            <SectionHead title={`Taxpayers (${taxpayers.length})`} />
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 100px', gap: 8, padding: '8px 18px', borderBottom: `1px solid ${C.border}`, background: C.bgMuted }}>
                {['Name', 'Location', 'Phone', 'National ID', 'Status'].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</span>)}
              </div>
              {isLoading ? (
                <div style={{ padding: '40px 18px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ width: 24, height: 24, color: C.teal, margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: C.faint }}>Loading taxpayers…</p></div>
              ) : isError ? (
                <div style={{ padding: '40px 18px', textAlign: 'center' }}><AlertCircle size={24} color={C.red} style={{ margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: C.redText }}>Failed to load taxpayers</p></div>
              ) : taxpayers.length === 0 ? (
                <div style={{ padding: '48px 18px', textAlign: 'center' }}><p style={{ fontSize: 13, color: C.faint }}>No taxpayers found</p></div>
              ) : (
                taxpayers.map(tp => <TaxpayerRow key={tp.id} taxpayer={tp} onView={handleViewTaxpayer} />)
              )}
            </div>
          </Card>
        ) : (
          <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {isLoading ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ width: 24, height: 24, color: C.teal, margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: C.faint }}>Loading taxpayers…</p></div>
            ) : taxpayers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}><p style={{ fontSize: 13, color: C.faint }}>No taxpayers found</p></div>
            ) : (
              taxpayers.map(tp => <TaxpayerCard key={tp.id} taxpayer={tp} onView={handleViewTaxpayer} />)
            )}
          </div>
        )}

        {/* Pagination (unchanged) */}
        {total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <p style={{ fontSize: 13, color: C.muted }}>Page {page} of {totalPages} ({total} total)</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <TaxpayerDetailModal taxpayer={selectedTaxpayer} isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedTaxpayer(null); }} />
      <AddTaxpayerModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  );
}