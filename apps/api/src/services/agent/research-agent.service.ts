import { format } from 'date-fns';
import { getGeminiClient, AI_MODELS } from '../../config/ai-providers';
import { DailyResearch, IResearchIssue } from '../../models/daily-research.model';
import { logger } from '../../utils/logger';

const MAX_ISSUES = 7;

export class ResearchAgentService {
  /**
   * 오늘의 Web3/AI/Crypto 핫이슈를 Gemini + Google Search Grounding으로 리서치합니다.
   * 결과를 DailyResearch DB에 저장하고 반환합니다.
   */
  async runDailyResearch(date?: string): Promise<typeof DailyResearch.prototype> {
    const targetDate = date ?? format(new Date(), 'yyyy-MM-dd');

    // 이미 오늘 리서치가 완료됐으면 재사용
    const existing = await DailyResearch.findOne({ date: targetDate, status: 'completed' });
    if (existing) {
      logger.info(`Research already exists for ${targetDate}, reusing.`);
      return existing;
    }

    // 진행 중인 레코드 생성 (또는 기존 failed 재시도)
    let record = await DailyResearch.findOne({ date: targetDate });
    if (!record) {
      record = await DailyResearch.create({ date: targetDate, issues: [], status: 'pending' });
    } else {
      record.status = 'pending';
      record.error = undefined;
      record.issues = [];
      await record.save();
    }

    logger.info(`Starting research for ${targetDate}`);

    try {
      const issues = await this.fetchHotIssues(targetDate);

      record.issues = issues;
      record.status = 'completed';
      await record.save();

      logger.info(`Research completed for ${targetDate}: ${issues.length} issues found`);
      return record;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Research failed for ${targetDate}:`, error);
      record.status = 'failed';
      record.error = msg;
      await record.save();
      throw error;
    }
  }

  /**
   * Gemini + Google Search Grounding으로 핫이슈를 수집합니다.
   */
  private async fetchHotIssues(date: string): Promise<IResearchIssue[]> {
    const gemini = getGeminiClient();
    if (!gemini) {
      throw new Error('GEMINI_API_KEY is not set.');
    }

    // Google Search Grounding 활성화
    const model = gemini.getGenerativeModel({
      model: AI_MODELS.GEMINI_FLASH_SEARCH,
      tools: [{ googleSearch: {} }] as any,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.4,
      },
    });

    const prompt = `Today is ${date}.

You are a Web3/Crypto/AI research analyst. Your task is to identify and summarize the TOP ${MAX_ISSUES} trending issues in the Web3, Crypto, and AI space AS OF TODAY.

Search for the most recent and significant news, developments, and trends happening right now across:
- Bitcoin, Ethereum, and major altcoins (price movements, major events)
- DeFi protocols (TVL changes, new launches, exploits)
- NFT/GameFi developments
- Layer 1/Layer 2 ecosystem news
- Regulatory and institutional news (SEC, ETF, governments)
- AI x Crypto convergence (AI agents, AI tokens)
- Macro events affecting crypto markets

For each issue, provide:
1. A concise, engaging title
2. A 2-3 sentence summary of what happened
3. Why it matters to the crypto community (1-2 sentences)
4. Relevant tags (e.g., ["Bitcoin", "ETF", "Institutional"])
5. Sources (URLs if available from your search)

Return ONLY a valid JSON object with this exact structure:
{
  "issues": [
    {
      "title": "Issue title here",
      "summary": "2-3 sentence summary of what happened and key details.",
      "whyItMatters": "1-2 sentences explaining significance to the crypto community.",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "sources": ["https://example.com/article"]
    }
  ]
}

Important:
- Prioritize the MOST RECENT and MOST SIGNIFICANT news (last 24-48 hours preferred)
- Focus on high-impact stories that a crypto KOL would want to tweet about
- Be specific with numbers, names, and facts
- Return ONLY the JSON, no other text`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*"issues"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in Gemini research response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.issues) || parsed.issues.length === 0) {
      throw new Error('No issues found in research response');
    }

    // 데이터 정제 및 검증
    const issues: IResearchIssue[] = parsed.issues
      .slice(0, MAX_ISSUES)
      .map((item: any) => ({
        title: String(item.title || '').trim(),
        summary: String(item.summary || '').trim(),
        whyItMatters: String(item.whyItMatters || '').trim(),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        sources: Array.isArray(item.sources) ? item.sources.map(String) : [],
      }))
      .filter((issue: IResearchIssue) => issue.title && issue.summary);

    return issues;
  }
}

export default new ResearchAgentService();
