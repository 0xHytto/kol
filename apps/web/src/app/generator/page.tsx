'use client';

import { useState } from 'react';
import { KOLSelector } from '@/components/tweet-generator/kol-selector';
import { ToneSelector } from '@/components/tweet-generator/tone-selector';
import { TweetCard } from '@/components/tweet-generator/tweet-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

type Tone = 'professional' | 'casual' | 'hype' | 'technical' | 'meme';

interface KOL {
  id: string;
  twitter_handle: string;
  display_name: string;
  bio: string;
  follower_count: number;
}

interface TweetVariant {
  content: string;
  length: number;
}

export default function TweetGeneratorPage() {
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [tone, setTone] = useState<Tone>('professional');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<TweetVariant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedTweets([]);

    try {
      const response = await apiClient.post('/tweet-generator/generate', {
        kolId: selectedKOL?.id,
        tone,
        topic: topic.trim(),
        options: {
          includeEmojis: true,
          includeHashtags: true,
          count: 3,
        },
      });

      setGeneratedTweets(response.data.variants || []);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(
        err?.error?.message || 'Failed to generate tweets. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🐦 AI 트윗 생성기</h1>
          <p className="text-muted-foreground">
            AI가 당신의 아이디어를 매력적인 트윗으로 만들어드립니다
          </p>
        </div>

        <div className="space-y-8">
          {/* KOL Selector */}
          <KOLSelector value={selectedKOL} onChange={setSelectedKOL} />

          {/* Tone Selector */}
          <ToneSelector value={tone} onChange={setTone} />

          {/* Topic Input */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              3️⃣ 무엇에 대해 쓸까요? (주제 입력)
            </Label>
            <Textarea
              placeholder="예: Bitcoin ETF 승인, 이더리움 업그레이드, DeFi 프로토콜 보안..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            size="lg"
            className="w-full"
          >
            {loading ? '✨ 생성 중...' : '✨ 트윗 생성하기'}
          </Button>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4 text-destructive">
                ⚠️ {error}
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">
                  AI가 트윗을 생성하고 있습니다...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Generated Tweets */}
          {generatedTweets.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">📝 생성된 트윗</h2>
                {selectedKOL && (
                  <div className="text-sm text-muted-foreground">
                    {selectedKOL.display_name} 스타일 · {tone}
                  </div>
                )}
              </div>

              {generatedTweets.map((tweet, index) => (
                <TweetCard
                  key={index}
                  content={tweet.content}
                  length={tweet.length}
                  index={index}
                />
              ))}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  🔄 다시 생성하기
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && generatedTweets.length === 0 && !error && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="font-medium mb-2">
                  주제를 입력하고 트윗을 생성해보세요
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI가 당신의 생각을 매력적인 트윗으로 만들어드립니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
