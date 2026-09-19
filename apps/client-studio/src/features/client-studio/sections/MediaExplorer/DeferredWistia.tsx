import { useEffect, useId, useState } from 'react';

export const WISTIA_POSTER = 'https://res.cloudinary.com/djiq5pxj1/image/upload/v1789593526/Sni%CC%81mek_obrazovky_2026-09-16_v_23.13.32_ocmynv.png';
const PLAYER_SCRIPT = 'https://fast.wistia.net/assets/external/E-v1.js';

export function activatedWistiaUrl(src: string): string {
  const url = new URL(src);
  url.searchParams.set('autoPlay', 'true');
  url.searchParams.set('muted', 'false');
  url.searchParams.set('silentAutoPlay', 'false');
  return url.href;
}

type WistiaQueueEntry = { id: string; onReady: () => void };
type WistiaWindow = Window & { _wq?: WistiaQueueEntry[] };

/** No iframe or vendor script until this particular surface is activated. */
export function DeferredWistia({ src, title, activated, surface }: {
  src: string;
  title: string;
  activated?: boolean;
  surface: 'main' | 'thumbnail';
}) {
  const id = `wistia-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const active = activated ?? requested;

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    const host = window as WistiaWindow;
    host._wq ??= [];
    // Match the DOM id, not the media id: the two surfaces share a video.
    host._wq.push({ id, onReady: () => { if (!disposed) setReady(true); } });
    if (!document.querySelector('script[data-deferred-wistia-api]')) {
      const script = document.createElement('script');
      script.src = PLAYER_SCRIPT;
      script.async = true;
      script.dataset.deferredWistiaApi = 'true';
      document.head.append(script);
    }
    return () => { disposed = true; };
  }, [active, id]);

  return (
    <div className="relative h-full w-full" data-wistia-surface={surface}
      data-wistia-state={ready ? 'ready' : active ? 'loading' : 'dormant'}>
      {active ? <iframe id={id} src={activatedWistiaUrl(src)} title={title}
        className="wistia_embed absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen" allowFullScreen /> : null}
      {!ready ? <img src={WISTIA_POSTER} alt={title} decoding="async"
        data-initial-scroll-media="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover" /> : null}
      {activated === undefined && !ready ? <button type="button"
        aria-label={active ? 'Načítám video' : 'Přehrát video'} aria-busy={active}
        disabled={active} onClick={() => setRequested(true)}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0" /> : null}
    </div>
  );
}
