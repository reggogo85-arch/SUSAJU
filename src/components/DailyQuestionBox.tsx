/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SajuData } from "../types";
import { MessageSquare, Lock, Send, HelpCircle, Loader2, Sparkles } from "lucide-react";

interface DailyQuestionBoxProps {
  sajuData: SajuData;
  userName: string;
}

export default function DailyQuestionBox({ sajuData, userName }: DailyQuestionBoxProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canAsk, setCanAsk] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getLocalDateString = (): string => {
    // Returns YYYY-MM-DD in local time
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check state on mount & when date changes
  useEffect(() => {
    checkQuestionLimit();
  }, []);

  const checkQuestionLimit = () => {
    const today = getLocalDateString();
    const lastDate = localStorage.getItem("lastQuestionDate");
    const countStr = localStorage.getItem("questionCountToday");
    const cachedAns = localStorage.getItem("lastQuestionAnswer");

    if (lastDate !== today) {
      // It's a new day! Reset limits
      localStorage.setItem("lastQuestionDate", today);
      localStorage.setItem("questionCountToday", "0");
      localStorage.removeItem("lastQuestionAnswer");
      setCanAsk(true);
      setAnswer(null);
    } else {
      const count = parseInt(countStr || "0", 10);
      if (count >= 1) {
        setCanAsk(false);
        if (cachedAns) {
          setAnswer(cachedAns);
        }
      } else {
        setCanAsk(true);
      }
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || !canAsk) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/saju/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sajuData,
          userQuestion: question,
          userInfo: { name: userName },
        }),
      });

      if (!res.ok) {
        throw new Error("답변을 구하던 중 우주 주파수에 장애가 발생하였습니다.");
      }

      const data = await res.json();
      const generatedAnswer = data.answer || "";

      // Store in localStorage
      const today = getLocalDateString();
      localStorage.setItem("lastQuestionDate", today);
      localStorage.setItem("questionCountToday", "1");
      localStorage.setItem("lastQuestionAnswer", generatedAnswer);
      localStorage.setItem("lastSubmittedQuestion", question);

      setAnswer(generatedAnswer);
      setCanAsk(false);
      setQuestion("");
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생하여 답변에 이르지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-black/60 border border-indigo-900/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md animate-[fadeIn_0.5s_ease-out]">
      {/* Mystical purple blur */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />

      <h3 className="text-base font-bold text-amber-500 font-serif uppercase tracking-[0.15em] mb-4 flex items-center gap-2 leading-none">
        <MessageSquare className="w-5 h-5 text-amber-500 animate-pulse" />
        신 우 특 문 (神佑 特問)
      </h3>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed font-serif">
        사주의 물결을 읽은 뒤 오직 <strong className="text-amber-500 font-bold">하루 단 한 번</strong>만 비책의 질문을 던질 수 있습니다. 마음 속에 물음을 귀하게 다져 그 깊은 울림을 선생께 청하십시오.
      </p>

      {/* Answer Area */}
      {answer && (
        <div className="mb-6 p-5 rounded-xl bg-indigo-950/15 border border-indigo-500/20 space-y-4 animate-[fadeIn_0.5s_ease-out] backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-indigo-950/60 pb-2 text-xs text-amber-400 font-bold font-serif tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500 animate-[pulse_1.5s_infinite]" />
            <span>오늘의 신의 비밀 서한 (回答)</span>
            {localStorage.getItem("lastSubmittedQuestion") && (
              <span className="text-slate-500 italic ml-auto font-normal font-serif truncate max-w-[50%]">
                Q. "{localStorage.getItem("lastSubmittedQuestion")}"
              </span>
            )}
          </div>

          <div className="text-slate-300 font-serif text-[13px] md:text-[14px] leading-relaxed whitespace-pre-line text-justify pl-1 space-y-4">
            {answer.split("\n").map((para, idx) => {
              const cleanedPara = para.trim();
              if (!cleanedPara) return null;

              if (cleanedPara.startsWith("## ")) {
                return (
                  <h4 key={idx} className="text-sm font-bold text-amber-400 mt-4 mb-2 font-serif">
                    {cleanedPara.replace("## ", "")}
                  </h4>
                );
              }

              if (cleanedPara.includes("오늘 신우의 문은 여기까지입니다.")) {
                return (
                  <div key={idx} className="text-center text-amber-500/90 font-bold italic mt-6 border-t border-indigo-950/80 pt-4">
                    {cleanedPara}
                  </div>
                );
              }

              return <p key={idx}>{cleanedPara}</p>;
            })}
          </div>
        </div>
      )}

      {/* Form or Lock State */}
      {canAsk ? (
        <form onSubmit={handleAsk} className="space-y-4">
          <div>
            <textarea
              name="question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 올해 가을쯤 이직을 시도하려는데 저에게 이로울까요? (신우 선생에게 정중히 물어보세요)"
              className="w-full p-4 rounded-xl bg-[#0F1121]/90 border border-indigo-950/85 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xs md:text-sm leading-relaxed font-serif"
              maxLength={150}
            />
            <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
              {question.length} / 150
            </div>
          </div>

          {errorMsg && (
            <div className="text-red-400 text-xs p-3 bg-red-950/20 border border-red-500/20 rounded-lg font-serif">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full py-3.5 px-4 rounded-lg bg-black/60 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white disabled:bg-zinc-950 disabled:text-slate-600 disabled:border-indigo-950/40 text-indigo-400 font-serif font-bold tracking-[0.15em] text-xs md:text-sm transition-all duration-350 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                기틀을 엮어 감응을 구하는 중...
              </>
            ) : (
              <>
                신의 뜻 여쭙기
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="p-6 md:p-8 rounded-xl bg-black/40 border border-dashed border-indigo-950/80 text-center space-y-4 relative overflow-hidden backdrop-blur-sm">
          <div className="inline-flex p-3 rounded-full bg-red-950/20 border border-red-500/20 text-red-400 mb-1">
            <Lock className="w-5 h-5" />
          </div>

          <h4 className="text-amber-500 font-bold font-serif text-sm tracking-[0.15em] uppercase">
            오늘 신우의 대문은 굳게 닫혔습니다
          </h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed font-serif">
            “무리하여 하늘의 천기를 계속 열려 하지 마라. 기틀이 흩어지니 삶의 해가 됨을 염려하거라. 내일 대지가 다시 깨어날 때, 그윽한 마음으로 다시 청하도록 해라.”
          </p>
        </div>
      )}
    </div>
  );
}
