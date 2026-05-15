/* ─── src/pages/USSDSimulatorPage.tsx ─── */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock, BadgeCheck,
  Zap, Globe, Star, ChevronRight,
  Lock, Server, Cpu, MonitorSmartphone, Hash, Send, XCircle, Phone,
  X, Check,
} from "lucide-react";

/* ─────────────────────────────────────────────
   1. Hero
   ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3BA7BC] rounded-full mix-blend-soft-light opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#10B981] rounded-full mix-blend-soft-light opacity-20 translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3BA7BC]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
          </span>
          Live USSD simulation – see how mobile payments work
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          USSD Simulator
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Experience Mobile Tax Payment
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Type a USSD code, navigate menus, and see how DalPay processes tax payments through simple text‑based commands.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#simulator" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            Try the Simulator
            <MonitorSmartphone size={20} />
          </a>
          <Link to="/register" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Smartphone size={20} /> Get the Real App
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "*888#", label: "DalPay Code", icon: Hash },
            { value: "3 min", label: "Average Session", icon: Clock },
            { value: "All Networks", label: "Zaad, eDahab, Nomad", icon: Globe },
            { value: "100%", label: "Free to Simulate", icon: BadgeCheck },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <stat.icon size={20} className="mx-auto mb-2 text-[#10B981]" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
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
    <section className="py-12 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10 items-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <ShieldCheck className="text-[#0F7B8C]" size={22} /> PCI-DSS Certified
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Zap className="text-[#0F7B8C]" size={22} /> ISO 27001
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Globe className="text-[#0F7B8C]" size={22} /> Government Approved
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <Smartphone className="text-[#0F7B8C]" size={22} /> All Mobile Networks
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. USSD Simulator – interactive with backend
   ──────────────────────────────────────────── */
