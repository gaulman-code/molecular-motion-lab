import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, BookOpen, Terminal, Lightbulb } from 'lucide-react';

interface PromptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptGuideModal: React.FC<PromptGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const masterBuildPrompt = `고등학교 화학 I 및 물리학 I 교육과정에 맞춘 대화형 분자 운동 가상 실험실(Molecular Motion Simulator)을 React, TypeScript, HTML5 Canvas로 개발해 줘.

[필수 요구사항 및 기능]
1. 열역학 파라미터 및 이상 기체 상태 방정식 (PV = nRT):
   - 초기 온도는 실온(298 K, 25 °C)으로 설정하고, 온도 슬라이더(100 K ~ 800 K)와 버너 가열/얼음 냉각 제어기를 구현해 줘.
   - 온도가 변하면 기체 분자 운동론(Ē_k = 3/2 k_B T, v_rms = √(3RT/M))에 따라 각 분자의 평균 운동 에너지와 속력이 실시간으로 변화하도록 해 줘.
   - 피스톤을 마우스로 드래그하거나 슬라이더를 통해 용기 부피(V)를 조절할 수 있게 하고, 부피 압축 시 분자들이 좁은 공간에 재배열되며 벽면 충돌 빈도와 압력(P)이 상승하는 물리 엔진을 구현해 줘.
   - 특정 압력(예: 1.0 atm, 2.0 atm 등)을 설정하면 피스톤이 외부 압력과 평형을 이룰 때까지 동적으로 수축/팽창하는 기능을 포함해 줘.

2. 시각화 및 그래프:
   - 2D Canvas 물리 엔진: 완전 탄성 충돌, 벽면 충돌 시 충격량 기반 실제 압력 계측, 충돌 스파크 이펙트.
   - 각 분자의 순간 속도 벡터(화살표) 토글 및 궤적(Trail) 추적 기능.
   - 맥스웰-볼츠만 분자 속도 분포 히스토그램 및 이론 곡선(v_mp, v_avg, v_rms) 실시간 오버레이.
   - 보일의 법칙(P-V), 샤를의 법칙(V-T), 게이뤼삭의 법칙(P-T), 온도-운동에너지(Ek-T), 충돌빈도-압력 그래프 실시간 연동.

3. 다양한 기체 분자 및 모드:
   - 다양한 질량의 기체 선택: He(4g), Ne(20g), N₂(28g), Ar(40g), CO₂(44g).
   - 상태 변화 모드: 고체(결정 격자 진동) ↔ 액체(인력 응집) ↔ 기체(자유 비산).
   - 확산 모드: 가벼운 기체와 무거운 기체의 확산 속도 경주(그레이엄의 법칙).
   - 브라운 운동 모드: 거대 꽃가루 입자와 수많은 용매 분자의 불규칙 충돌 궤적 관찰.
   - 실험 데이터 기록표(CSV 내보내기)와 학생 탐구 퀘스트.`;

  const studentInquiryPrompts = [
    {
      title: '1. 보일의 법칙 미시적 충돌 원리 질문',
      prompt: `고등학교 화학 시간에 분자 운동 시뮬레이터를 사용해 보일의 법칙을 실험했습니다. 온도가 일정한 상태에서 피스톤을 눌러 부피를 절반으로 줄였더니 압력이 2배로 증가하고 벽면 충돌 빈도가 급증했습니다. 기체 분자 운동론의 관점에서 '단위 시간당 단위 면적에 가해지는 분자의 충돌 횟수와 운동량 변화량'을 바탕으로 이 현상을 고등학생 수준에 맞게 자세히 설명해 주세요.`,
    },
    {
      title: '2. 맥스웰-볼츠만 분포와 온도의 관계',
      prompt: `시뮬레이터에서 온도를 298K에서 600K로 올렸을 때, 분자 속도 분포 그래프의 최고점(최빈 속도)이 오른쪽으로 이동하면서 피크의 높이는 오히려 낮아지고 곡선이 넓어졌습니다. 온도가 올라갔는데 최고점 높이가 낮아지는 이유와, 곡선 아래의 전체 면적이 의미하는 바가 무엇인지 설명해 주세요.`,
    },
    {
      title: '3. 분자량과 확산 속도 (그레이엄의 법칙)',
      prompt: `헬륨(He, 분자량 4)과 이산화탄소(CO2, 분자량 44)를 같은 온도 298K에서 확산시켰을 때 헬륨이 훨씬 빠르게 용기 끝에 도달했습니다. 기체 분자의 제곱평균제곱근 속력 공식 v_rms = √(3RT/M)을 이용하여 두 기체의 확산 속도 비를 계산하고, 가벼운 기체가 더 빠른 이유를 설명해 주세요.`,
    },
    {
      title: '4. 실험 데이터 오차 분석 및 기체 상수 R 검증',
      prompt: `실험실에서 측정한 데이터가 다음과 같습니다: [T=298K, V=10.0L, P=1.00atm, n=0.41mol]. 상태 방정식 PV = nRT를 이용해 계산한 기체 상수 R의 값과 이론값(0.08206 L·atm/(mol·K))을 비교하고, 실제 분자 시뮬레이션에서 분자 자체의 크기나 측정 표본 수로 인해 발생할 수 있는 오차 요인을 분석해 주세요.`,
    },
    {
      title: '5. 절대온도 0K의 물리적 의미와 샤를의 법칙',
      prompt: `샤를의 법칙 그래프(V-T)에서 온도를 낮추면 부피가 선형적으로 감소하여 -273.15 ℃ (0 K)에서 가상적으로 0에 수렴하는 직선이 나타납니다. 절대온도 0 K에서 기체 분자들의 운동 에너지와 운동 상태는 어떻게 되는지 고교 과학 개념으로 쉽게 설명해 주세요.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                AI 시뮬레이터 프롬프트 & 탐구 가이드 (Prompt Guide)
              </h3>
              <p className="text-xs text-slate-400">
                시뮬레이터 개발을 위한 마스터 프롬프트 및 학생·교사용 과학 탐구 AI 질문 템플릿
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Master Build Prompt */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-indigo-200">
                  1. 시뮬레이터 개발 및 생성 마스터 프롬프트 (Master Developer Prompt)
                </h4>
              </div>
              <button
                onClick={() => handleCopy(masterBuildPrompt, 'master')}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {copiedKey === 'master' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'master' ? '복사됨!' : '프롬프트 복사'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              이 프롬프트를 다른 AI 모델이나 AI Studio 세션에 입력하면 동일한 수준의 고품질 분자 운동 시뮬레이터를 완벽하게 구축할 수 있습니다.
            </p>
            <pre className="p-3 bg-slate-900 rounded-lg text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800">
              {masterBuildPrompt}
            </pre>
          </div>

          {/* Section 2: Student Inquiry Prompts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-200">
                2. 고등학생 탐구 보고서 및 AI 질의 프롬프트 5선 (Student Inquiry Prompts)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              시뮬레이터에서 실험을 수행한 후, 아래 프롬프트를 복사하여 AI(Gemini, ChatGPT 등)에 질문하면 심층 탐구 보고서 작성에 유용한 과학적 원리와 설명을 얻을 수 있습니다.
            </p>

            <div className="space-y-3">
              {studentInquiryPrompts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <button
                      onClick={() => handleCopy(item.prompt, `prompt_${idx}`)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] rounded-lg transition-all"
                    >
                      {copiedKey === `prompt_${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedKey === `prompt_${idx}` ? '복사됨' : '복사'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
