import React from 'react';
import { RecordedDataPoint } from '../types/simulation';
import { X, Download, Trash2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoints: RecordedDataPoint[];
  onClear: () => void;
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  dataPoints,
  onClear,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (dataPoints.length === 0) return;
    const headers = ['No', '시간', '온도_T(K)', '온도_T(C)', '부피_V(L)', '압력_P(atm)', '분자수_n', 'P*V곱', 'V/T비', 'P/T비', '실험모드'];
    const rows = dataPoints.map((dp, idx) => [
      idx + 1,
      dp.timestamp,
      dp.temperature,
      Math.round(dp.temperature - 273.15),
      dp.volume,
      dp.pressure,
      dp.particleCount,
      dp.pV.toFixed(2),
      dp.vOverT.toFixed(4),
      dp.pOverT.toFixed(4),
      dp.mode,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `분자운동_실험데이터_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                실험 데이터 기록표 (Laboratory Data Sheet)
              </h3>
              <p className="text-xs text-slate-400">
                측정된 열역학 상태량 (P, V, T, n) 및 보일·샤를 법칙 검증 계산값
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={dataPoints.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              CSV 내보내기
            </button>
            <button
              onClick={onClear}
              disabled={dataPoints.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/60 disabled:hover:bg-slate-800 text-slate-400 hover:text-rose-300 disabled:text-slate-600 text-xs rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              전체 비우기
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {dataPoints.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-400">아직 기록된 실험 데이터가 없습니다.</p>
              <p className="text-xs text-slate-500 mt-1">
                실험실에서 온도, 부피, 압력을 조절한 후 [데이터 기록] 버튼을 눌러 데이터를 수집하세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">기록 시각</th>
                    <th className="py-3 px-3">온도 T (K)</th>
                    <th className="py-3 px-3">부피 V (L)</th>
                    <th className="py-3 px-3">압력 P (atm)</th>
                    <th className="py-3 px-3">분자 수 n</th>
                    <th className="py-3 px-3 text-sky-400 font-bold bg-sky-950/30">P × V (보일)</th>
                    <th className="py-3 px-3 text-pink-400 font-bold bg-pink-950/30">V / T (샤를)</th>
                    <th className="py-3 px-3 text-amber-400 font-bold bg-amber-950/30">P / T (게이뤼삭)</th>
                    <th className="py-3 px-3">모드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {dataPoints.map((dp, idx) => (
                    <tr key={dp.id || idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{dp.timestamp}</td>
                      <td className="py-2.5 px-3 text-rose-400 font-semibold">{dp.temperature} K</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">{dp.volume.toFixed(1)} L</td>
                      <td className="py-2.5 px-3 text-sky-400 font-semibold">{dp.pressure.toFixed(2)} atm</td>
                      <td className="py-2.5 px-3 text-slate-300">{dp.particleCount}개</td>
                      <td className="py-2.5 px-3 font-bold text-sky-300 bg-sky-950/20">{dp.pV.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-pink-300 bg-pink-950/20">{dp.vOverT.toFixed(4)}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300 bg-amber-950/20">{dp.pOverT.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-[11px] font-sans text-slate-400">
                        {dp.mode === 'gas_laws' ? '기체 법칙' : dp.mode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Scientific Inquiry Guide Box */}
          <div className="mt-6 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              데이터 분석 및 검증 가이드 (학생용)
            </h4>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-slate-300">보일의 법칙 검증:</strong> 온도가 일정할 때, 부피 V를 변화시키면서 P × V의 곱이 오차 범위 내에서 일정한지 확인해 보세요.
              </li>
              <li>
                <strong className="text-slate-300">샤를의 법칙 검증:</strong> 압력이 일정할 때, 절대온도 T가 증가함에 따라 V / T 비율이 일정한 비례 관계를 이루는지 확인해 보세요.
              </li>
              <li>
                <strong className="text-slate-300">이상 기체 상태 방정식:</strong> (P · V) / (n · T)를 계산하면 기체 상수 R에 수렴하는 것을 관찰할 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
