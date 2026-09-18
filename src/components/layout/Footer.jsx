import React from 'react';
import { Zap, ShieldCheck, Database, FileCheck2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/8 bg-[#04060C] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-soft">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white font-display text-sm tracking-wide">
                G13 — AI Meeting-to-Action Intelligence
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              "We don't just summarize meetings. We identify what was committed, who owns it, when it is due, and the evidence behind it."
            </p>
          </div>

          {/* Three Architecture Pillars */}
          <div className="grid grid-cols-3 gap-6 text-slate-300">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence Grounded</span>
              </div>
              <p className="text-[11px] text-slate-500">Every task tied to exact speech timestamps</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Database className="w-3.5 h-3.5 text-ai" />
                <span>RAG Memory</span>
              </div>
              <p className="text-[11px] text-slate-500">Cross-meeting contradiction detection</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <FileCheck2 className="w-3.5 h-3.5 text-accent" />
                <span>Accountability</span>
              </div>
              <p className="text-[11px] text-slate-500">Owner & strict deadline validation</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-[11px] text-slate-400">
          <p>© 2026 G13 Intelligence Engine. Built for production-grade executive workflows.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-200 cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-slate-200 cursor-pointer">Diarization Standards</span>
            <span className="hover:text-slate-200 cursor-pointer">Voice Consent Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
