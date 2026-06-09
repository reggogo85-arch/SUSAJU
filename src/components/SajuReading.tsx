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

// Custom crimson/charcoal thematic colored icons for light background
const SECTION_ICONS: { [key: string]: React.ReactNode } = {
  "당신의 사주 첫인상": <Eye className="w-5 h-5 text-[#8C1D1D]" />,
  "사주의 네 기둥": <Columns className="w-5 h-5 text-[#1A1105]" />,
  "나를 움직이는 중심 기운": <Sparkles className="w-5 h-5 text-[#8C1D1D] animate-pulse" />,
  "강한 기운과 부족한 기운": <Scale className="w-5 h-5 text-[#4A5D4E]" />,
  "연애와 인연운": <Heart className="w-5 h-5 text-[#8C1D1D] animate-pulse" />,
  "직업과 재물운": <Coins className="w-5 h-5 text-[#B8860B]" />,
  "올해의 흐름": <Calendar className="w-5 h-5 text-[#8C1D1D]" />,
  "비슷한 기운의 유명인 또는 인물상": <Smile className="w-5 h-5 text-[#1A1105]" />,
  "신우의 한마디": <Quote className="w-5 h-5 text-[#8C1D1D]" />,
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
        icon: SECTION_ICONS[iconTitleKey] || <Feather className="w-5 h-5 text-[#5C5243]" />,
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
      <div className="flex flex-col items-center justify-center py-20 bg-[#FDFBF7] border-2 border-[#1A1105]/40 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8C1D1D]/70" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8C1D1D]/70" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8C1D1D]/70" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8C1D1D]/70" />
        
        {/* Traditional spinning design element */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#8C1D1D]/20 animate-[spin_25s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-double border-[#8C1D1D]/40 animate-[spin_10s_linear_infinite] [animation-direction:reverse]" />
          <div className="absolute inset-5 rounded-full bg-[#8C1D1D]/5 flex items-center justify-center border border-[#8C1D1D]/20">
            <Feather className="w-6 h-6 text-[#8C1D1D] animate-[pulse_1.8s_infinite]" />
          </div>
        </div>
        <div className="text-center px-4 max-w-md">
          <p className="text-[#8C1D1D] font-brush text-3xl tracking-widest animate-pulse select-none">
            은하계의 궤적을 짚어보는 중...
          </p>
          <p className="text-[#5C5243] text-xs mt-3 leading-relaxed font-serif">
            신우 선생이 귀하가 걸어온 기운을 모아 깊은 성찰의 글을 써 내려가고 있습니다. 잠시만 숨을 고르며 기다려 주십시오.
          </p>
        </div>
      </div>
    );
  }

  const sections = parseReadingMarkdown(reading);

  return (
    <div className="space-y-6">
      {sections.map((sec, idx) => {
        // Special render style for "신우의 한마디" (Section 9) or quotes
        const isOneLiner = sec.title.includes("신우의 한마디") || sec.title.includes("한마디");

        if (isOneLiner) {
          return (
            <div
              key={idx}
              className="relative p-6 md:p-8 rounded-2xl bg-[#FFFDF9] border-2 border-double border-[#8C1D1D] text-center shadow-sm overflow-hidden animate-[fadeIn_0.5s_ease-out]"
            >
              {/* Decorative corner brackets of scroll */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8C1D1D]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#8C1D1D]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#8C1D1D]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8C1D1D]" />
              
              <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-[#8C1D1D]/5 mb-3.5 border border-[#8C1D1D]/20">
                {sec.icon}
              </div>

              <h4 className="text-2xl font-brush text-[#8C1D1D] tracking-widest mb-3">
                {sec.title}
              </h4>

              <div className="text-[#1A1105] font-serif text-sm md:text-base leading-relaxed font-semibold italic max-w-xl mx-auto whitespace-pre-line text-center">
                "{sec.content.replace(/[\"*]/g, "")}"
              </div>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="group relative bg-[#FDFBF7] border border-[#1A1105]/15 rounded-2xl p-5 md:p-6 shadow-sm transition-all duration-300 hover:border-[#8C1D1D]/40 hover:bg-[#FFFDF9]"
          >
            {/* Elegant corner ornament */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#1A1105]/15 group-hover:border-[#8C1D1D]/40 transition-all" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#1A1105]/15 group-hover:border-[#8C1D1D]/40 transition-all" />

            {/* Section Header */}
            <div className="flex items-center gap-3 border-b border-[#1A1105]/10 pb-3 mb-4">
              <div className="p-2 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/15 group-hover:bg-[#8C1D1D]/5 group-hover:border-[#8C1D1D]/20 transition-all">
                {sec.icon}
              </div>
              <h3 className="text-base font-bold text-[#1A1105] tracking-wide font-serif">
                {sec.title}
              </h3>
            </div>

            {/* Section Content formatted beautifully */}
            <div className="text-[#3E3425] font-serif text-[13px] md:text-[14px] leading-relaxed space-y-3 whitespace-pre-line text-justify pl-1">
              {sec.content.split("\n").map((para, pIdx) => {
                if (!para.trim()) return null;
                
                // If the paragraph is a list item
                if (para.trim().startsWith("- ") || para.trim().startsWith("* ")) {
                  return (
                    <div key={pIdx} className="flex items-start gap-2 text-[#5C5243] pl-1">
                      <span className="text-[#8C1D1D] mt-1 shrink-0">•</span>
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
