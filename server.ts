/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Successfully initialized Google GenAI client.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI client:", err);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY not found or is placeholder. Server will run with beautiful offline fallback.");
}

// Dynamically retrieve Gemini AI client based on custom key or environment variables
function getAiClient(customKey?: string): GoogleGenAI | null {
  let activeKey = customKey || process.env.GEMINI_API_KEY;
  if (!activeKey) {
    return null;
  }
  activeKey = activeKey.trim();
  if (
    activeKey === "" ||
    activeKey === "MY_GEMINI_API_KEY" ||
    activeKey === "undefined" ||
    activeKey === "null"
  ) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize Google GenAI client dynamically:", err);
    return null;
  }
}

// Helper to call Gemini with automatic retries and fallback models block
async function generateSajuContentWithFallback(
  activeAi: any,
  options: { contents: string; temperature?: number }
): Promise<string> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 2; // Retry twice per model on transient errors (total 3 attempts)
    while (retries >= 0) {
      try {
        console.log(`[신우사주] Attempting generation with model "${model}"... (retries left: ${retries})`);
        const response = await activeAi.models.generateContent({
          model: model,
          contents: options.contents,
          config: {
            temperature: options.temperature ?? 0.8,
          },
        });
        if (response && response.text) {
          console.log(`[신우사주] Successfully generated content using model: ${model}`);
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[신우사주] Failed generation with ${model} (retries: ${retries}):`, err.message || err);

        const errMsg = (err.message || "").toLowerCase();
        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("unavailable") || 
                            errMsg.includes("high demand") || 
                            errMsg.includes("rate limit") || 
                            errMsg.includes("429") ||
                            err.status === 503 ||
                            err.status === 429;

        if (isTransient && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          retries--;
        } else {
          break; // Try fallback model
        }
      }
    }
  }
  throw lastError || new Error("All model generation attempts failed.");
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiInitialized: !!ai });
});

// 2. Primary Saju Reading Endpoint
app.post("/api/saju/reading", async (req, res) => {
  const { userInfo, sajuData, concern } = req.body;
  const customKey = req.headers["x-gemini-api-key"] as string || req.headers["x-api-key"] as string || undefined;

  if (!userInfo || !sajuData) {
    return res.status(400).json({ error: "Missing userInfo or sajuData" });
  }

  const promptInput = `
너는 한국식 명리학과 사주 상담 콘셉트를 가진 AI 역술인 “신우 선생”이다.

사용자가 입력한 출생정보와 사주 계산 결과를 바탕으로 사주 풀이를 작성해라.

중요 원칙:
1. 사주 계산 결과에 없는 내용은 지어내지 마라.
2. 명리학 용어를 사용하되 초보자도 이해할 수 있게 설명해라.
3. 무당의 신점처럼 직관적이고 몰입감 있는 문장을 섞어라.
4. 단정적 예언이 아니라 가능성과 흐름 중심으로 말해라.
5. 사용자가 불안해하지 않도록 현실적인 조언을 포함해라.
6. 의료, 법률, 투자, 도박, 생명과 안전에 관한 결정은 전문가 상담을 권해라.
7. 유명인 예시는 실제 정보가 확실하지 않으면 단정하지 말고, “비슷한 인물상”으로 설명해라.
8. 답변은 한국어로 작성해라.

사용자 정보:
이름/별명: ${userInfo.name}
생년월일: ${userInfo.birthDate} (${userInfo.calendarType === "solar" ? "양력" : "음력"})
태어난 시간: ${userInfo.isTimeUnknown ? "모름" : userInfo.birthTime}
성별: ${userInfo.gender === "male" ? "남성" : userInfo.gender === "female" ? "여성" : "선택하지 않음"}

사주 계산 결과:
년주 (연기둥): ${sajuData.yearPillar.heavenlyStem}${sajuData.yearPillar.earthlyBranch} (${sajuData.yearPillar.stemHanja}${sajuData.yearPillar.branchHanja})
월주 (월기둥): ${sajuData.monthPillar.heavenlyStem}${sajuData.monthPillar.earthlyBranch} (${sajuData.monthPillar.stemHanja}${sajuData.monthPillar.branchHanja})
일주 (일기둥): ${sajuData.dayPillar.heavenlyStem}${sajuData.dayPillar.earthlyBranch} (${sajuData.dayPillar.stemHanja}${sajuData.dayPillar.branchHanja})
시주 (시기둥): ${sajuData.hourPillar ? `${sajuData.hourPillar.heavenlyStem}${sajuData.hourPillar.earthlyBranch} (${sajuData.hourPillar.stemHanja}${sajuData.hourPillar.branchHanja})` : "시간 모름 (인식불가)"}

일간(나의 본질): ${sajuData.dayMaster}
오행분포: 목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
특징 및 신살/십성 단서: ${sajuData.notes ? sajuData.notes.join(", ") : ""}

사용자의 최대 고민 분야: ${concern || "전체 운세"}

출력 형식:

# 신우사주 풀이

## 1. 당신의 사주 첫인상
사용자의 사주를 한 문단으로 인상 깊게 설명해라. ("이 사주는 겉으로는 담담해 보이지만..." 스타일)

## 2. 사주의 네 기둥
년주, 월주, 일주, 시주의 의미를 쉽게 설명해라.

## 3. 나를 움직이는 중심 기운
일간과 오행 균형을 바탕으로 본인의 원래 기질적 성향을 풀어내라.

## 4. 강한 기운과 부족한 기운
강한 오행과 약한 오행이 삶에서 장단점으로 어떻게 드러나는지 설명해라.

## 5. 연애와 인연운
관계 패턴, 끌리는 사람, 조심할 관계 방식을 설명해라.

## 6. 직업과 재물운
잘 맞는 일의 방향, 돈이 모이는 방식, 피해야 할 선택을 설명해라.

## 7. 올해의 흐름
올해의 운세를 기회, 주의점, 행동 조언으로 나누어 신우 선생 특유의 말투로 조언해라.

## 8. 비슷한 기운의 유명인 또는 인물상
사용자와 비슷한 기운을 가진 역사적 인물이나 대중적 흐름인 상(예: '비바람을 견디는 소나무 같은 장수', '들판을 비추는 촛불 같은 정치가')을 비유로 설명해라. 확실치 않은 특정 실존 인물의 정확한 생년월일을 단정하지 말고 개연성 있는 흐름으로만 비유해라.

## 9. 신우의 한마디
마지막에 짧고 깊숙이 파고드는 경구와도 같은 한 문장을 홀로 남겨라.
`;

  const activeAi = getAiClient(customKey);

  if (!activeAi) {
    // Elegant Offline Mock Fallback in case of missing keys
    return res.json({ 
      reading: getFallbackReading(userInfo, sajuData, concern),
      isFallback: true,
      reason: "API key is not configured"
    });
  }

  try {
    const text = await generateSajuContentWithFallback(activeAi, {
      contents: promptInput,
      temperature: 0.85,
    });
    res.json({ reading: text, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Saju generation error:", error);
    // Dynamic graceful fallback to protect user experience from error screens
    res.json({ 
      reading: getFallbackReading(userInfo, sajuData, concern),
      isFallback: true,
      reason: error.message || "Gemini API call failed"
    });
  }
});

// 3. Daily Question Endpoint
app.post("/api/saju/question", async (req, res) => {
  const { sajuData, userQuestion, userInfo } = req.body;

  if (!sajuData || !userQuestion) {
    return res.status(400).json({ error: "Missing sajuData or userQuestion" });
  }

  const promptInput = `
너는 AI 역술인 “신우 선생”이다.

사용자는 오늘 단 한 번만 질문할 수 있다.
따라서 답변은 짧지만 매우 깊이 있고 명쾌하게 작성해라.

사용자의 기본 사주 정보:
일주: ${sajuData.dayPillar.heavenlyStem}${sajuData.dayPillar.earthlyBranch}
일간: ${sajuData.dayMaster}
오행: 목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
특징: ${sajuData.notes ? sajuData.notes.join(", ") : ""}

사용자의 질문:
"${userQuestion}"

답변 원칙:
1. 질문에 직접적이고 솔직하게 답해라.
2. 주어진 날짜/사주 흐름과 오행 균형을 근거로 설명해라.
3. 신점처럼 직관적이고 사색적인 표현을 섞어라.
4. 하지만 무조건적인 예언이나 공포 조장은 하지 마라.
5. 현실적으로 오늘부터 할 수 있는 일상 속 행동 조언을 1~2개 제시해라.
6. 의료, 법률, 금전 투자, 도박, 안전 문제는 직접 결정을 내려주는 대신 신중히 타협하라고 조언해라.
7. 답변 마지막에는 반드시 다음 형식을 똑같이 준수하여 끝맺어라:
“오늘 신우의 문은 여기까지입니다.”

출력 형식:

## 신우의 답

[질문에 대한 명쾌하고 심금을 울리는 핵심 답변]

## 왜 그렇게 보이는가

[사주학적 분석 및 오행 흐름 설명]

## 지금 해야 할 일

[현실적인 행동 조언]

## 오늘의 문장

“오늘 신우의 문은 여기까지입니다.”
`;

  const customKey = req.headers["x-gemini-api-key"] as string || req.headers["x-api-key"] as string || undefined;
  let activeAi = getAiClient(customKey);

  if (!activeAi) {
    return res.json({ 
      answer: getFallbackQuestionAnswer(userQuestion, sajuData),
      isFallback: true,
      reason: "API key is not configured"
    });
  }

  try {
    const text = await generateSajuContentWithFallback(activeAi, {
      contents: promptInput,
      temperature: 0.8,
    });
    res.json({ answer: text, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Question error:", error);
    // Graceful fallback on API generation error
    res.json({ 
      answer: getFallbackQuestionAnswer(userQuestion, sajuData),
      isFallback: true,
      reason: error.message || "Gemini API call failed"
    });
  }
});

// Setup Vite Dev server or Serve static files
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[신우사주 Server] online on port ${PORT}`);
  });
}

