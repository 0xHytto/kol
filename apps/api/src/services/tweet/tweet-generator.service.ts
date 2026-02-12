import { TweetType } from '@kol/shared-types';
import geminiService from '../ai/gemini.service';
import { KolProfile } from '../../models/kol-profile.model';
import { TweetGeneration } from '../../models/tweet-generation.model';
import { logger } from '../../utils/logger';

export type LengthRange = 'short' | 'medium' | 'long';

export interface GenerateTweetRequest {
  userId: string;
  kolId?: string;
  tone: 'professional' | 'casual' | 'hype' | 'technical' | 'meme';
  topic: string;
  language?: 'en' | 'kr';
  lengthRange?: LengthRange;
  options?: {
    includeEmojis?: boolean;
    includeHashtags?: boolean;
    count?: number;
  };
}

export interface TweetVariant {
  content: string;
  length: number;
}

export interface GenerateTweetResponse {
  variants: TweetVariant[];
  kolName?: string;
  tone: string;
}

interface ToneInstruction {
  description: string;
  examples: string;
  style: string;
}

// Language-specific tone instructions based on Web3 KOL tweet style analysis
// Reference: docs/kol-tweet-style-analysis.md
const TONE_INSTRUCTIONS: Record<string, Record<string, ToneInstruction>> = {
  en: {
    professional: {
      description: 'Concise, data-driven, authoritative observation',
      examples: 'Short declarative statements like Ki Young Ju or Anthony Pompliano. e.g. "Every Bitcoin analyst is now bearish." / "The jobs data proved one thing…"',
      style: 'Brief 1-2 sentence assertions, data or vision-backed, measured confidence, no fluff',
    },
    casual: {
      description: 'Personal experience sharing, storytelling, reflective',
      examples: 'Lowercase casual tone like 1mpal or Yena. e.g. "I first dove into…", personal journey + takeaway',
      style: 'Story-driven, conversational, "main takeaway:" pattern, relatable anecdotes',
    },
    hype: {
      description: 'Emotional, emoji-heavy, meme-like excitement and energy',
      examples: 'Use emojis heavily like CryptoKorean or Pentoshi. e.g. "😭😩 almost 2.5 billion usd volume" / "Our precious green candles 🕯️"',
      style: 'Ultra-short sentences, heavy emoji usage, FOMO-inducing, community vibe, excitement',
    },
    technical: {
      description: 'Data report style with rankings, trends, and educational insights',
      examples: 'Structured like Jason Yeah or Andreas Antonopoulos. e.g. "Checking Korean TG mindshare on Pre TGE 7d: 1st @X 2nd @Y…" / "here\'s why [link]"',
      style: 'Numbered rankings, trend aggregation, educational "here\'s why" format, practical advice with links',
    },
    meme: {
      description: 'Minimal text, cryptic, meta-commentary or pure meme humor',
      examples: 'Cobie / Pentoshi style. e.g. just a link, or "If I were pushing it my tweets may look something like this." / "When Crypto pumps 1%"',
      style: 'Extremely short or link-only, ironic meta-commentary, meme references, self-aware humor',
    },
  },
  kr: {
    professional: {
      description: '격식체, 정보 전달형 (뉴스리포트 스타일)',
      examples: 'Henry Kim(@Fromadistance11) 스타일. "~합니다/습니다" 어미, 객관적 사실 전달, "~했는데요" 연결, "해당 소식을 공유드립니다"',
      style: '긴 문장 연결, 출처 명시, 객관적이고 신뢰감 있는 톤, ~라고 합니다 패턴',
    },
    casual: {
      description: '반말/경험 공유형 (친근한 경험담)',
      examples: 'Hope(@Hope_web3_) 스타일. "ㅎㅎ", "쑨!", 개인 미팅·이벤트 경험 공유, "너무 좋은 시간 보냈습니다"',
      style: '~합니다와 구어체 혼용, 개인 스토리, 감탄사·이모티콘 활용, 커뮤니티 인사/감사',
    },
    hype: {
      description: '뉴스/미디어 공식형 + 흥분 톤 (헤드라인 스타일)',
      examples: 'Blockstreet(@blockstreetGL) 스타일. 🔥 이모지로 시작, 인용구 포함, "자세한 내용은 기사에서 👉" 유도',
      style: '짧은 헤드라인 + 링크 유도, 이모지(🔥🔗👉) 적극 활용, 해시태그 多, 기대감 조성',
    },
    technical: {
      description: '개발/프로젝트 진행형 (빌더의 실험 로그)',
      examples: 'Moonyu(@moonyu_myu) 스타일. "바이브코딩을 이용하여 게임 제작중", "20시간정도 걸린 것 같은데", 도구 비교',
      style: '반말(~네요, ~듯?), 개발 과정 상세 서술, "아", "대충" 등 캐주얼 표현, 도구/AI 활용 공유',
    },
    meme: {
      description: '극도의 구어체 + 밈 + 유머',
      examples: '크립토 커뮤니티 밈 스타일. "ㅋㅋㅋ", "ㄹㅇ", "ㅇㅈ", 과장된 반응, 자조적 유머',
      style: '초성체·줄임말 활용, 자조적 유머, Web3/크립토 밈 레퍼런스, 짧고 임팩트 있는 문장',
    },
  },
};

