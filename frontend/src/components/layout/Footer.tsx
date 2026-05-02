import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Link2,
  Video,
  Layout,
  FileText,
  HelpCircle,
  Building,
  BookOpen,
  Briefcase,
  Shield,
} from "lucide-react";
import { SponsoredByUOH } from "@/components/shared/SponsoredByUOH";
import { FooterTeamSection } from "@/components/shared/FooterTeamSection";

const footerSections = [
  {
    title: "Services",
    icon: Briefcase,
    links: [
      { name: "Pay Tax", href: "/pay" },
      { name: "Tax Calculator", href: "/calculator" },
      { name: "Check Balance", href: "/balance" },
      { name: "Payment History", href: "/history" },
      { name: "Mobile App", href: "/mobile" },
    ],
  },
  {
    title: "Tax Types",
    icon: Layout,
    links: [
      { name: "Income Tax", href: "/tax-types/income" },
      { name: "Business Tax", href: "/tax-types/business" },
      { name: "Property Tax", href: "/tax-types/property" },
      { name: "Consumption Tax", href: "/tax-types/consumption" },
    ],
  },
  {
    title: "Resources",
    icon: BookOpen,
    links: [
      { name: "How to Pay", href: "/resources/how-to-pay" },
      { name: "Tax Rates", href: "/resources/tax-rates" },
      { name: "Download Forms", href: "/resources/forms" },
      { name: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Government",
    icon: Building,
    links: [
      { name: "Ministry of Finance", href: "https://slmof.org/" },
      { name: "About DalPay", href: "/about" },
      { name: "Contact Us", href: "/contact" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    icon: HelpCircle,
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Support", href: "/contact" },
      { name: "Report Issue", href: "/report" },
    ],
  },
  {
    title: "Legal",
    icon: FileText,
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    links: [
      { name: "Security Center", href: "/security" },
      { name: "Report Fraud", href: "/report-fraud" },
      { name: "Data Protection", href: "/data-protection" },
    ],
  },
];

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/dalpay", icon: MessageCircle, color: "hover:bg-blue-400" },
  { name: "LinkedIn", href: "https://linkedin.com/company/dalpay", icon: Link2, color: "hover:bg-blue-700" },
  { name: "YouTube", href: "https://youtube.com/@dalpay", icon: Video, color: "hover:bg-red-600" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-b from-primary-dark to-primary text-white py-16 px-6 md:px-20">
        <div className="max-w-[1800px] mx-auto">
          {/* Logo + Description */}
          <div className="flex flex-col items-center text-center mb-12">
            <img
              src="/logo.png"
              alt="DalPay"
              className="h-20 md:h-28 w-auto object-contain mb-4 brightness-0 invert"
            />
            <p className="text-white/60 max-w-md text-sm">
              The official digital tax payment system of the Ministry of Finance, Republic of Somaliland.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-12">
            {footerSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.title} className="group">
                  <h3 className="text-lg font-bold mb-6 text-white/70 group-hover:text-white transition-colors duration-300 flex items-center">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-white/50 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center group/link"
                        >
                          <span className="w-1 h-1 bg-white/40 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/20 my-8" />

          {/* Contact + Social */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-white/50">
              <div className="flex items-center gap-2"><Mail size={14} /> support@dalpay.gov.so</div>
              <div className="flex items-center gap-2"><Phone size={14} /> +252 63 365 0000</div>
              <div className="flex items-center gap-2"><MapPin size={14} /> Hargeisa, Somaliland</div>
            </div>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                    className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110`}
                    aria-label={social.name}>
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Project Team Section */}
          <FooterTeamSection />

          {/* Copyright */}
          <div className="text-center pt-8 border-t border-white/20 mt-8">
            <p className="text-white/40 text-sm">
              &copy; {currentYear} Ministry of Finance, Republic of Somaliland. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <SponsoredByUOH />
    </>
  );
}