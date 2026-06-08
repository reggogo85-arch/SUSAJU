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
    birthTime: "",
    isTimeUnknown: false,
    calendarType: "solar",
    gender: "none",
    concern: "전체 운세",
  });

  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState("");

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
    <div className="w-full max-w-2xl mx-auto bg-black/60 border border-indigo-900/40 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
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
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="time"
                name="birthTime"
                id="input-birthtime"
                value={formData.birthTime}
                onChange={handleChange}
                disabled={formData.isTimeUnknown}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F1121]/90 border border-indigo-950/80 text-slate-200 disabled:opacity-45 disabled:bg-zinc-950 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-sans"
              />
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