export class TweetGeneratorService {
  async generateTweets(request: GenerateTweetRequest): Promise<GenerateTweetResponse> {
    const { userId, kolId, tone, topic, language = 'en', lengthRange = 'medium', options = {} } = request;
    const { includeEmojis = true, includeHashtags = true, count = 3 } = options;

    // Get KOL style if specified
    let kolStyle = null;
    let kolName = 'Custom';

    if (kolId) {
      kolStyle = await KolProfile.findById(kolId);
      kolName = kolStyle?.displayName || kolStyle?.twitterHandle || 'Unknown KOL';
    }

    // Build prompt
    const prompt = this.buildPrompt({
      kolStyle,
      tone,
      topic,
      includeEmojis,
      includeHashtags,
      count,
      language,
      lengthRange,
    });

    logger.info('Generating tweets', { userId, kolId, tone, topic });

    // Call Gemini API
    const response = await geminiService.generateJSON<{ tweets: string[] }>({
      prompt,
      maxTokens: 8192,
      temperature: 0.8,
    });

    // Parse and validate tweets
    const variants: TweetVariant[] = response.tweets.map((content: string) => ({
      content: content.trim(),
      length: content.trim().length,
    }));

    // Save generation to database
    await this.saveGeneration({
      userId,
      kolId,
      tone,
      topic,
      variants,
    });

    return {
      variants,
      kolName,
      tone,
    };
  }

