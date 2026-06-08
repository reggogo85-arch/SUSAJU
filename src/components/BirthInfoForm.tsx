/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserInput } from "../types";
import { Calendar, Clock, Smile, Sparkles, AlertCircle } from "lucide-react";

interface BirthInfoFormProps {
  onSubmit: (data: UserInput) => void;
}

const CONCERNS = [
  { id: "all", label: "전체 운세 🔮" },
  { id: "year", label: "신년 운세 🗓️" },
  { id: "love", label: "연애 & 인연 💖" },
  { id: "career", label: "직업 & 승진 💼" },
  { id: "wealth", label: "재물 & 사업 💵" },
  { id: "relations", label: "인간관계 🤝" },
  { id: "health", label: "건강 & 심신 🍀" },
  { id: "academic", label: "학업 & 시험 🎓" },
];

export default function BirthInfoForm({ onSubmit }: BirthInfoFormProps) {
  const [formData, setFormData] = useState<UserInput>({
    name: "",
    birthDate: "",
    birthTime: "12:00",
    isTimeUnknown: false,
    calendarType: "solar",
    gender: "none",
    concern: "전체 운세",
  });

  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState("");

  const [timeMode, setTimeMode] = useState<"12h" | "24h">("12h");
  const [ampm, setAmPm] = useState<"AM" | "PM">("PM");
  const [hour12, setHour12] = useState<number>(12);
  const [hour24, setHour24] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);

  // Helper to sync local state back to formData.birthTime
  const syncTimeValue = (
    mode: "12h" | "24h",
    ap: "AM" | "PM",
    h12: number,
    h24: number,
    m: number
  ) => {
    let finalHour = 0;
    if (mode === "12h") {
      if (ap === "PM") {
        finalHour = h12 === 12 ? 12 : h12 + 12;
      } else { // AM
        finalHour = h12 === 12 ? 0 : h12;
      }
    } else {
      finalHour = h24;
    }
    const formattedTime = `${String(finalHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setFormData((prev) => ({ ...prev, birthTime: formattedTime }));
  };

  const handleTimeModeChange = (mode: "12h" | "24h") => {
    setTimeMode(mode);
    if (mode === "24h") {
      let current24 = hour12;
      if (ampm === "PM") {
        current24 = hour12 === 12 ? 12 : hour12 + 12;
      } else { // AM
        current24 = hour12 === 12 ? 0 : hour12;
      }
      setHour24(current24);
      syncTimeValue("24h", ampm, hour12, current24, minute);
    } else {
      let ap: "AM" | "PM" = "AM";
      let h12 = 12;
      if (hour24 >= 12) {
        ap = "PM";
        h12 = hour24 === 12 ? 12 : hour24 - 12;
      } else {
        ap = "AM";
        h12 = hour24 === 0 ? 12 : hour24;
      }
      setAmPm(ap);
      setHour12(h12);
      syncTimeValue("12h", ap, h12, hour24, minute);
    }
  };

  const handleAmPmToggle = (ap: "AM" | "PM") => {
    setAmPm(ap);
    syncTimeValue(timeMode, ap, hour12, hour24, minute);
  };

  const handleHourChange = (newHour: number) => {
    if (timeMode === "12h") {
      setHour12(newHour);
      syncTimeValue(timeMode, ampm, newHour, hour24, minute);
    } else {
      setHour24(newHour);
      syncTimeValue(timeMode, ampm, hour12, newHour, minute);
    }
  };

  const handleMinuteChange = (newMin: number) => {
    setMinute(newMin);
    syncTimeValue(timeMode, ampm, hour12, hour24, newMin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("이름 혹은 별명을 적어 주셔야 귀하를 부를 수 있습니다.");
      return;
    }
    if (!formData.birthDate) {
      setError("태어나신 생년월일 정보를 밝혀 주셔야 사주가 정해집니다.");
      return;
    }
    if (!formData.isTimeUnknown && !formData.birthTime) {
      setError("태어난 시를 모르시는 경우 '시간 모름'을 확인해 주십시오.");
      return;
    }
    if (!hasAgreed) {
      setError("개인정보 활용 및 감상 목적 안내에 직접 서명하듯 확인해 주셔야 합니다.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/60 border border-indigo-900/40 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-500/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-500/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-500/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-500/30" />

      <h2 className="text-xl md:text-2xl font-bold text-amber-500 font-serif text-center mb-6 tracking-widest flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        명 리 사 주 첩 (命理 四柱帖)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error alerting */}
        {error && (
          <div className="p-4 bg-red-950/25 border border-red-500/30 text-red-400 rounded-md text-sm flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Name / Nickname */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
            성명 / 별칭 (姓名)
          </label>
          <div className="relative">
            <Smile className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              name="name"
              id="input-name"
              value={formData.name}
              onChange={handleChange}
              placeholder="본명 또는 별명을 적어주세요 (예: 무구한 여행자)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-sans"
            />
          </div>
        </div>

        {/* Birth Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
              생년월일 (生年月日)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                name="birthDate"
                id="input-birthdate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
              태어난 시간 (出生時刻)
            </label>
            <div className={`space-y-2 p-3 rounded-xl border border-indigo-950/60 bg-[#0F1121]/50 transition-all ${
              formData.isTimeUnknown ? "opacity-35 pointer-events-none" : ""
            }`}>
              {/* Toggle to switch between 12h (AM/PM) format and 24h format */}
              <div className="flex justify-between items-center pb-2 border-b border-indigo-950/30">
                <span className="text-[11px] text-slate-400 font-serif flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                  시간형식
                </span>
                <div className="flex bg-[#05070F] rounded-md p-0.5 border border-indigo-900/40">
                  <button
                    type="button"
                    disabled={formData.isTimeUnknown}
                    onClick={() => handleTimeModeChange("12h")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                      timeMode === "12h"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    오전/오후
                  </button>
                  <button
                    type="button"
                    disabled={formData.isTimeUnknown}
                    onClick={() => handleTimeModeChange("24h")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                      timeMode === "24h"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    24시간제
                  </button>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="flex items-center gap-2">
                {timeMode === "12h" && (
                  <div className="flex rounded-lg bg-[#05070F] p-0.5 border border-indigo-950/60 shrink-0 h-10 items-center">
                    <button
                      type="button"
                      disabled={formData.isTimeUnknown}
                      onClick={() => handleAmPmToggle("AM")}
                      className={`px-2.5 py-1 text-xs font-serif font-bold rounded-md transition-all cursor-pointer h-full flex items-center ${
                        ampm === "AM"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      오전 (AM)
                    </button>
                    <button
                      type="button"
                      disabled={formData.isTimeUnknown}
                      onClick={() => handleAmPmToggle("PM")}
                      className={`px-2.5 py-1 text-xs font-serif font-bold rounded-md transition-all cursor-pointer h-full flex items-center ${
                        ampm === "PM"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      오후 (PM)
                    </button>
                  </div>
                )}

                <div className="flex-1 relative">
                  <select
                    disabled={formData.isTimeUnknown}
                    value={timeMode === "12h" ? hour12 : hour24}
                    onChange={(e) => handleHourChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#05070F]/90 border border-indigo-950/80 text-slate-200 focus:outline-none focus:border-amber-500 text-xs md:text-sm font-serif h-10 appearance-none cursor-pointer"
                  >
                    {timeMode === "12h"
                      ? Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>
                            {h === 12 ? (ampm === "AM" ? "자정 12시" : "정오 12시") : `${h}시`}
                          </option>
                        ))
                      : Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, "0")}시
                          </option>
                        ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                </div>

                <span className="text-slate-500 font-bold font-serif">:</span>

                <div className="flex-1 relative">
                  <select
                    disabled={formData.isTimeUnknown}
                    value={minute}
                    onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#05070F]/90 border border-indigo-950/80 text-slate-200 focus:outline-none focus:border-amber-500 text-xs md:text-sm font-serif h-10 appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, "0")}분
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center">
              <input
                type="checkbox"
                name="isTimeUnknown"
                id="time-unknown"
                checked={formData.isTimeUnknown}
                onChange={handleCheckboxChange}
                className="rounded border-indigo-950/80 text-amber-500 focus:ring-amber-500 accent-amber-500 bg-[#0F1121] mr-2 cursor-pointer w-4 h-4"
              />
              <label htmlFor="time-unknown" className="text-slate-400 text-xs cursor-pointer select-none">
                태어난 시간을 모릅니다 (시주 해석을 건너뜁니다)
              </label>
            </div>
          </div>
        </div>

        {/* Calendar and Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
              력법 (달력) 선택
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-400 cursor-pointer select-none transition-all has-checked:border-amber-500/50 has-checked:bg-amber-500/5 has-checked:text-amber-400 text-xs font-medium font-serif">
                <input
                  type="radio"
                  name="calendarType"
                  value="solar"
                  checked={formData.calendarType === "solar"}
                  onChange={handleChange}
                  className="sr-only"
                />
                양력 (Solar)
              </label>
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-400 cursor-pointer select-none transition-all has-checked:border-amber-500/50 has-checked:bg-amber-500/5 has-checked:text-amber-400 text-xs font-medium font-serif">
                <input
                  type="radio"
                  name="calendarType"
                  value="lunar"
                  checked={formData.calendarType === "lunar"}
                  onChange={handleChange}
                  className="sr-only"
                />
                음력 (Lunar)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
              성별 구분 (性別)
            </label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-400 cursor-pointer select-none transition-all has-checked:border-amber-500/50 has-checked:bg-amber-500/5 has-checked:text-amber-400 text-xs font-medium font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="sr-only"
                />
                남성 (乾命)
              </label>
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-400 cursor-pointer select-none transition-all has-checked:border-amber-500/50 has-checked:bg-amber-500/5 has-checked:text-amber-400 text-xs font-medium font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="sr-only"
                />
                여성 (坤命)
              </label>
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-400 cursor-pointer select-none transition-all has-checked:border-amber-500/50 has-checked:bg-amber-500/5 has-checked:text-amber-400 text-xs font-medium font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="none"
                  checked={formData.gender === "none"}
                  onChange={handleChange}
                  className="sr-only"
                />
                비공개 (無)
              </label>
            </div>
          </div>
        </div>

        {/* Concern Selection */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2 tracking-wide font-serif">
            현재 마음에 품은 가장 큰 관심사
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONCERNS.map((c) => (
              <label
                key={c.id}
                className={`py-2 rounded-lg border text-center text-xs cursor-pointer select-none transition-all font-medium flex items-center justify-center font-serif ${
                  formData.concern === c.label.split(" ")[0]
                    ? "bg-amber-500/15 border-amber-500/80 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                    : "bg-[#0F1121]/90 border-indigo-950/80 text-slate-400 hover:border-indigo-900 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="concern"
                  value={c.label.split(" ")[0]}
                  checked={formData.concern === c.label.split(" ")[0]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, concern: e.target.value }))}
                  className="sr-only"
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        {/* Traditional Border Divider */}
        <div className="pt-2">
          <div className="h-px bg-indigo-900/30" />
        </div>

        {/* Terms of Amusement Agreement Checklist */}
        <div className="p-4 rounded-lg bg-black/40 border border-indigo-900/40 space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreement"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="rounded border-indigo-950 text-amber-500 focus:ring-amber-500 accent-amber-500 bg-[#0F1121] mt-1 cursor-pointer w-4 h-4"
            />
            <label htmlFor="agreement" className="text-slate-400 text-xs leading-relaxed pl-2.5 select-none cursor-pointer font-serif">
              <span className="text-amber-500 font-bold">[확인 서명] </span>
              신우사주는 명리학과 생성형 AI 기술을 접목한 <strong>자기성찰형 문화 엔터테인먼트</strong>이며, 절대적인 예언이 아님을 인지합니다. 의학적, 법률적, 신중한 투자 판정 등 전문 영역의 최종 판단에 사주를 대행시키지 않으며, 본인의 보조 수단으로만 감상하겠습니다.
            </label>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 text-center">
          <button
            type="submit"
            id="btn-find-fate"
            className="w-full px-6 py-4 rounded-lg bg-black/60 border border-amber-500/50 text-amber-400 font-serif font-bold tracking-[0.2em] text-sm md:text-base transition-all duration-300 hover:text-zinc-950 hover:bg-amber-500 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              운 명 의 사 주 첩 열 기
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
