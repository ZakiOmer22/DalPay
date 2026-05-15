// src/pages/admin/TaxpayerDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Mail, Phone, Shield, MapPin, FileText,
  CreditCard, CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown,
  Download, Share2, Briefcase, DollarSign, Home,
} from 'lucide-react';
import { adminApi, type TaxpayerDetail } from '@/services/api';
import toast from 'react-hot-toast';

// ─── Design tokens (matching dashboard) ────────────────────────────────
const C = {
  border: '#e5eae8',
  bg: '#ffffff',
  bgPage: '#f0f2f1',
  bgMuted: '#f7f9f8',
  text: '#111816',
  muted: '#7a918b',
  faint: '#a0b4ae',
  teal: '#0d9e75',
  tealBg: '#e8f7f2',
  tealText: '#0a7d5d',
  tealBorder: '#c3e8dc',
  amber: '#f59e0b',
  amberBg: '#fffbeb',
  amberText: '#92400e',
  amberBorder: '#fde68a',
  red: '#e53e3e',
  redBg: '#fff5f5',
  redText: '#c53030',
  redBorder: '#fed7d7',
  blue: '#3b82f6',
  blueBg: '#eff6ff',
  blueText: '#1d4ed8',
  purple: '#8b5cf6',
  purpleBg: '#f5f3ff',
  purpleText: '#5b21b6',
};

// ─── Reusable Components ────────────────────────────────────────────────

function Card({ children, style, ...rest }: { children: React.ReactNode; style?: React.CSSProperties;[key: string]: unknown }) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function SectionHead({
  title, sub, action, icon: Icon, iconColor,
}: {
  title: string; sub?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ElementType; iconColor?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: (iconColor ?? C.teal) + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={13} color={iconColor ?? C.teal} strokeWidth={2} />
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</p>
          {sub && <p style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action.onClick} style={{
          fontSize: 12, fontWeight: 600, color: C.teal,
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
        }}>
          {action.label} →
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
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
      background: map.bg, color: map.text, border: `1px solid ${map.border}`,
      whiteSpace: 'nowrap', textTransform: 'capitalize', display: 'inline-block',
    }}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

