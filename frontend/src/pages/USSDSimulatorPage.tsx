/* ─── src/pages/USSDSimulatorPage.tsx ─── */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Star, ChevronRight,
  Lock, Server, Cpu, MonitorSmartphone, Hash, Send, XCircle, Phone,
  X, Check, Activity,
} from "lucide-react";

/* ─────────────────────────────────────────────
   1. Hero Section
   ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3BA7BC] rounded-full mix-blend-soft-light opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#10B981] rounded-full mix-blend-soft-light opacity-20 translate-x-1/3 translate-y-1/3 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3BA7BC]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold hover:bg-white/15 transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
            </span>
            Live USSD simulation – Experience mobile tax payments
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-center text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tight">
          USSD
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#3BA7BC] to-[#10B981] animate-pulse">
            Simulator
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-center text-lg md:text-2xl text-white/85 max-w-3xl mx-auto mb-12 leading-relaxed">
          Type a USSD code, navigate menus, and see how DalPay processes tax payments through simple text-based commands—no internet required.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#simulator"
            className="group bg-white text-[#0F7B8C] hover:bg-gray-50 font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Try the Simulator
            <MonitorSmartphone size={22} />
          </a>
          <Link
            to="/register"
            className="group border-2 border-white/80 text-white hover:bg-white/10 hover:border-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
          >
            <Smartphone size={22} /> Get the Real App
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: "*888#", label: "DalPay Code", icon: Hash },
            { value: "3 min", label: "Avg Session", icon: Clock },
            { value: "All Networks", label: "Zaad, eDahab, Nomad", icon: Globe },
            { value: "100%", label: "Free to Use", icon: BadgeCheck },
          ].map((stat, i) => (
            <div
              key={i}
              className="group p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <stat.icon size={24} className="mx-auto mb-3 text-[#10B981]" />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. Trust Badges
   ──────────────────────────────────────────── */
