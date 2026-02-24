import { IDailyResearch, IResearchIssue } from '../../models/daily-research.model';
import { DailyBriefing, IBriefingItem } from '../../models/daily-briefing.model';
import tweetGeneratorService from '../tweet/tweet-generator.service';
import imageGeneratorService from '../image/image-generator.service';
import { logger } from '../../utils/logger';

export class ContentAgentService {
  /**
   * Research 결과를 받아 각 이슈별로 KOL 트윗 + 이미지를 생성하고
   * DailyBriefing DB에 저장합니다.
   */
  async runContentGeneration(research: IDailyResearch): Promise<typeof DailyBriefing.prototype> {
    const { _id: researchId, date, issues } = research;

    // 이미 완료된 브리핑이 있으면 재사용
    const existing = await DailyBriefing.findOne({
      date,
      researchId,
      status: 'completed',
    });
    if (existing) {
      logger.info(`Briefing already exists for ${date}, reusing.`);
      return existing;
    }

    // 브리핑 레코드 생성
    let briefing = await DailyBriefing.findOne({ date, researchId });
    if (!briefing) {
      briefing = await DailyBriefing.create({
        date,
        researchId,
        items: [],
        status: 'in_progress',
      });
    } else {
      briefing.status = 'in_progress';
      briefing.items = [];
      await briefing.save();
    }

    logger.info(`Starting content generation for ${date}: ${issues.length} issues`);

    const items: IBriefingItem[] = [];

    for (const issue of issues) {
      const item = await this.processIssue(issue);
      items.push(item);

      // 중간 저장 (한 이슈 완료할 때마다)
      briefing.items = [...items];
      await briefing.save();

      logger.info(`Processed issue: "${issue.title}" — status: ${item.status}`);
    }

    briefing.status = 'completed';
    briefing.items = items;
    await briefing.save();

    logger.info(`Content generation completed for ${date}`);
    return briefing;
  }

  /**
   * 개별 이슈에 대해 트윗 생성 + 이미지 생성을 수행합니다.
   */
  private async processIssue(issue: IResearchIssue): Promise<IBriefingItem> {
    const baseItem: IBriefingItem = {
      issue: {
        title: issue.title,
        summary: issue.summary,
        whyItMatters: issue.whyItMatters,
        tags: issue.tags,
      },
      tweets: [],
      status: 'pending',
    };

    try {
      // 트윗 생성: professional tone, English, medium length, 3 variants
      const topic = `${issue.title}\n\nContext: ${issue.summary}\n\nWhy it matters: ${issue.whyItMatters}`;

      const tweetResult = await tweetGeneratorService.generateTweets({
        userId: 'system-agent',
        tone: 'professional',
        topic,
        language: 'en',
        lengthRange: 'medium',
        options: { includeEmojis: true, includeHashtags: true, count: 3 },
      });

      baseItem.tweets = tweetResult.variants;

      // 이미지 생성: 첫 번째 트윗 기반으로 프롬프트 추천 → 이미지 생성
      try {
        const firstTweet = tweetResult.variants[0]?.content || topic;
        const promptResult = await imageGeneratorService.suggestPrompt(firstTweet);
        const imageResult = await imageGeneratorService.generateImage(promptResult.prompt);

        baseItem.imageUrl = imageResult.imageUrl;
        baseItem.imagePrompt = promptResult.prompt;
      } catch (imgError) {
        // 이미지 생성 실패는 치명적이지 않음 — 트윗은 유지
        logger.warn(`Image generation failed for issue "${issue.title}":`, imgError);
      }

      baseItem.status = 'completed';
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process issue "${issue.title}":`, error);
      baseItem.status = 'failed';
      baseItem.error = msg;
    }

    return baseItem;
  }
}

export default new ContentAgentService();
