'use client';

import { useState, useEffect } from 'react';
import { Syne } from 'next/font/google';
import { Space_Mono } from 'next/font/google';
import { RefreshCw, Newspaper, ChevronRight, Copy, Check, Download, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });

interface TweetVariant { content: string; length: number; }
interface BriefingIssue { title: string; summary: string; whyItMatters: string; tags: string[]; }
interface BriefingItem {
  issue: BriefingIssue;
  tweets: TweetVariant[];
  imageUrl?: string;
  imagePrompt?: string;
  status: 'completed' | 'failed' | 'pending';
}
interface Briefing {
  _id: string;
  date: string;
  items: BriefingItem[];
  status: string;
  createdAt: string;
}

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/briefing');
      setBriefing(res.data ?? null);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || '브리핑 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await apiClient.post('/briefing/trigger', {});
      setTriggerMsg(res.message || '브리핑 생성이 시작됐습니다. 완료까지 수 분이 소요될 수 있습니다.');
    } catch (err: any) {
      setTriggerMsg(err?.error?.message || '실행에 실패했습니다.');
    } finally {
      setTriggering(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes b-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .b-fade-up { animation: b-fade-up 0.3s ease forwards; }
        .b-item-enter { animation: b-fade-up 0.4s ease forwards; }
      `}</style>

      <div className={cn('min-h-screen', syne.className)} style={{ background: '#07070f', color: '#e8e8f0' }}>
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div style={{
            position: 'absolute', top: '5%', right: '10%', width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', left: '5%', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto py-12 px-6">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className={cn('text-xs font-bold mb-3 uppercase', spaceMono.className)}
                 style={{ color: '#22d3ee', letterSpacing: '0.22em' }}>
                Daily Research · KOL Briefing
              </p>
              <h1 className="text-4xl font-extrabold mb-2" style={{ letterSpacing: '-0.025em' }}>
                리서치
              </h1>
              <p style={{ color: '#55556a', fontSize: '0.875rem' }}>
                매일 Web3/AI/Crypto 핫이슈를 자동 리서치해 KOL 트윗과 이미지로 정리합니다
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={fetchBriefing}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  fontSize: '0.78rem', letterSpacing: '0.02em',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#9999b0', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading ? 'animate-spin' : '')} />
                새로고침
              </button>
              <button
                onClick={handleTrigger}
                disabled={triggering}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  fontSize: '0.78rem', letterSpacing: '0.02em',
                  background: triggering ? 'rgba(34,211,238,0.05)' : 'rgba(34,211,238,0.1)',
                  border: '1px solid rgba(34,211,238,0.25)',
                  color: triggering ? 'rgba(34,211,238,0.4)' : '#22d3ee',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                }}
              >
                {triggering
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Newspaper className="h-3.5 w-3.5" />
                }
                리서치 실행
              </button>
            </div>
          </div>

          {/* Trigger message */}
          {triggerMsg && (
            <div className="mb-5 rounded-xl px-4 py-3 b-fade-up"
                 style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)' }}>
              <p style={{ color: '#22d3ee', fontSize: '0.875rem' }}>{triggerMsg}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3 b-fade-up"
                 style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#f87171' }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div style={{ textAlign: 'center' }}>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: '#22d3ee' }} />
                <p style={{ color: '#55556a', fontSize: '0.875rem' }}>브리핑 로딩 중...</p>
              </div>
            </div>
          )}

          {/* No data */}
          {!loading && !briefing && !error && (
            <div className="rounded-2xl px-6 py-16 text-center b-fade-up"
                 style={{ border: '1.5px dashed rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <h3 className="font-semibold mb-2">아직 브리핑이 없습니다</h3>
              <p style={{ color: '#55556a', fontSize: '0.875rem', maxWidth: 320, margin: '0 auto' }}>
                "리서치 실행" 버튼을 눌러 오늘의 Web3 핫이슈 브리핑을 생성하세요
              </p>
            </div>
          )}

          {/* Briefing content */}
          {!loading && briefing && (
            <div className="space-y-4 b-fade-up">
              {/* Date header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className={cn('text-xs font-bold', spaceMono.className)}
                      style={{ color: '#3a3a4e', letterSpacing: '0.12em' }}>
                  {briefing.date}
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {briefing.items.map((item, idx) => (
                <BriefingCard
                  key={idx}
                  item={item}
                  index={idx}
                  isExpanded={expandedItem === idx}
                  onToggle={() => setExpandedItem(expandedItem === idx ? null : idx)}
                  onCopy={handleCopy}
                  copiedIndex={copiedIndex}
                  spaceMono={spaceMono.className}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── BriefingCard sub-component ──────────────────────────────────────────────

function BriefingCard({
  item, index, isExpanded, onToggle, onCopy, copiedIndex, spaceMono
}: {
  item: BriefingItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, key: string) => void;
  copiedIndex: string | null;
  spaceMono: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
    >
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4 transition-all"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span
          className={cn('text-xs font-bold mt-0.5 shrink-0', spaceMono)}
          style={{ color: '#3a3a4e' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-1 leading-snug" style={{ letterSpacing: '-0.01em' }}>
            {item.issue.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {item.issue.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={cn('text-xs px-2 py-0.5 rounded-full font-bold', spaceMono)}
                style={{
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px solid rgba(34,211,238,0.18)',
                  color: '#22d3ee',
                  letterSpacing: '0.04em',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {!isExpanded && (
            <p style={{ color: '#55556a', fontSize: '0.8rem', lineHeight: 1.5 }}>
              {item.issue.summary.slice(0, 120)}…
            </p>
          )}
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 mt-0.5 transition-transform duration-200"
          style={{
            color: '#3a3a4e',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="pt-4 space-y-5">
            {/* Issue summary */}
            <div className="space-y-2">
              <p className={cn('text-xs font-bold uppercase', spaceMono)}
                 style={{ color: '#55556a', letterSpacing: '0.14em' }}>Summary</p>
              <p style={{ color: '#c0c0d0', fontSize: '0.875rem', lineHeight: 1.7 }}>
                {item.issue.summary}
              </p>
            </div>
            <div className="space-y-2">
              <p className={cn('text-xs font-bold uppercase', spaceMono)}
                 style={{ color: '#55556a', letterSpacing: '0.14em' }}>Why It Matters</p>
              <p style={{ color: '#c0c0d0', fontSize: '0.875rem', lineHeight: 1.7 }}>
                {item.issue.whyItMatters}
              </p>
            </div>

            {/* Image */}
            {item.imageUrl && (
              <div>
                <p className={cn('text-xs font-bold uppercase mb-2', spaceMono)}
                   style={{ color: '#55556a', letterSpacing: '0.14em' }}>Generated Image</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <img src={item.imageUrl} alt={item.issue.title} className="w-full block" />
                  <div className="px-4 py-3 flex items-center justify-between"
                       style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <p className={cn('text-xs', spaceMono)} style={{ color: '#3a3a4e' }}>
                      DALL·E 3
                    </p>
                    <a
                      href={item.imageUrl}
                      download="briefing-image.png"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e8e8f0', textDecoration: 'none',
                      }}
                    >
                      <Download className="h-3 w-3" />
                      다운로드
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tweets */}
            {item.tweets.length > 0 && (
              <div>
                <p className={cn('text-xs font-bold uppercase mb-3', spaceMono)}
                   style={{ color: '#55556a', letterSpacing: '0.14em' }}>
                  Generated Tweets ({item.tweets.length})
                </p>
                <div className="space-y-3">
                  {item.tweets.map((tweet, ti) => {
                    const copyKey = `${index}-${ti}`;
                    const copied = copiedIndex === copyKey;
                    return (
                      <div
                        key={ti}
                        className="rounded-xl p-4"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn('text-xs font-bold', spaceMono)}
                                style={{ color: '#3a3a4e', letterSpacing: '0.08em' }}>
                            VERSION {ti + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={cn('text-xs', spaceMono)} style={{ color: '#3a3a4e' }}>
                              {tweet.length}자
                            </span>
                            <button
                              onClick={() => onCopy(tweet.content, copyKey)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
                              style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                background: copied ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${copied ? 'rgba(34,211,238,0.25)' : 'rgba(255,255,255,0.09)'}`,
                                color: copied ? '#22d3ee' : '#9999b0',
                                cursor: 'pointer',
                              }}
                            >
                              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {copied ? '복사됨' : '복사'}
                            </button>
                          </div>
                        </div>
                        <p style={{ color: '#c0c0d0', fontSize: '0.875rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                          {tweet.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Failed state */}
            {item.status === 'failed' && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                   style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#f87171' }} />
                <p style={{ color: '#f87171', fontSize: '0.875rem' }}>
                  이 이슈의 콘텐츠 생성에 실패했습니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
