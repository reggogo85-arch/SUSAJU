/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserInput } from "../types";
import { Calendar, Clock, Smile, Sparkles, AlertCircle, Key } from "lucide-react";

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

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("shin_saju_gemini_api_key") || "";
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem("shin_saju_gemini_api_key", val.trim());
  };

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
      setError("태어난 시간을 선택해 주세요.");
      return;
    }
    if (!hasAgreed) {
      setError("신우사주 이용 동의서 내용에 확인 서명하셔야 열람하실 수 있습니다.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#FDFBF7] border-2 border-[#1A1105]/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8C1D1D]/70" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8C1D1D]/70" />

      <h2 className="text-4xl md:text-5xl text-[#1A1105] font-brush text-center mb-6 tracking-widest flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-[#8C1D1D] animate-pulse shrink-0" />
        명 리 사 주 첩
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error alerting */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-950 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#8C1D1D]" />
            <span className="font-serif font-medium">{error}</span>
          </div>
        )}

        {/* Name / Nickname */}
        <div>
          <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
            성명 / 별칭
          </label>
          <div className="relative">
            <Smile className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5243]" />
            <input
              type="text"
              name="name"
              id="input-name"
              value={formData.name}
              onChange={handleChange}
              placeholder="본명 또는 별명을 적어주세요 (예: 무구한 여행자)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#1A1105] placeholder-[#8C8476] focus:outline-none focus:border-[#8C1D1D] focus:ring-1 focus:ring-[#8C1D1D] transition-all text-sm font-serif"
            />
          </div>
        </div>

        {/* Birth Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
              생년월일
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5243]" />
              <input
                type="date"
                name="birthDate"
                id="input-birthdate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#1A1105] focus:outline-none focus:border-[#8C1D1D] focus:ring-1 focus:ring-[#8C1D1D] transition-all text-sm font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
              태어난 시간
            </label>
            <div className={`space-y-2 p-3 rounded-xl border border-[#1A1105]/10 bg-[#FAF5EB]/50 transition-all ${
              formData.isTimeUnknown ? "opacity-35 pointer-events-none" : ""
            }`}>
              {/* Toggle to switch between 12h (AM/PM) format and 24h format */}
              <div className="flex justify-between items-center pb-2 border-b border-[#1A1105]/10">
                <span className="text-[11px] text-[#5C5243] font-serif flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#8C1D1D]" />
                  시간형식
                </span>
                <div className="flex bg-[#EFECE1] rounded-md p-0.5 border border-[#1A1105]/10">
                  <button
                    type="button"
                    disabled={formData.isTimeUnknown}
                    onClick={() => handleTimeModeChange("12h")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                      timeMode === "12h"
                        ? "bg-[#FAF5EB] text-[#8C1D1D] border border-[#8C1D1D]/30 font-bold"
                        : "text-[#8C8476] hover:text-[#1A1105] border border-transparent"
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
                        ? "bg-[#FAF5EB] text-[#8C1D1D] border border-[#8C1D1D]/30 font-bold"
                        : "text-[#8C8476] hover:text-[#1A1105] border border-transparent"
                    }`}
                  >
                    24시간제
                  </button>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="flex items-center gap-2">
                {timeMode === "12h" && (
                  <div className="flex rounded-lg bg-[#FAF5EB] p-0.5 border border-[#1A1105]/20 shrink-0 h-10 items-center">
                    <button
                      type="button"
                      disabled={formData.isTimeUnknown}
                      onClick={() => handleAmPmToggle("AM")}
                      className={`px-2.5 py-1 text-xs font-serif font-bold rounded-md transition-all cursor-pointer h-full flex items-center ${
                        ampm === "AM"
                          ? "bg-[#8C1D1D]/10 text-[#8C1D1D] border border-[#8C1D1D]/20 font-extrabold"
                          : "text-[#8C8476] hover:text-[#1A1105] border border-transparent"
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
                          ? "bg-[#8C1D1D]/10 text-[#8C1D1D] border border-[#8C1D1D]/20 font-extrabold"
                          : "text-[#8C8476] hover:text-[#1A1105] border border-transparent"
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
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#1A1105] focus:outline-none focus:border-[#8C1D1D] text-xs md:text-sm font-serif h-10 appearance-none cursor-pointer"
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C5243] text-[10px]">▼</div>
                </div>

                <span className="text-[#5C5243] font-bold font-serif">:</span>

                <div className="flex-1 relative">
                  <select
                    disabled={formData.isTimeUnknown}
                    value={minute}
                    onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#1A1105] focus:outline-none focus:border-[#8C1D1D] text-xs md:text-sm font-serif h-10 appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, "0")}분
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C5243] text-[10px]">▼</div>
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
                className="rounded border-[#1A1105]/30 text-[#8C1D1D] focus:ring-[#8C1D1D] accent-[#8C1D1D] mr-2 cursor-pointer w-4 h-4"
              />
              <label htmlFor="time-unknown" className="text-[#5C5243] text-xs cursor-pointer select-none font-serif">
                태어난 시간을 모릅니다 (시주 해석을 건너뜁니다)
              </label>
            </div>
          </div>
        </div>

        {/* Calendar and Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
              력법 (달력) 선택
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#5C5243] cursor-pointer select-none transition-all has-checked:border-[#8C1D1D]/60 has-checked:bg-[#8C1D1D]/5 has-checked:text-[#8C1D1D] text-xs font-semibold font-serif">
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
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#5C5243] cursor-pointer select-none transition-all has-checked:border-[#8C1D1D]/60 has-checked:bg-[#8C1D1D]/5 has-checked:text-[#8C1D1D] text-xs font-semibold font-serif">
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
            <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
              성별 구분
            </label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#5C5243] cursor-pointer select-none transition-all has-checked:border-[#8C1D1D]/60 has-checked:bg-[#8C1D1D]/5 has-checked:text-[#8C1D1D] text-xs font-semibold font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="sr-only"
                />
                남성 (건명)
              </label>
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#5C5243] cursor-pointer select-none transition-all has-checked:border-[#8C1D1D]/60 has-checked:bg-[#8C1D1D]/5 has-checked:text-[#8C1D1D] text-xs font-semibold font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="sr-only"
                />
                여성 (곤명)
              </label>
              <label className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 text-[#5C5243] cursor-pointer select-none transition-all has-checked:border-[#8C1D1D]/60 has-checked:bg-[#8C1D1D]/5 has-checked:text-[#8C1D1D] text-xs font-semibold font-serif">
                <input
                  type="radio"
                  name="gender"
                  value="none"
                  checked={formData.gender === "none"}
                  onChange={handleChange}
                  className="sr-only"
                />
                비공개 (무)
              </label>
            </div>
          </div>
        </div>

        {/* Concern Selection */}
        <div>
          <label className="block text-[#1A1105] text-sm font-semibold mb-2 tracking-wide font-serif">
            현재 마음에 품은 가장 큰 관심사
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONCERNS.map((c) => (
              <label
                key={c.id}
                className={`py-2 rounded-lg border text-center text-xs cursor-pointer select-none transition-all font-semibold flex items-center justify-center font-serif ${
                  formData.concern === c.label.split(" ")[0]
                    ? "bg-[#8C1D1D]/10 border-[#8C1D1D] text-[#8C1D1D]"
                    : "bg-[#FAF5EB] border-[#1A1105]/20 text-[#5C5243] hover:border-[#8C1D1D]/50 hover:text-[#1A1105]"
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

        {/* Gemini API Key configuration */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-xs text-[#8C1D1D] hover:text-[#741616] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer font-serif"
          >
            <Key className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>AI 엔진 API 키 설정 (선택사항)</span>
            <span className="text-[10px] text-[#8C8476]">
              {apiKey ? "• 설정됨" : "• 기본제공 / 개인 키 사용 가능"}
            </span>
          </button>

          {showApiKeyInput && (
            <div className="mt-2.5 p-3.5 rounded-lg bg-[#FAF5EB] border border-[#1A1105]/20 space-y-2.5">
              <p className="text-[#5C5243] text-xs font-serif leading-relaxed">
                서버 API 연결이 불안정하거나 원격 할당량이 일시 초과되었을 때, 개인 구글 <strong className="text-[#8C1D1D] font-medium">Gemini API 키</strong>를 등록하여 직접 통신망을 확보할 수 있습니다. 입력하신 값은 외부로 유출되지 않으며 브라우저(<span className="text-[10px] font-mono text-[#8C1D1D]">local storage</span>)에만 안전하게 저장됩니다.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="AI Studio에서 발급받은 GEMINI_API_KEY 입력..."
                  className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#1A1105]/30 text-[#8C1D1D] placeholder-[#8C8476] focus:outline-none focus:border-[#8C1D1D] transition-all font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Traditional Border Divider */}
        <div className="pt-2">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#8C1D1D]/40 to-transparent" />
        </div>

        {/* Terms of Amusement Agreement Checklist */}
        <div className="p-4 rounded-lg bg-[#FAF5EB] border border-[#8C1D1D]/30 space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreement"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="rounded border-[#1A1105]/30 text-[#8C1D1D] focus:ring-[#8C1D1D] accent-[#8C1D1D] mt-1 cursor-pointer w-4 h-4"
            />
            <label htmlFor="agreement" className="text-[#3E3425] text-xs leading-relaxed pl-2.5 select-none cursor-pointer font-serif">
              <span className="text-[#8C1D1D] font-bold">[확인 서명] </span>
              신우사주는 명리학과 생성형 AI 기술을 접목한 <strong>자기성찰형 문화 엔터테인먼트</strong>이며, 절대적인 예언이 아님을 인지합니다. 의학적, 법률적, 신중한 투자 판단 등 전문 영역의 최종 판단에 사주를 대행시키지 않으며, 본인의 보조 수단으로만 감상하겠습니다.
            </label>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 text-center">
          <button
            type="submit"
            id="btn-find-fate"
            className="w-full px-8 py-3.5 rounded-full bg-[#8C1D1D] border-2 border-[#6e1313] text-[#FAF5EB] font-brush text-3xl md:text-4xl tracking-widest transition-all duration-300 hover:bg-[#1A1105] hover:border-black hover:scale-[1.02] cursor-pointer shadow-md"
          >
            <span className="flex items-center justify-center gap-2">
              운 명 의 사 주 첩 열 기
              <Sparkles className="w-6 h-6 text-[#FAF5EB]" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
