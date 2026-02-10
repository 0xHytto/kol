'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';

interface KOL {
  id: string;
  twitter_handle: string;
  display_name: string;
  bio: string;
  follower_count: number;
}

interface KOLSelectorProps {
  value: KOL | null;
  onChange: (kol: KOL | null) => void;
}

export function KOLSelector({ value, onChange }: KOLSelectorProps) {
  const [kols, setKols] = useState<KOL[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKOLs();
  }, []);

  const fetchKOLs = async () => {
    try {
      const response = await apiClient.get('/kol-profiles?limit=10');
      setKols(response.data || []);
    } catch (error) {
      console.error('Failed to fetch KOLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        1️⃣ 누구 스타일로 쓸까요? (KOL 선택)
      </Label>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading KOLs...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kols.map((kol) => (
              <Card
                key={kol.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  value?.id === kol.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => onChange(value?.id === kol.id ? null : kol)}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{kol.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    @{kol.twitter_handle}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    👥 {formatFollowers(kol.follower_count)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            또는{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => onChange(null)}
            >
              ⚙️ 커스텀 스타일
            </button>
            로 작성
          </div>
        </>
      )}
    </div>
  );
}
