import React, { useState, useEffect } from 'react';
import { LabQuest, SimulationMode, SimulationStats } from '../types/simulation';
import confetti from 'canvas-confetti';
import { CheckCircle, Circle, Award, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';

interface LabQuestsProps {
  stats: SimulationStats;
  mode: SimulationMode;
  onApplyPreset?: (patch: { temp?: number; width?: number; targetP?: number; species?: any }) => void;
}

export const LabQuests: React.FC<LabQuestsProps> = ({ stats, mode, onApplyPreset }) => {
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const quests: {
    id: string;
    title: string;
    subtitle: string;
    mode: SimulationMode;
    goal: string;
    hint: string;
    isMet: (stats: SimulationStats, currentMode: SimulationMode) => boolean;
  }[] = [
    {
      id: 'quest_temp_ek',
      title: '탐구 1: 절대온도와 평균 운동 에너지 (Ē_k = 3/2 k_B T)',
      subtitle: '온도 조절 슬라이더로 온도를 500 K 이상으로 가열하여 분자 평균 속력의 증가를 관찰하세요.',
      mode: 'gas_laws',
      goal: '온도 T >= 500 K 달성',
      hint: '열 제어기에서 [가열(버너)]을 누르거나 온도 슬라이더를 500 K 이상으로 올리세요.',
      isMet: (s) => s.temperature >= 500,
    },
    {
      id: 'quest_boyle',
      title: '탐구 2: 보일의 법칙 (부피 압축과 충돌 빈도 및 압력 증가)',
      subtitle: '피스톤을 안쪽으로 밀어 용기 부피를 6.5 L 이하로 압축하고, 벽면 충돌 빈도와 압력의 상승을 확인하세요.',
      mode: 'gas_laws',
      goal: '부피 V <= 6.5 L 및 압력 P >= 1.5 atm',
      hint: '피스톤 핸들을 왼쪽으로 드래그하거나 용기 부피 슬라이더를 줄이세요.',
      isMet: (s) => s.volume <= 6.5 && s.pressure >= 1.5,
    },
    {
      id: 'quest_target_p',
      title: '탐구 3: 특정 압력 설정과 분자 재배열',
      subtitle: '특정 압력을 2.0 atm으로 설정하여 피스톤이 평형 부피를 찾아 압축되는 과정을 관찰하세요.',
      mode: 'gas_laws',
      goal: '목표 압력 2.0 atm 설정 & 압력 평형',
      hint: '컨트롤 패널의 [특정 압력 설정]에서 2.0 atm 버튼을 클릭하세요.',
      isMet: (s) => s.targetPressure === 2.0 && Math.abs(s.pressure - 2.0) < 0.25,
    },
    {
      id: 'quest_states',
      title: '탐구 4: 물질의 세 가지 상태와 상전이',
      subtitle: '물질의 세 상태 모드에서 온도를 150 K 이하로 냉각하여 고체 결정을 만든 후, 450 K 이상으로 가열하여 기화시키세요.',
      mode: 'states_of_matter',
      goal: '물질의 세 상태 모드 체험',
      hint: '상단에서 [물질의 세 상태] 모드를 선택하고 냉각/가열을 시험해 보세요.',
      isMet: (s, m) => m === 'states_of_matter',
    },
  ];

  useEffect(() => {
    quests.forEach((q) => {
      if (!completedIds[q.id] && q.isMet(stats, mode)) {
        setCompletedIds((prev) => ({ ...prev, [q.id]: true }));
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        } catch {
          // ignore if canvas context issue
        }
      }
    });
  }, [stats, mode, completedIds]);

  const completedCount = Object.values(completedIds).filter(Boolean).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">고교 과학 탐구 과제 (Lab Quests)</h4>
            <p className="text-[11px] text-slate-400">교과서 핵심 개념 가상 실험 미션</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 font-bold">{completedCount}</span>
          <span className="text-slate-500">/ {quests.length} 완료</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {quests.map((q) => {
          const isDone = !!completedIds[q.id];
          return (
            <div
              key={q.id}
              className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    {q.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? '완료 ✓' : '진행 중'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 ml-5 leading-relaxed">{q.subtitle}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 ml-5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  <strong className="text-slate-300">목표:</strong> {q.goal}
                </span>
                <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                  <HelpCircle className="w-3 h-3" />
                  {q.hint}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
