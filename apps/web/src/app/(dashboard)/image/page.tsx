'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useDropzone } from 'react-dropzone';
import { Syne } from 'next/font/google';
import { Space_Mono } from 'next/font/google';
import {
  Sparkles,
  Upload,
  X,
  Download,
  Wand2,
  ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { suggestImagePrompt, generateImage } from '@/lib/image-api';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });

type ImageMode = 'ai-suggest' | 'manual';

export default function ImageGeneratorPage() {
  const [mode, setMode] = useState<ImageMode>('ai-suggest');
  const [tweetContent, setTweetContent] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  const [manualPrompt, setManualPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    };
  }, [uploadedPreviewUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setUploadedFile(file);
      setUploadedPreviewUrl(url);
      setGeneratedImageUrl(null);
      setError(null);
    },
    [uploadedPreviewUrl]
  );

  const handleClearUpload = () => {
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleSuggest = async () => {
    if (!tweetContent.trim()) return;
    setIsSuggesting(true);
    setError(null);
    try {
      const result = await suggestImagePrompt(tweetContent);
      setSuggestedPrompt(result.prompt);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || '프롬프트 생성에 실패했습니다.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerate = async () => {
    const activePrompt = mode === 'ai-suggest' ? suggestedPrompt : manualPrompt;
    if (!activePrompt.trim() || uploadedFile || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage(activePrompt);
      setGeneratedImageUrl(result.imageUrl);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || '이미지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activePrompt = mode === 'ai-suggest' ? suggestedPrompt : manualPrompt;
  const canGenerate = !!activePrompt.trim() && !uploadedFile && !isGenerating;
  const resultImageUrl = uploadedPreviewUrl || generatedImageUrl;

  return (
    <>
      <style>{`
        @keyframes kol-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes kol-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes kol-pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.15); }
          50%       { box-shadow: 0 0 40px rgba(245,158,11,0.35); }
        }
        .kol-fade-up   { animation: kol-fade-up 0.35s ease forwards; }
        .kol-spin-anim { animation: kol-spin 0.8s linear infinite; }
        .kol-generate-active { animation: kol-pulse-glow 2s ease-in-out infinite; }
        .kol-textarea {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8e8f0;
          width: 100%;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.875rem;
          line-height: 1.7;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .kol-textarea:focus { border-color: rgba(245,158,11,0.45); }
        .kol-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .kol-textarea-gold {
          background: rgba(245,158,11,0.04);
          border: 1px solid rgba(245,158,11,0.22);
        }
        .kol-textarea-gold:focus { border-color: rgba(245,158,11,0.55); }
      `}</style>

      <div
        className={cn('min-h-screen', syne.className)}
        style={{ background: '#07070f', color: '#e8e8f0' }}
      >
        {/* Ambient blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div style={{
            position: 'absolute', top: '8%', left: '15%',
            width: 480, height: 480,
            background: 'radial-gradient(circle, rgba(251,191,36,0.045) 0%, transparent 68%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '18%', right: '8%',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 68%)',
            filter: 'blur(60px)',
          }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto py-12 px-6">

          {/* ── Header ── */}
          <div className="mb-10">
            <p
              className={cn('text-xs font-bold mb-3 uppercase', spaceMono.className)}
              style={{ color: '#f59e0b', letterSpacing: '0.22em' }}
            >
              Gemini · Image Generation
            </p>
            <h1
              className="text-4xl font-extrabold mb-3"
              style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
            >
              이미지 생성기
            </h1>
            <p style={{ color: '#55556a', fontSize: '0.875rem', lineHeight: 1.65 }}>
              트윗에 맞는 비주얼을 AI로 생성하거나, 직접 업로드하세요
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3 kol-fade-up"
              style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.22)',
              }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#f87171' }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {/* ── Main input card ── */}
          <div
            className="rounded-2xl p-6 mb-5"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <Tabs.Root value={mode} onValueChange={(v) => setMode(v as ImageMode)}>
              {/* Tab list */}
              <Tabs.List
                className="flex rounded-xl p-1 mb-6 gap-1"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {[
                  { value: 'ai-suggest', label: 'AI 추천 프롬프트', icon: <Sparkles className="h-3.5 w-3.5" /> },
                  { value: 'manual',     label: '직접 입력',        icon: <Wand2    className="h-3.5 w-3.5" /> },
                ].map((tab) => {
                  const active = mode === tab.value;
                  return (
                    <Tabs.Trigger
                      key={tab.value}
                      value={tab.value}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 font-bold transition-all duration-200"
                      style={{
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        outline: 'none',
                        border: 'none',
                        color:      active ? '#07070f'          : '#55556a',
                        background: active ? '#f59e0b'          : 'transparent',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>

              {/* ── AI Suggest ── */}
              <Tabs.Content value="ai-suggest" className="space-y-4">
                <div>
                  <label
                    className={cn('block text-xs font-bold mb-2', spaceMono.className)}
                    style={{ color: '#55556a', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                  >
                    트윗 내용
                  </label>
                  <textarea
                    className="kol-textarea"
                    value={tweetContent}
                    onChange={(e) => setTweetContent(e.target.value)}
                    placeholder="생성된 트윗 내용을 붙여넣으세요..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSuggest}
                  disabled={!tweetContent.trim() || isSuggesting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all duration-200"
                  style={{
                    fontSize: '0.78rem',
                    letterSpacing: '0.02em',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.28)',
                    color: !tweetContent.trim() || isSuggesting ? 'rgba(245,158,11,0.35)' : '#f59e0b',
                    cursor: !tweetContent.trim() || isSuggesting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSuggesting ? (
                    <>
                      <div
                        className="kol-spin-anim"
                        style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: '2px solid currentColor',
                          borderTopColor: 'transparent',
                        }}
                      />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      AI 프롬프트 추천받기
                    </>
                  )}
                </button>

                {suggestedPrompt && (
                  <div className="kol-fade-up space-y-2">
                    <label
                      className={cn('block text-xs font-bold', spaceMono.className)}
                      style={{ color: '#f59e0b', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                    >
                      추천 프롬프트{' '}
                      <span style={{ color: '#55556a', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                        (수정 가능)
                      </span>
                    </label>
                    <textarea
                      className="kol-textarea kol-textarea-gold"
                      value={suggestedPrompt}
                      onChange={(e) => setSuggestedPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </Tabs.Content>

              {/* ── Manual ── */}
              <Tabs.Content value="manual">
                <div>
                  <label
                    className={cn('block text-xs font-bold mb-2', spaceMono.className)}
                    style={{ color: '#55556a', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                  >
                    이미지 프롬프트
                  </label>
                  <textarea
                    className="kol-textarea"
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    placeholder="예: A glowing Bitcoin symbol floating above a futuristic city skyline, cinematic lighting, deep blue and gold tones..."
                    rows={6}
                  />
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>

          {/* ── Upload section ── */}
          {uploadedFile ? (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between mb-5"
              style={{
                background: 'rgba(34,211,238,0.055)',
                border: '1px solid rgba(34,211,238,0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4 shrink-0" style={{ color: '#22d3ee' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#22d3ee' }}>
                    {uploadedFile.name}
                  </p>
                  <p
                    className={spaceMono.className}
                    style={{ fontSize: '0.72rem', color: '#55556a', marginTop: 2 }}
                  >
                    {(uploadedFile.size / 1024).toFixed(0)} KB · 업로드됨
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all"
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(239,68,68,0.09)',
                  border: '1px solid rgba(239,68,68,0.22)',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
              >
                <X className="h-3.5 w-3.5" />
                업로드 취소
              </button>
            </div>
          ) : (
            <>
              {/* Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span
                  className={cn('text-xs font-bold', spaceMono.className)}
                  style={{ color: '#2e2e3e', letterSpacing: '0.1em' }}
                >
                  또는 직접 업로드
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className="rounded-xl px-6 py-8 text-center mb-5 transition-all duration-200"
                style={{
                  border: `1.5px dashed ${isDragActive ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.09)'}`,
                  background: isDragActive ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.015)',
                  cursor: 'pointer',
                }}
              >
                <input {...getInputProps()} />
                <Upload
                  className="mx-auto mb-3"
                  style={{
                    width: 22, height: 22,
                    color: isDragActive ? '#f59e0b' : '#2e2e3e',
                    transition: 'color 0.2s',
                  }}
                />
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: isDragActive ? '#f59e0b' : '#55556a', transition: 'color 0.2s' }}
                >
                  {isDragActive ? '여기에 놓으세요' : '드래그하거나 클릭해서 업로드'}
                </p>
                <p
                  className={spaceMono.className}
                  style={{ fontSize: '0.72rem', color: '#2e2e3e' }}
                >
                  PNG, JPG, WebP · 최대 5MB
                </p>
              </div>
            </>
          )}

          {/* ── Generate button ── */}
          {!uploadedFile && (
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all duration-300 mb-6',
                canGenerate && !isGenerating ? 'kol-generate-active' : ''
              )}
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                background: canGenerate
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: canGenerate ? 'none' : '1px solid rgba(255,255,255,0.07)',
                color: canGenerate ? '#07070f' : '#2e2e3e',
                cursor: canGenerate ? 'pointer' : 'not-allowed',
              }}
            >
              {isGenerating ? (
                <>
                  <div
                    className="kol-spin-anim"
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                    }}
                  />
                  Gemini 생성 중… (최대 60초)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  이미지 생성하기
                </>
              )}
            </button>
          )}

          {/* ── Result ── */}
          {resultImageUrl && (
            <div
              className="rounded-2xl overflow-hidden kol-fade-up"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img
                src={resultImageUrl}
                alt={uploadedFile ? '업로드된 이미지' : '생성된 이미지'}
                className="w-full block"
                style={{ display: 'block' }}
              />
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{
                  background: 'rgba(0,0,0,0.65)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p
                  className={cn('text-xs font-bold uppercase', spaceMono.className)}
                  style={{
                    color: uploadedFile ? '#22d3ee' : '#f59e0b',
                    letterSpacing: '0.14em',
                  }}
                >
                  {uploadedFile ? '업로드된 이미지' : 'Gemini 생성됨'}
                </p>
                <a
                  href={resultImageUrl}
                  download={uploadedFile ? uploadedFile.name : 'generated-image.png'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all"
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e8e8f0',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  다운로드
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
