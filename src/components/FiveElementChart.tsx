/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SajuData } from "../types";
import { Compass, Flame, Trees, Mountain, Shield, Coins } from "lucide-react";

interface FiveElementChartProps {
  sajuData: SajuData;
}

interface ElementDetail {
  id: string;
  name: string;
  chinese: string;
  color: string;
  barColor: string;
  icon: React.ReactNode;
  desc: string;
  count: number;
}

export default function FiveElementChart({ sajuData }: FiveElementChartProps) {
  const { fiveElements } = sajuData;
  const total = fiveElements.wood + fiveElements.fire + fiveElements.earth + fiveElements.metal + fiveElements.water || 1;

  const elements: ElementDetail[] = [
    {
      id: "wood",
      name: "목 (木)",
      chinese: "木 - 나무",
      color: "text-emerald-400 bg-emerald-500/10",
      barColor: "bg-emerald-500",
      icon: <Trees className="w-4 h-4" />,
      desc: "성장, 창조성, 인자함, 솟구치는 발전의 잠재력",
      count: fiveElements.wood,
    },
    {
      id: "fire",
      name: "화 (火)",
      chinese: "火 - 불",
      color: "text-red-400 bg-red-500/10",
      barColor: "bg-red-500",
      icon: <Flame className="w-4 h-4" />,
      desc: "열정, 화려함, 사교성, 밝혀 사르는 지각력",
      count: fiveElements.fire,
    },
    {
      id: "earth",
      name: "토 (土)",
      chinese: "土 - 흙",
      color: "text-amber-400 bg-amber-500/10",
      barColor: "bg-amber-500",
      icon: <Mountain className="w-4 h-4" />,
      desc: "믿음, 굳건함, 조율 능력, 만물을 포용하는 지반",
      count: fiveElements.earth,
    },
    {
      id: "metal",
      name: "금 (金)",
      chinese: "金 - 쇠",
      color: "text-zinc-200 bg-zinc-400/10",
      barColor: "bg-zinc-400",
      icon: <Shield className="w-4 h-4" />,
      desc: "결단력, 정의로움, 완벽주의, 예리하게 자르는 결실",
      count: fiveElements.metal,
    },
    {
      id: "water",
      name: "수 (水)",
      chinese: "水 - 물",
      color: "text-indigo-400 bg-indigo-500/10",
      barColor: "bg-indigo-500",
      icon: <Coins className="w-4 h-4" />,
      desc: "지혜, 유연함, 기민한 통찰력, 어둠 속 수렴력",
      count: fiveElements.water,
    },
  ];

  return (
    <div className="w-full bg-black/60 border border-indigo-900/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <h3 className="text-base font-bold text-amber-500 font-serif uppercase tracking-[0.15em] mb-5 flex items-center gap-2 leading-none">
        <Compass className="w-5 h-5 text-amber-500 animate-[spin_35s_linear_infinite]" />
        오행 분포 및 조화 (五행 균형)
      </h3>

      <div className="space-y-5">
        {elements.map((el) => {
          const percentage = Math.round((el.count / total) * 100);

          return (
            <div key={el.id} className="group">
              {/* Labels */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${el.color} border border-white/5`}>
                    {el.icon}
                  </div>
                  <span className="font-bold text-slate-200 font-serif">{el.name}</span>
                  <span className="text-[10px] text-slate-500 font-serif">{el.chinese}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-serif">함량: {el.count}자</span>
                  <div className="w-1 h-1 rounded-full bg-indigo-950" />
                  <span className="font-bold text-amber-500 font-sans text-xs">{percentage}%</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-2 rounded-full bg-[#0F1121] border border-indigo-950/80 overflow-hidden relative">
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full ${el.barColor} rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.05)]`}
                />
              </div>

              {/* Short explanation */}
              <p className="text-[11px] text-slate-500 mt-1 max-w-xl leading-relaxed font-serif group-hover:text-slate-300 transition-colors pl-1">
                {el.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary insights block */}
      <div className="mt-6 p-4 rounded-xl bg-[#0F1121]/50 border border-indigo-950 text-xs font-serif leading-relaxed">
        <div className="text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
          <span>💡 수호의 오행 비책 (五行 秘策):</span>
        </div>
        <ul className="space-y-1.5 text-slate-400 list-none pl-1">
          {sajuData.notes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-500 font-bold">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
