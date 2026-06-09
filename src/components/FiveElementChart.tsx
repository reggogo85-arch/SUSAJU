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
  bgColor: string; // Background for progress track
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
      chinese: "나무",
      color: "text-[#1B5E20] bg-[#E8F5E9]",
      barColor: "bg-[#2E7D32]",
      bgColor: "bg-[#E8F5E9]",
      icon: <Trees className="w-4 h-4" />,
      desc: "성장, 창조성, 인자함, 솟구치는 발전의 잠재력",
      count: fiveElements.wood,
    },
    {
      id: "fire",
      name: "화 (火)",
      chinese: "불",
      color: "text-[#B71C1C] bg-[#FFEBEE]",
      barColor: "bg-[#C62828]",
      bgColor: "bg-[#FFEBEE]",
      icon: <Flame className="w-4 h-4" />,
      desc: "열정, 화려함, 사교성, 밝혀 사르는 지각력",
      count: fiveElements.fire,
    },
    {
      id: "earth",
      name: "토 (土)",
      chinese: "흙",
      color: "text-[#E65100] bg-[#FFF8E1]",
      barColor: "bg-[#EF6C00]",
      bgColor: "bg-[#FFF8E1]",
      icon: <Mountain className="w-4 h-4" />,
      desc: "믿음, 굳건함, 조율 능력, 만물을 포용하는 지반",
      count: fiveElements.earth,
    },
    {
      id: "metal",
      name: "금 (金)",
      chinese: "쇠",
      color: "text-[#263238] bg-[#ECEFF1]",
      barColor: "bg-[#455A64]",
      bgColor: "bg-[#ECEFF1]",
      icon: <Shield className="w-4 h-4" />,
      desc: "결단력, 정의로움, 완벽주의, 예리하게 자르는 결실",
      count: fiveElements.metal,
    },
    {
      id: "water",
      name: "수 (水)",
      chinese: "물",
      color: "text-[#0D47A1] bg-[#E3F2FD]",
      barColor: "bg-[#1565C0]",
      bgColor: "bg-[#E3F2FD]",
      icon: <Coins className="w-4 h-4" />,
      desc: "지혜, 유연함, 기민한 통찰력, 어둠 속 수렴력",
      count: fiveElements.water,
    },
  ];

  return (
    <div className="w-full bg-[#FDFBF7] border border-[#1A1105]/15 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8C1D1D]/50" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8C1D1D]/50" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8C1D1D]/50" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8C1D1D]/50" />

      <h3 className="text-xl md:text-2xl font-brush text-[#1A1105] tracking-widest mb-5 flex items-center gap-2 leading-none">
        <Compass className="w-5 h-5 text-[#8C1D1D] animate-[spin_35s_linear_infinite] shrink-0" />
        오행 분포 및 조화
      </h3>

      <div className="space-y-5">
        {elements.map((el) => {
          const percentage = Math.round((el.count / total) * 100);

          return (
            <div key={el.id} className="group">
              {/* Labels */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${el.color} border border-[#1A1105]/10`}>
                    {el.icon}
                  </div>
                  <span className="font-bold text-[#1A1105] font-serif">{el.name}</span>
                  <span className="text-[10px] text-[#5C5243] font-serif">- {el.chinese}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#5C5243] font-serif">함량: {el.count}자</span>
                  <div className="w-1 h-1 rounded-full bg-[#1A1105]/20" />
                  <span className="font-bold text-[#8C1D1D] font-sans text-xs">{percentage}%</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-2 rounded-full bg-[#FAF5EB] border border-[#1A1105]/10 overflow-hidden relative">
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full ${el.barColor} rounded-full transition-all duration-1000 ease-out`}
                />
              </div>

              {/* Short explanation */}
              <p className="text-[11px] text-[#5C5243] mt-1 max-w-xl leading-relaxed font-serif group-hover:text-[#1A1105] transition-colors pl-1">
                {el.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary insights block */}
      <div className="mt-6 p-4 rounded-xl bg-[#FAF5EB] border border-[#1A1105]/15 text-xs font-serif leading-relaxed">
        <div className="text-[#8C1D1D] font-bold mb-1.5 flex items-center gap-1.5">
          <span>💡 수호의 오행 비책:</span>
        </div>
        <ul className="space-y-1.5 text-[#3E3425] list-none pl-1">
          {sajuData.notes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-[#8C1D1D] font-bold">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
