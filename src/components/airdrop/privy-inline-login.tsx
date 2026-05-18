"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { useLoginWithEmail, useLoginWithOAuth, usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@/hooks/use-wallet";

type Stage = "idle" | "otp" | "connecting";

export type PrivyInlineLocale = "br" | "en";

const COPY = {
  br: {
    title: "Crie sua conta gratuita",
    subtitle: "Entre com email ou Google. Sem carteira, sem cartão, sem gas.",
    emailPlaceholder: "seu@email.com",
    emailSubmit: "Continuar com email",
    emailSending: "Enviando código…",
    or: "ou",
    googleButton: "Continuar com Google",
    googleLoading: "Abrindo Google…",
    otpTitle: "Verifique seu email",
    otpSubtitleA: "Enviamos um código para",
    otpPlaceholder: "Código de 6 dígitos",
    otpSubmit: "Verificar",
    otpVerifying: "Verificando…",
    otpBack: "Usar outro email",
    connecting: "Criando sua conta…",
    connectingSub: "Estamos preparando e implantando sua conta Starknet. Isso leva alguns segundos.",
    reconnecting: "Conectando…",
    reconnectingSub: "Reconectando sua conta. Só um instante.",
    retry: "Tentar de novo",
    walletLink: "Já tem uma carteira cripto? Conectar",
    invalidEmail: "Digite um email válido.",
    incompleteCode: "Digite o código completo.",
    sendCodeError: "Não foi possível enviar o código.",
    invalidCode: "Código inválido. Tente novamente.",
    googleError: "Não foi possível abrir o Google.",
    loading: "Carregando…",
  },
  en: {
    title: "Create your free account",
    subtitle: "Sign in with email or Google. No wallet, no card, no gas.",
    emailPlaceholder: "you@email.com",
    emailSubmit: "Continue with email",
    emailSending: "Sending code…",
    or: "or",
    googleButton: "Continue with Google",
    googleLoading: "Opening Google…",
    otpTitle: "Check your email",
    otpSubtitleA: "We sent a code to",
    otpPlaceholder: "6-digit code",
    otpSubmit: "Verify",
    otpVerifying: "Verifying…",
    otpBack: "Use a different email",
    connecting: "Creating your account…",
    connectingSub: "Preparing and deploying your Starknet account. This takes a few seconds.",
    reconnecting: "Connecting…",
    reconnectingSub: "Reconnecting your account. Just a moment.",
    retry: "Try again",
    walletLink: "Have a crypto wallet? Connect",
    invalidEmail: "Enter a valid email.",
    incompleteCode: "Enter the full code.",
    sendCodeError: "Couldn't send the code.",
    invalidCode: "Invalid code. Please try again.",
    googleError: "Couldn't open Google.",
    loading: "Loading…",
  },
} as const;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function maskEmail(value: string): string {
  const [user, domain] = value.split("@");
  if (!user || !domain) return value;
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

interface Props {
  onOpenWalletPicker: () => void;
  locale?: PrivyInlineLocale;
}

export function PrivyInlineLogin({ onOpenWalletPicker, locale = "br" }: Props) {
  const t = COPY[locale];
  const { ready, authenticated } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { initOAuth, loading: oauthLoading } = useLoginWithOAuth();
  const { isConnected } = useWallet();

  const [stage, setStage] = useState<Stage>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Once Privy is authenticated but the StarkZap wallet isn't ready yet, the
  // background onboarding is running (silent on this surface — we render the
  // progress here instead of in the global dialog).
  const isOnboarding = authenticated && !isConnected;

  const armAutoReconnect = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ml_privy_session", "1");
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!isValidEmail(email)) {
      setEmailError(t.invalidEmail);
      return;
    }
    setBusy(true);
    try {
      armAutoReconnect();
      await sendCode({ email: email.trim() });
      setStage("otp");
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t.sendCodeError);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (code.trim().length < 4) {
      setOtpError(t.incompleteCode);
      return;
    }
    setBusy(true);
    try {
      await loginWithCode({ code: code.trim() });
      setStage("connecting");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : t.invalidCode);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setEmailError(null);
    setBusy(true);
    try {
      armAutoReconnect();
      await initOAuth({ provider: "google" });
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t.googleError);
      setBusy(false);
    }
  };

  const showConnecting = stage === "connecting" || isOnboarding;
  // Only the fresh sign-in path (stage flipped to "connecting" in this
  // component) is actually creating/deploying an account. An already-
  // authenticated session reconnecting on page load is not — show lighter
  // copy so returning users don't see a false "deploying your account".
  const isReconnect = isOnboarding && stage !== "connecting";

  if (!ready) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/30 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t.loading}
        </div>
      </div>
    );
  }

  if (showConnecting) {
    return (
      <div className="max-w-md rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isReconnect ? t.reconnecting : t.connecting}
            </p>
            <p className="text-xs text-muted-foreground">
              {isReconnect ? t.reconnectingSub : t.connectingSub}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "otp") {
    return (
      <form onSubmit={handleVerify} className="max-w-md space-y-3 rounded-2xl border border-border/40 bg-card/30 p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{t.otpTitle}</p>
          <p className="text-xs text-muted-foreground">
            {t.otpSubtitleA} <span className="text-foreground">{maskEmail(email)}</span>
          </p>
        </div>
        {otpError && <p className="text-xs text-destructive">{otpError}</p>}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder={t.otpPlaceholder}
          className="w-full rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 text-sm tracking-widest text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? t.otpVerifying : t.otpSubmit}
        </button>
        <button
          type="button"
          onClick={() => { setStage("idle"); setCode(""); setOtpError(null); }}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {t.otpBack}
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-border/40 bg-card/30 p-5">
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{t.title}</p>
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSendCode} className="space-y-2">
        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/60 px-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? t.emailSending : t.emailSubmit}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border/50" />
        {t.or}
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={busy || oauthLoading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.7 2.5 2.4 6.8 2.4 12s4.3 9.5 9.6 9.5c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1-.2-1.5H12z"/>
        </svg>
        {oauthLoading || busy ? t.googleLoading : t.googleButton}
      </button>

      <button
        type="button"
        onClick={onOpenWalletPicker}
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        {t.walletLink}
      </button>
    </div>
  );
}
