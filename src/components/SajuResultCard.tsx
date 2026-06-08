/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SajuData } from "../types";

interface SajuResultCardProps {
  sajuData: SajuData;
}

const getElementColorClass = (element: string) => {
  switch (element) {
    case "wood":
      return "bg-emerald-950/40 border-emerald-500/30 text-emerald-400";
    case "fire":
      return "bg-red-950/40 border-red-500/30 text-red-400";
    case "earth":
      return "bg-amber-950/40 border-amber-600/30 text-amber-400";
    case "metal":
      return "bg-zinc-800/60 border-zinc-600/30 text-zinc-100";
    case "water":
      return "bg-indigo-950/40 border-indigo-500/30 text-indigo-300";
    default:
      return "bg-zinc-900 border-zinc-800 text-zinc-400";
  }
};

const STEMS_ELEMENT_MAP: { [key: string]: string } = {
  "갑": "wood", "을": "wood",
  "병": "fire", "정": "fire",
  "무": "earth", "기": "earth",
  "경": "metal", "신": "metal",
  "임": "water", "계": "water"
};

const BRANCHES_ELEMENT_MAP: { [key: string]: string } = {
  "자": "water", "해": "water",
  "인": "wood", "묘": "wood",
  "사": "fire", "오": "fire",
  "축": "earth", "진": "earth", "미": "earth", "술": "earth",
  "신": "metal", "유": "metal"
};

export default function SajuResultCard({ sajuData }: SajuResultCardProps) {
  const pillarsList = [
    { label: "시주 (時柱)", data: sajuData.hourPillar, desc: "노후 & 소망", relKey: "hour" as const },
    { label: "일주 (日柱)", data: sajuData.dayPillar, desc: "나 자신 (일간)", highlight: true, relKey: "day" as const },
    { label: "월주 (月柱)", data: sajuData.monthPillar, desc: "사회 & 직업", relKey: "month" as const },
    { label: "년주 (年柱)", data: sajuData.yearPillar, desc: "조상 & 집안", relKey: "year" as const },
  ];

  return (
    <div className="w-full bg-black/60 border border-indigo-900/40 rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md animate-[fadeIn_0.5s_ease-out]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-base md:text-lg font-bold font-serif text-amber-500 uppercase tracking-[0.2em]">
          사 주 팔 자 (四 柱 八 字)
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 font-serif">
          귀하의 은하계를 구성하는 네 기둥과 여덟 가닥의 기틀
        </p>
      </div>

      {/* Saju Pillars Layout */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 select-none">
        {pillarsList.map((p, idx) => {
          if (!p.data) {
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center border border-indigo-950/60 rounded-xl p-3 bg-black/40 text-center min-h-[190px] h-full"
              >
                <span className="text-[11px] font-bold font-serif text-slate-500">{p.label}</span>
                <span className="text-[10px] text-slate-600 mt-1">{p.desc}</span>
                <div className="w-px h-8 bg-indigo-950/85 my-3" />
                <span className="text-xs font-medium text-slate-600 tracking-tighter font-serif">시간 미기입</span>
              </div>
            );
          }

          const stemElem = STEMS_ELEMENT_MAP[p.data.heavenlyStem] || "earth";
          const branchElem = BRANCHES_ELEMENT_MAP[p.data.earthlyBranch] || "earth";

          return (
            <div
              key={idx}
              className={`flex flex-col items-center rounded-xl p-2 md:p-4 border transition-all duration-300 ${
                p.highlight
                  ? "border-amber-500/50 bg-[#13111f]/45 shadow-[0_0_15px_rgba(245,158,11,0.08)] scale-[1.02]"
                  : "border-indigo-950 bg-black/40"
              }`}
            >
              {/* Pillar Title */}
              <span className={`text-[11px] md:text-xs font-bold leading-none font-serif ${p.highlight ? "text-amber-400" : "text-slate-400"}`}>
                {p.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-1 font-serif truncate max-w-full text-center">{p.desc}</span>

              {/* Stem / Heavenly (천간) */}
              <div className="w-full mt-4 flex flex-col items-center">
                <div
                  className={`w-11 h-11 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-lg border shadow-inner transition-all ${getElementColorClass(
                    stemElem
                  )}`}
                >
                  <span className="text-xl md:text-2xl font-black font-serif leading-none">{p.data.stemHanja}</span>
                  <span className="text-[10px] md:text-xs font-medium mt-0.5 md:mt-1 font-serif">{p.data.heavenlyStem}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-serif mt-1">천간 (天)</span>
              </div>

              {/* Decorative Connector */}
              <div className="w-px h-3 bg-[#1e1b4b]/60" />

              {/* Branch / Earthly (지지) */}
              <div className="w-full flex flex-col items-center">
                <div
                  className={`w-11 h-11 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-lg border shadow-inner transition-all ${getElementColorClass(
                    branchElem
                  )}`}
                >
                  <span className="text-xl md:text-2xl font-black font-serif leading-none">{p.data.branchHanja}</span>
                  <span className="text-[10px] md:text-xs font-medium mt-0.5 md:mt-1 font-serif">{p.data.earthlyBranch}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-serif mt-1">지지 (地)</span>
              </div>

              {/* Relation badge underneath */}
              <div className="mt-4 px-1 sm:px-2 py-0.5 md:py-1 rounded bg-[#0A0B14] border border-indigo-950 text-[9px] sm:text-[10px] md:text-xs text-slate-400 whitespace-nowrap font-serif font-medium text-center">
                {sajuData.tenGods.pillarsRelation[p.relKey] || "비견"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper Legend */}
      <div className="mt-6 grid grid-cols-5 text-center text-[10px] md:text-xs text-slate-400 bg-black/40 py-2.5 rounded-lg border border-indigo-950/60 font-serif gap-1">
        <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 木 (초록)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> 火 (빨강)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 土 (황색)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-300" /> 金 (백색)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> 水 (청색)</span>
      </div>
    </div>
  );
}
