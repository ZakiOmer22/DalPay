import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
        },
      ) => void;
    };
  }
}

interface Props {
  onVerify: (token: string) => void;
}

export default function TurnstileWidget({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for the Cloudflare script to load
    const timeout = setTimeout(() => {
      if (window.turnstile && containerRef.current) {
        containerRef.current.innerHTML = '';
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
        });
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      // Clean up widget
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={containerRef}></div>;
}