import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, ChevronDown, Smartphone, LogOut, Sun, Moon,
} from "lucide-react";
import { clearTokens } from "@/services/api";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const NAV_LINKS = [
  {
    title: "Services",
    links: [
      { label: "Pay Tax", href: "/pay" },
      { label: "Check Balance", href: "/balance" },
      { label: "Tax Calculator", href: "/calculator" },
      { label: "Payment History", href: "/history" },
    ],
  },
  {
    title: "Tax Types",
    links: [
      { label: "Income Tax", href: "/tax-types/income" },
      { label: "Business Tax", href: "/tax-types/business" },
      { label: "Property Tax", href: "/tax-types/property" },
      { label: "Consumption Tax", href: "/tax-types/consumption" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How to Pay", href: "/resources/how-to-pay" },
      { label: "FAQ", href: "/faq" },
      { label: "Tax Rates", href: "/resources/tax-rates" },
      { label: "Download Forms", href: "/resources/forms" },
    ],
  },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopIndex, setOpenDesktopIndex] = useState<number | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<number | null>(null);

  const [dark, setDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });

  const [user, setUser] = useState<{ fullName: string; role: string } | null>(() => {
    try {
      const raw = localStorage.getItem("dalpay_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDesktopIndex(null);
    setOpenMobileSubmenu(null);
    try {
      const raw = localStorage.getItem("dalpay_user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  const handleMouseEnter = (idx: number) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDesktopIndex(idx);
  };
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setOpenDesktopIndex(null), 200);
  };

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("dalpay_user");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          "bg-white dark:bg-gray-900",
          "border-b border-gray-200 dark:border-gray-700/60",
          scrolled && "shadow-lg shadow-black/5 dark:shadow-black/20"
        )}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="shrink-0 flex items-center">
              <img
                src="/icon.png"
                alt="DalPay"
                className="h-14 md:h-16 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = "flex";
                }}
              />
              <span className="hidden items-center gap-1 text-2xl font-extrabold" style={{ display: "none" }}>
                <span className="text-[#0F7B8C]">Dal</span>
                <span className="text-gray-900 dark:text-white">Pay</span>
              </span>
            </Link>

            <ul className="hidden lg:flex items-center gap-0.5 font-medium">
              {NAV_LINKS.map((item, idx) => (
                <li
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      "text-gray-600 dark:text-gray-300",
                      "hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC]",
                      "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {item.title}
                    <ChevronDown size={13} className={cn("transition-transform duration-200", openDesktopIndex === idx && "rotate-180")} />
                  </button>
                  {openDesktopIndex === idx && (
                    <div className="absolute left-0 top-full mt-2 w-52 z-50 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5">
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] hover:bg-gray-50 dark:hover:bg-gray-700/60"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <Link to="/about" className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/ussd" className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  USSD Simulator
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-2">
              <Link
                to="/mobile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#0F7B8C]/30 text-[#0F7B8C] dark:text-[#3BA7BC] hover:border-[#0F7B8C] hover:bg-[#0F7B8C]/5"
              >
                <Smartphone size={13} />
                App
              </Link>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="hidden sm:flex items-center gap-2.5 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F7B8C] to-[#3BA7BC] flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 bg-[#0F7B8C] hover:bg-[#0A5D6B] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                    Register
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <img src="/icon.png" alt="DalPay" className="h-10 w-auto" />
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{dark ? "Dark Mode" : "Light Mode"}</span>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F7B8C] to-[#3BA7BC] flex items-center justify-center text-sm font-bold text-white shrink-0">
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <div className="space-y-1 pt-1">
            {NAV_LINKS.map((item, idx) => (
              <div key={item.title}>
                <button
                  onClick={() => setOpenMobileSubmenu(openMobileSubmenu === idx ? null : idx)}
                  className="flex items-center justify-between w-full px-2 py-3 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {item.title}
                  <ChevronDown size={15} className={cn("transition-transform duration-200 text-gray-400", openMobileSubmenu === idx && "rotate-180")} />
                </button>
                {openMobileSubmenu === idx && (
                  <div className="ml-3 pl-3 border-l-2 border-[#0F7B8C]/30 space-y-0.5 mb-1">
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#0F7B8C] dark:hover:text-[#3BA7BC] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block px-2 py-3 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block px-2 py-3 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Contact
            </Link>
          </div>

          {!user && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-sm font-semibold text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-sm font-bold text-white bg-[#0F7B8C] hover:bg-[#0A5D6B] rounded-xl transition-colors shadow-sm">
                Register Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}