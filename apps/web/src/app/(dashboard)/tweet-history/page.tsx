'use client';

import { useState, useEffect } from 'react';
import { Syne } from 'next/font/google';
import { Space_Mono } from 'next/font/google';
import {
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Twitter,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getTweetGenerations, TweetGenerationItem } from '@/lib/tweet-api';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });

const TONE_LABELS: Record<string, string> = {
  professional: '🎯 프로',
  casual: '😊 캐주얼',
  hype: '🔥 하이프',
  technical: '🔬 기술적',
  meme: '😂 밈',
};

const LENGTH_LABELS: Record<string, string> = {
  short: 'S',
  medium: 'M',
  long: 'L',
};

const TONE_COLORS: Record<string, string> = {
  professional: '#3b82f6',
  casual: '#10b981',
  hype: '#f59e0b',
  technical: '#8b5cf6',
  meme: '#ec4899',
};

function TweetCard({ item }: { item: TweetGenerationItem }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    const succeed = () => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
      toast.success('클립보드에 복사됐어요', { duration: 2000, icon: '📋' });
    };

    // Modern Clipboard API
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        succeed();
        return;
      } catch {
        // fall through to legacy
      }
    }

    // Legacy fallback (execCommand)
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      succeed();
    } catch {
      toast.error('복사에 실패했어요. 직접 선택해서 복사해주세요.');
    }
  };

  const toneColor = TONE_COLORS[item.tone] || '#64748b';
  const displayedVariants = expanded ? item.variants : item.variants.slice(0, 1);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'rgba(15,15,20,0.85)',
        borderColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn('text-sm font-semibold leading-snug flex-1 line-clamp-2', syne.className)}
            style={{ color: '#f1f5f9' }}
          >
            {item.topic || '(주제 없음)'}
          </p>
          <span
            className={cn('text-xs shrink-0 mt-0.5', spaceMono.className)}
            style={{ color: '#475569' }}
          >
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span
            className={cn('text-xs px-2 py-0.5 rounded-full font-medium', spaceMono.className)}
            style={{ background: `${toneColor}22`, color: toneColor, border: `1px solid ${toneColor}44` }}
          >
            {TONE_LABELS[item.tone] || item.tone}
          </span>
          <span
            className={cn('text-xs px-2 py-0.5 rounded-full', spaceMono.className)}
            style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}
          >
            {item.language === 'kr' ? '🇰🇷 한국어' : '🇺🇸 English'}
          </span>
          {LENGTH_LABELS[item.lengthRange] && (
            <span
              className={cn('text-xs px-2 py-0.5 rounded-full', spaceMono.className)}
              style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}
            >
              길이 {LENGTH_LABELS[item.lengthRange]}
            </span>
          )}
          {item.kolName && (
            <span
              className={cn('text-xs px-2 py-0.5 rounded-full', spaceMono.className)}
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              @{item.kolName}
            </span>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {displayedVariants.map((variant, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {item.variants.length > 1 && (
                  <span
                    className={cn('text-xs mb-2 block', spaceMono.className)}
                    style={{ color: '#475569' }}
                  >
                    variant {i + 1}/{item.variants.length}
                  </span>
                )}
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#cbd5e1' }}
                >
                  {variant.content}
                </p>
                <span
                  className={cn('text-xs mt-2 block', spaceMono.className)}
                  style={{ color: '#334155' }}
                >
                  {variant.length}자
                </span>
              </div>
              <button
                onClick={() => handleCopy(variant.content, i)}
                className="shrink-0 p-1.5 rounded-lg transition-all mt-0.5"
                style={{
                  background: copiedIndex === i ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  color: copiedIndex === i ? '#10b981' : '#64748b',
                  border: `1px solid ${copiedIndex === i ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
                title="복사"
              >
                {copiedIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expand toggle */}
      {item.variants.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs transition-all"
          style={{
            color: '#475569',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <span className={spaceMono.className}>
            {expanded ? '접기' : `variant ${item.variants.length}개 모두 보기`}
          </span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

export default function TweetHistoryPage() {
  const [items, setItems] = useState<TweetGenerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchItems = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const data = await getTweetGenerations(LIMIT, currentOffset);
      if (reset) {
        setItems(data.items);
      } else {
        setItems((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
      if (!reset) setOffset(currentOffset + data.items.length);
    } catch (e: any) {
      setError(e?.message || '히스토리를 불러오지 못했어요.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
  }, []);

  const hasMore = items.length < total;

  return (
    <>
      <style>{`
        @keyframes th-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .th-fade-up { animation: th-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .th-card-delay-0 { animation-delay: 0.05s; }
        .th-card-delay-1 { animation-delay: 0.10s; }
        .th-card-delay-2 { animation-delay: 0.15s; }
        .th-card-delay-3 { animation-delay: 0.20s; }
        .th-card-delay-4 { animation-delay: 0.25s; }
      `}</style>

      <div
        className="min-h-screen px-6 py-8"
        style={{ background: 'linear-gradient(160deg, #090910 0%, #0d0d18 50%, #090910 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="th-fade-up mb-8" style={{ animationDelay: '0s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn('text-xs font-bold uppercase mb-2', spaceMono.className)}
                  style={{ color: '#3b82f6', letterSpacing: '0.2em' }}
                >
                  Tweet · History
                </p>
                <h1
                  className={cn('text-3xl font-extrabold', syne.className)}
                  style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}
                >
                  트윗 히스토리
                </h1>
                <p className="text-sm mt-1" style={{ color: '#475569' }}>
                  {loading ? '로딩 중…' : `총 ${total}개의 생성 기록`}
                </p>
              </div>
              <button
                onClick={() => fetchItems(true)}
                disabled={loading}
                className="p-2.5 rounded-xl transition-all"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: '#3b82f6',
                }}
                title="새로고침"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="th-fade-up flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl h-36 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && !error && (
            <div
              className="th-fade-up text-center py-20 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Twitter className="w-10 h-10 mx-auto mb-4" style={{ color: '#1d2a3e' }} />
              <p className={cn('text-base font-semibold mb-1', syne.className)} style={{ color: '#334155' }}>
                아직 생성된 트윗이 없어요
              </p>
              <p className="text-sm" style={{ color: '#1e293b' }}>
                /generator에서 트윗을 생성해보세요
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={cn('th-fade-up', `th-card-delay-${Math.min(i, 4)}`)}
                >
                  <TweetCard item={item} />
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => fetchItems(false)}
                disabled={loadingMore}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  spaceMono.className
                )}
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: '#60a5fa',
                  opacity: loadingMore ? 0.5 : 1,
                }}
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 로딩 중…
                  </span>
                ) : (
                  `더 보기 (${total - items.length}개 남음)`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
