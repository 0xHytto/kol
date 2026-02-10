export enum GenerationStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const GENERATION_STATUSES = Object.values(GenerationStatus);
