/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Compass, Sparkles } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Traditional Korean style background rings */}
      <div className="absolute inset-0 bg-radial from-[#131527]/40 via-[#0A0B14] to-[#0A0B14] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-indigo-500/10 animate-spin [animation-duration:80s] pointer-events-none -z-5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-amber-500/5 animate-spin [animation-duration:120s] [animation-direction:reverse] pointer-events-none -z-5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Traditional Korean Pattern Emblem */}
      <div className="mb-8 relative">
        <div className="absolute -inset-2 bg-amber-500/20 blur-md rounded-full animate-pulse" />
        <div className="w-16 h-16 border-2 border-amber-500 rotate-45 flex items-center justify-center bg-[#0F1121] text-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <span className="-rotate-45 font-bold text-2xl font-serif">神</span>
        </div>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-500/80 font-bold">인생의 은하계를 비추는 등불</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-[#ead8bf] font-serif drop-shadow-[0_0_12px_rgba(234,216,191,0.2)]">
          신우사주
        </h1>
        <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        <p className="text-slate-300 text-sm md:text-base tracking-wider max-w-sm mx-auto leading-relaxed font-serif pt-2">
          "겉으로는 담담히 버티더라도,<br />
          발밑에 흐르는 거센 물길이 당신을 이끌어 마침내 빛나게 할 것입니다."
        </p>
      </div>

      <div className="mt-10">
        <button
          id="btn-start-reading"
          onClick={onStart}
          className="group relative px-8 py-4 rounded-md bg-black/60 border border-amber-500/40 text-amber-400 font-serif font-bold tracking-[0.15em] text-sm md:text-base transition-all duration-300 hover:text-zinc-950 hover:bg-amber-500 hover:border-amber-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            운명(運命)의 문 열기
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-zinc-950" />
          </span>
        </button>
      </div>

      <div className="mt-16 text-[10px] md:text-xs text-slate-500 max-w-sm leading-relaxed pointer-events-none tracking-wide">
        명리학적 우주 비법과 직관의 풀이를 통하여<br />
        인생의 큰 흐름 속 수호와 평안을 전합니다.
      </div>
    </div>
  );
}
