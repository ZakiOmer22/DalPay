// src/pages/taxpayer/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Bell, Shield, Save, Eye, EyeOff, Lock, Globe,
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

function SectionHead({ title, sub, icon: Icon }: { title: string; sub?: string; icon?: React.ElementType }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={16} color={C.teal} />}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</p>
        {sub && <p style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "", phone: "" });

  // Password form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");

  // Preferences (saved to localStorage)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("dalpay_preferences");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { emailNotifications: true, smsNotifications: false, darkMode: false, language: "en" };
  });

  // Fetch profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => request("/auth/profile"),
  });

  useEffect(() => {
    const user = (profileData as any)?.data?.user;
    if (user) {
      setProfileForm({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [profileData]);

  // Update profile (try two endpoints)
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Attempting to update profile with:", data);
      try {
        // First try PUT /auth/profile
        return await request("/auth/profile", { method: "PUT", body: JSON.stringify(data) });
      } catch (err: any) {
        console.warn("PUT /auth/profile failed, trying /user/profile", err);
        return await request("/user/profile", { method: "PUT", body: JSON.stringify(data) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update profile (endpoint missing?)"),
  });

  // Change password
  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => request("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
      toast.success("Password changed successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to change password (endpoint missing?)"),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      full_name: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  // ✅ Fix TypeScript error: explicitly cast key to string
  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    const keyStr = String(key); // ensures string
    const newPrefs = { ...preferences, [keyStr]: value };
    setPreferences(newPrefs);
    localStorage.setItem("dalpay_preferences", JSON.stringify(newPrefs));
    toast.success(`${keyStr} updated`);
    if (keyStr === "darkMode") {
      if (value) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  const handleLogoutOthers = async () => {
    if (!confirm("Log out from all other devices?")) return;
    try {
      await request("/auth/logout-all", { method: "POST" });
      toast.success("Logged out from other devices");
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error("This feature is not available. Contact support.");
    }
  };

  if (profileLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Manage your account preferences and security</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "security", label: "Security", icon: Shield },
          { id: "preferences", label: "Preferences", icon: Bell },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px",
              background: activeTab === tab.id ? C.tealBg : "transparent",
              color: activeTab === tab.id ? C.tealText : C.muted,
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${C.teal}` : "2px solid transparent",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: 13,
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <SectionHead title="Personal Information" sub="Update your basic details" icon={User} />
          <form onSubmit={handleProfileSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: updateProfileMutation.isPending ? 0.7 : 1 }}
              >
                <Save size={14} /> {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <>
          <Card>
            <SectionHead title="Change Password" sub="Update your login credentials" icon={Lock} />
            <form onSubmit={handlePasswordSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {passwordError && <div style={{ padding: 8, background: C.redBg, borderRadius: 8, color: C.redText, fontSize: 12 }}>{passwordError}</div>}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.teal, color: "white", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: changePasswordMutation.isPending ? 0.7 : 1 }}
                >
                  <Lock size={14} /> {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <SectionHead title="Active Sessions" sub="Manage your logged-in devices" icon={Globe} />
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Current Session</p>
                  <p style={{ fontSize: 11, color: C.muted }}>This device • {new Date().toLocaleString()}</p>
                </div>
                <span style={{ fontSize: 11, color: C.teal }}>Active</span>
              </div>
              <button onClick={handleLogoutOthers} style={{ width: "100%", padding: "8px", border: `1px solid ${C.redBorder}`, borderRadius: 8, background: C.redBg, color: C.redText, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Log out from other devices</button>
            </div>
          </Card>
        </>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <Card>
          <SectionHead title="Notification Preferences" sub="Choose how you receive updates" icon={Bell} />
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <div><p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Email Notifications</p><p style={{ fontSize: 11, color: C.muted }}>Receive payment confirmations and reminders via email</p></div>
              <button onClick={() => handlePreferenceChange("emailNotifications", !preferences.emailNotifications)} style={{ width: 44, height: 24, borderRadius: 12, background: preferences.emailNotifications ? C.teal : C.border, border: "none", cursor: "pointer", position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: preferences.emailNotifications ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <div><p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>SMS Notifications</p><p style={{ fontSize: 11, color: C.muted }}>Receive payment confirmations via SMS (charges may apply)</p></div>
              <button onClick={() => handlePreferenceChange("smsNotifications", !preferences.smsNotifications)} style={{ width: 44, height: 24, borderRadius: 12, background: preferences.smsNotifications ? C.teal : C.border, border: "none", cursor: "pointer", position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: preferences.smsNotifications ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <div><p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Dark Mode</p><p style={{ fontSize: 11, color: C.muted }}>Switch between light and dark theme</p></div>
              <button onClick={() => handlePreferenceChange("darkMode", !preferences.darkMode)} style={{ width: 44, height: 24, borderRadius: 12, background: preferences.darkMode ? C.teal : C.border, border: "none", cursor: "pointer", position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: preferences.darkMode ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Language</p><p style={{ fontSize: 11, color: C.muted }}>Select your preferred language</p></div>
              <select value={preferences.language} onChange={(e) => handlePreferenceChange("language", e.target.value)} style={{ padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: C.bg, cursor: "pointer" }}>
                <option value="en">English</option>
                <option value="so">Soomaali</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}