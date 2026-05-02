import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  Code,
  Database,
  Palette,
  FileText,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";

const team = [
  {
    name: "Zacki A. Omer",
    role: "Lead Developer & System Architect",
    description:
      "Owns the entire system direction and critical backend logic. Defines system architecture, API contracts, and development standards.",
    icon: Code,
  },
  {
    name: "Abdulkadir I. Abdi",
    role: "Backend & Database Engineer",
    description:
      "Designs and manages the database, writes optimized queries, leads system testing, and ensures project quality assurance.",
    icon: Database,
  },
  {
    name: "Abdulmajid A. Ahmed",
    role: "Frontend Lead Developer",
    description:
      "Builds the complete user interface – Citizen Dashboard, Admin Dashboard, and all UI components.",
    icon: Palette,
  },
  {
    name: "Arafat Osman Aden",
    role: "Documentation Lead",
    description:
      "Writes the entire proposal letter, ensures it meets university standards, and coordinates the writing team.",
    icon: FileText,
  },
  {
    name: "Abdiqadir Ismacil",
    role: "Methodology & System Design Writer",
    description:
      "Owns the methodology chapter and system design documentation, ensuring academic rigour and clarity.",
    icon: BookOpen,
  },
  {
    name: "Abdiraxem Khadar",
    role: "Testing, Evaluation & Results Writer",
    description:
      "Writes testing methodology, evaluation criteria, and the results analysis chapter.",
    icon: ClipboardCheck,
  },
];

export function FooterTeamSection() {
  return (
    <div className="border-t border-white/10 pt-10 mt-10">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Users size={20} className="text-primary-light" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Project Team</h3>
            <p className="text-white/40 text-xs">
              The people building DalPay
            </p>
          </div>
        </div>
        <Link
          to="/our-team"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary-light transition-colors"
        >
          View full team
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Team grid – compact cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {team.map((member) => {
          const Icon = member.icon;
          return (
            <div
              key={member.name}
              className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 
                         rounded-xl p-4 text-center transition-all duration-300 hover:border-primary-light/40 
                         hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3 
                            group-hover:bg-primary-light/20 transition-colors duration-300"
              >
                <Icon size={18} className="text-primary-light group-hover:text-white transition-colors" />
              </div>

              {/* Name & Role – always visible */}
              <h4 className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                {member.name}
              </h4>
              <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider line-clamp-1">
                {member.role}
              </p>

              {/* Description – fades in on hover */}
              <div
                className="mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300"
              >
                <p className="text-[11px] text-white/60 leading-relaxed text-left">
                  {member.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}