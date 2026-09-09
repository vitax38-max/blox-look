import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Flame,
  Award,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Share2,
  Check
} from "lucide-react";
import { RobloxUserDetail, RobloxAvatarData, AvatarAIReview } from "../types";
import { copyToClipboard } from "../utils/roblox";

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RobloxUserDetail;
  avatarData: RobloxAvatarData;
}

export const AIStylistModal: React.FC<AIStylistModalProps> = ({
  isOpen,
  onClose,
  user,
  avatarData,
}) => {
  const [review, setReview] = useState<AvatarAIReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const fetchReview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/avatar-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.name,
          displayName: user.displayName,
          playerAvatarType: avatarData.playerAvatarType,
          assets: avatarData.assets,
          scales: avatarData.scales,
          bodyColors: avatarData.bodyColors,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReview(data);
      }
    } catch (err) {
      console.error("Stylist fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !review) {
      fetchReview();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case "GOD TIER":
        return "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold";
      case "CLEAN FIT":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "SOLID CASUAL":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "GOOFY / MEME":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "NEEDS RESCUE":
      case "MID":
      default:
        return "bg-zinc-700 text-zinc-200";
    }
  };

  const handleShareReview = async () => {
    if (!review) return;
    const text = `🔥 BloxLook AI Fit Check for @${user.name}:\nScore: ${review.rating}/10 (${review.dripVerdict})\nAesthetic: "${review.aestheticTitle}"\n"${review.vibeSummary}"`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-purple-500/30 bg-zinc-900 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white">
                BloxStyle AI Avatar Fashion Critic
              </h2>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Honest Drip Rating, Aesthetic Genre Breakdown, & Fashion Upgrades
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="my-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="my-16 flex flex-col items-center justify-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">
                Analyzing @{user.name}'s Outfit & Drip...
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                Scanning equipped accessories, color coordination, rig scales, and Roblox community trends
              </p>
            </div>
          ) : review ? (
            <>
              {/* Score & Verdict Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-950 to-indigo-950/30 p-5 border border-purple-500/20">
                <div className="flex items-center gap-4">
                  {/* Rating Circle */}
                  <div className="relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-purple-600/20 border border-purple-500/40 shadow-inner">
                    <span className="font-display text-2xl font-black text-purple-200">
                      {review.rating}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-400 -mt-1">/ 10</span>
                  </div>

                  <div>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase mb-1 ${getVerdictBadge(
                        review.dripVerdict
                      )}`}
                    >
                      {review.dripVerdict}
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      "{review.aestheticTitle}"
                    </h3>
                  </div>
                </div>

                <button
                  onClick={fetchReview}
                  title="Re-rate this avatar"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-Analyze</span>
                </button>
              </div>

              {/* Vibe Summary */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1.5">
                  <Flame className="h-4 w-4 text-purple-400" />
                  <span>The Vibe & Aura</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-300">{review.vibeSummary}</p>
              </div>

              {/* Strengths & Critiques Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Strengths */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2">
                    <ThumbsUp className="h-4 w-4 text-emerald-400" />
                    <span>What Hits (Style Strengths)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {review.styleStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critiques */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Constructive Roast & Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {review.styleCritiques.map((crit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stylist Recommendations */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-2">
                  <Lightbulb className="h-4 w-4 text-cyan-400" />
                  <span>AI Recommended Additions to Level Up the Fit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {review.recommendedAdditions.map((rec, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs text-zinc-300"
                    >
                      <span className="block font-semibold text-cyan-400 text-[10px] uppercase tracking-wider mb-1">
                        Idea #{i + 1}
                      </span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        {review && (
          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Evaluated based on {avatarData.assets.length} equipped items & scale proportions
            </span>

            <button
              onClick={handleShareReview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 transition active:scale-95"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied Rating to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Fit Rating</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
