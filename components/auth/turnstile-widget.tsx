"use client";

import Script from "next/script";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export interface TurnstileHandle {
  getToken: () => string | null;
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify?: (token: string) => void;
  className?: string;
}

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const tokenRef = useRef<string | null>(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useImperativeHandle(ref, () => ({
      getToken: () => tokenRef.current,
      reset: () => {
        tokenRef.current = null;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      if (!siteKey || !containerRef.current) return;

      const renderWidget = () => {
        if (!window.turnstile || !containerRef.current || widgetIdRef.current) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "auto",
          size: "flexible",
          callback: (token) => {
            tokenRef.current = token;
            onVerify?.(token);
          },
          "expired-callback": () => {
            tokenRef.current = null;
          },
          "error-callback": () => {
            tokenRef.current = null;
          },
        });
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        window.onTurnstileLoad = renderWidget;
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, onVerify]);

    if (!siteKey) {
      return (
        <p className="text-xs text-muted">
          CAPTCHA is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
        </p>
      );
    }

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
          strategy="lazyOnload"
        />
        <div ref={containerRef} className={className} />
      </>
    );
  }
);
