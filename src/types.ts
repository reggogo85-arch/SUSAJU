/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  isTimeUnknown: boolean;
  calendarType: "solar" | "lunar";
  gender: "male" | "female" | "none";
  concern: string;
}

export interface Pillar {
  heavenlyStem: string;
  earthlyBranch: string;
  stemHanja: string;
  branchHanja: string;
  stemKorean: string;
  branchKorean: string;
}

export interface SajuData {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar | null;
  dayMaster: string; // e.g. "무토"
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  tenGods: {
    mainTraits: string[];
    pillarsRelation: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
  };
  luckCycle: {
    baseAge: number;
    cycles: Array<{ age: number; stem: string; branch: string }>;
  };
  notes: string[];
}

export interface SajuReadingResponse {
  reading: string;
  sajuData: SajuData;
}

export interface QuestionResponse {
  answer: string;
  timestamp: number;
}