function TrustBadges() {
  return (
    <section className="py-14 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 items-center">
        {[
          { icon: ShieldCheck, label: "PCI-DSS Certified" },
          { icon: Zap, label: "ISO 27001" },
          { icon: Globe, label: "Government Approved" },
          { icon: Smartphone, label: "All Mobile Networks" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C] dark:hover:border-[#3BA7BC] transition-colors duration-300"
          >
            <Icon className="text-[#0F7B8C] dark:text-[#3BA7BC]" size={20} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. USSD Simulator
   ──────────────────────────────────────────── */
function USSDSimulator() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shortCode, setShortCode] = useState("*888#");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<{ text: string; from: "user" | "system" }[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const normalisePhone = (num: string) => {
    const trimmed = num.trim();
    if (trimmed.startsWith("252")) return "+" + trimmed;
    return trimmed;
  };

  const isValidShortCode = (code: string) => {
    return code.startsWith("*") && code.endsWith("#") && code.length >= 3;
  };

  const sendUSSD = async (text: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/v1/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: normalisePhone(phoneNumber),
          text,
          sessionId: sessionId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const resp = data.data;
        setSessionId(resp.sessionId);
        setMessages((prev) => [...prev, { text: resp.response, from: "system" }]);

        if (
          !resp.end &&
          resp.response.toLowerCase().includes("phone") &&
          resp.response.toLowerCase().includes("enter")
        ) {
          setTimeout(() => {
            const pn = normalisePhone(phoneNumber);
            setMessages((prev) => [...prev, { text: pn, from: "user" }]);
            sendUSSD(pn);
          }, 1200);
          setIsProcessing(false);
          return;
        }

        if (resp.response.includes("Enter your") && resp.response.includes("PIN")) {
          setShowPinModal(true);
        }

        if (resp.end) {
          setSessionEnded(true);
          setIsConnected(false);
        }
      } else {
        setMessages((prev) => [...prev, { text: data.message || "USSD error", from: "system" }]);
        setSessionEnded(true);
        setIsConnected(false);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { text: "Connection failed. Please try again.", from: "system" }]);
      setSessionEnded(true);
      setIsConnected(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDial = async () => {
    if (!isValidShortCode(shortCode)) {
      alert("Invalid shortcode. It must start with * and end with # (e.g., *888#)");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("Please enter a phone number.");
      return;
    }

    setMessages([]);
    setSessionId("");
    setSessionEnded(false);
    setIsConnected(true);
    setShowPinModal(false);
    setPin("");
    await sendUSSD(shortCode.trim());
  };

  const handleSend = () => {
    if (!input.trim() || sessionEnded) return;
    setMessages((prev) => [...prev, { text: input.trim(), from: "user" }]);
    const textToSend = input.trim();
    setInput("");
    sendUSSD(textToSend);
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) return;
    setShowPinModal(false);
    setMessages((prev) => [...prev, { text: "●●●●", from: "user" }]);
    sendUSSD(pin);
    setPin("");
  };

  const resetSimulator = () => {
    setIsConnected(false);
    setSessionEnded(false);
    setMessages([]);
    setSessionId("");
    setInput("");
    setShowPinModal(false);
    setPin("");
  };

  return (
    <section id="simulator" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            <Activity size={16} /> Try It Yourself
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            USSD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F7B8C] to-[#10B981]">Simulator</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Dial a shortcode and navigate the menu – just like on a real phone.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16">
          {/* LEFT PANEL */}
          <div className="w-full lg:w-1/2 max-w-md space-y-6">
            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-7 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0F7B8C] text-white flex items-center justify-center text-xs font-bold">?</div>
                How It Works
              </h3>
              <ol className="space-y-4">
                {[
                  { step: 1, text: "Enter a registered phone number and a USSD code (like *888#)" },
                  { step: 2, text: "Press Dial – the simulator auto-answers if asked for your number." },
                  { step: 3, text: "Navigate the menu and confirm payments with your PIN." },
                ].map(({ step, text }) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F7B8C] text-white flex items-center justify-center text-sm font-bold shadow-md">
                      {step}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Input Card */}
            <div className="bg-white dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Phone Number Input */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isConnected || sessionEnded}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]/50"
                  placeholder="e.g. +252612345678"
                />
              </div>

              {/* Shortcode Input */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                  USSD Shortcode
                </label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  disabled={isConnected || sessionEnded}
                  className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    shortCode && !isValidShortCode(shortCode)
                      ? "border-red-400 focus:ring-red-500/50"
                      : "border-gray-300 dark:border-gray-600 focus:ring-[#0F7B8C]/50"
                  }`}
                  placeholder="*888#"
                />
                {shortCode && !isValidShortCode(shortCode) && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Shortcode must start with * and end with #</p>
                )}
              </div>

              {/* Action Buttons */}
              {!isConnected && !sessionEnded ? (
                <button
                  onClick={handleDial}
                  disabled={!isValidShortCode(shortCode) || !phoneNumber.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <Phone size={20} /> Dial {shortCode || "*888#"}
                </button>
              ) : sessionEnded ? (
                <button
                  onClick={resetSimulator}
                  className="w-full bg-gradient-to-r from-[#0F7B8C] to-[#0A5D6B] hover:from-[#0A5D6B] hover:to-[#083C47] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Phone size={20} /> Dial Again
                </button>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type response..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F7B8C]/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-[#0F7B8C] hover:bg-[#0A5D6B] disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    <Send size={18} />
                  </button>
                  <button
                    onClick={resetSimulator}
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors duration-300"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: iPhone 16 Pro Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* iPhone 16 Pro Frame */}
              <div className="relative mx-auto">
                {/* Phone Frame */}
                <div className="relative bg-black rounded-[50px] p-3.5 shadow-2xl">
                  {/* Flat Edge Frame */}
                  <div className="absolute inset-0 rounded-[50px] border-8 border-gray-950 pointer-events-none" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full border border-gray-800 z-20 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                  </div>

                  {/* Screen */}
                  <div className="bg-gradient-to-b from-gray-900 to-black rounded-[44px] overflow-hidden aspect-[9/18] relative border border-gray-800">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-black/50 text-white text-xs px-6 py-3 flex justify-between items-center z-10 h-10">
                      <span className="font-semibold tracking-tight">9:41</span>
                    </div>

                    {/* USSD Content Area */}
                    <div className="pt-16 pb-24 px-5 text-sm text-gray-100 font-mono overflow-y-auto h-full space-y-4 bg-black">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`animate-fade-in ${
                            msg.from === "user" ? "text-emerald-400 font-semibold" : "text-gray-300"
                          }`}
                        >
                          {msg.from === "user" ? <span className="text-emerald-500">→ </span> : ""}
                          <span className="break-words">
                            {msg.text.split("\n").map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </span>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="text-gray-500 text-xs animate-pulse">
                          ⟳ Processing...
                        </div>
                      )}
                      {sessionEnded && !isProcessing && (
                        <div className="text-center text-gray-500 text-xs mt-6">
                          Session ended. Press "Dial Again"
                        </div>
                      )}
                      {!isConnected && !sessionEnded && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center">
                          <Smartphone size={48} className="mb-4 opacity-40" />
                          <p className="text-xs leading-relaxed">Enter phone & shortcode<br />then press Dial</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Prompt */}
                    {isConnected && !sessionEnded && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/80 border-t border-gray-700 px-5 py-4 flex items-center gap-1">
                        <span className="text-emerald-400 font-mono text-sm">{'>'}</span>
                        <span className="text-emerald-400 font-mono text-sm flex-1">
                          {input || " "}
                          <span className="inline-block w-1.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera Rings (Decorative) */}
                <div className="absolute -top-1 right-6 w-12 h-12 rounded-full border-2 border-gray-950 opacity-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-96 shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Payment</h3>
                <button
                  onClick={() => setShowPinModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your 4-digit mobile money PIN to confirm.
              </p>

              {/* PIN Display */}
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                      pin.length > i
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                  >
                    {pin[i] ? "●" : "○"}
                  </div>
                ))}
              </div>

              {/* PIN Keypad */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "x"].map((num, idx) => (
                  <button
                    key={idx}
                    disabled={num === ""}
                    onClick={() => {
                      if (num === "x") setPin((prev) => prev.slice(0, -1));
                      else if (pin.length < 4) setPin((prev) => prev + num);
                    }}
                    className={`py-3 rounded-2xl font-bold text-lg transition-all duration-200 ${
                      num === ""
                        ? "invisible"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 shadow-sm"
                    }`}
                  >
                    {num === "x" ? "⌫" : num}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Check size={20} /> Confirm Payment
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. FAQ Section
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "What is USSD?", a: "USSD (Unstructured Supplementary Service Data) is a simple menu-based system that works on any mobile phone without internet. It's used for mobile banking and payments across Africa." },
    { q: "Is the simulator using the real DalPay backend?", a: "Currently it's a demo simulation. The live DalPay USSD gateway is connected to real mobile money operators." },
    { q: "Can I actually pay taxes via USSD?", a: "Yes! Dial *888# on Zaad, eDahab, or Nomad to access the real DalPay USSD menu and pay taxes." },
    { q: "Is it safe to use USSD for payments?", a: "Absolutely. USSD sessions are encrypted between your phone and the operator's network, just like mobile money transactions." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            FAQ
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F7B8C] to-[#10B981]">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C]/30 dark:hover:border-[#3BA7BC]/30 rounded-2xl p-7 transition-all duration-300 cursor-pointer"
            >
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white text-lg list-none">
                {faq.q}
                <ChevronRight size={22} className="transition-transform group-open:rotate-90 text-[#0F7B8C] dark:text-[#3BA7BC]" />
              </summary>
              <p className="mt-5 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-8">
          Enterprise Security
        </div>
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-16">
          Even USSD is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F7B8C] to-[#10B981]">Encrypted</span>
        </h2>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "Network-Level Encryption", desc: "USSD traffic is encrypted between your SIM and the operator's core network." },
            { icon: Server, title: "Operator-Grade Security", desc: "All connections go through secure mobile money gateways." },
            { icon: Cpu, title: "Real-Time Fraud Checks", desc: "Every USSD transaction is verified before processing." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C]/30 dark:hover:border-[#3BA7BC]/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#0F7B8C]/20 transition-colors duration-300">
                <Icon size={32} className="text-[#0F7B8C] dark:text-[#3BA7BC]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981] rounded-full mix-blend-soft-light opacity-10 translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3">
        {[
          { value: "5M+", label: "USSD Sessions", subtext: "Processed successfully" },
          { value: "All Phones", label: "Feature & Smart", subtext: "Works everywhere" },
          { value: "30 sec", label: "Avg. Completion", subtext: "Fast & reliable" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-5xl md:text-6xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-white">
              {stat.value}
            </div>
            <div className="text-lg font-bold mb-2">{stat.label}</div>
            <div className="text-sm text-white/70">{stat.subtext}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Testimonials Section
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed D.", role: "Farmer, Borama", text: "I don't have a smartphone, but USSD works perfectly. I paid my business tax in seconds." },
    { name: "Sahra K.", role: "Shop Owner, Hargeisa", text: "The USSD menu is so simple. Even my grandmother can use it." },
    { name: "Ali G.", role: "Driver, Berbera", text: "No internet needed – I pay my taxes right from my feature phone on the road." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Testimonials
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
            What <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F7B8C] to-[#10B981]">Users</span> Say
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {quotes.map(({ name, role, text }, idx) => (
            <div
              key={name}
              className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0F7B8C]/30 dark:hover:border-[#3BA7BC]/30 rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8 italic leading-relaxed">"{text}"</p>
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. CTA Section
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3BA7BC] rounded-full mix-blend-soft-light opacity-10 -translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
          Dial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">*888#</span> Now
        </h2>
        <p className="text-xl text-white/85 mb-12 leading-relaxed">
          Grab your phone (any phone), dial *888#, and experience the easiest way to pay taxes—no internet required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Get Your Tax Account
            <ArrowRight size={22} />
          </Link>
          <a
            href="#simulator"
            className="inline-flex items-center gap-3 border-2 border-white/80 text-white hover:bg-white/10 hover:border-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 backdrop-blur-sm"
          >
            Try Simulator Again
            <ChevronRight size={22} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Page Export
   ──────────────────────────────────────────── */
export default function USSDSimulatorPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <USSDSimulator />
      <Faq />
      <Security />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}