// Only mount Vite middleware and start listening if not running on Vercel
if (!process.env.VERCEL) {
  mountViteMiddleware();
}

export default app;

// -------------------------------------------------------------
// Deep Traditional Saju Reference Databases for Local Fallback
// -------------------------------------------------------------
const SHINSAL_DESC_MAP: { [key: string]: string } = {
  "겁살": "외부 환경에 의해 재물이나 노력을 분탈 당할 우려가 있으나, 투철한 준비로 돌파하면 엄청난 실권이나 번창을 쟁취할 수 있는 야성적인 카리스마와 기회를 내포합니다.",
  "재살": "위기를 극복하기 위한 기발한 지혜와 영리함을 줍니다. 때로는 송사, 시비, 억압을 겪을 수 있으나 뛰어난 작전과 생존전략으로 가문을 일으킵니다.",
  "천살": "내 의지대로 제어하기 어려운 기운으로 하늘에서 돕거나 연단하는 에너지입니다. 겸손하게 자신을 닦고 지혜를 늘리면 비상한 합격을 이끌어냅니다.",
  "지살": "이사, 이동, 해외 이동 등 일차적인 정비를 돕는 영리한 개척을 뜻합니다. 적극적 움직임 속에 운세를 다잡고 자영업이나 사업 도약을 개진합니다.",
  "연살(도화)": "매력, 미적 감각, 인기를 총괄하는 꽃잎과도 같은 기운입니다. 사교성과 영감이 뛰어나 영업, 마케팅, 방송, 예술, 개발 등 이목을 끄는 분야에서 폭발적인 성과를 뜻합니다.",
  "연살": "매력, 미적 감각, 인기를 총괄하는 꽃잎과도 같은 기운입니다. 사교성과 영감이 뛰어나 영업, 마케팅, 방송, 예술, 개발 등 이목을 끄는 분야에서 폭발적인 성과를 뜻합니다.",
  "도화살": "매력, 미적 감각, 인기를 총괄하는 꽃잎과도 같은 기운입니다. 사교성과 영감이 뛰어나 영업, 마케팅, 방송, 예술, 개발 등 이목을 끄는 분야에서 폭발적인 성과를 뜻합니다.",
  "월살": "칠흑 같은 어둠 속에 달빛이 영롱하듯 구제의 문을 뜻합니다. 상속, 포상금 등 우연찮은 행재를 보장하거나, 타인을 위로하는 활인업으로 큰 명성을 가집니다.",
  "망신살": "자신의 모든 비밀과 재능을 속속들이 세상에 노출하여 이목을 유도하는 힘입니다. 감출 수 없는 끼로 사람들의 호기심과 동경을 한몸에 자극하여 성공합니다.",
  "장성살": "무리의 선봉장이 되어 깃발을 지휘하는 극적인 권리입니다. 자긍심이 높고 통솔력이 뛰어나 어떠한 파란이 와도 극복하여 일가견을 이루고 정점에 도달합니다.",
  "반안살": "말안장에 오르듯 가장 한가롭고 풍요롭게 지위를 유지하는 안전의 상징입니다. 합격, 정규직 승진, 귀인의 자금 원조 등 평화로운 복록이 마르지 않음을 드러냅니다.",
  "역마살": "대륙을 동서남북으로 누비며 소통과 교역을 지탱하는 바쁜 수레를 가리킵니다. 안주하기보다 과감히 거주지나 업종을 트며 기동함으로써 막대한 부채를 갚고 부를 일굽니다.",
  "육해살": "날카로운 예민함, 직관력, 수련 정신을 가리킵니다. 사소한 막힘이나 가족의 근심을 남부러운 혜안과 진득한 기도로 보살펴 집안의 대선배로 등극하는 지혜가 있습니다.",
  "화개살": "쓸쓸하고 우아한 단풍과 같은 문예의 성정입니다. 예술, 정보기술(IT), 연구 학술, 마음에 깊은 사색을 지니며 고독 속에서 보물 같은 대작을 출산하는 원천의 힘입니다."
};

