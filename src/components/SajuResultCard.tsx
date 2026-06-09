/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SajuData } from "../types";

interface SajuResultCardProps {
  sajuData: SajuData;
}

// Custom traditional high-contrast vibrant colors for elements (for light backgrounds)
const getElementColorClass = (element: string) => {
  switch (element) {
    case "wood":
      return "bg-[#E8F5E9] border-2 border-[#2E7D32] text-[#1B5E20]"; // 목 (초록)
    case "fire":
      return "bg-[#FFEBEE] border-2 border-[#C62828] text-[#B71C1C]"; // 화 (빨강)
    case "earth":
      return "bg-[#FFF8E1] border-2 border-[#EF6C00] text-[#E65100]"; // 토 (노랑)
    case "metal":
      return "bg-[#ECEFF1] border-2 border-[#455A64] text-[#263238]"; // 금 (백색계열)
    case "water":
      return "bg-[#E3F2FD] border-2 border-[#1565C0] text-[#0D47A1]"; // 수 (청색)
    default:
      return "bg-[#F5F5F5] border-2 border-[#9E9E9E] text-[#212121]";
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
    { label: "시주", data: sajuData.hourPillar, desc: "노후 & 소망", relKey: "hour" as const },
    { label: "일주", data: sajuData.dayPillar, desc: "나 자신 (일간)", highlight: true, relKey: "day" as const },
    { label: "월주", data: sajuData.monthPillar, desc: "사회 & 직업", relKey: "month" as const },
    { label: "년주", data: sajuData.yearPillar, desc: "조상 & 집안", relKey: "year" as const },
  ];

  return (
    <div className="w-full bg-[#FDFBF7] border-2 border-[#1A1105]/40 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md relative overflow-hidden animate-[fadeIn_0.5s_use-out]">
      {/* Decorative Traditional Border Double */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8C1D1D]/70" />

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-brush text-[#8C1D1D] tracking-widest">
          사 주 팔 자
        </h3>
        <p className="text-xs text-[#5C5243] mt-1 font-serif">
          귀하의 우주를 구성하는 네 기둥과 여덟 글자의 수호 기운
        </p>
      </div>

      {/* Saju Pillars Layout */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 select-none">
        {pillarsList.map((p, idx) => {
          if (!p.data) {
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center border border-[#1A1105]/20 rounded-xl p-2.5 bg-[#FAF5EB]/50 text-center min-h-[220px] h-full"
              >
                <span className="text-[11px] font-bold font-serif text-[#5C5243]">{p.label}</span>
                <span className="text-[9px] text-[#8C8476] mt-0.5">{p.desc}</span>
                <div className="w-12 h-[1px] bg-[#1A1105]/10 my-4" />
                <span className="text-xs font-semibold text-[#8C8476] font-serif leading-relaxed">시간<br />미기입</span>
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
                  ? "border-2 border-[#8C1D1D] bg-[#F4EFE6] shadow-sm transform scale-[1.03]"
                  : "border border-[#1A1105]/20 bg-[#FAF5EB]/40"
              }`}
            >
              {/* Pillar Title */}
              <span className={`text-xs font-bold leading-none font-serif ${p.highlight ? "text-[#8C1D1D]" : "text-[#1A1105]"}`}>
                {p.label}
              </span>
              <span className="text-[9px] text-[#5C5243] mt-1 font-serif truncate max-w-full text-center">{p.desc}</span>

              {/* Stem / Heavenly (천간) */}
              <div className="w-full mt-4 flex flex-col items-center">
                <div
                  className={`w-11 h-11 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all ${getElementColorClass(
                    stemElem
                  )}`}
                >
                  <span className="text-xl md:text-2xl font-black font-serif leading-none">{p.data.stemHanja}</span>
                  <span className="text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 font-serif">{p.data.heavenlyStem}</span>
                </div>
                <span className="text-[9px] text-[#5C5243] font-serif mt-1">천간 (天)</span>
              </div>

              {/* Decorative Connector */}
              <div className="w-1 h-3 border-l border-[#1A1105]/20 my-0.5" />

              {/* Branch / Earthly (지지) */}
              <div className="w-full flex flex-col items-center">
                <div
                  className={`w-11 h-11 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all ${getElementColorClass(
                    branchElem
                  )}`}
                >
                  <span className="text-xl md:text-2xl font-black font-serif leading-none">{p.data.branchHanja}</span>
                  <span className="text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 font-serif">{p.data.earthlyBranch}</span>
                </div>
                <span className="text-[9px] text-[#5C5243] font-serif mt-1">지지 (地)</span>
              </div>

              {/* Relation badge underneath */}
              <div className="mt-4 px-1.5 py-1 rounded bg-[#F4EFE6] border border-[#1A1105]/15 text-[10px] md:text-xs text-[#1A1105] font-serif font-bold text-center whitespace-nowrap">
                {sajuData.tenGods.pillarsRelation[p.relKey] || "비견"}
              </div>

              {/* Shinsal Badge */}
              {sajuData.shinsal && sajuData.shinsal[p.relKey] && (
                <div 
                  className="mt-1.5 px-1.5 py-0.5 rounded bg-[#8C1D1D]/5 border border-[#8C1D1D]/30 text-[10px] md:text-xs text-[#8C1D1D] font-serif font-extrabold text-center hover:bg-[#8C1D1D]/10 transition-all select-none"
                  title={sajuData.shinsal[p.relKey]}
                >
                  ⚜️ {sajuData.shinsal[p.relKey]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Legend */}
      <div className="mt-6 grid grid-cols-5 text-center text-xs text-[#3E3425] bg-[#FAF5EB] py-2 whitespace-nowrap rounded-lg border border-[#1A1105]/15 font-serif font-semibold gap-1">
        <span className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /> 木 (초록)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" /> 火 (빨강)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF6C00]" /> 土 (황색)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#455A64]" /> 金 (백색)</span>
        <span className="flex items-center justify-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" /> 水 (청색)</span>
      </div>

      {/* 12 Shinsal Deep Interpretations Section */}
      {sajuData.shinsal && (
        <div className="mt-6 border-t border-[#1A1105]/10 pt-5 space-y-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#8C1D1D] text-lg">🌸</span>
            <h4 className="text-base font-bold text-[#1A1105] font-serif tracking-wide">나의 사주 속 12신살 해석</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "년주 - 초년·선대운", key: "year" as const, val: sajuData.shinsal.year },
              { label: "월주 - 청년·사회운", key: "month" as const, val: sajuData.shinsal.month },
              { label: "일주 - 장년·자신의 본질", key: "day" as const, val: sajuData.shinsal.day },
              sajuData.hourPillar ? { label: "시주 - 말년·가정운", key: "hour" as const, val: sajuData.shinsal.hour } : null
            ].filter(Boolean).map((item, id) => {
              if (!item || !item.val || item.val === "분석 불가") return null;
              
              const cleanName = item.val.split("(")[0].trim();
              const desc = SHINSAL_DESC_MAP[item.val] || SHINSAL_DESC_MAP[cleanName] || "길흉화복을 조율하고 다스리는 신비로운 하늘의 이치이자 살이며 복록의 흐름입니다.";
              
              return (
                <div key={id} className="p-3.5 bg-[#FAF5EB] border border-[#1A1105]/15 rounded-xl space-y-1.5 shadow-sm hover:border-[#8C1D1D]/30 transition-all">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[#5C5243] font-bold font-serif">{item.label}</span>
                    <span className="px-2 py-0.5 rounded bg-[#8C1D1D]/10 text-[#8C1D1D] text-xs font-extrabold font-serif">{item.val}</span>
                  </div>
                  <p className="text-xs text-[#1A1105] leading-relaxed font-serif text-justify">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
