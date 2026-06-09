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
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    checkQuestionLimit();
  }, []);

  const checkQuestionLimit = () => {
    const today = getLocalDateString();
    const lastDate = localStorage.getItem("lastQuestionDate");
    const countStr = localStorage.getItem("questionCountToday");
    const cachedAns = localStorage.getItem("lastQuestionAnswer");

    if (lastDate !== today) {
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
      const savedApiKey = localStorage.getItem("shin_saju_gemini_api_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedApiKey.trim()) {
        headers["x-gemini-api-key"] = savedApiKey.trim();
      }

      const res = await fetch("/api/saju/question", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          sajuData,
          userQuestion: question,
          userInfo: { name: userName },
        }),
      });

      if (!res.ok) {
        let serverError = `답변을 구하던 중 우주 주파수에 장애가 발생하였습니다. (상태코드: ${res.status})`;
        try {
          const errorText = await res.text();
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
          // ignore errorText failure
        }
        throw new Error(serverError);
      }

      const data = await res.json();
      const generatedAnswer = data.answer || "";

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
    <div className="w-full bg-[#FDFBF7] border border-[#1A1105]/15 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8C1D1D]/50" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8C1D1D]/50" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8C1D1D]/50" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8C1D1D]/50" />

      <h3 className="text-xl md:text-2xl font-brush text-[#8C1D1D] tracking-widest mb-4 flex items-center gap-2 leading-none">
        <MessageSquare className="w-5 h-5 text-[#8C1D1D] shrink-0" />
        신 우 특 문 (神佑 特問)
      </h3>

      <p className="text-xs text-[#5C5243] mb-6 leading-relaxed font-serif">
        사주의 기운을 읽고 보충하는 비책의 질문을 오직 <strong className="text-[#8C1D1D] font-bold">하루 단 한 번</strong>만 던질 수 축원 드립니다. 마음에 담은 소망을 조심스레 적어보십시오.
      </p>

      {/* Answer Area */}
      {answer && (
        <div className="mb-6 p-5 rounded-xl bg-[#FAF5EB] border border-[#1A1105]/15 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#1A1105]/10 pb-2 text-xs text-[#8C1D1D] font-bold font-serif tracking-wider">
            <Sparkles className="w-4 h-4 text-[#8C1D1D] animate-pulse" />
            <span>오늘의 신우 운명비서 (回答)</span>
            {localStorage.getItem("lastSubmittedQuestion") && (
              <span className="text-[#8C8476] italic ml-auto font-normal font-serif truncate max-w-[50%]">
                Q. "{localStorage.getItem("lastSubmittedQuestion")}"
              </span>
            )}
          </div>

          <div className="text-[#1A1105] font-serif text-[13px] md:text-[14px] leading-relaxed whitespace-pre-line text-justify pl-1 space-y-4">
            {answer.split("\n").map((para, idx) => {
              const cleanedPara = para.trim();
              if (!cleanedPara) return null;

              if (cleanedPara.startsWith("## ")) {
                return (
                  <h4 key={idx} className="text-sm font-bold text-[#8C1D1D] mt-4 mb-2 font-serif">
                    {cleanedPara.replace("## ", "")}
                  </h4>
                );
              }

              if (cleanedPara.includes("오늘 신우의 문은 여기까지입니다.")) {
                return (
                  <div key={idx} className="text-center text-[#8C1D1D] font-bold italic mt-6 border-t border-[#1A1105]/10 pt-4 font-serif">
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
              placeholder="예: 올해 가을쯤 이직을 시도하려는데 저에게 이로울까요? (신우 선생에게 정중히 질문을 적어보세요)"
              className="w-full p-4 rounded-xl bg-[#FAF5EB] border border-[#1A1105]/20 text-[#1A1105] placeholder-[#8C8476] focus:outline-none focus:border-[#8C1D1D] focus:ring-1 focus:ring-[#8C1D1D] transition-all text-xs md:text-sm leading-relaxed font-serif"
              maxLength={150}
            />
            <div className="text-[10px] text-[#8C8476] text-right mt-1 font-mono">
              {question.length} / 150
            </div>
          </div>

          {errorMsg && (
            <div className="text-[#8C1D1D] text-xs p-3 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg font-serif">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full py-3.5 px-4 rounded-full bg-[#8C1D1D] text-[#FAF5EB] font-brush text-2xl tracking-widest hover:bg-[#1A1105] disabled:bg-[#ECEFF1] disabled:text-[#90A4AE] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#FAF5EB]" />
                기운을 짚어보고 비책을 적는 중...
              </>
            ) : (
              <>
                신의 뜻 여쭙기
                <Send className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="p-6 md:p-8 rounded-xl bg-[#FAF5EB] border border-dashed border-[#8C1D1D]/30 text-center space-y-4 relative overflow-hidden">
          <div className="inline-flex p-3 rounded-full bg-[#8C1D1D]/10 border border-[#8C1D1D]/20 text-[#8C1D1D] mb-1">
            <Lock className="w-5 h-5 shrink-0" />
          </div>

          <h4 className="text-[#8C1D1D] font-bold font-serif text-sm tracking-widest uppercase">
            오늘 신우의 대문은 닫혔습니다
          </h4>
          <p className="text-[#5C5243] text-xs max-w-sm mx-auto leading-relaxed font-serif">
            “무리하여 하늘의 천기를 계속 열려 하지 마라. 기틀이 어지러워지니 삶의 해가 됨이라. 내일 새벽이 밝을 때 깊은 마음으로 다시 청하도록 하거라.”
          </p>
        </div>
      )}
    </div>
  );
}