function USSDSimulator() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shortCode, setShortCode] = useState("*888#"); // default
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

  // Normalise phone number: prepend '+' if it starts with '252'
  const normalisePhone = (num: string) => {
    const trimmed = num.trim();
    if (trimmed.startsWith("252")) return "+" + trimmed;
    return trimmed;
  };

  // Check if a shortcode looks valid
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

        // Auto‑reply with phone number when backend asks for it
        if (
          !resp.end &&
          resp.response.toLowerCase().includes("phone") &&
          resp.response.toLowerCase().includes("enter")
        ) {
          // Give a tiny delay so the user can read the prompt, then auto‑send the number
          setTimeout(() => {
            const pn = normalisePhone(phoneNumber);
            setMessages((prev) => [...prev, { text: pn, from: "user" }]);
            sendUSSD(pn);
          }, 1200);
          setIsProcessing(false);
          return;
        }

        // Show PIN modal if the response asks for a PIN
        if (resp.response.includes("Enter your") && resp.response.includes("PIN")) {
          setShowPinModal(true);
        }

        if (resp.end) {
          setSessionEnded(true);
          setIsConnected(false);
        }
      } else {
        // Backend error – show message in phone screen
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
    // Validate shortcode
    if (!isValidShortCode(shortCode)) {
      alert("Invalid shortcode. It must start with * and end with # (e.g., *888#)");
      return;
    }
    // Validate phone number
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-4">
            Try It Yourself
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            USSD <span className="text-[#0F7B8C]">Simulator</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Dial a shortcode and navigate the menu – just like on a real phone.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-16">
          {/* LEFT PANEL */}
          <div className="w-full lg:w-1/2 max-w-md space-y-6">
            <div className="bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How it works</h3>
              <ol className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0F7B8C] text-white flex items-center justify-center text-sm font-bold">1</span>
                  <span>Enter a registered phone number and a USSD code (like <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[#0F7B8C]">*888#</code>)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0F7B8C] text-white flex items-center justify-center text-sm font-bold">2</span>
                  <span>Press <strong>Dial</strong> – the simulator will auto‑answer if asked for your number.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0F7B8C] text-white flex items-center justify-center text-sm font-bold">3</span>
                  <span>Navigate the menu and confirm payments with your PIN.</span>
                </li>
              </ol>
            </div>

            <div className="bg-white dark:bg-[#111627] border-2 border-[#0F7B8C]/20 rounded-2xl p-5">
              {/* Phone number input */}
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isConnected || sessionEnded}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white mb-3 disabled:opacity-50"
                placeholder="e.g. +252612345678"
              />

              {/* Shortcode input */}
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                USSD Shortcode
              </label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                disabled={isConnected || sessionEnded}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white mb-1 disabled:opacity-50 ${
                  shortCode && !isValidShortCode(shortCode)
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="*888#"
              />
              {shortCode && !isValidShortCode(shortCode) && (
                <p className="text-xs text-red-500 mb-3">Shortcode must start with * and end with #</p>
              )}

              {!isConnected && !sessionEnded ? (
                <button
                  onClick={handleDial}
                  disabled={!isValidShortCode(shortCode) || !phoneNumber.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Phone size={20} /> Dial {shortCode || "*888#"}
                </button>
              ) : sessionEnded ? (
                <button
                  onClick={resetSimulator}
                  className="w-full bg-[#0F7B8C] hover:bg-[#0A5D6B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={20} /> Dial Again
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type response..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isProcessing}
                    className="px-5 py-3 bg-[#0F7B8C] hover:bg-[#0A5D6B] text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} /> Send
                  </button>
                  <button
                    onClick={resetSimulator}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Phone mockup (unchanged) */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="relative bg-gray-900 rounded-[48px] p-5 shadow-2xl mx-auto">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-b-2xl z-10" />
                <div className="bg-black rounded-[36px] overflow-hidden aspect-[9/18] relative border-2 border-gray-700">
                  <div className="absolute top-0 left-0 right-0 bg-black/80 text-white text-sm px-5 py-3 flex justify-between z-10">
                    <span className="font-semibold">USSD</span>
                    <span>▮▮▮▮</span>
                  </div>
                  <div className="pt-14 pb-24 px-4 text-base text-white font-mono overflow-y-auto h-full space-y-3">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={msg.from === "user" ? "text-green-400" : "text-gray-200"}>
                        {msg.from === "user" ? "> " : ""}
                        {msg.text.split("\n").map((line, i) => (
                          <span key={i}>{line}<br /></span>
                        ))}
                      </div>
                    ))}
                    {isProcessing && <div className="text-gray-400 animate-pulse">Processing...</div>}
                    {sessionEnded && !isProcessing && (
                      <div className="text-center text-gray-400 mt-4">
                        Session ended. Press "Dial Again" to restart.
                      </div>
                    )}
                    {!isConnected && !sessionEnded && messages.length === 0 && (
                      <div className="text-gray-500 text-center mt-20">
                        <Smartphone size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Enter a phone number and shortcode then press Dial.</p>
                      </div>
                    )}
                  </div>
                  {isConnected && !sessionEnded && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-gray-700 px-5 py-3 flex items-center gap-2">
                      <span className="text-green-400 font-mono text-base">{'>'}</span>
                      <span className="text-green-400 font-mono text-base">
                        {input || " "}
                        <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-0.5 align-middle" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIN Modal – unchanged */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Payment</h3>
                <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your mobile money PIN to confirm the payment.
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold ${
                      pin.length > i ? "border-green-500 bg-green-100 text-green-800" : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {pin[i] || "•"}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "x"].map((num, idx) => (
                  <button
                    key={idx}
                    disabled={num === ""}
                    onClick={() => {
                      if (num === "x") setPin((prev) => prev.slice(0, -1));
                      else if (pin.length < 4) setPin((prev) => prev + num);
                    }}
                    className="py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {num === "x" ? "⌫" : num}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "What is USSD?", a: "USSD (Unstructured Supplementary Service Data) is a simple menu‑based system that works on any mobile phone without internet. It's used for mobile banking and payments across Africa." },
    { q: "Is the simulator using the real DalPay backend?", a: "Currently it's a demo simulation. The live DalPay USSD gateway is connected to real mobile money operators." },
    { q: "Can I actually pay taxes via USSD?", a: "Yes! Dial *888# on Zaad, eDahab, or Nomad to access the real DalPay USSD menu and pay taxes." },
    { q: "Is it safe to use USSD for payments?", a: "Absolutely. USSD sessions are encrypted between your phone and the operator's network, just like mobile money transactions." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">FAQ</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Frequently Asked <span className="text-[#0F7B8C]">Questions</span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 group">
              <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 dark:text-white text-lg list-none">
                {faq.q}
                <ChevronRight size={20} className="transition-transform group-open:rotate-90 text-gray-400" />
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Enterprise Security</div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Even USSD is <span className="text-[#0F7B8C]">Encrypted</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "Network‑Level Encryption", desc: "USSD traffic is encrypted between your SIM and the operator's core network." },
            { icon: Server, title: "Operator‑Grade Security", desc: "All connections go through secure mobile money gateways." },
            { icon: Cpu, title: "Real‑Time Fraud Checks", desc: "Every USSD transaction is verified before processing." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <div className="w-16 h-16 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 flex items-center justify-center mx-auto mb-4">
                <Icon size={30} className="text-[#0F7B8C]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{desc}</p>
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
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "5M+", label: "USSD Sessions" },
          { value: "All Phones", label: "Feature & Smart" },
          { value: "30 sec", label: "Avg. Completion" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-5xl font-extrabold mb-2">{stat.value}</div>
            <div className="text-lg text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. Testimonials
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What <span className="text-[#0F7B8C]">Users</span> Say
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {quotes.map(({ name, role, text }) => (
            <div key={name} className="bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic">“{text}”</p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Dial *888# Now
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Grab your phone (any phone), dial *888#, and experience the easiest way to pay taxes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Get Your Tax Account
            <ArrowRight size={22} />
          </Link>
          <a href="#simulator" className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300">
            Back to Simulator
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   USSDSimulatorPage
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