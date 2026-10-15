import React from 'react';
import { Atom, FileSpreadsheet, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';
import { SimulationStats } from '../types/simulation';

interface HeaderProps {
  stats: SimulationStats;
  dataPointCount: number;
  onOpenDataTable: () => void;
  onOpenPromptGuide: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  dataPointCount,
  onOpenDataTable,
  onOpenPromptGuide,
  onResetAll,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-6 h-6 text-sky-400 animate-spin-slow" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                고등학교 분자 운동 가상 실험실
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                PV = nRT 물리 엔진
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              기체 분자 운동론 · 상태 변화 · 보일/샤를/게이뤼삭 법칙 · 맥스웰-볼츠만 분포
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Prompt Guide Button */}
          <button
            onClick={onOpenPromptGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 프롬프트 가이드</span>
          </button>

          {/* Data Table Button */}
          <button
            onClick={onOpenDataTable}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all relative"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>실험 데이터표</span>
            {dataPointCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full">
                {dataPointCount}
              </span>
            )}
          </button>

          {/* Reset All */}
          <button
            onClick={onResetAll}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            title="실험실 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
