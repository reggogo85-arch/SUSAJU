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
    <div className="min-h-screen bg-hanji text-[#1A1105] selection:bg-[#8C1D1D]/10 selection:text-[#8C1D1D] font-sans flex flex-col justify-between">
      {/* Immersive navigation style header */}
      <header className="border-b border-[#1A1105]/10 bg-[#FAF5EB]/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 border-2 border-[#8C1D1D] rotate-45 flex items-center justify-center bg-[#8C1D1D] shrink-0">
              <span className="-rotate-45 text-[#FAF5EB] font-bold text-base md:text-lg font-serif">신</span>
            </div>
            <span className="font-brush tracking-widest text-[#1A1105] text-3xl md:text-4xl leading-none pt-1">
              신우사주
            </span>
          </div>
          
          {view === "result" && (
            <button
              id="header-btn-reset"
              onClick={handleReset}
              className="px-4 py-1.5 text-xs md:text-sm text-[#8C1D1D] bg-[#FAF5EB] border-2 border-[#8C1D1D] rounded-full hover:bg-[#8C1D1D] hover:text-[#FAF5EB] transition-all font-brush cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 운세 다잡기
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
              <div className="flex justify-between items-center bg-[#FDFBF7] p-3.5 rounded-xl border border-[#1A1105]/15 shadow-sm">
                <button
                  onClick={() => setView("form")}
                  className="text-xs text-[#5C5243] hover:text-[#1A1105] flex items-center gap-1 transition-colors cursor-pointer font-serif font-bold"
                >
                  <ChevronLeft className="w-4 h-4 text-[#8C1D1D]" />
                  출생 정보 수정
                </button>
                <span className="text-xs text-[#5C5243] font-serif">
                  <strong className="text-[#8C1D1D] font-bold">{userInput.name}</strong> 님의 명리 사주첩
                </span>
              </div>

              {/* Saju Core Pillars Block */}
              <SajuResultCard sajuData={sajuData} />

              {/* Saju Five Elements Block */}
              <FiveElementChart sajuData={sajuData} />

              {/* Saju General Notes Block */}
              <div className="h-px bg-[#1A1105]/10 border-none" />

              {/* Character Header For SajuReading */}
              <div className="text-center space-y-2 select-none">
                <div className="h-0.5 w-16 bg-[#8C1D1D]/30 mx-auto" />
                <div className="inline-flex items-center justify-center gap-2 p-1 px-3.5 bg-[#FDFBF7] border border-[#1A1105]/15 rounded-full text-[#5C5243] font-serif text-xs shadow-sm">
                  <Feather className="w-3.5 h-3.5 text-[#8C1D1D] animate-pulse" />
                  <span>신우선생의 수호가해</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-brush text-[#1A1105] tracking-widest">
                  심 층 사 주 통 찰
                </h3>
              </div>

              {/* Saju AI Reading Scroll */}
              {error && (
                <div className="p-4 bg-[#FFEBEE] border border-[#C62828]/20 text-[#8C1D1D] rounded-xl text-sm text-center font-serif font-semibold">
                  {error}
                </div>
              )}
              <SajuReading reading={reading} isLoading={isReadingLoading} />

              {/* Daily Question limit Section */}
              {!isReadingLoading && (
                <>
                  <div className="h-px bg-[#1A1105]/10 border-none" />
                  <DailyQuestionBox sajuData={sajuData} userName={userInput.name} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Polished, explicit bottom warning / legal disclaimer */}
      <footer className="border-t border-[#1A1105]/10 bg-[#FAF5EB]/95 text-center py-6 px-4">
        <p className="max-w-2xl mx-auto text-[10px] md:text-[11px] text-[#5C5243] font-serif leading-relaxed select-none">
          신우사주는 명리학과 생성형 AI를 결합한 엔터테인먼트형 자기성찰 서비스입니다. <br />
          제공되는 내용은 수나 날의 절대적인 예언이 아니며, 중요한 의료·법률·투자·진로 결정은 반드시 각 분야 전문가와 개별 상담해 주세요.
        </p>
        <p className="text-[9px] text-[#8C8476] font-serif mt-3 select-none">
          © 2026 신우사주 Sinwoo Saju. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
