/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Flower } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 py-8 relative overflow-hidden">
      {/* Decorative frame elements - Corners resembling traditional Korean window paper lattice (창틀) or wooden scroll */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#8C1D1D]/70" />

      {/* Traditional Korean Royal Minhwa Artwork (일월오봉도 - Sun, Moon and Five Peaks Concept) */}
      <div className="mb-6 relative w-full max-w-[320px] md:max-w-[380px] aspect-video sm:aspect-[4/3] mx-auto bg-[#F4EFE6] border-4 border-double border-[#8C1D1D] rounded-lg p-2 md:p-3 shadow-md">
        <div className="absolute inset-0 bg-radial from-[#FAF5EB]/20 to-[#EAE2D2]/10 pointer-events-none" />
        <svg
          viewBox="0 0 200 150"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft Hanji warm sky backdrop */}
          <rect width="200" height="150" fill="#FBF9F3" />
          <path d="M 0 120 C 50 115, 150 115, 200 120 L 200 150 L 0 150 Z" fill="#E8DEC9" />
          
          {/* Distant mountains (soft pale grey wash) */}
          <path d="M 20 130 L 60 85 L 100 130" fill="#DFD5C0" opacity="0.6" />
          <path d="M 100 130 L 140 75 L 180 130" fill="#DFD5C0" opacity="0.6" />
          
          {/* Main Three Peaks in Calligraphy Brush style (Charcoal dye) */}
          {/* Peak 1 (Left) */}
          <path
            d="M 5 135 Q 45 45, 75 135 Z"
            fill="url(#brush-wood)"
            stroke="#2A2218"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Peak 2 (Center - Grand Sovereign Peak) */}
          <path
            d="M 50 135 Q 100 25, 150 135 Z"
            fill="url(#brush-rock)"
            stroke="#1A1105"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Peak 3 (Right) */}
          <path
            d="M 120 135 Q 155 55, 195 135 Z"
            fill="url(#brush-wood)"
            stroke="#2A2218"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Golden/Crimson Sun (일출 - Rising Sun of Destiny) */}
          <circle cx="150" cy="50" r="18" fill="url(#crimson-sun)" stroke="#741616" strokeWidth="0.5" />
          <circle cx="150" cy="50" r="22" fill="none" stroke="#8C1D1D" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.7" />

          {/* Silver Moon (달 - Soft moon glow representing subconscious path) */}
          <circle cx="50" cy="45" r="14" fill="url(#silver-moon)" stroke="#8FA89B" strokeWidth="0.5" />
          
          {/* Traditional cloud trails in calligraphic strokes */}
          <path d="M 10 75 C 25 70, 35 80, 50 75 C 65 70, 55 60, 45 65 Z" fill="#FFFDF9" opacity="0.85" stroke="#DFD5C0" strokeWidth="0.4" />
          <path d="M 130 95 C 145 90, 155 100, 170 95 C 185 90, 175 80, 165 85 Z" fill="#FFFDF9" opacity="0.85" stroke="#DFD5C0" strokeWidth="0.4" />

          {/* Pine trees on mountainsides (brush-strokes of wood element) */}
          <g stroke="#1A2D23" strokeWidth="1" fill="none" strokeLinecap="round">
            {/* Left Pine */}
            <path d="M 40 120 L 40 100" strokeWidth="2" stroke="#4a3b2c" />
            <path d="M 30 100 C 35 95, 45 95, 50 100" fill="#2E4C3E" strokeWidth="0.6" />
            <path d="M 32 93 C 37 88, 43 88, 48 93" fill="#2E4C3E" strokeWidth="0.6" />
            {/* Right Pine */}
            <path d="M 165 125 L 160 105" strokeWidth="1.8" stroke="#4a3b2c" />
            <path d="M 150 105 C 155 100, 165 100, 170 105" fill="#2E4C3E" strokeWidth="0.6" />
          </g>

          {/* Defs for Minhwa Textures */}
          <defs>
            <linearGradient id="crimson-sun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DF3838" />
              <stop offset="60%" stopColor="#8C1D1D" />
              <stop offset="100%" stopColor="#4A0B0B" />
            </linearGradient>
            <linearGradient id="silver-moon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFEE" />
              <stop offset="100%" stopColor="#D2DEC8" />
            </linearGradient>
            <linearGradient id="brush-rock" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CDCEBD" />
              <stop offset="70%" stopColor="#9CA392" />
              <stop offset="100%" stopColor="#6C7262" />
            </linearGradient>
            <linearGradient id="brush-wood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DFDECE" />
              <stop offset="100%" stopColor="#ACAA91" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Title block */}
      <div className="space-y-3 max-w-xl mx-auto z-10">
        <div className="flex items-center justify-center gap-1">
          <Flower className="w-3.5 h-3.5 text-[#8C1D1D] animate-spin [animation-duration:20s]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#8C1D1D] font-bold font-serif">
            인생의 은하계를 비추는 등불
          </span>
          <Flower className="w-3.5 h-3.5 text-[#8C1D1D] animate-spin [animation-duration:20s]" />
        </div>

        {/* BRUSH CALLIGRAPHY TITLE */}
        <h1 className="text-6xl md:text-8xl font-brush text-[#1A1105] tracking-widest drop-shadow-[1px_2px_2px_rgba(26,17,5,0.1)] py-1.5 select-none animate-[fadeIn_0.8s_ease-out]">
          신우사주
        </h1>

        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#8C1D1D] to-transparent mx-auto" />
        
        <p className="text-[#3E3425] text-sm md:text-base tracking-wider max-w-sm mx-auto leading-relaxed font-serif pt-2.5">
          "겉으로는 담담히 버티더라도,<br />
          발밑에 흐르는 거센 물길이 당신을 이끌어 마침내 빛나게 할 것입니다."
        </p>
      </div>

      {/* Start Button with BRUSH Calligraphy style */}
      <div className="mt-8 z-10">
        <button
          id="btn-start-reading"
          onClick={onStart}
          className="group relative px-10 py-4 border-2 border-[#8C1D1D] rounded-full bg-[#FAF5EB] text-[#8C1D1D] font-brush text-3xl md:text-4xl tracking-widest transition-all duration-300 hover:text-[#FAF5EB] hover:bg-[#8C1D1D] hover:shadow-[0_0_20px_rgba(140,29,29,0.3)] hover:scale-105 cursor-pointer shadow-md"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            운명의 문 열기
            <Sparkles className="w-6 h-6 text-[#8C1D1D] group-hover:text-[#FAF5EB] transition-colors" />
          </span>
        </button>
      </div>

      <div className="mt-12 text-[10px] md:text-xs text-[#5C5243] max-w-sm leading-relaxed pointer-events-none tracking-widest font-serif">
        명리학적 우주 비법과 직관의 풀이를 통하여<br />
        인생의 큰 흐름 속 수호와 평안을 전합니다.
      </div>
    </div>
  );
}