const DAY_MASTER_DETAILS: { [key: string]: { description: string, personality: string, elementText: string, famous: string, advice: string } } = {
  "갑목": {
    description: "갑목 (甲木 - 곧게 뻗은 아름다운 낙엽송)",
    personality: "하늘을 찌를 듯 솟아오르는 기상을 지닌 거목과 같습니다. 성정이 곧고 정직하며 굽히기를 싫어해 남들보다 독립심이 강하고 리더십이 탁월합니다. 불의를 참지 않으며 자존심이 세지만, 그만큼 타인을 책임지는 마음 또한 풍부한 당당한 나무입니다.",
    elementText: "목(木)의 기운이 기둥에 깃들어 있어, 무한한 번창과 성장, 새로운 돌파구를 찾는 에너지가 탁월합니다. 자칫 고집이 앞서면 꺾이기 쉬우니 때로는 유연하게 숙이는 부드러움을 갖추는 것이 명예를 수호하는 비결입니다.",
    famous: "꿋꿋한 기상으로 풍파를 헤치고 대들보가 된 강직한 학자 혹은 비바람을 견디는 만고의 소나무",
    advice: "“억지로 새벽을 당기려 하지 말거라. 나무가 깊이 뿌리내릴 시간이 곧 너의 위대한 결실임을 전하노라.”"
  },
  "을목": {
    description: "을목 (乙木 - 담벼락을 이겨내는 예쁜 화초와 넝쿨)",
    personality: "외유내강의 표본입니다. 비바람 부는 들판의 어여쁜 꽃잎이나 밤하늘을 수놓는 담쟁이넝쿨처럼 겉은 부드러우나 결코 기죽거나 마르지 않는 강인한 끈기를 갖췄습니다. 친화력이 뛰어나 주변과 상생하며 조화를 일구고 실속을 확보하는 수완가입니다.",
    elementText: "부드럽고 끈질기며 뛰어난 친화력을 보여줍니다. 현실적인 적응력이 최고조에 달해 어떤 상황에서도 이로운 입지를 구축합니다. 변덕과 심적 불안함을 억제하고 대인 관계에서 은근한 온정으로 대처하면 대박을 마주합니다.",
    famous: "거친 바위틈에서 향기로운 품격의 꽃을 틔워낸 만인의 난초 같은 은둔 공예가",
    advice: "“바위를 휘감아 결국 하늘로 솟아나듯, 귀하의 부드러운 영민함이 시대의 가치관을 관통할 것이라.”"
  },
  "병화": {
    description: "병화 (丙火 - 대지를 정열적으로 밝히는 찬연한 태양)",
    personality: "어둠에 휩싸인 만상을 아낌없이 정열적으로 비추는 태양의 격입니다. 기질이 대단히 명랑하며 솔직담백하고 뒤끝이 전혀 없습니다. 추진력과 에너지가 뛰어나 무리를 밝히는 영웅적인 역할을 선호하고 감출 수 없는 찬란한 위엄을 과시합니다.",
    elementText: "화(火)의 기원으로 가슴에 찬란한 이상과 정열을 잉태하고 있습니다. 솔직하고 시원시원하여 만인의 등대가 됩니다. 다만 본인의 감정 기복이 지나쳐 성급하게 결단을 지었다가 자책할 염려가 있으니 차가운 금수의 지혜를 수시로 빌리십시오.",
    famous: "군중을 시원스레 이끌어 개척의 길을 개진하던 정열의 지도자 혹은 만인에게 사랑받는 예인",
    advice: "“태양이 잠깐 구름 뒤로 수그러들지언정 광채는 불변하나니, 일시적인 침잠에 조바심을 부리지 마라.”"
  },
  "정화": {
    description: "정화 (丁火 - 밤하늘의 쓸쓸한 어둠을 이겨내는 은은한 촛불)",
    personality: "칠흑 같은 어둠 속에서 가만히 세상을 지키는 촛불이자 등대와 같은 기둥입니다. 예의를 지극히 바르게 수호하며, 따뜻한 마음과 은근한 인덕을 가두어 사람들을 조용히 돕습니다. 정신적이고 남들의 상처를 치료해 주는 활인의 분야에서 눈부신 영감을 가집니다.",
    elementText: "내밀하게 타오르는 화(火)의 귀한 정수로, 문예와 영적인 직관력이 깊숙이 성립되어 있습니다. 타인을 배려하는 안목이 섬세하되, 내면의 사소한 집착과 오기 때문에 홀로 고독과 불면의 밤을 보낼 수 있으니 마음 자리를 정돈히 방치하는 법을 전합니다.",
    famous: "외롭고 번민 많은 세속의 사람들에게 참된 등대로서 보혜를 가르쳐 이끈 위대한 철학가",
    advice: "“빛 한 줄기가 만 갈래의 어둠을 순식간에 관통하듯, 네 마음의 청명한 불씨가 만사를 밝히게 되노라.”"
  },
  "무토": {
    description: "무토 (戊土 - 드넓은 영토이자 풍파를 담대히 막아서는 태산)",
    personality: "매서운 눈비 바람 속에서도 끝끝내 평정심을 잃지 않는 은혜롭고 듬직한 산맥의 상입니다. 신용을 목숨처럼 아끼며 웬만한 풍파 일희일비에는 가볍게 흔들리거나 감정을 표출하지 않는 우직함이 있습니다. 사람들을 골고루 돌보고 품는 배포가 큽니다.",
    elementText: "우주의 모든 극성과 갈등을 완충해 주는 넓은 대지의 기틀입니다. 고집과 철학이 산맥처럼 단단하여 정직을 보장합니다. 다만 가끔은 너무 완고하고 아집에 휩싸여 다른 이의 기발한 교류 제의를 무조건 외면할 염려가 있으니 활짝 문을 터야 합니다.",
    famous: "백성과 부하들을 성채와 같이 든든히 지켜내어 국가의 수장으로 멸성을 남긴 대장군",
    advice: "“거대한 산맥은 먼저 길을 채근하지 않아도 만물이 모이듯, 너희 두터운 신용으로 만복을 다스려라.”"
  },
  "기토": {
    description: "기토 (己土 - 온갖 보석과 생명을 수확케 만드는 비옥한 논밭)",
    personality: "씨앗과 보석을 소중히 받아 가꾸어 대성시키는 기품 어린 옥토와 같습니다. 섬세하고 실무적인 능력이 뛰어나며 대단히 자애롭고 포용적입니다. 생활 역정이 끈기 있고 단단하여 불필요한 결손을 사소하게 저지르지 않는 주부이자 참謀의 저력이 탁월합니다.",
    elementText: "실속과 알토란 같은 보물을 생산하는 보람찬 토(土)의 성정입니다. 사리분별이 이치에 맞게 정밀하고 주변인들을 소소하게 가꿉니다. 가랑비처럼 사소한 근정으로 만성 염려증에 허덕여 영혼의 안락을 저해치 말고 넓고 멀리 내지르는 안목을 갖추어야 합니다.",
    famous: "황무지를 개간하여 마침내 풍요로운 식량과 곡간을 구제해 가솔들을 먹여 살려낸 의로운 개국공신",
    advice: "“비옥한 흙 밑에는 영롱한 황금 보석이 숨겨져 있으니, 성급하게 가시밭에 상처 입어 통곡치 말거라.”"
  },
  "경금": {
    description: "경금 (庚金 - 당당하고 굳센 의리의 원쇠이자 보검 원석)",
    personality: "가을 장엄한 서릿발이나 투박하지만 웅장한 바위산의 원석과 같습니다. 매사 의리가 두텁고 강직하며, 겉레와 낭비를 단호하게 거절하여 사전에 쳐냅니다. 목표 지점을 설정했다면 어떤 거센 수렁에도 가차 없이 돌입하는 야성적 승부사이자 명장입니다.",
    elementText: "단단한 가치가 절정으로 깃든 금(金)의 기둥입니다. 결단력이 천하를 제패하듯 압도적으로 수립되어 매듭짓고자 노력합니다. 용광로의 불같은 정비(제련)를 통과하여 보검이 되듯 고난을 발판 삼아 군림할 수 있는 역동의 천재입니다.",
    famous: "불의와 타협하지 않고 자신의 목숨만큼 선대와 신념을 수호하던 천하의 충신과 전장의 명장",
    advice: "“단단한 쇳덩이는 뜨거운 고난의 화염을 마주해야 찬란한 영웅의 보검으로 가치를 드러냄을 잊지 마라.”"
  },
  "신금": {
    description: "신금 (辛金 - 세상을 화려하게 사로잡는 아름다운 보석과 은장도)",
    personality: "정밀하게 눈부시도록 가공된 찬연한 다이아몬드나 차갑지만 예리하게 빛나는 귀한 명도와 같습니다. 성품이 대단히 깔끔하고 완벽에 가깝게 성실하며 미적 안목과 지능이 독보적입니다. 통념을 깨는 자신만의 드높은 질서와 격조를 구축합니다.",
    elementText: "가장 보석다운 찬란함과 비판성을 함께 갖춘 우아한 금(金)의 속성입니다. 유행과 실세를 낚아채는 직감과 계산 능력이 극도로 발달해 있습니다. 본인의 차가운 말투와 기질로 아끼는 인연들의 영혼에 생채기를 내지 않도록 말을 담장에 담아야 길합니다.",
    famous: "가문에서 조용히 장엄한 학문을 완성하여 궁궐의 사서와 사법을 규율하던 고고한 선비",
    advice: "“고귀한 보석은 맑고 깨끗한 씻음으로 광채를 내나니, 지저분한 이단 논쟁에 가벼이 몸을 떨지 말거라.”"
  },
  "임수": {
    description: "임수 (壬水 - 도도히 넓은 평야를 가로지르는 광활한 대양)",
    personality: "모든 지류를 아무런 차별 없이 삼켜 심오함을 장식하는 거대하고 깊은 바다와 같습니다. 뇌회전이 번개같이 비상하고 주변 상황에 맞게 제 모양을 바꾸는 유연한 순응력과 친화력을 함께 보유했습니다. 대인 처세가 너그럽고 스케일이 웅대합니다.",
    elementText: "만물이 태동하는 지혜와 천재성을 가두어 둔 수(水)의 위용입니다. 옭아매려는 규범이나 조직 속에 갇히기 싫어하는 방랑과 철학이 있습니다. 겉으로 수용하는 듯하지만 남들이 다가오기 어려운 자신만의 깊은 음밀함을 조율하여 정숙히 소통해야 복이 큽니다.",
    famous: "넓고 너른 해안가 교역을 도모해 국가에 필적할 막대한 상재를 모았던 위대한 거상과 탐험가",
    advice: "“가벼운 바람에는 바다의 표면만 물결칠 뿐, 깊고 도도히 흐르는 본연의 지혜는 늘 마르지 않노라.”"
  },
  "계수": {
    description: "계수 (癸水 - 산천초목을 생명으로 정성껏 소생시키는 이슬과 봄비)",
    personality: "가뭄 든 대지를 보살피듯 하늘빛 구름에서 촉촉이 내리는 생명수이자 새옹의 맑은 옹달샘과 같습니다. 성정이 지극히 사려 깊고 적응력이 비상하며 고요합니다. 남을 빛내고 참다운 아이디어를 창조해 기여하는 참된 후원이나 영성 창작에 가치가 큽니다.",
    elementText: "가장 순결하고 맑은 수(水)의 핵심으로 지능과 임기응변, 마음 챙김의 능력이 뛰어납니다. 다만 가끔은 차가운 우물물처럼 이면에 극도의 의심과 계산, 잔걱정의 성벽을 축적하여 지치기 쉬우니 낙천적이고 단순한 도량으로 삶을 가꾸십시오.",
    famous: "풍파 많은 역사의 고비에서 고요히 인재를 가르쳐 명장의 스승으로 자리매김한 위대한 영문학자",
    advice: "“낙숫물 한 방울이 쉬지 않고 떨어져 거대한 바위를 기어이 뚫듯, 네 고요함 속에 담긴 폭발력을 믿거라.”"
  }
};

