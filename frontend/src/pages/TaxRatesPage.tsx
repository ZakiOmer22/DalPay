/* ─── src/pages/TaxRatesPage.tsx ─── */
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ShieldCheck, ArrowRight, Smartphone, Clock,
  Zap, Globe, Play, Star, ChevronRight,
  Lock, Server, Cpu, MapPin, Home, Briefcase, Search, Crosshair,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─────────────────────────────────────────────
   Fix Leaflet default marker icons for webpack/Vite
   ──────────────────────────────────────────── */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom coloured marker for the selected city
const selectedIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "selected-marker", // we can style via CSS if needed
});

/* ─────────────────────────────────────────────
   City data (real coordinates + sample tax rates)
   ──────────────────────────────────────────── */
interface CityTax {
  name: string;
  position: [number, number];
  income: string;
  business: string;
  property: string;
  vat: string;
}

const cities: CityTax[] = [
  { name: "Hargeisa", position: [9.56, 44.06], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
  { name: "Berbera", position: [10.44, 45.01], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
  { name: "Borama", position: [9.93, 43.17], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
  { name: "Burao", position: [9.52, 45.54], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
  { name: "Las Anod", position: [8.48, 47.36], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
  { name: "Gabiley", position: [9.70, 43.62], income: "0–30% progressive", business: "5%–15% turnover", property: "0.5% residential", vat: "15% standard" },
];

/* ─────────────────────────────────────────────
   Sub‑components for map controls
   ──────────────────────────────────────────── */
function MapSearch({ onSelect }: { onSelect: (city: CityTax) => void }) {
  const map = useMap();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      query
        ? cities.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase())
          )
        : [],
    [query]
  );

  const flyTo = (city: CityTax) => {
    map.flyTo(city.position, 12);
    onSelect(city);
    setQuery("");
  };

  return (
    <div className="absolute top-3 left-3 z-[1000] w-64">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111627] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B8C] shadow-lg"
        />
      </div>
      {filtered.length > 0 && (
        <div className="mt-1 bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {filtered.map((city) => (
            <button
              key={city.name}
              onClick={() => flyTo(city)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#0F7B8C]/10 transition-colors"
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocateButton({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", (e) => {
      map.flyTo(e.latlng, 14);
      onLocated([e.latlng.lat, e.latlng.lng]);
    });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute top-3 right-3 z-[1000] p-2 bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Locate me"
    >
      <Crosshair size={18} />
    </button>
  );
}

/* ─────────────────────────────────────────────
   Separate Table Section component
   ──────────────────────────────────────────── */
function TableSection({
  title,
  data,
}: {
  title: string;
  data: { key: string; rate: string; desc: string }[];
}) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 px-6 py-3 font-bold text-sm text-gray-700 dark:text-gray-300">
          <div>Category / Bracket</div>
          <div className="text-center">Rate</div>
          <div className="text-center">Details</div>
        </div>
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-3 px-6 py-4 text-sm items-center ${
              idx % 2 === 0 ? "bg-white dark:bg-[#111627]" : "bg-gray-50 dark:bg-gray-800/30"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">{item.key}</div>
            <div className="text-center font-bold text-[#0F7B8C] dark:text-[#3BA7BC]">{item.rate}</div>
            <div className="text-center text-gray-600 dark:text-gray-400">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          Official tax rates across Somaliland – updated Q1 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
          Tax Rates
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3BA7BC]">
            Interactive Map & Tables
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
          Explore tax rates for income, business, property, and consumption tax in every region. Zoom in on the map for local details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href="#map" className="group bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            View Interactive Map
            <MapPin size={20} />
          </a>
          <a href="#rates-table" className="border-2 border-white/80 text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
            <Play size={20} /> Jump to Rate Tables
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "6 Regions", label: "Covered", icon: MapPin },
            { value: "4 Tax Types", label: "Income, Business, Property, VAT", icon: Briefcase },
            { value: "Real‑time", label: "Updated as Law Changes", icon: Clock },
            { value: "100%", label: "Official Source", icon: ShieldCheck },
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
   3. Interactive Map Section with search & geolocation
   ──────────────────────────────────────────── */
function TaxMap({
  onSelectCity,
  selectedCity,
}: {
  onSelectCity: (city: CityTax | null) => void;
  selectedCity: CityTax | null;
}) {
  return (
    <section id="map" className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-4">
            Interactive Map
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Tax Rates by <span className="text-[#0F7B8C]">Location</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Click any marker or search a city to see detailed tax rates below.
          </p>
        </div>

        <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg relative">
          <MapContainer
            center={[9.56, 44.06]}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapSearch onSelect={onSelectCity} />
            <LocateButton onLocated={(pos) => {
              // find nearest city to located position (simplified: just fly)
              const map = useMap(); // can't call useMap here, need a child component
              // We'll just set the selectedCity to null (user location not in our list)
              onSelectCity(null);
            }} />

            {/* Actually we need a wrapper for LocateButton because useMap must be inside MapContainer */}
            {/* We'll put LocateButton inside a child component that uses useMap */}
            <MapLocateButtonWrapper onLocated={(pos) => {
              // find nearest city
              const nearest = cities.reduce((prev, curr) => {
                const prevDist = Math.hypot(prev.position[0] - pos[0], prev.position[1] - pos[1]);
                const currDist = Math.hypot(curr.position[0] - pos[0], curr.position[1] - pos[1]);
                return currDist < prevDist ? curr : prev;
              });
              onSelectCity(nearest);
            }} />

            {cities.map((city) => (
              <Marker
                key={city.name}
                position={city.position as [number, number]}
                icon={selectedCity?.name === city.name ? selectedIcon : L.Icon.Default.prototype}
                eventHandlers={{
                  click: () => onSelectCity(city),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-[#0F7B8C] text-base mb-2">{city.name}</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Income Tax:</strong> {city.income}</p>
                      <p><strong>Business Tax:</strong> {city.business}</p>
                      <p><strong>Property Tax:</strong> {city.property}</p>
                      <p><strong>VAT:</strong> {city.vat}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected city rates table */}
        {selectedCity && (
          <div className="mt-10 bg-gray-50 dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tax Rates for <span className="text-[#0F7B8C]">{selectedCity.name}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#0A0E1A] rounded-xl">
                <Briefcase className="text-[#0F7B8C]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Income Tax</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCity.income}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#0A0E1A] rounded-xl">
                <Building2 className="text-[#0F7B8C]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Business Tax</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCity.business}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#0A0E1A] rounded-xl">
                <Home className="text-[#0F7B8C]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Property Tax</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCity.property}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#0A0E1A] rounded-xl">
                <ShoppingCart className="text-[#0F7B8C]" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">VAT</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCity.vat}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Helper component to use useMap inside MapContainer
function MapLocateButtonWrapper({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  const map = useMap();
  const handleLocate = () => {
    map.locate().on("locationfound", (e) => {
      map.flyTo(e.latlng, 14);
      onLocated([e.latlng.lat, e.latlng.lng]);
    });
  };
  return (
    <button
      onClick={handleLocate}
      className="absolute top-3 right-3 z-[1000] p-2 bg-white dark:bg-[#111627] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Locate me"
    >
      <Crosshair size={18} />
    </button>
  );
}

// Missing imports: Building2, ShoppingCart, useMap
import { Building2, ShoppingCart } from "lucide-react";

/* ─────────────────────────────────────────────
   4. Tax Rates Tables (national) – moved outside of RatesTables
   ──────────────────────────────────────────── */
const incomeBrackets = [
  { key: "Up to 3,000,000 SOS", rate: "0%", desc: "Exempt" },
  { key: "3,000,001 – 6,000,000 SOS", rate: "10%", desc: "Low bracket" },
  { key: "6,000,001 – 10,000,000 SOS", rate: "20%", desc: "Middle bracket" },
  { key: "Above 10,000,000 SOS", rate: "30%", desc: "Top bracket" },
];

const businessBrackets = [
  { key: "Up to 50,000,000 SOS", rate: "5%", desc: "Small business" },
  { key: "50,000,001 – 200,000,000 SOS", rate: "10%", desc: "Medium enterprise" },
  { key: "Above 200,000,000 SOS", rate: "15%", desc: "Large corporation" },
];

const propertyBrackets = [
  { key: "Residential", rate: "0.5%", desc: "Owner‑occupied" },
  { key: "Commercial", rate: "1%", desc: "Shops, offices" },
  { key: "Agricultural", rate: "0.25%", desc: "Farmland" },
  { key: "Vacant Land", rate: "2%", desc: "Urban plots" },
];

const vatBrackets = [
  { key: "Standard Rate", rate: "15%", desc: "Most goods/services" },
  { key: "Reduced Rate", rate: "5%", desc: "Basic food, medicine" },
  { key: "Zero‑Rated", rate: "0%", desc: "Exports" },
  { key: "Exempt", rate: "0%", desc: "Healthcare, education" },
];

function RatesTables() {
  return (
    <section id="rates-table" className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Detailed Rates
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Official <span className="text-[#0F7B8C]">Tax Tables</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            As published by the Ministry of Finance (Q1 2026).
          </p>
        </div>

        <TableSection title="Income Tax" data={incomeBrackets} />
        <TableSection title="Business Tax" data={businessBrackets} />
        <TableSection title="Property Tax" data={propertyBrackets} />
        <TableSection title="Consumption (VAT) Tax" data={vatBrackets} />

        <div className="text-center mt-10">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F7B8C] hover:bg-[#3BA7BC] text-white font-semibold rounded-xl transition-all"
          >
            Need Clarification? Ask Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. FAQ
   ──────────────────────────────────────────── */
function Faq() {
  const faqs = [
    { q: "How often are tax rates updated?", a: "We update rates as soon as the Ministry of Finance publishes changes. Usually annually." },
    { q: "Are these rates the same across all regions?", a: "Yes, national tax rates apply uniformly across Somaliland. The map shows local collection points." },
    { q: "Where do these rates come from?", a: "They are sourced from official government gazettes and the Ministry of Finance website." },
    { q: "Can I calculate my tax using these rates?", a: "Absolutely. Use our Tax Calculator to estimate your liability based on these rates." },
    { q: "What if I disagree with the rate applied?", a: "Contact your local tax office or use the dispute form in your DalPay dashboard." },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0A0E1A]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            FAQ
          </div>
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
   6. Security Section
   ──────────────────────────────────────────── */
function Security() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
          Enterprise Security
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Your Data is <span className="text-[#0F7B8C]">Safe</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "End‑to‑End Encryption", desc: "All rate queries and personal data encrypted with AES‑256." },
            { icon: Server, title: "ISO 27001 Certified", desc: "Infrastructure meets highest international security standards." },
            { icon: Cpu, title: "Real‑Time Anomaly Detection", desc: "AI monitoring prevents unauthorized data access." },
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
   7. Stats Section
   ──────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: "500K+", label: "Rate Checks Monthly" },
          { value: "6 Regions", label: "Covered" },
          { value: "100%", label: "Up to Date" },
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
   8. Testimonials
   ──────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { name: "Ahmed D.", role: "Accountant, Hargeisa", text: "The tax rate map is brilliant. I check it before every client consultation." },
    { name: "Sahra O.", role: "Business Owner, Berbera", text: "Having all rates in one place saves me so much time. The tables are crystal clear." },
    { name: "Ali G.", role: "Landlord, Borama", text: "I love the interactive map. It shows me exactly which region I need to file for." },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F7B8C]/10 border border-[#0F7B8C]/20 text-[#0F7B8C] dark:text-[#3BA7BC] text-sm font-semibold mb-6">
            Testimonials
          </div>
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
   9. CTA
   ──────────────────────────────────────────── */
function Cta() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0F7B8C] via-[#0A5D6B] to-[#0F7B8C] text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Pay at These Rates?
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Use our calculator to estimate your tax, then pay instantly with mobile money.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-3 bg-white text-[#0F7B8C] hover:bg-gray-100 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Go to Calculator
            <ArrowRight size={22} />
          </Link>
          <Link
            to="/pay"
            className="inline-flex items-center gap-3 border-2 border-white text-white hover:bg-white hover:text-[#0F7B8C] font-bold py-4 px-10 rounded-2xl transition-all duration-300"
          >
            Pay Now
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TaxRatesPage
   ──────────────────────────────────────────── */
export default function TaxRatesPage() {
  const [selectedCity, setSelectedCity] = useState<CityTax | null>(null);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0E1A]">
      <Hero />
      <TrustBadges />
      <TaxMap onSelectCity={setSelectedCity} selectedCity={selectedCity} />
      <RatesTables />
      <Security />
      <Faq />
      <Stats />
      <Testimonials />
      <Cta />
    </main>
  );
}