/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pillar, SajuData, UserInput } from "../types";
import KoreanLunarCalendar from "korean-lunar-calendar";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const STEMS_H_KOR = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const STEMS_DESC = ["갑목 (숲속의 큰 나무)", "을목 (유연한 화초)", "병화 (태양의 열정)", "정화 (촛불의 따스함)", "무토 (드넓은 대지)", "기토 (비옥한 정원)", "경금 (제련된 원석)", "신금 (반짝이는 보석)", "임수 (거대한 바다)", "계수 (맑은 이슬물)"];
const STEMS_ELEMENT = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];

const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const BRANCHES_H_KOR = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCHES_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const BRANCHES_ELEMENT = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"];

const getElementKor = (eng: string): string => {
  const map: { [key: string]: string } = {
    wood: "목 (木)",
    fire: "화 (火)",
    earth: "토 (土)",
    metal: "금 (金)",
    water: "수 (水)",
  };
  return map[eng] || eng;
};

// Polarity check helper
const getBranchPolarity = (idx: number): boolean => {
  const polarities: { [key: number]: boolean } = {
    0: false, // 자 (Water-)
    1: false, // 축 (Earth-)
    2: true,  // 인 (Wood+)
    3: false, // 묘 (Wood-)
    4: true,  // 진 (Earth+)
    5: true,  // 사 (Fire+)
    6: false, // 오 (Fire-)
    7: false, // 미 (Earth-)
    8: true,  // 신 (Metal+)
    9: false, // 유 (Metal-)
    10: true, // 술 (Earth+)
    11: true, // 해 (Water+)
  };
  return polarities[idx] !== false;
};

const getRelation = (dmIndex: number, targetIndex: number, isStem: boolean): string => {
  const dmPol = dmIndex % 2 === 0; // true: +, false: -
  const targetElement = isStem ? STEMS_ELEMENT[targetIndex] : BRANCHES_ELEMENT[targetIndex];
  
  let targetPol = isStem ? (targetIndex % 2 === 0) : getBranchPolarity(targetIndex);
  const samePol = dmPol === targetPol;
  const dmElem = STEMS_ELEMENT[dmIndex];
  
  const ELEM_ORDER = ["wood", "fire", "earth", "metal", "water"];
  const dmElemI = ELEM_ORDER.indexOf(dmElem);
  const targetElemI = ELEM_ORDER.indexOf(targetElement);
  
  if (dmElemI === targetElemI) {
    return samePol ? "비견" : "겁재";
  }
  if ((dmElemI + 1) % 5 === targetElemI) {
    return samePol ? "식신" : "상관";
  }
  if ((targetElemI + 1) % 5 === dmElemI) {
    return samePol ? "편인" : "정인";
  }
  if ((dmElemI + 2) % 5 === targetElemI) {
    return samePol ? "편재" : "정재";
  }
  if ((targetElemI + 2) % 5 === dmElemI) {
    return samePol ? "편관" : "정관";
  }
  return "비견";
};

