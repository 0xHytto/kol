'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type Tone = 'professional' | 'casual' | 'hype' | 'technical' | 'meme';
type Language = 'en' | 'kr';

interface ToneSelectorProps {
  value: Tone;
  onChange: (tone: Tone) => void;
  language: Language;
}

interface ToneOption {
  value: Tone;
  label: string;
  emoji: string;
  description: Record<Language, string>;
}

const TONES: ToneOption[] = [
  {
    value: 'professional',
    label: 'Professional',
    emoji: '🎯',
    description: {
      en: 'Concise, data-driven observation (Ki Young Ju style)',
      kr: '격식체 뉴스리포트 스타일 (~합니다/습니다)',
    },
  },
  {
    value: 'casual',
    label: 'Casual',
    emoji: '💬',
    description: {
      en: 'Personal storytelling, reflective (1mpal style)',
      kr: '반말/경험 공유, 친근한 경험담 (Hope style)',
    },
  },
  {
    value: 'hype',
    label: 'Hype',
    emoji: '🚀',
    description: {
      en: 'Emotional, emoji-heavy excitement (Pentoshi style)',
      kr: '헤드라인 + 이모지 흥분 톤 (Blockstreet style)',
    },
  },
  {
    value: 'technical',
    label: 'Technical',
    emoji: '📊',
    description: {
      en: 'Data reports, rankings, educational (aantonop style)',
      kr: '개발/프로젝트 진행 로그 (Moonyu style)',
    },
  },
  {
    value: 'meme',
    label: 'Meme',
    emoji: '😂',
    description: {
      en: 'Minimal text, cryptic, ironic humor (Cobie style)',
      kr: '극도의 구어체 + 밈 + 자조적 유머',
    },
  },
];

export function ToneSelector({ value, onChange, language }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        3️⃣ 어떤 분위기로 쓸까요? (톤 선택)
      </Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TONES.map((tone) => (
          <Card
            key={tone.value}
            className={`cursor-pointer transition-all hover:border-primary ${
              value === tone.value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onChange(tone.value)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-2xl">{tone.emoji}</div>
              <div className="flex-1">
                <div className="font-medium">{tone.label}</div>
                <div className="text-xs text-muted-foreground">
                  {tone.description[language]}
                </div>
              </div>
              {value === tone.value && (
                <div className="text-primary">●</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
