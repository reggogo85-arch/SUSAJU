/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Eye,
  Columns,
  Sparkles,
  Scale,
  Heart,
  Coins,
  Calendar,
  Smile,
  Quote,
  Feather,
} from "lucide-react";

interface SajuReadingProps {
  reading: string;
  isLoading: boolean;
}

interface SajuSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const SECTION_ICONS: { [key: string]: React.ReactNode } = {
  "당신의 사주 첫인상": <Eye className="w-5 h-5 text-amber-500" />,
  "사주의 네 기둥": <Columns className="w-5 h-5 text-indigo-400" />,
  "나를 움직이는 중심 기운": <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />,
  "강한 기운과 부족한 기운": <Scale className="w-5 h-5 text-teal-400" />,
  "연애와 인연운": <Heart className="w-5 h-5 text-rose-400 animate-pulse" />,
  "직업과 재물운": <Coins className="w-5 h-5 text-amber-500" />,
  "올해의 흐름": <Calendar className="w-5 h-5 text-amber-500" />,
  "비슷한 기운의 유명인 또는 인물상": <Smile className="w-5 h-5 text-indigo-400" />,
  "신우의 한마디": <Quote className="w-5 h-5 text-amber-500" />,
};

// Simple parser for offline mock markdown or generative text formats
function parseReadingMarkdown(markdownText: string): SajuSection[] {
  if (!markdownText) return [];

  const sections: SajuSection[] = [];
  const lines = markdownText.split("\n");
  
  let currentTitle = "풀이 개요";
  let currentContentLines: string[] = [];

  const addCurrentSection = () => {
    const content = currentContentLines.join("\n").trim();
    if (content) {
      // Clean up title name to match our lookup keys if needed
      let iconTitleKey = currentTitle;
      const matchedKey = Object.keys(SECTION_ICONS).find((key) =>
        currentTitle.includes(key)
      );
      if (matchedKey) iconTitleKey = matchedKey;

      sections.push({
        title: currentTitle,
        content: content,
        icon: SECTION_ICONS[iconTitleKey] || <Feather className="w-5 h-5 text-zinc-400" />,
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      addCurrentSection();
      // Extract title name, ignoring markdown numbering like "## 1. Title" -> "Title"
      const cleanTitle = line.replace(/^##\s*(?:\d+\.\s*)?/, "").trim();
      currentTitle = cleanTitle;
      currentContentLines = [];
    } else if (line.startsWith("# ")) {
      // ignore main header
    } else {
      currentContentLines.push(line);
    }
  }
  // Flush last section
  addCurrentSection();

  return sections;
}

export default function SajuReading({ reading, isLoading }: SajuReadingProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-black/60 border border-indigo-900/40 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/5 to-transparent pointer-events-none" />
        
        {/* Traditional spinning design element */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_25s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-double border-amber-500/40 animate-[spin_10s_linear_infinite] [animation-direction:reverse]" />
          <div className="absolute inset-5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Feather className="w-6 h-6 text-amber-500 animate-[pulse_1.8s_infinite]" />
          </div>
        </div>
        <div className="text-center px-4 max-w-md">
          <p className="text-amber-400 font-serif font-bold text-base tracking-widest animate-pulse">
            명상의 방에서 은하계 궤적을 해석 중...
          </p>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed font-serif">
            신우 선생이 귀하의 사주 기를 모아 통찰을 내리고 있습니다. 촛불이 안정을 되찾을 때까지 숨을 가다듬으며 기다려 주십시오.
          </p>
        </div>
      </div>
    );
  }

  const sections = parseReadingMarkdown(reading);

  return (
    <div className="space-y-6">
      {sections.map((sec, idx) => {
        // Special render style for "신우의 한마디" (Section 9)
        const isOneLiner = sec.title.includes("신우의 한마디") || sec.title.includes("한마디");

        if (isOneLiner) {
          return (
            <div
              key={idx}
              className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#1c1409]/30 via-black/60 to-[#0A0B14]/80 border border-amber-500/30 text-center shadow-2xl overflow-hidden animate-[fadeIn_0.5s_ease-out] backdrop-blur-md"
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              
              <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-amber-500/10 mb-4 border border-amber-500/25">
                {sec.icon}
              </div>

              <h4 className="text-xs uppercase font-bold tracking-[0.25em] text-amber-400 mb-4 font-serif">
                {sec.title}
              </h4>

              <div className="text-amber-100 font-serif text-sm md:text-base leading-relaxed font-medium italic max-w-xl mx-auto whitespace-pre-line">
                {sec.content.replace(/[\"*]/g, "")}
              </div>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="group relative bg-black/60 border border-indigo-900/40 rounded-2xl p-5 md:p-6 shadow-xl transition-all duration-300 hover:border-amber-500/30 hover:bg-[#131123]/30 backdrop-blur-md"
          >
            {/* Elegant corner ornament */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-indigo-950/80 group-hover:border-amber-500/40 transition-all" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-indigo-950/80 group-hover:border-amber-500/40 transition-all" />

            {/* Section Header */}
            <div className="flex items-center gap-3 border-b border-indigo-950/40 pb-3 mb-4">
              <div className="p-2 rounded-lg bg-black border border-indigo-950/80">
                {sec.icon}
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-wide font-serif">
                {sec.title}
              </h3>
            </div>

            {/* Section Content formatted beautifully */}
            <div className="text-slate-300 font-serif text-[13px] md:text-[14px] leading-relaxed space-y-3 whitespace-pre-line text-justify pl-1">
              {sec.content.split("\n").map((para, pIdx) => {
                if (!para.trim()) return null;
                
                // If the paragraph is a list item
                if (para.trim().startsWith("- ") || para.trim().startsWith("* ")) {
                  return (
                    <div key={pIdx} className="flex items-start gap-2 text-slate-400 pl-1">
                      <span className="text-amber-500 mt-1 shrink-0">•</span>
                      <span>{para.replace(/^[-*]\s*/, "")}</span>
                    </div>
                  );
                }

                // Standard paragraph
                return (
                  <p key={pIdx}>
                    {para}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
