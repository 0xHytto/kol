'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type Tone = 'professional' | 'casual' | 'hype' | 'technical' | 'meme';

interface ToneSelectorProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

const TONES: {
  value: Tone;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    value: 'professional',
    label: 'Professional',
    emoji: '🎯',
    description: '전문적이고 신뢰감있게',
  },
  {
    value: 'casual',
    label: 'Casual',
    emoji: '💬',
    description: '편하고 친근하게',
  },
  {
    value: 'hype',
    label: 'Hype',
    emoji: '🚀',
    description: '흥분되고 기대감있게',
  },
  {
    value: 'technical',
    label: 'Technical',
    emoji: '📊',
    description: '기술적이고 상세하게',
  },
  {
    value: 'meme',
    label: 'Meme',
    emoji: '😂',
    description: '재미있고 밈스럽게',
  },
];

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        2️⃣ 어떤 분위기로 쓸까요? (톤 선택)
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
                  {tone.description}
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
