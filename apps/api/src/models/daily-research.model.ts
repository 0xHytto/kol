import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchIssue {
  title: string;
  summary: string;
  whyItMatters: string;
  sources: string[];
  tags: string[];
}

export type ResearchStatus = 'pending' | 'completed' | 'failed';

export interface IDailyResearch extends Document {
  date: string;          // 'YYYY-MM-DD'
  issues: IResearchIssue[];
  status: ResearchStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchIssueSchema = new Schema<IResearchIssue>(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    sources: [{ type: String }],
    tags: [{ type: String }],
  },
  { _id: false }
);

const DailyResearchSchema = new Schema<IDailyResearch>(
  {
    date: { type: String, required: true },
    issues: [ResearchIssueSchema],
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    error: String,
  },
  { timestamps: true }
);

DailyResearchSchema.index({ date: -1 });
DailyResearchSchema.index({ status: 1 });

export const DailyResearch = mongoose.model<IDailyResearch>('DailyResearch', DailyResearchSchema);
