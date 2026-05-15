// web/src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, ShieldCheck, ArrowLeft,
  Edit, Key, LogOut, BadgeCheck, Calendar, Building, Activity, Check, X,
  Save, XCircle, Eye, EyeOff,
} from 'lucide-react';
import { authApi } from '@/api/auth';
import { getAccessToken, clearTokens } from '@/api/client';

interface ProfileData {
  id: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  memberSince: string;
  region: string | null;
  district: string | null;
  occupation: string | null;
}

export default function ProfilePage() {
  const accessToken = getAccessToken();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(!!accessToken);
  const [error, setError] = useState('');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Edit form state
  const [editOccupation, setEditOccupation] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editDistrict, setEditDistrict] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch profile – only runs when we have a token
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getProfile();
        if (!cancelled) {
          setProfile(res.data.user);
          setError('');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load profile';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [accessToken]);

  // Open edit modal and pre‑fill
  const handleEditClick = () => {
    if (profile) {
      setEditOccupation(profile.occupation || '');
      setEditRegion(profile.region || '');
      setEditDistrict(profile.district || '');
      setShowEditModal(true);
    }
  };

  // Simulate save (optimistic UI – backend not yet implemented)
  const handleEditSave = () => {
    if (profile) {
      setProfile({
        ...profile,
        occupation: editOccupation || null,
        region: editRegion || null,
        district: editDistrict || null,
      });
    }
    setShowEditModal(false);
  };

  // Simulate password change (no backend yet)
  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      alert('Please fill all fields correctly.');
      return;
    }
    alert('Password change is not yet connected to the backend.');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Not authenticated
  if (!accessToken) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0E1A] px-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
          <Link to="/login" className="mt-4 inline-block text-[#0F7B8C] font-semibold">
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0E1A] px-6">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#0F7B8C] rounded-full" />
          Loading profile…
        </div>
      </section>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0E1A] px-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Profile unavailable'}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-[#0F7B8C] font-semibold">
            Retry
          </button>
        </div>
      </section>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const memberDate = new Date(profile.memberSince).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="min-h-screen bg-white dark:bg-[#0A0E1A] pb-20">
      {/* Cover + Header */}
      <div className="relative bg-gradient-to-br from-[#0A5D6B] via-[#0F7B8C] to-[#3BA7BC] dark:from-[#091E2E] dark:via-[#0A2E3F] dark:to-[#0F7B8C]">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
        <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-black text-white">{initials}</span>
              {profile.role === 'admin' && (
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                  <BadgeCheck size={20} className="text-gray-900" />
                </span>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{profile.fullName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm capitalize">{profile.role}</span>
                {profile.role === 'admin' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/90 text-gray-900 flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Activity, label: 'Status', value: 'Active', color: 'bg-green-400/20 text-green-200' },
              { icon: Calendar, label: 'Member since', value: memberDate, color: 'bg-white/20' },
              { icon: Mail, label: 'Email verified', value: profile.emailVerified ? 'Yes' : 'No', color: 'bg-white/20' },
              { icon: Phone, label: 'Phone verified', value: profile.phoneVerified ? 'Yes' : 'No', color: 'bg-white/20' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <div key={i} className={`p-4 rounded-2xl ${color} backdrop-blur-sm border border-white/10`}>
                <Icon size={18} className="text-white/70 mb-2" />
                <p className="text-white/60 text-xs uppercase tracking-wider">{label}</p>
                <p className="text-white font-semibold text-sm mt-1 flex items-center gap-1">
                  {value}
                  {(label === 'Email verified' || label === 'Phone verified') && (
                    value === 'Yes' ? <Check size={14} className="text-green-300" /> : <X size={14} className="text-red-300" />
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mt-5 mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-8">
        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0F7B8C]/10">
              <Building size={20} className="text-[#0F7B8C]" />
            </div>
            Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
              <MapPin size={20} className="text-[#0F7B8C]" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {profile.region && profile.district ? `${profile.region}, ${profile.district}` : 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
              <User size={20} className="text-[#0F7B8C]" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Occupation</p>
                <p className="font-medium text-gray-900 dark:text-white">{profile.occupation || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
              <Calendar size={20} className="text-[#0F7B8C]" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Joined</p>
                <p className="font-medium text-gray-900 dark:text-white">{memberDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0F7B8C]/10">
              <ShieldCheck size={20} className="text-[#0F7B8C]" />
            </div>
            Security & Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleEditClick} className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all">
              <Edit size={18} className="group-hover:rotate-12 transition-transform" /> Edit Profile
            </button>
            <button onClick={() => setShowPasswordModal(true)} className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <Key size={18} /> Change Password
            </button>
            <button
              onClick={() => { clearTokens(); window.location.href = '/login'; }}
              className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111627] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Occupation</label>
                <input value={editOccupation} onChange={e => setEditOccupation(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Region</label>
                <input value={editRegion} onChange={e => setEditRegion(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">District</label>
                <input value={editDistrict} onChange={e => setEditDistrict(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                <XCircle size={18} /> Cancel
              </button>
              <button onClick={handleEditSave} className="flex items-center gap-2 px-4 py-2 bg-[#0F7B8C] text-white rounded-xl hover:bg-[#3BA7BC]">
                <Save size={18} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111627] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />} {showPassword ? 'Hide' : 'Show'} passwords
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                <XCircle size={18} /> Cancel
              </button>
              <button onClick={handlePasswordChange} className="flex items-center gap-2 px-4 py-2 bg-[#0F7B8C] text-white rounded-xl hover:bg-[#3BA7BC]">
                <Key size={18} /> Change
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}