export function calculateSaju(
  birthDate: string,
  birthTime: string,
  calendarType: "solar" | "lunar",
  gender: "male" | "female" | "none"
): SajuData {
  // Parsing birthdate
  const sanitizedDate = birthDate ? birthDate.replace(/[\.\/]/g, "-") : "";
  const parts = sanitizedDate.split("-");
  const year = parseInt(parts[0]) || 1990;
  const month = parseInt(parts[1]) ? parseInt(parts[1]) - 1 : 0; // 0-11
  const day = parseInt(parts[2]) || 1;

  const calendar = new KoreanLunarCalendar();
  
  if (calendarType === "lunar") {
    // parameters: lunarYear, lunarMonth, lunarDay, isIntercalation
    calendar.setLunarDate(year, month + 1, day, false);
  } else {
    // parameters: solarYear, solarMonth, solarDay
    calendar.setSolarDate(year, month + 1, day);
  }

  const gapjaKo = calendar.getKoreanGapja();
  const gapjaCh = calendar.getChineseGapja();

  // Extract Korean names and strip suffixes ('년', '월', '일') to match Saju elements
  const yStem = gapjaKo.year[0] || "갑";
  const yBranch = gapjaKo.year[1] || "자";
  const mStem = gapjaKo.month[0] || "갑";
  const mBranch = gapjaKo.month[1] || "자";
  const dStem = gapjaKo.day[0] || "갑";
  const dBranch = gapjaKo.day[1] || "자";

  // Find exact indices in global lists of STEMS and BRANCHES
  const yStemI = STEMS.indexOf(yStem) >= 0 ? STEMS.indexOf(yStem) : 0;
  const yBranchI = BRANCHES.indexOf(yBranch) >= 0 ? BRANCHES.indexOf(yBranch) : 0;
  const mStemI = STEMS.indexOf(mStem) >= 0 ? STEMS.indexOf(mStem) : 0;
  const mBranchI = BRANCHES.indexOf(mBranch) >= 0 ? BRANCHES.indexOf(mBranch) : 2; // defaults to '인'
  const dStemI = STEMS.indexOf(dStem) >= 0 ? STEMS.indexOf(dStem) : 0;
  const dBranchI = BRANCHES.indexOf(dBranch) >= 0 ? BRANCHES.indexOf(dBranch) : 0;

  // 1. Year Pillar (년주)
  const yearPillar: Pillar = {
    heavenlyStem: STEMS[yStemI],
    stemHanja: STEMS_H_KOR[yStemI],
    earthlyBranch: BRANCHES[yBranchI],
    branchHanja: BRANCHES_H_KOR[yBranchI],
    stemKorean: `${STEMS[yStemI]}${getElementKor(STEMS_ELEMENT[yStemI])}`,
    branchKorean: `${BRANCHES[yBranchI]}${BRANCHES_ANIMALS[yBranchI]}`,
  };

  // 2. Month Pillar (월주)
  const monthPillar: Pillar = {
    heavenlyStem: STEMS[mStemI],
    stemHanja: STEMS_H_KOR[mStemI],
    earthlyBranch: BRANCHES[mBranchI],
    branchHanja: BRANCHES_H_KOR[mBranchI],
    stemKorean: `${STEMS[mStemI]}${getElementKor(STEMS_ELEMENT[mStemI])}`,
    branchKorean: `${BRANCHES[mBranchI]}${BRANCHES_ANIMALS[mBranchI]}`,
  };

  // 3. Day Pillar (일주)
  const dayPillar: Pillar = {
    heavenlyStem: STEMS[dStemI],
    stemHanja: STEMS_H_KOR[dStemI],
    earthlyBranch: BRANCHES[dBranchI],
    branchHanja: BRANCHES_H_KOR[dBranchI],
    stemKorean: `${STEMS[dStemI]}${getElementKor(STEMS_ELEMENT[dStemI])}`,
    branchKorean: `${BRANCHES[dBranchI]}${BRANCHES_ANIMALS[dBranchI]}`,
  };

  const dayMaster = `${STEMS[dStemI]}${getElementKor(STEMS_ELEMENT[dStemI]).split(" ")[0]}`;

  // 4. Hour Pillar (시주)
  let hourPillar: Pillar | null = null;
  let hStemRelation = "식신";
  let hBranchI = 0;
  let hStemI = 0;

  if (birthTime) {
    const timeParts = birthTime.split(":");
    const hr = parseInt(timeParts[0]) || 0;
    const min = parseInt(timeParts[1]) || 0;

    hBranchI = getSajuHourBranchIndex(hr, min);

    // Hour Stem based on Day Stem index (dStemI)
    let hStartStem = 0;
    if (dStemI === 0 || dStemI === 5) hStartStem = 0; // 갑기 -> 갑자시
    else if (dStemI === 1 || dStemI === 6) hStartStem = 2; // 을경 -> 병자시
    else if (dStemI === 2 || dStemI === 7) hStartStem = 4; // 병신 -> 무자시
    else if (dStemI === 3 || dStemI === 8) hStartStem = 6; // 정임 -> 경자시
    else hStartStem = 8; // 무계 -> 임자시

    hStemI = (hStartStem + hBranchI) % 10;

    hourPillar = {
      heavenlyStem: STEMS[hStemI],
      stemHanja: STEMS_H_KOR[hStemI],
      earthlyBranch: BRANCHES[hBranchI],
      branchHanja: BRANCHES_H_KOR[hBranchI],
      stemKorean: `${STEMS[hStemI]}${getElementKor(STEMS_ELEMENT[hStemI])}`,
      branchKorean: `${BRANCHES[hBranchI]}${BRANCHES_ANIMALS[hBranchI]}`,
    };

    hStemRelation = getRelation(dStemI, hStemI, true);
  }

  // 5. Five Elements Calculation (오행)
  const fiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // Year elements
  fiveElements[STEMS_ELEMENT[yStemI] as keyof typeof fiveElements]++;
  fiveElements[BRANCHES_ELEMENT[yBranchI] as keyof typeof fiveElements]++;
  
  // Month elements
  fiveElements[STEMS_ELEMENT[mStemI] as keyof typeof fiveElements]++;
  fiveElements[BRANCHES_ELEMENT[mBranchI] as keyof typeof fiveElements]++;
  
  // Day elements
  fiveElements[STEMS_ELEMENT[dStemI] as keyof typeof fiveElements]++;
  fiveElements[BRANCHES_ELEMENT[dBranchI] as keyof typeof fiveElements]++;
  
  // Hour elements
  if (hourPillar) {
    fiveElements[STEMS_ELEMENT[hStemI] as keyof typeof fiveElements]++;
    fiveElements[BRANCHES_ELEMENT[hBranchI] as keyof typeof fiveElements]++;
  }

  // 6. Ten Gods (십성)
  const yStemRelation = getRelation(dStemI, yStemI, true);
  const mStemRelation = getRelation(dStemI, mStemI, true);
  const dBranchRelation = getRelation(dStemI, dBranchI, false);

  const mainTraits = Array.from(new Set([
    yStemRelation, 
    mStemRelation, 
    dBranchRelation, 
    ...(hourPillar ? [hStemRelation] : [])
  ])).slice(0, 3);

  const pillarsRelation = {
    year: yStemRelation,
    month: mStemRelation,
    day: dBranchRelation,
    hour: hourPillar ? hStemRelation : "분석 불가",
  };

  // 7. Luck Cycle (대운)
  const isYangYear = yStemI % 2 === 0;
  // standard rules: male in yang year or female in yin year goes forward, others backward
  const goesForward = (gender === "male" && isYangYear) || (gender === "female" && !isYangYear);
  const baseAge = ((day + yStemI + yBranchI) % 9) + 1; // realistic math

  const cycles: Array<{ age: number; stem: string; branch: string }> = [];
  for (let i = 0; i < 6; i++) {
    const offset = (i + 1) * (goesForward ? 1 : -1);
    const stemIdx = (mStemI + offset + 100) % 10;
    const branchIdx = (mBranchI + offset + 120) % 12;
    cycles.push({
      age: baseAge + i * 10,
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
    });
  }

  // Notes
  const notes: string[] = [];
  const strongElements = Object.entries(fiveElements)
    .filter(([_, count]) => count >= 3)
    .map(([elem, _]) => getElementKor(elem).split(" ")[0]);
  const weakElements = Object.entries(fiveElements)
    .filter(([_, count]) => count === 0)
    .map(([elem, _]) => getElementKor(elem).split(" ")[0]);

  if (strongElements.length > 0) {
    notes.push(`${strongElements.join(", ")} 기운이 매우 강한 사주팔자`);
  }
  if (weakElements.length > 0) {
    notes.push(`${weakElements.join(", ")} 기운이 부족하여 조절이 필요`);
  }
  notes.push(`일간(중심 기운)은 ${STEMS_DESC[dStemI]}`);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    fiveElements,
    tenGods: {
      mainTraits,
      pillarsRelation,
    },
    luckCycle: {
      baseAge,
      cycles,
    },
    notes,
  };
}

function getSajuHourBranchIndex(hr: number, min: number): number {
  const totalMin = hr * 60 + min;
  if (totalMin >= 1410 || totalMin < 90) return 0; // 자
  if (totalMin >= 90 && totalMin < 210) return 1; // 축
  if (totalMin >= 210 && totalMin < 330) return 2; // 인
  if (totalMin >= 330 && totalMin < 450) return 3; // 묘
  if (totalMin >= 450 && totalMin < 570) return 4; // 진
  if (totalMin >= 570 && totalMin < 690) return 5; // 사
  if (totalMin >= 690 && totalMin < 810) return 6; // 오
  if (totalMin >= 810 && totalMin < 930) return 7; // 미
  if (totalMin >= 930 && totalMin < 1050) return 8; // 신
  if (totalMin >= 1050 && totalMin < 1170) return 9; // 유
  if (totalMin >= 1170 && totalMin < 1290) return 10; // 술
  return 11; // 해
}
