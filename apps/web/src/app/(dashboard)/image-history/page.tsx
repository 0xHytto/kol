'use client';

import { useState, useEffect } from 'react';
import { Syne } from 'next/font/google';
import { Space_Mono } from 'next/font/google';
import {
  Download,
  RefreshCw,
  ImageIcon,
  X,
  AlertCircle,
  ZoomIn,
  Copy,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getImageGenerations, ImageGenerationItem } from '@/lib/tweet-api';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });

function ImageModal({
  item,
  onClose,
}: {
  item: ImageGenerationItem;
  onClose: () => void;
}) {
  const [promptCopied, setPromptCopied] = useState(false);

  const handleCopyPrompt = async () => {
    const succeed = () => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1500);
      toast.success('프롬프트가 복사됐어요', { duration: 2000, icon: '📋' });
    };

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(item.prompt);
        succeed();
        return;
      } catch {
        // fall through
      }
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = item.prompt;
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

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(12,12,18,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.prompt}
          className="w-full object-cover"
          style={{ maxHeight: '480px', objectFit: 'contain', background: '#0a0a10' }}
        />

        {/* Info */}
        <div className="p-5">
          {item.tweetContent && (
            <div className="mb-4">
              <p
                className={cn('text-xs font-bold uppercase mb-1.5', spaceMono.className)}
                style={{ color: '#475569', letterSpacing: '0.15em' }}
              >
                원본 트윗
              </p>
              <p
                className="text-sm leading-relaxed rounded-lg px-3 py-2.5"
                style={{
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {item.tweetContent}
              </p>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p
                className={cn('text-xs font-bold uppercase', spaceMono.className)}
                style={{ color: '#475569', letterSpacing: '0.15em' }}
              >
                프롬프트
              </p>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-all"
                style={{
                  color: promptCopied ? '#10b981' : '#64748b',
                  background: promptCopied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${promptCopied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {promptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span className={spaceMono.className}>{promptCopied ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <p
              className="text-sm leading-relaxed rounded-lg px-3 py-2.5"
              style={{
                color: '#cbd5e1',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {item.prompt}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={cn('text-xs', spaceMono.className)}
              style={{ color: '#334155' }}
            >
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <a
              href={item.imageUrl}
              download={item.filename}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#fbbf24',
              }}
            >
              <Download className="w-4 h-4" />
              다운로드
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  item,
  onClick,
}: {
  item: ImageGenerationItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden text-left w-full transition-all"
      style={{
        background: 'rgba(15,15,20,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        aspectRatio: '1',
      }}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.prompt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <ZoomIn className="w-6 h-6" style={{ color: '#f1f5f9' }} />
      </div>

      {/* Bottom info bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}
      >
        <p
          className="text-xs line-clamp-2 leading-snug"
          style={{ color: '#cbd5e1' }}
        >
          {item.prompt}
        </p>
        <p
          className={cn('text-xs mt-1', spaceMono.className)}
          style={{ color: '#475569' }}
        >
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
        </p>
      </div>
    </button>
  );
}

export default function ImageHistoryPage() {
  const [items, setItems] = useState<ImageGenerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ImageGenerationItem | null>(null);

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
      const data = await getImageGenerations(LIMIT, currentOffset);
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
        @keyframes ih-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ih-fade-up { animation: ih-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .ih-grid-item { animation: ih-fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div
        className="min-h-screen px-6 py-8"
        style={{ background: 'linear-gradient(160deg, #090910 0%, #0d0d18 50%, #090910 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="ih-fade-up mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn('text-xs font-bold uppercase mb-2', spaceMono.className)}
                  style={{ color: '#f59e0b', letterSpacing: '0.2em' }}
                >
                  Image · History
                </p>
                <h1
                  className={cn('text-3xl font-extrabold', syne.className)}
                  style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}
                >
                  이미지 히스토리
                </h1>
                <p className="text-sm mt-1" style={{ color: '#475569' }}>
                  {loading ? '로딩 중…' : `총 ${total}개의 생성 이미지`}
                </p>
              </div>
              <button
                onClick={() => fetchItems(true)}
                disabled={loading}
                className="p-2.5 rounded-xl transition-all"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b',
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
              className="ih-fade-up flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    aspectRatio: '1',
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && !error && (
            <div
              className="ih-fade-up text-center py-20 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <ImageIcon className="w-10 h-10 mx-auto mb-4" style={{ color: '#1d2a3e' }} />
              <p className={cn('text-base font-semibold mb-1', syne.className)} style={{ color: '#334155' }}>
                아직 생성된 이미지가 없어요
              </p>
              <p className="text-sm" style={{ color: '#1e293b' }}>
                /image에서 이미지를 생성해보세요
              </p>
            </div>
          )}

          {/* Image grid */}
          {!loading && items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="ih-grid-item"
                  style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
                >
                  <ImageCard item={item} onClick={() => setSelectedItem(item)} />
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
                className={cn('px-6 py-2.5 rounded-xl text-sm font-semibold transition-all', spaceMono.className)}
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#fbbf24',
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

      {/* Modal */}
      {selectedItem && (
        <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
