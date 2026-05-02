import { 
  GraduationCap, 
  ExternalLink, 
  ClipboardList, 
  UserCircle, 
  Presentation 
} from "lucide-react";

export function SponsoredByUOH() {
  return (
    <div className="bg-[#0F2237] text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* University logo + name (clickable) */}
          <a 
            href="https://uoh.edu.so" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 group shrink-0"
          >
            {/* UOH seal – replace with actual image if available */}
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg 
                          group-hover:bg-[#E8A020] transition-all duration-300 group-hover:scale-105">
              <GraduationCap size={28} className="text-[#0F2237] group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg leading-tight text-white 
                            group-hover:text-[#E8A020] transition-colors duration-300">
                  University of Hargeisa
                </p>
                <ExternalLink size={12} className="text-white/30 group-hover:text-[#E8A020] transition-colors" />
              </div>
              <p className="text-white/50 text-sm font-medium">
                College of Engineering, Computing & IT
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                Software Development & Systems Engineering
              </p>
            </div>
          </a>

          {/* Divider */}
          <div className="hidden lg:block w-px h-16 bg-white/10" />

          {/* Project info cards */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            
            {/* Project */}
            <div className="flex items-center gap-3 group/card cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0
                            group-hover/card:bg-[#E8A020]/20 transition-colors duration-300">
                <ClipboardList size={18} className="text-[#E8A020]" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Research Project</p>
                <p className="text-white/80 font-semibold text-sm">DalPay</p>
                <p className="text-white/30 text-xs">Digital Tax Payment System</p>
              </div>
            </div>

            <span className="hidden sm:block text-white/10">|</span>

            {/* Student */}
            <div className="flex items-center gap-3 group/card cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0
                            group-hover/card:bg-[#E8A020]/20 transition-colors duration-300">
                <UserCircle size={18} className="text-[#E8A020]" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Lead Researcher</p>
                <p className="text-white/80 font-semibold text-sm">Zacki Abdulkadir Omer</p>
                <p className="text-white/30 text-xs">CECIT/2026/2227460</p>
              </div>
            </div>

            <span className="hidden sm:block text-white/10">|</span>

            {/* Supervisor */}
            <div className="flex items-center gap-3 group/card cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0
                            group-hover/card:bg-[#E8A020]/20 transition-colors duration-300">
                <Presentation size={18} className="text-[#E8A020]" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Supervisor</p>
                <p className="text-white/80 font-semibold text-sm">Mohamed Ahmed Ali</p>
                <p className="text-white/30 text-xs">BSc IT Program</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-white/25 text-[11px]">
            Bachelor of Science in Information Technology • Academic Year 2025–2026
          </p>
          <p className="text-white/20 text-[11px]">
            Submitted: April 28, 2026
          </p>
        </div>
      </div>
    </div>
  );
}