  private buildPrompt({
    kolStyle,
    tone,
    topic,
    includeEmojis,
    includeHashtags,
    count,
    language = 'en',
    lengthRange = 'medium',
  }: {
    kolStyle: any;
    tone: string;
    topic: string;
    includeEmojis: boolean;
    includeHashtags: boolean;
    count: number;
    language?: 'en' | 'kr';
    lengthRange?: LengthRange;
  }): string {
    const isKorean = language === 'kr';
    const langKey = isKorean ? 'kr' : 'en';
    const toneInstructions = TONE_INSTRUCTIONS[langKey][tone];

    const languageInstruction = isKorean
      ? 'LANGUAGE: Write all content in Korean (한국어). The entire post MUST be written in Korean.'
      : 'LANGUAGE: Write all content in English.';

    const today = new Date().toISOString().split('T')[0];

    const LENGTH_RANGE_INSTRUCTIONS = {
      short: {
        range: '200–300 characters',
        guidance: 'Keep it punchy and concise. One core idea, maximum impact in minimal words. Think tweet-length.',
      },
      medium: {
        range: '300–1000 characters',
        guidance: 'Balanced depth. Develop your point with supporting context, but stay focused. Use 1-2 line breaks for readability.',
      },
      long: {
        range: '1000+ characters (aim for 1000–1500)',
        guidance: 'Long-form thread-style post. Deep analysis with structured sections — use line breaks, bullet points, or numbered lists for readability. Cover context, analysis, and implications thoroughly.',
      },
    };

    const lengthInstruction = LENGTH_RANGE_INSTRUCTIONS[lengthRange];

    let prompt = `You are a senior Web3/crypto analyst and influential KOL (Key Opinion Leader) who writes expert-level posts for Twitter/X.

ROLE:
- You have deep expertise in blockchain, DeFi, NFTs, L1/L2, tokenomics, market dynamics, and crypto regulation.
- You stay up to date with the latest news, trends, and market movements.
- You write posts that demonstrate real domain knowledge — not generic AI-sounding content.

TASK: Generate ${count} different expert-level post versions about: "${topic}"

TODAY'S DATE: ${today}

${languageInstruction}

LENGTH: ${lengthInstruction.range}
- ${lengthInstruction.guidance}

CONTENT GUIDELINES:
1. **Research & Context**: Based on the topic "${topic}", incorporate relevant and plausible recent developments, market trends, on-chain data points, or industry news that a real crypto expert would reference as of ${today}. Think about what's actually happening in the space around this topic.
2. **Expert Analysis**: Provide genuine insight — why this matters, what the implications are, what smart money is watching. Go beyond surface-level commentary.
3. **Specificity**: Use concrete details — mention specific protocols, metrics, comparisons, or ecosystem developments when relevant. Avoid vague platitudes.
4. **Structure**: ${lengthRange === 'long' ? 'Use line breaks, bullet points, or numbered lists to structure your analysis clearly.' : lengthRange === 'medium' ? 'Use line breaks where appropriate to improve readability.' : 'Keep it tight — no unnecessary line breaks or lists.'}
5. **Authenticity**: Write as a real crypto-native professional would. No corporate jargon, no "In the ever-evolving world of blockchain..." style openings.

TONE & STYLE: ${toneInstructions.description}
- ${toneInstructions.examples}
- ${toneInstructions.style}
`;

    // Add KOL style if available
    if (kolStyle?.styleAnalysis) {
      const style = kolStyle.styleAnalysis;
      prompt += `
WRITING STYLE (based on ${kolStyle.displayName || kolStyle.twitterHandle}):
- Sentence length: ${style.avg_sentence_length || 'medium'} words
- Emoji usage: ${style.emoji_usage || 'moderate'}
- Common phrases: ${style.common_phrases?.join(', ') || 'none'}
- Technical level: ${style.technical_level || 'mixed'}
`;
    }

    prompt += `
REQUIREMENTS:
- Each post MUST be ${lengthInstruction.range} long. This is critical — strictly respect this length constraint.
- ${includeEmojis ? 'Include relevant emojis where they fit naturally' : 'No emojis'}
- ${includeHashtags ? 'Include 2-3 relevant hashtags at the end' : 'No hashtags'}
- Each version MUST take a different angle, perspective, or narrative approach
- Sound like a real crypto-native expert, NOT like an AI
- ${isKorean ? 'All content MUST be in Korean (한국어). Use natural Korean crypto community expressions.' : 'All content MUST be in English. Use natural crypto-native English expressions.'}
- Include specific data points, protocol names, or market context where relevant
- Use line breaks (\\n) to structure longer posts for readability

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure:
{
  "tweets": [
    "First post version here...",
    "Second post version here...",
    "Third post version here..."
  ]
}

Do not include any other text, explanations, or markdown formatting. Just the raw JSON.`;

    return prompt;
  }

  private async saveGeneration({
    userId,
    kolId,
    tone,
    topic,
    variants,
  }: {
    userId: string;
    kolId?: string;
    tone: string;
    topic: string;
    variants: TweetVariant[];
  }) {
    try {
      await TweetGeneration.create({
        userId,
        generationType: 'single',
        tweetType: tone,
        kolProfileIds: kolId ? [kolId] : [],
        inputText: topic,
        generatedContent: { variants },
        status: 'completed',
        aiProvider: 'gemini',
        creditsUsed: 1,
      });
    } catch (error) {
      logger.error('Error saving tweet generation:', error);
      // Don't throw - generation succeeded, saving is secondary
    }
  }
}

export default new TweetGeneratorService();
