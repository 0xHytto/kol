'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TweetCardProps {
  content: string;
  length: number;
  index: number;
}

export function TweetCard({ content, length, index }: TweetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-muted-foreground">
            버전 {index + 1}
          </div>
          <div className="text-xs text-muted-foreground">
            {length}자
          </div>
        </div>

        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {content}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? '✅ 복사됨!' : '📋 복사하기'}
        </Button>
      </CardFooter>
    </Card>
  );
}
