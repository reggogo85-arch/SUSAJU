/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserInput, SajuData } from "./types";
import { calculateSaju } from "./utils/sajuCalculator";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import BirthInfoForm from "./components/BirthInfoForm";
import SajuResultCard from "./components/SajuResultCard";
import FiveElementChart from "./components/FiveElementChart";
import SajuReading from "./components/SajuReading";
import DailyQuestionBox from "./components/DailyQuestionBox";
import { Compass, Sparkles, ChevronLeft, RefreshCw, Feather } from "lucide-react";

type ViewState = "landing" | "form" | "result";

export default function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [sajuData, setSajuData] = useState<SajuData | null>(null);
  const [reading, setReading] = useState<string>("");
  const [isReadingLoading, setIsReadingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleStart = () => {
    setView("form");
  };

  const handleFormSubmit = async (input: UserInput) => {
    setUserInput(input);
    
    // Calculate local deterministic Saju data
    const computed = calculateSaju(
      input.birthDate,
      input.birthTime,
      input.calendarType,
      input.gender
    );
    setSajuData(computed);
    setView("result");
    setIsReadingLoading(true);
    setError("");

    try {
      const savedApiKey = localStorage.getItem("shin_saju_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedApiKey.trim()) {
        headers["x-gemini-api-key"] = savedApiKey.trim();
      }

      const response = await fetch("/api/saju/reading", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          userInfo: input,
          sajuData: computed,
          concern: input.concern,
        }),
      });

      if (!response.ok) {
        let serverError = `우주 기운 조율에 실수가 있었습니다. (상태코드: ${response.status})`;
        try {
          const errorText = await response.text();
          try {
            const errJson = JSON.parse(errorText);
            if (errJson.error) {
              serverError += ` - ${errJson.error}`;
            } else if (errJson.message) {
              serverError += ` - ${errJson.message}`;
            } else if (errJson.reason) {
              serverError += ` - ${errJson.reason}`;
            }
          } catch {
            if (errorText && errorText.length < 150) {
              serverError += ` - ${errorText}`;
            }
          }
        } catch (e) {
          // ignore reading errorText failure
        }
        throw new Error(serverError);
      }

      const data = await response.json();
      setReading(data.reading || "해해지간의 기운을 얻지 못했습니다.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "사주 해석의 선이 엉켰습니다.");
    } finally {
      setIsReadingLoading(false);
    }
  };

  const handleReset = () => {
    setView("form");
    setUserInput(null);
    setSajuData(null);
    setReading("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#0A0B14_70%)] text-slate-100 selection:bg-amber-500/20 selection:text-amber-300 font-sans flex flex-col justify-between">
      {/* Immersive navigation style header */}
      <header className="border-b border-indigo-900/50 bg-[#0A0B14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 border-2 border-amber-500 rotate-45 flex items-center justify-center bg-transparent shrink-0">
              <span className="-rotate-45 text-amber-400 font-bold text-base md:text-lg">神</span>
            </div>
            <span className="font-extrabold tracking-widest text-amber-500 text-lg md:text-xl font-serif drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]">
              신우사주
            </span>
          </div>
          
          {view === "result" && (
            <button
              id="header-btn-reset"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-400 transition-all font-medium flex items-center gap-1 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <RefreshCw className="w-3 h-3" />
              다시 부르기
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6 md:py-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <LandingPage onStart={handleStart} />
            </motion.div>
          )}

          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <BirthInfoForm onSubmit={handleFormSubmit} />
            </motion.div>
          )}

          {view === "result" && sajuData && userInput && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Top navigation back link */}
              <div className="flex justify-between items-center bg-black/60 p-3.5 rounded-xl border border-indigo-900/40 backdrop-blur-md">
                <button
                  onClick={() => setView("form")}
                  className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-500" />
                  출생 정보 수정
                </button>
                <span className="text-xs text-slate-400">
                  <strong className="text-amber-400 font-serif font-semibold">{userInput.name}</strong> 님의 명리 사주첩
                </span>
              </div>

              {/* Saju Core Pillars Block */}
              <SajuResultCard sajuData={sajuData} />

              {/* Saju Five Elements Block */}
              <FiveElementChart sajuData={sajuData} />

              {/* Saju General Notes Block */}
              <div className="h-px bg-indigo-900/20 border-none" />

              {/* Character Header For SajuReading */}
              <div className="text-center space-y-2 select-none">
                <div className="h-0.5 w-12 bg-amber-500/30 mx-auto" />
                <div className="inline-flex items-center justify-center gap-2 p-1 px-3 bg-black/60 border border-amber-900/30 rounded-full text-slate-400 font-sans text-xs">
                  <Feather className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>신우선생 수호가해(&#21321;&#23431;&#20808;&#29983;&#40664;&#31086;)</span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-400 tracking-widest">
                  심 층 사 주 통 찰
                </h3>
              </div>

              {/* Saju AI Reading Scroll */}
              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-md text-sm text-center">
                  {error}
                </div>
              )}
              <SajuReading reading={reading} isLoading={isReadingLoading} />

              {/* Daily Question limit Section */}
              {!isReadingLoading && (
                <>
                  <div className="h-px bg-indigo-900/20 border-none" />
                  <DailyQuestionBox sajuData={sajuData} userName={userInput.name} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Polished, explicit bottom warning / legal disclaimer */}
      <footer className="border-t border-indigo-900/30 bg-black/80 text-center py-6 px-4">
        <p className="max-w-2xl mx-auto text-[10px] md:text-[11px] text-slate-500 font-sans leading-relaxed select-none">
          신우사주는 명리학과 생성형 AI를 결합한 엔터테인먼트형 자기성찰 서비스입니다. <br />
          제공되는 내용은 수나 날의 절대적인 예언이 아니며, 중요한 의료·법률·투자·진로 결정은 반드시 각 분야 전문가와 개별 상담해 주세요.
        </p>
        <p className="text-[9px] text-zinc-700/60 font-sans mt-3 select-none">
          © 2026 신우사주 Sinwoo Saju. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