// -------------------------------------------------------------
// Beautiful Fallback Saju Reading (offline or fallback mode)
// -------------------------------------------------------------
function getFallbackReading(user: any, saju: any, concern: string): string {
  try {
    const name = (user && user.name) || "인연";
    const fiveElements = (saju && saju.fiveElements) || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const elementsText = `목(${fiveElements.wood ?? 0}), 화(${fiveElements.fire ?? 0}), 토(${fiveElements.earth ?? 0}), 금(${fiveElements.metal ?? 0}), 수(${fiveElements.water ?? 0})`;
    
    const yearPillar = (saju && saju.yearPillar) || { heavenlyStem: "갑", earthlyBranch: "자", stemHanja: "甲", branchHanja: "子" };
    const monthPillar = (saju && saju.monthPillar) || { heavenlyStem: "갑", earthlyBranch: "자", stemHanja: "甲", branchHanja: "子" };
    const dayPillar = (saju && saju.dayPillar) || { heavenlyStem: "갑", earthlyBranch: "자", stemHanja: "甲", branchHanja: "子" };
    const hourPillar = saju && saju.hourPillar;
    const dayMaster = (saju && saju.dayMaster) || "갑목";

    // Clean Day Master for lookup
    const cleanedDm = dayMaster.trim().slice(0, 2);
    const dmInfo = DAY_MASTER_DETAILS[cleanedDm] || DAY_MASTER_DETAILS["갑목"];

    // Identify strong and weak elements
    const elementKorMap: { [key: string]: string } = { wood: "목 (나무)", fire: "화 (불)", earth: "토 (흙)", metal: "금 (금속)", water: "수 (물)" };
    const strongElems: string[] = [];
    const weakElems: string[] = [];
    
    for (const [k, v] of Object.entries(fiveElements)) {
      if ((v as number) >= 3) {
        strongElems.push(elementKorMap[k]);
      } else if ((v as number) === 0) {
        weakElems.push(elementKorMap[k]);
      }
    }

    // Remedy advice generating
    const remedyDatabase: { [key: string]: string } = {
      wood: "일상 환경에 초록 식물을 가꾸거나 나무 소재의 집기를 소장하시고, 오전에 숲이나 야외 공원을 거니는 노력이 목마른 생기를 보충해 줍니다. 청색 코디가 행운을 부릅니다.",
      fire: "볕이 양명하게 잘 드는 자리를 가깝게 정비하고 미온수의 차를 수시로 마셔야 합니다. 남쪽 방향을 지면 삼아 가벼운 낮잠이나 햇살 아래 산보가 막힌 기운을 도약시킵니다. 붉은 소품이 좋습니다.",
      earth: "등산길을 걷거나 도자기, 흙을 만지고 모래흙을 소소하게 밟는 경험이 행운의 자양분을 장식해 줍니다. 황토색이나 연한 노란색 계통 옷이 든든한 정서적 안정을 이끕니다.",
      metal: "흰 옷을 입거나 금속 재질의 수려한 주얼리(시계, 반지, 백금 목걸이 등)를 상시 착용하는 것이 마무리 의리와 결실력을 몇 갑절 끌어올려 줍니다. 서쪽 방향이 극히 유리합니다.",
      water: "차분한 명상 세션, 반신욕과 가벼운 물놀이 등이 내면의 탁기를 순식간에 정비해 줍니다. 검은색, 네이비 계열의 정갈한 수트 코디가 대인 관계에서 운수대통을 장식해 줍니다."
    };

    let strongAdvice = strongElems.length > 0 
      ? `당신의 우주 격국 속에서 **${strongElems.join(", ")}**의 기운은 대단히 웅장하고 넘치도록 수립되어 있습니다. 이는 인생길에서 타인을 강인하게 압도하고 선두를 돌파하여 목표를 성취해 내는 엄청난 돌도저와 같은 독점적 카리스마입니다. 다만 한 분야의 에너지가 넘쳐 고집이 세지기 쉬우니 겸양을 지양해야 무결한 평화를 맛봅니다.`
      : `귀하의 사주는 한쪽으로만 치우침 없이 오행이 물 흐르듯 잔잔히 구성되어 조화와 타협 능력이 대단히 훌륭한 균형 잡힌 명식입니다.`;

    let weakAdvice = "";
    if (weakElems.length > 0) {
      weakAdvice = `현재 사주 명식에 **${weakElems.join(", ")}** 기운이 누락되거나 극히 공허한 양상입니다. 이로 인해 매사 마무리가 조급해지거나, 실리적인 결실의 매듭 앞에서 끈기가 일시적으로 부족해질 가능성이 존재합니다.\n\n**지혜로운 오행 개운법(改運法) 제안:**\n`;
      for (const [k, v] of Object.entries(fiveElements)) {
        if ((v as number) === 0 && remedyDatabase[k]) {
          weakAdvice += `- **${elementKorMap[k]} 기운 보강법**: ${remedyDatabase[k]}\n`;
        }
      }
    } else {
      weakAdvice = `귀하의 사주에는 사장되는 낙오 오행이 없이 다섯 가지 명리의 바퀴가 조화로이 탑재되어 평생 크나큰 무질서나 우울, 극한의 시련에 휘말리지 않도록 사주팔자가 자연스럽게 액운을 거르고 수호하고 있나니 참으로 안온한 복록입니다.`;
    }

    // 2026 Year (Byeong-Oh, Fire Horse) annual flow based on DM Element
    let annualFlowText = "";
    if (cleanedDm === "갑목" || cleanedDm === "을목") {
      annualFlowText = "2026년 병오년(丙午年)의 맹렬하고 뜨거운 붉은 말의 화(火) 기운은 당신에게 **식상운(食傷運)** 즉 자신의 가치관을 마음껏 발현하고 전파하는 적극적 창조와 언어의 파동을 의미합니다. 그동안 머뭇거리던 자리에서 떨쳐 일어나 자신의 숨겨진 실력이나 제품을 가차 없이 선보인다면 천하가 귀하를 우러르고 명성이 수립되리라 가리킵니다. 다만 너무 에너지를 빨리 연소하면 금세 주저앉기 쉬우니 물을 마셔 정비를 아끼지 마십시오.";
    } else if (cleanedDm === "병화" || cleanedDm === "정화") {
      annualFlowText = "2026년 병오년(丙午年)의 거대한 화마의 영역은 당신에게 **비겁운(比劫運)**을 부릅니다. 이는 강력한 친구, 든든한 동업자의 손길을 겪거나, 역으로 드높은 대치 전선의 치열한 권력 경쟁을 가리킵니다. 동지들을 모아 일대 창업을 쟁취하는 데는 가히 최상의 기운이나, 남의 귀신같은 언동에 놀아나 보증을 잡히거나, 귀가 얇아 문서를 섣불리 교환하면 전 재산의 분탈이 일시에 성립되니 필히 웅숭 깊게 생각의 문을 제어하십시오.";
    } else if (cleanedDm === "무토" || cleanedDm === "기토") {
      annualFlowText = "2026년 병오년(丙午年)의 영양이 넘쳐 대지를 비옥케 만드는 활화의 불꽃은 당신에게 **인성운(印星運)**을 이끕니다. 인생을 수호하는 든든한 합격, 자격증 관철, 영리한 학술 창작, 혹은 부동산과 가솔의 대권 상속 같은 고귀한 '귀인의 문서'가 수립되는 일률 천운의 마디입니다. 겉돌던 지식들이 완전무결히 제 자리를 잡고 무거운 학덕을 보상받게 됩니다. 아집의 성벽에 갇혀 실행 속도를 늦추지만 않는다면 금년에 대가가 보장됩니다.";
    } else if (cleanedDm === "경금" || cleanedDm === "신금") {
      annualFlowText = "2026년 병오년(丙午年)의 무쇠를 명검으로 탄생시키는 가마솥 가마 기운은 당신에게 **관성운(官星運)**을 불러들입니다. 직업에서의 파격적인 영전, 취업 전선의 대단히 순조로운 당선, 가문의 명예 회복, 또는 평생의 든든한 수호자이자 평생 배필의 행운을 가득히 쟁취하게 됨을 지칭합니다. 영광스러운 지지만큼 어깨를 짓누르는 책임도 비장하게 늘어나는 영역이니, 심장과 간장의 무리를 주말 휴식과 담백한 나눔으로 제어해야 마땅합니다.";
    } else { // 임수, 계수
      annualFlowText = "2026년 병오년(丙午年)의 장엄한 불길은 영리한 당신의 수로에 부딪혀 거대하게 솟구치는 거부의 **재성운(財星運)**을 창조해 냅니다. 오랫동안 성실히 씨앗을 뿌려 가꾸던 사업과 구직 활동에서 확실한 금전의 피돌기를 실감하며, 예상을 뛰어넘는 고부가가치 복록을 확실히 거두어 쥐는 대운의 형상입니다. 다만 본인의 사주에 기력이 부족하면 재물에 기가 질려 오히려 몸이 아플 수 있으니, 무리하지 않고 상생하는 법을 배워 나누십시오.";
    }

    // 12 Shinsal Fallback Interpretation Builder
    let shinsalDetailsText = "";
    if (saju.shinsal) {
      shinsalDetailsText = "귀하의 네 기둥 만세력에 드리운 주요 **12신살(12神煞)**들의 세밀한 평생 운세 해석은 다음과 같습니다:\n\n";
      const shinsalList = [
        { name: "년주(年柱) - 초년과 선대운의 터대", val: saju.shinsal.year },
        { name: "월주(月柱) - 청년과 사회 직종의 가치", val: saju.shinsal.month },
        { name: "일주(日柱) - 장년의 배우자 및 자신의 속정", val: saju.shinsal.day },
        saju.hourPillar ? { name: "시주(時柱) - 말년의 가정과 종국의 소망", val: saju.shinsal.hour } : null
      ].filter(Boolean);
      
      for (const sh of shinsalList) {
        if (sh && sh.val && sh.val !== "분석 불가") {
          const cleanN = sh.val.split("(")[0];
          const desc = SHINSAL_DESC_MAP[sh.val] || SHINSAL_DESC_MAP[cleanN] || "길흉화복을 조율하고 다스리는 하늘의 진득한 가르침입니다.";
          shinsalDetailsText += `### ✦ ${sh.name} : [${sh.val}]\n${desc}\n\n`;
        }
      }
    } else {
      shinsalDetailsText = "귀하의 12신살은 전래 역학 원리상 년지(年支)를 터대로 삼아 삼합의 섭리에 따라 정형화됩니다. 연주의 깊은 성향이 월주와 일주, 시주 본연의 흐름을 든든하게 받치고 귀인의 비조를 구합니다.\n";
    }

    return `# 신우사주 명리 감응서 (神佑四柱)

*현재 원격 천상의 통신(AI 모델 공급량 수급 등)이 임시 조율 중에 있어, 신우 선생이 가문에 전해지던 전래 오행 만세력과 12신살을 직접 한 획씩 헤아려 정밀하고 은혜로운 명리 해석을 온 정성을 다해 올립니다.*

---

## 1. 당신의 사주 첫인상
**${name}**님, 귀하의 본성을 심오히 관조하건대 가슴속에 웅숭깊은 혜안과 자신만의 당당함의 씨앗을 대단히 귀히 머금고 있습니다. 남들에게 성급히 아쉬운 소리를 내지 않는 담대한 자존감을 지녔으며, 매장된 보석이 비를 맞아 빛나듯 혼란한 세속 속에서도 정연한 내적 질서와 선함의 품격을 견지하려 부단히 의지를 뽐내는 사주 격국입니다.

---

## 2. 사주의 네 기둥과 만세력 (柱)
당신의 생일 터 위로 곧게 솟은 네 가지 우주 기둥의 조각배는 다음과 같습니다:
- **년주(年柱) [${yearPillar.stemHanja}${yearPillar.branchHanja} 기둥 / ${yearPillar.heavenlyStem}${yearPillar.earthlyBranch}]**: 조상의 풍덕과 초년 성장의 큰 기틀입니다. 가문의 뿌리와 같은 자리로써 평생 인생을 받치는 지반목을 의미합니다.
- **월주(月柱) [${monthPillar.stemHanja}${monthPillar.branchHanja} 기둥 / ${monthPillar.heavenlyStem}${monthPillar.earthlyBranch}]**: 사회로 영토를 확장하는 청년기의 직업 운로입니다. 부모 형제의 성정과 소통하는 터대이기도 합니다.
- **일주(日柱) [${dayPillar.stemHanja}${dayPillar.branchHanja} 기둥 / ${dayPillar.heavenlyStem}${dayPillar.earthlyBranch}]**: **나 자신의 본질**과 내밀한 내면세계, 그리고 성년 이후 평생 배우자의 안락함을 의미하는 가장 고귀한 주춧돌입니다.
- **시주(時柱) [${hourPillar ? `${hourPillar.stemHanja}${hourPillar.branchHanja} 기둥 / ${hourPillar.heavenlyStem}${hourPillar.earthlyBranch}` : "분석 불가"}]**: 인생 황혼기의 안착과 소소한 꿈, 자식과의 정운이 고요히 도사리고 마침표를 장식하는 신령의 자리입니다.

---

## 3. 나를 움직이는 중심 기운 (일간)
당신의 자아 성향을 결정짓는 핵심 별자리는 **${dmInfo.description}**입니다.

### ✦ 성정의 깊은 탐구
${dmInfo.personality}

### ✦ 우주 오행 오행의 기운 균형
귀하의 오행 정수 분포는 다음과 같이 세심히 흐릅니다:
- **실시간 분포**: ${elementsText}
${dmInfo.elementText}

---

## 4. 오행 치유법 (五行 改運)
### ✦ 강한 기운의 지혜로운 활용
${strongAdvice}

### ✦ 부족한 기운의 영리한 보강법
${weakAdvice}

---

## 5. 평생의 연애와 인연운
속내를 함부로 쉽게 열지는 않으나, 일단 마음에 든 귀한 반려자에게는 지고지순한 순정과 흔들리지 않는 가문의 의리를 몸 바쳐 실천하는 참된 흐름입니다. 타고난 영혼의 불씨가 굳세기에 자칫 상대의 영역을 성급히 간섭하려 들면 인연이 건조해지기 쉬우니 기운을 담백하게 가두십시오. 봄날 강바람처럼 한 걸음 물러나 흘러가듯 격려해 줄 때 궁합의 안전하고 깊은 복록이 영원히 수호됩니다.

---

## 6. 사회적 복록과 평생 재물운
${concern === "재물" ? "**[재물/금전운 비책 감응]**" : ""}
당신의 기틀은 완고하게 가로막힌 정형화된 머슴 조직 속에서는 창의력과 자존심이 심각하게 메말라 영혼이 한숨짓기 쉽습니다. 독립적으로 권한을 아낌없이 일임 받아 책임 주도형으로 프로젝트를 전격 매듭짓는 자영 분야, 지능적인 두뇌 기획을 도모하는 첨단 전문 지식, 또는 타인의 우매함을 지혜롭게 타파해 주는 보혜 성격의 컨설팅 및 전문 가치 가공 계통에서 가문의 거대한 재물 만석을 틀림없이 안전하게 회수하게 될 조짐입니다.

---

## 7. 2026년 병오년(丙午年)의 도약 길잡이
${annualFlowText}

---

## 8. 사주 속 12신살 심층 해석 (12神煞)
${shinsalDetailsText}

---

## 9. 명리 지혜의 요람과 인물상
당신의 사주 격은 겨울 안개 속에서도 찬연히 눈빛을 붉히는 **'하늘의 백학(白鶴)'** 혹은 봄 햇살을 품고 마침내 풍성하게 자라나 만인에게 유익함을 선사하는 **'자애로운 선비의 기둥'**과 완벽히 맞닿아 있습니다. 세속의 쩨쩨한 잡음에 휘말리지 마시고 홀가분하게 한 걸음 묵묵히 정직한 궤적을 밟아 일류 명성에 도달하시기 바랍니다.

---

## 10. 신우의 전래 수호 한마디
${dmInfo.advice}
`;
  } catch (err) {
    console.error("Failed to generate fallback reading safely:", err);
    return `# 신우 선생 오프라인 풀이
귀하의 명리학적 기운을 안전히 연계 받았습니다. 기운이 고요히 가라앉길 기다리며 잠시만 숨을 고르신 뒤 다시 대고해 주시기 바랍니다.`;
  }
}