function Avi({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#0d9e75,#0a7d5d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.37, fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function KpiCard({ label, value, color, trend, trendUp, icon: Icon }: {
  label: string; value: string | number; color: string;
  trend?: string; trendUp?: boolean; icon: React.ElementType;
}) {
  return (
    <Card>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</span>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={color} strokeWidth={1.8} />
          </div>
        </div>
        <p style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-.03em' }}>{value}</p>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11 }}>
            {trendUp !== undefined && (trendUp ? <TrendingUp size={11} color={C.teal} /> : <TrendingDown size={11} color={C.red} />)}
            <span style={{ color: trendUp ? C.tealText : C.redText }}>{trend}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoBlock({
  icon: Icon, label, value, sub,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: C.teal + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} color={C.teal} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: C.faint, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</p>
        {sub && <p style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Modal Component ────────────────────────────────────────────────────
function Modal({
  isOpen, onClose, title, children, size = 'md'
}: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  if (!isOpen) return null;

  const widthMap = { sm: 400, md: 600, lg: 800 };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn .2s ease',
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Card style={{
        width: '90%', maxWidth: widthMap[size], maxHeight: '90vh', overflow: 'auto',
        animation: 'slideUp .3s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        <div style={{ padding: '18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: C.faint }}>
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </Card>
    </div>
  );
}

// ─── Assessment Detail Modal (FIXED) ────────────────────────────────────
function AssessmentDetailModal({
  isOpen, onClose, assessment,
}: {
  isOpen: boolean; onClose: () => void;
  assessment: Record<string, unknown> | null;
}) {
  if (!assessment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assessment Details" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Type</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{(assessment.tax_type as string)?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Year</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{assessment.year as string}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Amount</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>SOS {Number(assessment.amount).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Status</p>
            <Badge label={assessment.status as string} color={
              assessment.status === 'paid' ? 'green' :
                assessment.status === 'overdue' ? 'red' : 'amber'
            } />
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Due Date</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{assessment.due_date ? new Date(assessment.due_date as string).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Created</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{assessment.created_at ? new Date(assessment.created_at as string).toLocaleDateString() : '—'}</p>
          </div>
        </div>

        {(assessment.notes as string) && (
          <div style={{ padding: '12px', background: C.bgMuted, borderRadius: 8 }}>
            {assessment.notes as string}
          </div>
        )}

        <button onClick={onClose} style={{
          padding: '10px 16px', background: C.teal, color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
          fontFamily: 'inherit',
        }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

// ─── Payment Detail Modal (FIXED) ───────────────────────────────────────
function PaymentDetailModal({
  isOpen, onClose, payment,
}: {
  isOpen: boolean; onClose: () => void;
  payment: Record<string, unknown> | null;
}) {
  if (!payment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Provider</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{payment.provider as string}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Amount</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>SOS {Number(payment.amount).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Status</p>
            <Badge label={payment.status as string} color={payment.status === 'confirmed' ? 'green' : 'amber'} />
          </div>
          <div>
            <p style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Date</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{payment.created_at ? new Date(payment.created_at as string).toLocaleDateString() : '—'}</p>
          </div>
          {/* Fixed: cast the condition to string to avoid unknown ReactNode error */}
          {(payment.transaction_reference as string) && (
            <div style={{ gridColumn: '1 / -1' }}>
              {payment.transaction_reference as string}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          padding: '10px 16px', background: C.teal, color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
          fontFamily: 'inherit',
        }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Taxpayer Detail Page ──────────────────────────────────────────
export default function TaxpayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Record<string, unknown> | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Record<string, unknown> | null>(null);

  // ✅ Fetch the full taxpayer detail using the dedicated admin endpoint
  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery<TaxpayerDetail>({
    queryKey: ['taxpayer-detail', id],
    queryFn: async () => {
      const response = await adminApi.getTaxpayerDetail(id!);
      return response.data;
    },
    enabled: !!id,
  });

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading && !detail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid #e2e8f0`, borderTopColor: C.teal, animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 13, color: C.faint }}>Loading taxpayer details…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────
  if (isError || !detail) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.redText }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Taxpayer not found</p>
        <p style={{ fontSize: 12, marginBottom: 16 }}>
          The taxpayer with ID <strong>{id}</strong> could not be found.
        </p>
        <button onClick={() => navigate('/admin/taxpayers')} style={{
          padding: '8px 16px', background: C.teal, color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
          fontFamily: 'inherit',
        }}>
          Back to Taxpayers
        </button>
      </div>
    );
  }

  // ── Populate all local variables from the API response ────────────
  const user = {
    full_name: detail.user.full_name,
    email: detail.user.email,
    phone: detail.user.phone,
    national_id: detail.user.national_id,
    role: detail.user.role,
    email_verified: detail.user.email_verified,
    phone_verified: detail.user.phone_verified,
    created_at: detail.user.created_at,
  };

  const profile = {
    occupation: detail.profile?.occupation ?? '',
    monthly_income: detail.profile?.monthly_income ?? 0,
    property_value: detail.profile?.property_value ?? 0,
    region: detail.profile?.region ?? '',
    district: detail.profile?.district ?? '',
    business_name: detail.profile?.business_name,
    business_type: detail.profile?.business_type,
  };

  const taxSummary = detail.taxSummary;
  const assessments = detail.assessments;
  const payments = detail.payments;
  const documents = detail.documents;
  const disputes = detail.disputes;

  const formatCurrency = (val: number) => `SOS ${val.toLocaleString()}`;

  const handleViewAssessment = (a: Record<string, unknown>) => {
    setSelectedAssessment(a);
    setAssessmentModalOpen(true);
  };

  const handleViewPayment = (p: Record<string, unknown>) => {
    setSelectedPayment(p);
    setPaymentModalOpen(true);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-section { animation: fadeUp .4s ease both; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Breadcrumb & Actions */}
        <div className="dash-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/admin/taxpayers')} style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.teal,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          }}>
            <ArrowLeft size={14} /> Back to Taxpayers
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toast.success('Profile downloaded')} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8,
              background: C.blue + '15', border: `1px solid ${C.blue}30`, color: C.blue,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Download size={12} /> Download
            </button>
            <button onClick={() => toast.success('Share link copied')} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8,
              background: C.purple + '15', border: `1px solid ${C.purple}30`, color: C.purpleText,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>

        {/* User Header Card */}
        <Card className="dash-section">
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avi name={user.full_name} size={60} />
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>{user.full_name}</h1>
                <p style={{ fontSize: 13, color: C.faint, marginBottom: 8 }}>
                  {profile.occupation || 'Taxpayer'} • Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {user.email_verified && <Badge label="Email Verified" color="green" />}
                  {user.phone_verified && <Badge label="Phone Verified" color="green" />}
                  {!user.email_verified && <Badge label="Email Pending" color="amber" />}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge label={user.role} color="blue" />
            </div>
          </div>
        </Card>

        {/* Contact Info Grid */}
        <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <InfoBlock icon={Mail} label="Email Address" value={user.email} />
          <InfoBlock icon={Phone} label="Phone Number" value={user.phone} />
          <InfoBlock icon={Shield} label="National ID" value={user.national_id} />
          <InfoBlock icon={MapPin} label="Location" value={`${profile.region} / ${profile.district}`} />
        </div>

        {/* Tax Summary KPIs */}
        {taxSummary && (
          <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <KpiCard
              label="Total Due"
              value={formatCurrency(taxSummary.total_due)}
              color={C.red}
              trend={`${taxSummary.pending} outstanding`}
              trendUp={false}
              icon={FileText}
            />
            <KpiCard
              label="Total Paid"
              value={formatCurrency(taxSummary.total_paid)}
              color={C.teal}
              trend={`${assessments.filter((a: any) => a.status === 'paid').length} settled`}
              trendUp
              icon={CheckCircle}
            />
            <KpiCard
              label="Pending"
              value={taxSummary.pending}
              color={C.amber}
              icon={Clock}
            />
            <KpiCard
              label="Overdue"
              value={taxSummary.overdue}
              color={C.red}
              icon={AlertCircle}
            />
          </div>
        )}

        {/* Profile Details */}
        {profile && (
          <Card className="dash-section">
            <SectionHead title="Tax Profile Information" icon={Briefcase} />
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              <InfoBlock
                icon={Briefcase}
                label="Occupation"
                value={profile.occupation || '—'}
              />
              <InfoBlock
                icon={DollarSign}
                label="Monthly Income"
                value={formatCurrency(profile.monthly_income)}
              />
              <InfoBlock
                icon={Home}
                label="Property Value"
                value={formatCurrency(profile.property_value)}
              />
              <InfoBlock
                icon={MapPin}
                label="Region / District"
                value={`${profile.region} / ${profile.district}`}
              />
              {profile.business_name && (
                <InfoBlock
                  icon={Briefcase}
                  label="Business"
                  value={`${profile.business_name}${profile.business_type ? ` (${profile.business_type})` : ''}`}
                  sub={profile.business_type ?? undefined}
                />
              )}
            </div>
          </Card>
        )}

        {/* Assessments Table */}
        <Card className="dash-section">
          <SectionHead
            title="Tax Assessments"
            sub={`${assessments.length} assessments on record`}
            icon={FileText}
            action={assessments.length > 5 ? { label: 'View all', onClick: () => { } } : undefined}
          />
          <div>
            {assessments.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <FileText size={28} color={C.border} style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 13, color: C.faint }}>No assessments on record</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 80px', gap: 8,
                  padding: '10px 24px', borderBottom: `1px solid ${C.border}`, background: C.bgMuted,
                }}>
                  {['Type', 'Year', 'Amount', 'Status', 'Due Date'].map((h) => (
                    <span key={h} style={{
                      fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '.06em', textTransform: 'uppercase',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
                {assessments.slice(0, 6).map((a: any, i: number) => (
                  <div key={a.id} onClick={() => handleViewAssessment(a)} style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 80px', gap: 8,
                    padding: '12px 24px', borderBottom: i < Math.min(6, assessments.length) - 1 ? `1px solid ${C.border}` : 'none',
                    cursor: 'pointer', transition: 'background .1s', alignItems: 'center',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{a.tax_type?.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.year}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{formatCurrency(a.amount)}</span>
                    <Badge label={a.status} color={
                      a.status === 'paid' ? 'green' :
                        a.status === 'overdue' ? 'red' : 'amber'
                    } />
                    <span style={{ fontSize: 11, color: C.faint }}>{new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="dash-section">
          <SectionHead
            title="Payment History"
            sub={`${payments.length} payments recorded`}
            icon={CreditCard}
            action={payments.length > 5 ? { label: 'View all', onClick: () => { } } : undefined}
          />
          <div>
            {payments.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <CreditCard size={28} color={C.border} style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 13, color: C.faint }}>No payments recorded</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 80px', gap: 8,
                  padding: '10px 24px', borderBottom: `1px solid ${C.border}`, background: C.bgMuted,
                }}>
                  {['Provider', 'Amount', 'Status', 'Date'].map((h) => (
                    <span key={h} style={{
                      fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '.06em', textTransform: 'uppercase',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
                {payments.slice(0, 6).map((p: any, i: number) => (
                  <div key={p.id} onClick={() => handleViewPayment(p)} style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 80px', gap: 8,
                    padding: '12px 24px', borderBottom: i < Math.min(6, payments.length) - 1 ? `1px solid ${C.border}` : 'none',
                    cursor: 'pointer', transition: 'background .1s', alignItems: 'center',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{p.provider}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{formatCurrency(p.amount)}</span>
                    <Badge label={p.status} color={p.status === 'confirmed' ? 'green' : 'amber'} />
                    <span style={{ fontSize: 11, color: C.faint }}>{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Documents & Disputes */}
        <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card>
            <SectionHead title="Documents" icon={FileText} sub={`${documents.length} on file`} />
            <div style={{ padding: '16px 24px' }}>
              {documents.length === 0 ? (
                <p style={{ color: C.faint, fontSize: 13, margin: 0 }}>No documents</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map((d: any) => (
                    <div key={d.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', background: C.bgMuted, borderRadius: 6,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{d.document_type}</span>
                      <Badge label={d.verified ? 'verified' : 'pending'} color={d.verified ? 'green' : 'amber'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHead title="Disputes" icon={AlertCircle} sub={`${disputes.length} on record`} />
            <div style={{ padding: '16px 24px' }}>
              {disputes.length === 0 ? (
                <p style={{ color: C.faint, fontSize: 13, margin: 0 }}>No disputes</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {disputes.map((d: any) => (
                    <div key={d.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '8px 12px', background: C.bgMuted, borderRadius: 6, gap: 8,
                    }}>
                      <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{d.reason}</span>
                      <Badge label={d.status} color={
                        d.status === 'approved' ? 'green' :
                          d.status === 'rejected' ? 'red' : 'amber'
                      } />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AssessmentDetailModal
        isOpen={assessmentModalOpen}
        onClose={() => { setAssessmentModalOpen(false); setSelectedAssessment(null); }}
        assessment={selectedAssessment}
      />
      <PaymentDetailModal
        isOpen={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setSelectedPayment(null); }}
        payment={selectedPayment}
      />
    </>
  );
}