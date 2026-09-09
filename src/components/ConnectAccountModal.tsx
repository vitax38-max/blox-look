import React, { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Shirt,
  Bookmark,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { ConnectedRobloxAccount } from "../types";
import { copyToClipboard, generateSafeVerificationPhrase } from "../utils/roblox";
import confetti from "canvas-confetti";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: ConnectedRobloxAccount) => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountConnected,
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentBioFeedback, setCurrentBioFeedback] = useState<string | null>(null);

  // Anti-censor verification phrase generated from 100% Roblox filter-safe dictionary words
  const [verificationPhrase, setVerificationPhrase] = useState(() =>
    generateSafeVerificationPhrase(4)
  );
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  if (!isOpen) return null;

  const handleRegeneratePhrase = () => {
    setVerificationPhrase(generateSafeVerificationPhrase(4));
    setErrorMsg(null);
    setCurrentBioFeedback(null);
  };

  const handleCopyPhrase = async () => {
    const ok = await copyToClipboard(verificationPhrase);
    if (ok) {
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 2000);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentBioFeedback(null);

    try {
      const res = await fetch("/api/roblox/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrId: usernameInput.trim(),
          verificationPhrase: verificationPhrase.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setErrorMsg(data.error || "Failed to verify Roblox account bio.");
        if (data.currentBio) {
          setCurrentBioFeedback(data.currentBio);
        }
        return;
      }

      // Success celebration!
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {}

      const connectedAccount: ConnectedRobloxAccount = {
        user: data.user,
        connectedAt: new Date().toISOString(),
        verificationMethod: "bio-words",
        savedOutfits: [],
        favorites: [],
      };

      onAccountConnected(connectedAccount);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while verifying account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 shadow-md shadow-red-600/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white">
                Connect Roblox Account
              </h2>
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Bio Verification Required
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Verify ownership via your Roblox profile About section to unlock all features
            </p>
          </div>
        </div>

        {/* What You Unlock Banner */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Shirt className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Virtual Try-On Fitting Room</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span>AI Avatar Fit Critic & Drip Score</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Bookmark className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>Saved Outfits & Catalog Vault</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <User className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>1-Click Switch to My Avatar</span>
          </div>
        </div>

        {/* Mandatory Step-by-Step Verification Box */}
        <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs">
          {/* Step 1 Heading */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-[11px] font-bold text-emerald-200">
                1
              </span>
              Copy this Filter-Safe Word Phrase:
            </span>

            <button
              type="button"
              onClick={handleRegeneratePhrase}
              title="Get different filter-safe words"
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-300 transition"
            >
              <RefreshCw className="h-3 w-3" />
              <span>New Words</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mb-2">
            These friendly dictionary words are <strong>100% immune to Roblox's text filter</strong> (no numbers or symbols that cause <code className="text-red-400">###</code> censoring):
          </p>

          {/* Word Phrase Display Box */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-2.5 border border-emerald-500/40 shadow-inner">
            <span className="font-mono font-bold text-sm text-emerald-300 tracking-wide select-all">
              {verificationPhrase}
            </span>

            <button
              type="button"
              id="copy-verification-phrase-btn"
              onClick={handleCopyPhrase}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95"
            >
              {copiedPhrase ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Words</span>
                </>
              )}
            </button>
          </div>

          {/* Step 2 Heading */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-500/20">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-[11px] font-bold text-emerald-200">
                2
              </span>
              Paste anywhere in your Roblox About / Bio
            </span>

            <a
              href="https://www.roblox.com/my/account#!/info"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
            >
              <span>Edit Roblox Bio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-1">
            You can remove this phrase from your bio immediately after verification is complete.
          </span>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Step 3: Enter your Roblox Username or User ID
            </label>
            <input
              id="connect-username-input"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. Builderman or 156"
              className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Error Message & Bio Feedback */}
          {errorMsg && (
            <div className="space-y-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
              {currentBioFeedback && (
                <div className="rounded-lg bg-black/40 p-2 text-[11px] font-mono text-zinc-400 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-sans mb-0.5">
                    What Roblox servers currently see in your bio:
                  </span>
                  {currentBioFeedback}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              id="connect-verify-btn"
              type="submit"
              disabled={isLoading || !usernameInput.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking Roblox Bio...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify Bio & Connect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
