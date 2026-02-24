import cron from 'node-cron';
import researchAgentService from '../services/agent/research-agent.service';
import contentAgentService from '../services/agent/content-agent.service';
import { logger } from '../utils/logger';

/**
 * 매일 오후 12시 (KST = UTC 03:00)에 실행:
 * 1. Research Agent: Web3/AI/Crypto 핫이슈 리서치
 * 2. Content Agent: 각 이슈별 트윗 + 이미지 생성
 */
export async function runDailyBriefing(): Promise<void> {
  logger.info('Daily briefing job started');

  try {
    // Step 1: Research
    logger.info('[1/2] Running research agent...');
    const research = await researchAgentService.runDailyResearch();
    logger.info(`[1/2] Research done: ${research.issues.length} issues`);

    // Step 2: Content Generation
    logger.info('[2/2] Running content agent...');
    const briefing = await contentAgentService.runContentGeneration(research);
    logger.info(`[2/2] Content generation done: ${briefing.items.length} items`);

    logger.info('Daily briefing job completed successfully');
  } catch (error) {
    logger.error('Daily briefing job failed:', error);
  }
}

/**
 * 스케줄러 초기화.
 * - 매일 오전 09:00 KST (UTC 00:00) 실행
 *   cron: "0 0 * * *"  (UTC 기준)
 *   → KST(UTC+9)로는 오전 9시
 *
 * 환경변수 DAILY_BRIEFING_CRON으로 오버라이드 가능
 * 기본값: "0 0 * * *"  (UTC 00:00 = KST 09:00)
 */
export function initDailyBriefingScheduler(): void {
  const cronExpression = process.env.DAILY_BRIEFING_CRON || '0 0 * * *';

  if (!cron.validate(cronExpression)) {
    logger.error(`Invalid cron expression: ${cronExpression}`);
    return;
  }

  cron.schedule(cronExpression, () => {
    runDailyBriefing();
  }, {
    timezone: 'UTC',
  });

  logger.info(`Daily briefing scheduler initialized (cron: ${cronExpression} UTC)`);
}
