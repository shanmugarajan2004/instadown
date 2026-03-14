'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Download, Search, X, AlertCircle, Loader2,
  Link as LinkIcon, Clock, Eye, Heart, User,
  CheckCircle, Zap, Shield, Smartphone, Globe,
  Lock, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════ Types */
interface VideoFormat {
  quality: string;
  url: string;
  ext: string;
  filesize: number | null;
}
interface VideoMeta {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: number;
  uploader: string;
  upload_date: string;
  view_count: number;
  like_count: number;
  webpage_url: string;
  formats: VideoFormat[];
}
type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: VideoMeta }
  | { status: 'error'; message: string };

/* ══════════════════════════════════════════════════════ Config */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ══════════════════════════════════════════════════════ Helpers */
function fmtDuration(s: number) {
  if (!s) return '';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function fmtCount(n: number) {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtBytes(b: number | null) {
  if (!b) return '';
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1_024) return `${(b / 1_024).toFixed(0)} KB`;
  return `${b} B`;
}

/* ══════════════════════════════════════════════════════ Thumbnail */
function Thumbnail({ url, duration }: { url: string | null; duration: number }) {
  const [failed, setFailed] = useState(false);

  // url is already a proxied /api/thumbnail?url=... path from the backend
  const src = url ? `${API_URL}${url}` : null;

  if (!src || failed) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-600 text-xs"
        style={{ aspectRatio: '16/9', background: '#111' }}
      >
        <span className="flex flex-col items-center gap-2 opacity-40">
          <Download size={24} />
          <span>Preview unavailable</span>
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#0a0a0a' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Video thumbnail"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
      {duration > 0 && (
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Clock size={11} /> {fmtDuration(duration)}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ GradBtn */
function GradBtn({
  children, onClick, disabled, className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 font-bold rounded-xl text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: disabled ? '#374151' : 'linear-gradient(90deg,#7c3aed,#db2777,#ea580c)' }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════ Quality Selector */
function QualitySelector({
  formats,
  selected,
  onSelect,
}: {
  formats: VideoFormat[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);

  if (formats.length <= 1) return null;

  const current = formats[selected];

  return (
    <div className="relative mb-3">
      <p className="text-xs text-gray-400 mb-1.5 font-medium">Select Quality</p>

      {/* Dropdown trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl text-sm text-white hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          {/* Quality badge */}
          <span
            className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
            style={{ background: 'linear-gradient(90deg,#7c3aed,#db2777)' }}
          >
            {current.quality}
          </span>
          <span className="text-gray-300">{current.ext.toUpperCase()}</span>
          {current.filesize && (
            <span className="text-gray-500 text-xs">{fmtBytes(current.filesize)}</span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {/* Dropdown options */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 glass rounded-xl overflow-hidden shadow-2xl border border-white/10">
          {formats.map((fmt, i) => (
            <button
              key={i}
              onClick={() => { onSelect(i); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/10 ${i === selected ? 'bg-white/5' : ''}`}
            >
              <div className="flex items-center gap-2">
                {/* Checkmark for selected */}
                <span className="w-4 h-4 flex items-center justify-center">
                  {i === selected && <CheckCircle size={14} className="text-green-400" />}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
                  style={{ background: i === selected ? 'linear-gradient(90deg,#7c3aed,#db2777)' : '#374151' }}
                >
                  {fmt.quality}
                </span>
                <span className="text-gray-300">{fmt.ext.toUpperCase()}</span>
              </div>
              {fmt.filesize && (
                <span className="text-gray-500 text-xs">{fmtBytes(fmt.filesize)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ VideoCard */
function VideoCard({ data, onReset }: { data: VideoMeta; onReset: () => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const downloadVideo = () => {
    const fmt = data.formats[selectedIdx];
    // Always stream through backend — this forces Content-Disposition: attachment
    // which makes mobile browsers download instead of playing inline
    const streamUrl = `${API_URL}/api/download?url=${encodeURIComponent(data.webpage_url)}&quality=${encodeURIComponent(fmt?.quality || 'Best')}`;
    const a = document.createElement('a');
    a.href = streamUrl;
    a.download = `instagram_${data.id || 'video'}_${fmt?.quality || 'best'}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedFmt = data.formats[selectedIdx];

  return (
    <div className="w-full max-w-xl mx-auto mt-6 glass rounded-2xl overflow-hidden shadow-2xl">

      {/* Thumbnail */}
      <Thumbnail url={data.thumbnail} duration={data.duration} />

      <div className="p-5">
        {/* Title */}
        {data.title && (
          <h2 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
            {data.title}
          </h2>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
          {data.uploader && (
            <span className="flex items-center gap-1"><User size={11} />{data.uploader}</span>
          )}
          {data.view_count > 0 && (
            <span className="flex items-center gap-1"><Eye size={11} />{fmtCount(data.view_count)}</span>
          )}
          {data.like_count > 0 && (
            <span className="flex items-center gap-1"><Heart size={11} />{fmtCount(data.like_count)}</span>
          )}
        </div>

        {/* Quality selector — only shown when multiple formats exist */}
        {data.formats.length > 0 && (
          <QualitySelector
            formats={data.formats}
            selected={selectedIdx}
            onSelect={setSelectedIdx}
          />
        )}

        {/* Download button */}
        <GradBtn
          onClick={downloadVideo}
          className="w-full px-4 py-3.5 text-sm"
        >
          <Download size={16} />
          Download {selectedFmt?.quality || 'Best'}
          {selectedFmt?.filesize && (
            <span className="ml-1 text-xs opacity-70">
              &middot; {fmtBytes(selectedFmt.filesize)}
            </span>
          )}
        </GradBtn>

        <button
          onClick={onReset}
          className="mt-3 w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 border border-white/10 rounded-xl"
        >
          ← Download another video
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ Features */
const FEATURES = [
  { icon: Zap,        title: 'Lightning Fast',  desc: 'Videos ready in seconds.' },
  { icon: Shield,     title: 'Safe & Secure',   desc: 'No ads, no malware.' },
  { icon: Download,   title: 'HD Quality',      desc: 'Best available resolution.' },
  { icon: Smartphone, title: 'All Devices',     desc: 'Desktop, tablet, mobile.' },
  { icon: Globe,      title: 'No Account',      desc: 'Zero sign-up required.' },
  { icon: Lock,       title: 'No Storage',      desc: 'Nothing saved server-side.' },
];
function Features() {
  return (
    <section className="w-full max-w-xl mx-auto mt-14">
      <h2 className="text-xl font-bold text-center text-white mb-6">Why InstaDown?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg grad-brand flex items-center justify-center mb-3">
              <Icon size={15} className="text-white" />
            </div>
            <p className="text-white text-xs font-semibold mb-1">{title}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════ FAQ */
const FAQS = [
  { q: 'How do I download a video?',      a: 'Copy the Instagram URL, paste it above, click "Get Video", choose your quality and hit Download.' },
  { q: 'Can I choose the video quality?', a: 'Yes! After fetching the video, a quality selector appears. Choose from all available resolutions before downloading.' },
  { q: 'Is it free?',                     a: 'Yes — completely free with no account or sign-up required.' },
  { q: 'What content is supported?',      a: 'Public posts (/p/), Reels (/reel/), and IGTV (/tv/). Private accounts are not supported.' },
  { q: 'Do you store videos?',            a: 'No. Videos stream directly from Instagram to your device. Nothing is saved on our servers.' },
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="w-full max-w-xl mx-auto mt-14 mb-8">
      <h2 className="text-xl font-bold text-center text-white mb-6">FAQ</h2>
      <div className="flex flex-col gap-2">
        {FAQS.map((f, i) => (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors"
            >
              <span>{f.q}</span>
              <ChevronDown size={15} className={`shrink-0 ml-2 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-4 pb-4 text-gray-400 text-xs leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════ Main */
export default function HomePage() {
  const [url,   setUrl]   = useState('');
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await fetch(`${API_URL}/api/fetch`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ url: trimmed }),
      });
      let body: Record<string, unknown>;
      try {
        body = await res.json();
      } catch {
        throw new Error(`Backend error (HTTP ${res.status}). Is it running?`);
      }
      if (!res.ok) throw new Error((body.error as string) || `HTTP ${res.status}`);
      setState({ status: 'success', data: body as unknown as VideoMeta });
    } catch (err: unknown) {
      let msg = 'An unexpected error occurred.';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        msg = `Cannot connect to backend at ${API_URL}.`;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setState({ status: 'error', message: msg });
    }
  }, [url]);

  const handleKey   = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); };
  const handleReset = () => {
    setUrl('');
    setState({ status: 'idle' });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 pt-14 pb-20">

      {/* ── Header ── */}
      <div className="w-full max-w-xl flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon-32.png" alt="InstaDown" width={28} height={28} className="rounded-lg" />
          <span className="font-extrabold text-base tracking-tight text-white">
            Insta<span className="text-grad">Down</span>
          </span>
        </div>
        <nav className="flex gap-5 text-xs text-gray-500">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/dmca"    className="hover:text-white transition-colors">DMCA</a>
          <a href="/terms"   className="hover:text-white transition-colors">Terms</a>
        </nav>
      </div>

      {/* ── Hero ── */}
      <div className="text-center max-w-lg mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 glass px-3 py-1 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Free · No account · Choose your quality
        </span>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-white mb-4">
          Download <span className="text-grad">Instagram</span><br />Videos & Reels
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Paste any public Instagram post, Reel, or IGTV link — pick your quality and download instantly for free.
        </p>
      </div>

      {/* ── Input ── */}
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 glass rounded-2xl p-2 shadow-2xl">
          <LinkIcon size={16} className="ml-2 text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKey}
            placeholder="https://www.instagram.com/reel/..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none min-w-0 py-2"
          />
          {url && (
            <button onClick={handleReset} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <X size={15} />
            </button>
          )}
          <GradBtn
            onClick={handleSubmit}
            disabled={!url.trim() || state.status === 'loading'}
            className="px-5 py-2.5 text-sm shrink-0"
          >
            {state.status === 'loading'
              ? <><Loader2 size={14} className="animate-spin" />Fetching…</>
              : <><Search size={14} />Get Video</>
            }
          </GradBtn>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Only public Instagram content is supported. You are responsible for copyright compliance.
        </p>
      </div>

      {/* ── Error ── */}
      {state.status === 'error' && (
        <div className="w-full max-w-xl mt-6 glass border border-red-500/25 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span className="text-red-400 font-semibold text-sm">Error</span>
          </div>
          <p className="text-red-300 text-sm leading-relaxed mb-4">{state.message}</p>
          <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-200 border border-red-500/30 rounded-lg px-3 py-1.5 transition-colors">
            Try another URL
          </button>
        </div>
      )}

      {/* ── Success ── */}
      {state.status === 'success' && (
        <>
          <div className="w-full max-w-xl mt-6 flex items-center gap-2 text-green-400 text-xs">
            <CheckCircle size={14} /> Video found — select quality and download
          </div>
          <VideoCard data={state.data} onReset={handleReset} />
        </>
      )}

      {/* ── Features + FAQ ── */}
      {(state.status === 'idle' || state.status === 'error') && (
        <>
          <Features />
          <FAQ />
        </>
      )}

      {/* ── Footer ── */}
      <footer className="w-full max-w-xl mt-16 pt-6 border-t border-white/5 flex flex-col items-center gap-4 text-xs text-gray-600">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <span>&copy; {new Date().getFullYear()} InstaDown &mdash; not affiliated with Meta Platforms.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="/terms"   className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="/dmca"    className="hover:text-gray-300 transition-colors">DMCA</a>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <span style={{ color: '#dc2743' }}>&#9829;</span>
          <span>by</span>
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(90deg, #f09433, #dc2743, #bc1888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Shankar
          </span>
        </div>
      </footer>
    </main>
  );
}