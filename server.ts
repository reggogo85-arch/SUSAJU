/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiInitialized: !!ai });
});

// 2. Primary Saju Reading Endpoint
app.post("/api/saju/reading", async (req, res) => {
  const { userInfo, sajuData, concern } = req.body;

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

  if (!ai) {
    // Elegant Offline Mock Fallback in case of missing keys
    return res.json({ reading: getFallbackReading(userInfo, sajuData, concern) });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInput,
      config: {
        temperature: 0.85,
      },
    });

    const text = response.text || "신우 선생의 기운에 닿지 못했습니다. 잠시 후 다시 시도해 주세요.";
    res.json({ reading: text });
  } catch (error: any) {
    console.error("Gemini Saju generation error:", error);
    res.status(500).json({ error: "사주 풀이 생성 중 오류가 발생했습니다. 오프라인 모드로 시도해 보세요.", details: error.message });
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

  if (!ai) {
    return res.json({ answer: getFallbackQuestionAnswer(userQuestion, sajuData) });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInput,
      config: {
        temperature: 0.8,
      },
    });

    const text = response.text || "기운이 흐려져 신우 선생의 답을 구하지 못했습니다.";
    res.json({ answer: text });
  } catch (error: any) {
    console.error("Gemini Question error:", error);
    res.status(500).json({ error: "답변을 얻는 중에 기운이 흔들렸습니다.", details: error.message });
  }
});

// Setup Vite Dev server or Serve static files
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
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

mountViteMiddleware();

// -------------------------------------------------------------
// Beautiful Fallback Saju Reading (offline or fallback mode)
// -------------------------------------------------------------
function getFallbackReading(user: any, saju: any, concern: string): string {
  const name = user.name || "인연";
  const elementsText = `목(${saju.fiveElements.wood}), 화(${saju.fiveElements.fire}), 토(${saju.fiveElements.earth}), 금(${saju.fiveElements.metal}), 수(${saju.fiveElements.water})`;
  const pillarText = `${saju.yearPillar.heavenlyStem}${saju.yearPillar.earthlyBranch}년 ${saju.monthPillar.heavenlyStem}${saju.monthPillar.earthlyBranch}월 ${saju.dayPillar.heavenlyStem}${saju.dayPillar.earthlyBranch}일`;
  
  return `# 신우사주 풀이 (서버 오프라인 감응 모드)

*현재 원격 신령의 방(AI API Key)이 굳게 잠겨 있거나 설정 단계에 있어, 신우 선생이 명리가 담긴 심오한 전래 만세력을 기반으로 지극히 깊은 가르침을 정성껏 내어 드립니다.*

## 1. 당신의 사주 첫인상
**${name}**님, 성정의 뿌리를 보니, 하늘 아래 굳건히 서 있고자 하는 남다른 의지가 눈에 띕니다. 이 사주는 겉으로는 더없이 평온하지만 깊이를 헤아리기 힘든 물길이 지하 깊숙이 흐르듯 고집스러우리만큼 철저한 내면의 질서를 지니고 있습니다. 무리 속에서 홀로 고고하며, 타인에게 기대는 법 없이 스스로 길을 내는 격국을 나타냅니다.

## 2. 사주의 네 기둥
당신의 탄생과 함께 세워진 네 개의 기둥은 다음과 같습니다:
- **년주(년기둥: ${saju.yearPillar.heavenlyStem}${saju.yearPillar.earthlyBranch})**: 선대에서 이어진 뼈대이자 삶에 드리운 커다란 울타리입니다. 초년의 기반과 집안의 뿌리를 보여주며 삶의 지반을 이룹니다.
- **월주(월기둥: ${saju.monthPillar.heavenlyStem}${saju.monthPillar.earthlyBranch})**: 사회와 소통하며 나를 넓히는 기둥입니다. 청년기의 운세를 좌우하고 부모와 형제, 그리고 직업의 주 무대를 상징합니다.
- **일주(일기둥: ${saju.dayPillar.heavenlyStem}${saju.dayPillar.earthlyBranch})**: **나 자신**이 거주하는 가장 핵심의 자리이자, 성년이 된 이후의 내면과 배우자 자리를 나타내는 영혼의 방입니다.
- **시주(시기둥: ${saju.hourPillar ? `${saju.hourPillar.heavenlyStem}${saju.hourPillar.earthlyBranch}` : "모름"})**: 인생의 황혼기와 사후, 그리고 자손과 나의 간절한 소망이 투영되는 종국의 울림을 나타냅니다.

## 3. 나를 움직이는 중심 기운
당신의 일간(중심 기운)은 **${saju.dayMaster}**입니다. 
당신을 둘러싼 다섯 가지 오행의 기운 분포는 **${elementsText}**로 흐릅니다. 
이 기운은 당신의 타고난 지혜와 직관, 독립적인 처세술을 뒷받침합니다. 한쪽으로 비중이 치우친 부분이 있다는 것은 그만큼 극적인 집중과 주체할 수 없는 강력한 몰입의 잠재력을 가졌음을 반증합니다.

## 4. 강한 기운과 부족한 기운
- **강한 기운**: 오행 중 숫자 3 이상을 점유하는 기운은 세상에서 당신이 거침없이 휘둘러 쓸 수 있는 마법의 칼날과 같습니다. 사람을 주도하거나, 어떤 어려운 장애물이 있어도 집착하듯 뚫고 나가는 강렬한 에너지를 부여합니다.
- **부족한 기운**: 분포에서 원(0)을 이루는 기운(주로 금속이나 쇠, 혹은 차오르는 빛)은 가끔 내 마음에 조급함을 안기고 결실을 매듭짓는 힘을 흔들기 쉽습니다. 조용히 명상하거나 나무를 가까이하고, 차분한 태도를 취하는 것으로 보이지 않는 우주의 빈자리를 스스로 보충해 주어야 합니다.

## 5. 연애와 인연운
속정을 쉽게 열지 않는 담담한 격이나, 한번 마음 한편을 내어준 상대에게는 묘하리만큼 깊은 의리와 책임을 다하는 흐름입니다. 다만 본인의 에너지가 드세어 상대에게 무언연히 요구하거나 통제하려 들면 인연이 어그러지니, 물 흐르듯 가만히 지켜봐 주는 너른 마음의 공간이 관계의 수명을 백만 배 늘려줄 것입니다.

## 6. 직업과 재물운
${concern === "재물" ? "**재물 분야에 집중된 조언입니다.**" : ""}
당신의 사주는 흙과 물, 나무가 조화롭게 어우러지려 노력하는 구조로써, 억지로 가두거나 통제하는 경직된 조직 문화 속에서는 영혼이 말려 죽기 쉽습니다. 주도적으로 결정을 일임받고 유연하게 움직이는 일, 기민하게 타인의 내면을 분석하거나 부가가치를 가공하는 전문 기술 영역에서 더 큰 부를 수확하는 복록을 마주하게 됩니다.

## 7. 올해의 흐름
올해는 기운의 마디가 변화하며 단단한 옹이를 만드는 해입니다. 매사가 서두른다고 하여 풀리지 않는 흐름이나, 본인의 강점과 통찰력을 믿고 흔들리지 않는 중심을 수성한다면 뜻하지 않은 주변의 원조와 동업자, 귀인의 도움을 얻어 곤경에서 순조롭게 탈출해 승리하게 될 것입니다.

## 8. 비슷한 기운의 유명인 또는 인물상
당신의 우주적 흐름은 전통적인 **'추운 겨울날 홀로 비상하기 위해 날개를 펼치는 백학'** 또는 **'눈 덮인 대지 위에서 고요히 사색하며 봄을 잉태하려는 선비'**의 상과 대단히 흡사합니다. 이는 수많은 군중 속에 섞이지 않고 자신만의 가치관을 관철하여 고고한 성취를 보았던 역사적 기고가들의 기운과 맞닿아 있습니다.

## 9. 신우의 한마디
**“억지로 새벽을 기어코 당기려 마라, 밤의 어스름 또한 너의 등뒤에서 묵묵히 너를 성숙시키는 그윽한 은총이니라.”**
`;
}