function getFallbackQuestionAnswer(question: string, saju: any): string {
  try {
    const dayMaster = (saju && saju.dayMaster) || "명주의 본질";
    const cleanedDm = dayMaster.trim().slice(0, 2);
    const dmInfo = DAY_MASTER_DETAILS[cleanedDm] || DAY_MASTER_DETAILS["갑목"];

    return `## 신우 선생의 비책 서한 (回答)

**“지극한 정성으로 마음에 담아 여쭈어 오신 화답을 하늘의 명리와 ${cleanedDm} 본연의 은혜에 비추어 올립니다.”**

귀하가 가슴 아파하며 한 획씩 적어 내리신 고뇌의 질문:
*Q. "${question}"*

명주의 깊은 안목으로 이 고뇌를 헤아릴 때, 지금은 기틀의 마디가 세 급하게 움직이며 잠시 영혼이 조바심에 갈피를 잡지 못하고 '조기의 기이한 결실'을 바라는 불안의 격류에 휩쓸려 있는 형상입니다. 마음속 고달픔과 시름이 깊은 것은 성숙을 위한 지극히 거룩한 과정이니 안심하시고 물의 노성을 잦추십시오.

---

## 1. 명리학적 진단과 감응 상태
우주의 기틀에서 오행 원류를 세심히 뜯어볼 때, 질문자님이 현재 마주한 고질적인 환경은 **사사로운 기운의 일시적 정체와 부딪힘**에서 온 영감의 과도기입니다. 마치 시원한 소나기가 내리쳐 황토물이 일시적으로 사방에 튀어 탁해 보이나, 비가 개고 나면 한층 굳어지고 정결해질 땅의 비옥함과 대길한 결실을 상징하고 있음을 확실히 깨우치셔야 합니다.

---

## 2. 신우 선생이 귀하의 마지노선에 고함 (귀한 처방전)

1. **지극히 고요히 바라보아 동요치 말라**
   - 다가올 사흘 동안은 아주 커다란 인생의 문서를 전격 바꾸거나, 충동적으로 전 재산을 배팅하는 성급한 도장은 절대 일절 유예하시는 것이 귀하의 귀한 복록을 안전히 사수하는 유일의 비책입니다.
   
2. **동쪽과 남쪽 하늘에서 전개되는 길한 바람**
   - 사색이 엉키고 가슴이 답답할 때는 가만히 동남쪽 방향으로 가슴을 활짝 펴 신선한 외기를 호흡하십시오. 따뜻한 대지에서 재배된 양질의 온수나 연한 녹차를 자주 음용하여 차가운 간과 심장에 양명한 활기를 북돋우셔야 합니다.
   
3. **나에게 맞는 인덕 수혜법**
   - 혼자서 고민하기보다 영리하게 신용을 오래 쌓아 두었던 장대한 윗사람이나 선배의 명쾌한 격려를 청해 들으면 막혔던 의혹이 은빛 구름을 헤치고 달을 보듯 영명하게 풀릴 것입니다.

---

## 3. 당신이 평생 기억해야 할 오늘의 문장

“쓸데없는 어둠에 매달려 울지 마라, 다가오는 새벽은 묵묵히 너의 등 뒤에서 동이 틀 뿐이니 단단히 네 주체적 지체를 곧게 버티거라.”

“오늘 신우의 문은 여기까지입니다.”`;
  } catch (err) {
    console.error("Failed to generate fallback question safely:", err);
    return `## 신우의 문답
잠시 오행 기운의 극성이 흩어졌습니다. 마음 속으로 소망을 품고 한 마디 쉼을 얻으신 뒤 다시 여쭤봐 주시기 바랍니다.`;
  }
}
