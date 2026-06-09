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

const SHINSAL_DESC_MAP: { [key: string]: string } = {
  "겁살": "외부 환경에 의해 재물이나 노력을 분탈 당할 우려가 있으나, 투철한 준비로 돌파하면 엄청난 실권이나 번창을 쟁취할 수 있는 야성적인 카리스마와 기회를 내포합니다.",
  "재살": "위기를 극복하기 위한 기발한 지혜와 영리함을 줍니다. 때개는 송사, 시비, 억압을 겪을 수 있으나 뛰어난 작전과 생존전략으로 가문을 일으킵니다.",
  "천살": "내 의지대로 제어하기 어려운 기운으로 하늘에서 돕거나 연단하는 에너지입니다. 겸손하게 자신을 닦고 지혜를 늘리면 비상한 합격을 이끌어냅니다.",
  "지살": "이사, 이동, 해외 이동 등 일차적인 정비를 돕는 영리한 개척을 뜻합니다. 적극적 움직임 속에 운세를 다잡고 자영업이나 사업 도약을 개진합니다.",
  "연살(도화)": "매력, 미적 감각, 인기를 총괄하는 꽃잎과도 같은 기운입니다. 사교성과 영감이 뛰어나 영업, 마케팅, 방송, 예술, 개발 등 이목을 끄는 분야에서 폭발적인 성과를 뜻합니다.",
  "월살": "칠흑 같은 어둠 속에 달빛이 영롱하듯 구제의 문을 뜻합니다. 상속, 포상금 등 우연찮은 행재를 보장하거나, 타인을 위로하는 활인업으로 큰 명성을 가집니다.",
  "망신살": "자신의 모든 비밀과 재능을 속속들이 세상에 노출하여 이목을 유도하는 힘입니다. 감출 수 없는 끼로 사람들의 호기심과 동경을 한몸에 자극하여 성공합니다.",
  "장성살": "무리의 선봉장이 되어 깃발을 지휘하는 극적인 권리입니다. 자긍심이 높고 통솔력이 뛰어나 어떠한 파란이 와도 극복하여 일가견을 이루고 정점에 도달합니다.",
  "반안살": "말안장에 오르듯 가장 한가롭고 풍요롭게 지위를 유지하는 안전의 상징입니다. 합격, 정규직 승진, 귀인의 자금 원조 등 평화로운 복록이 마르지 않음을 드러냅니다.",
  "역마살": "대륙을 동서남북으로 누비며 소통과 교역을 지탱하는 바쁜 수레를 가리킵니다. 안주하기보다 과감히 거주지나 업종을 트며 기동함으로써 막대한 부채를 갚고 부를 일굽니다.",
  "육해살": "날카로운 예민함, 직관력, 수련 정신을 가리킵니다. 사소한 막힘이나 가족의 근심을 남부러운 혜안과 진득한 기도로 보살펴 집안의 대선배로 등극하는 지혜가 있습니다.",
  "화개살": "쓸쓸하고 우아한 단풍과 같은 문예의 성정입니다. 예술, 정보기술(IT), 연구 학술, 마음에 깊은 사색을 지니며 고독 속에서 보물 같은 대작을 출산하는 원천의 힘입니다."
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

              {/* Shinsal Badge */}
              {sajuData.shinsal && sajuData.shinsal[p.relKey] && (
                <div 
                  className="mt-1.5 px-1.5 sm:px-2 py-0.5 md:py-1 rounded bg-[#1e1b4b]/40 border border-amber-500/20 text-[9px] sm:text-[10px] md:text-xs text-amber-300 font-serif font-semibold text-center hover:bg-amber-500/10 cursor-help transition-all shadow-[0_0_8px_rgba(245,158,11,0.05)] animate-pulse"
                  title={sajuData.shinsal[p.relKey]}
                >
                  ✨ {sajuData.shinsal[p.relKey]}
                </div>
              )}
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

      {/* 12 Shinsal Deep Interpretations Section */}
      {sajuData.shinsal && (
        <div className="mt-6 border-t border-indigo-900/40 pt-5 space-y-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-sm">🔮</span>
            <h4 className="text-sm font-bold text-amber-400 font-serif tracking-wider">나의 사주속 12신살(12神煞) 심층 해석</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "년주(年柱) - 초년·선대운", key: "year" as const, val: sajuData.shinsal.year },
              { label: "월주(月柱) - 청년·사회운", key: "month" as const, val: sajuData.shinsal.month },
              { label: "일주(日柱) - 장년·자신의 본질", key: "day" as const, val: sajuData.shinsal.day },
              sajuData.hourPillar ? { label: "시주(時柱) - 말년·가정운", key: "hour" as const, val: sajuData.shinsal.hour } : null
            ].filter(Boolean).map((item, id) => {
              if (!item || !item.val || item.val === "분석 불가") return null;
              
              // Map cleaned name
              const cleanName = item.val.split("(")[0];
              const desc = SHINSAL_DESC_MAP[item.val] || SHINSAL_DESC_MAP[cleanName] || "길흉화복을 조율하고 다스리는 신비로운 하늘의 이치이자 살이며 복록의 흐름입니다.";
              
              return (
                <div key={id} className="p-3 bg-indigo-950/15 border border-indigo-500/10 rounded-xl space-y-1 backdrop-blur-sm hover:border-amber-500/15 hover:bg-indigo-950/20 transition-all">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-slate-400 font-medium font-serif">{item.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold font-serif">{item.val}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-serif text-justify">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