function getFallbackQuestionAnswer(question: string, saju: any): string {
  return `## 신우의 답

${saju.dayMaster}의 원천적인 기운과 당신이 구한 물음에 비추어 보니, 이 질문은 마음이 조급하여 조기에 단정적인 결실을 보려 함에 있습니다. 지금 가슴속이 타들어가고 번민이 있는 것은 지극히 자연스러우나 마음의 나침반은 올바른 북향을 잃지 않고 있으니 안심하셔도 좋습니다.

## 왜 그렇게 보이는가

현재 사주상 오행 분포를 뜯어보고 흐름을 헤아릴 때, 질문자님의 마음에 갈등과 흔들림을 주도하는 살이나 부족한 부분이 일시적으로 강한 흐름과 서툴게 부딪히는 양상을 섭렵하고 있습니다. 이는 물줄기가 막혀 성질이 급하게 솟구치는 상형으로, 잠시 숨을 고를 때 비로소 순탄하게 하천을 이룰 것입니다.

## 지금 해야 할 일

1. **지극히 담담히 관조하라**: 다가올 이틀 간은 중대차한 결정을 하거나 문서에 지장을 찍는 날카로운 행위는 되도록 유예하시는 것이 본인 영혼의 해를 막는 보약이 될 것입니다.
2. **동쪽이나 남쪽에서 불어오는 바람**: 볕이 잘 드는 곳에서 온수를 가볍게 음용하고 쉼을 유지하여 흐려진 탁기를 원활히 제거하십시오.

## 오늘의 문장

“오늘 신우의 문은 여기까지입니다.”`;
}
