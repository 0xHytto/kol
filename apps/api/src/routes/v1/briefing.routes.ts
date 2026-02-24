import { Router } from 'express';
import briefingController from '../../controllers/briefing.controller';

const router = Router();

// 최신 브리핑 조회
router.get('/', briefingController.getLatest.bind(briefingController));

// 브리핑 히스토리 목록
router.get('/history', briefingController.getHistory.bind(briefingController));

// 특정 날짜 브리핑
router.get('/:date', briefingController.getByDate.bind(briefingController));

// 수동 실행 트리거 (개발/테스트용)
router.post('/trigger', briefingController.trigger.bind(briefingController));

export default router;
