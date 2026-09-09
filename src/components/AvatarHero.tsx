import React, { useState, useRef } from "react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Users,
  UserCheck,
  Sparkles,
  Shirt,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Maximize2,
  Shield,
  ShieldAlert,
  Lock,
  MessageSquare,
  Sliders,
  ChevronRight,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { RobloxUserDetail, RobloxThumbnails, FitCostBreakdown, AccountPermissions } from "../types";
import { formatJoinDate, copyToClipboard, getRobloxProfileUrl } from "../utils/roblox";

interface AvatarHeroProps {
  user: RobloxUserDetail;
  thumbnails: RobloxThumbnails;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenAIStylist: () => void;
  onOpenTryOn: () => void;
  totalRobux: number;
  breakdown?: FitCostBreakdown | null;
  onOpenCostBreakdown: () => void;
  permissions?: AccountPermissions | null;
  isOwnerConnected?: boolean;
  onOpenPermissions?: () => void;
}

type BackdropTheme = "studio" | "cyber" | "baseplate" | "sunset" | "transparent";

export const AvatarHero: React.FC<AvatarHeroProps> = ({
  user,
  thumbnails,
  isFavorite,
  onToggleFavorite,
  onOpenAIStylist,
  onOpenTryOn,
  totalRobux,
  breakdown,
  onOpenCostBreakdown,
  permissions,
  isOwnerConnected = false,
  onOpenPermissions,
}) => {
  const [renderMode, setRenderMode] = useState<"full" | "bust" | "headshot">("full");
  const [backdrop, setBackdrop] = useState<BackdropTheme>("studio");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Parallax tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isProfilePrivate = !isOwnerConnected && permissions?.allowPublicView === false;
  const isCostHidden = !isOwnerConnected && permissions?.showFitCost === false;
  const isAnonymous = !isOwnerConnected && permissions?.anonymousMode;

  const displayName = isAnonymous
    ? "Verified Collector"
    : user.displayName || user.name;

  const usernameHandle = isAnonymous ? "collector_private" : user.name;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const currentImage =
    renderMode === "full"
      ? thumbnails.fullBody
      : renderMode === "bust"
      ? thumbnails.bust
      : thumbnails.headshot;

  const handleCopyId = async () => {
    const ok = await copyToClipboard(user.id.toString());
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/?user=${encodeURIComponent(user.name)}`;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement("a");
    a.href = currentImage;
    a.download = `roblox-avatar-${user.name}-${renderMode}.png`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const { formatted: joinFormatted, yearsAgo } = formatJoinDate(user.created);

  // Backdrop background CSS classes
  const getBackdropClass = () => {
    switch (backdrop) {
      case "cyber":
        return "bg-radial from-cyan-950/60 via-zinc-950 to-zinc-950 border-cyan-500/20";
      case "baseplate":
        return "bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-950 border-zinc-700/40";
      case "sunset":
        return "bg-radial from-rose-950/50 via-amber-950/20 to-zinc-950 border-rose-500/20";
      case "transparent":
        return "bg-checkered border-zinc-800";
      case "studio":
      default:
        return "bg-radial from-zinc-800/40 via-zinc-900/60 to-zinc-950 border-zinc-800";
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Avatar 3D Stage (5 cols on lg) */}
        <div className="lg:col-span-5">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border p-6 shadow-2xl transition-shadow duration-300 ${getBackdropClass()}`}
          >
            {/* Top Toolbar: Backdrop switcher & Render Type */}
            <div className="flex w-full items-center justify-between gap-2 z-10">
              {/* View Type Toggle */}
              <div className="flex rounded-xl bg-zinc-900/80 p-0.5 ring-1 ring-zinc-800 backdrop-blur-md">
                <button
                  onClick={() => setRenderMode("full")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    renderMode === "full"
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Full Body
                </button>
                <button
                  onClick={() => setRenderMode("bust")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    renderMode === "bust"
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Bust
                </button>
                <button
                  onClick={() => setRenderMode("headshot")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    renderMode === "headshot"
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Headshot
                </button>
              </div>

              {/* Backdrop Style Selector */}
              <div className="flex items-center gap-1 rounded-xl bg-zinc-900/80 p-1 ring-1 ring-zinc-800 backdrop-blur-md">
                <button
                  onClick={() => setBackdrop("studio")}
                  title="Studio Dark"
                  className={`h-4 w-4 rounded-full bg-zinc-700 transition ${
                    backdrop === "studio" ? "ring-2 ring-red-500 scale-110" : "opacity-60"
                  }`}
                />
                <button
                  onClick={() => setBackdrop("cyber")}
                  title="Cyber Cyan"
                  className={`h-4 w-4 rounded-full bg-cyan-600 transition ${
                    backdrop === "cyber" ? "ring-2 ring-cyan-400 scale-110" : "opacity-60"
                  }`}
                />
                <button
                  onClick={() => setBackdrop("sunset")}
                  title="Sunset Glow"
                  className={`h-4 w-4 rounded-full bg-rose-600 transition ${
                    backdrop === "sunset" ? "ring-2 ring-rose-400 scale-110" : "opacity-60"
                  }`}
                />
                <button
                  onClick={() => setBackdrop("baseplate")}
                  title="Baseplate Grid"
                  className={`h-4 w-4 rounded-full border border-zinc-500 bg-zinc-800 transition ${
                    backdrop === "baseplate" ? "ring-2 ring-zinc-300 scale-110" : "opacity-60"
                  }`}
                />
              </div>
            </div>

            {/* Avatar Image Stage */}
            <div className="relative my-4 flex h-[380px] w-full items-center justify-center sm:h-[420px]">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={`${user.name}'s Avatar`}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)] transition-all duration-300 select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500">
                  <span className="text-sm">Loading Avatar Render...</span>
                </div>
              )}

              {/* Pedestal Shadow */}
              <div className="absolute bottom-2 h-4 w-48 rounded-full bg-black/60 blur-md" />
            </div>

            {/* Bottom Actions: Download Render & Share */}
            <div className="flex w-full items-center justify-between pt-2 border-t border-zinc-800/80 z-10">
              <span className="text-[11px] font-mono text-zinc-500">
                {renderMode === "full" ? "720×720 Ultra HD" : renderMode === "bust" ? "420×420 Portrait" : "150×150 Icon"}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  id="avatar-download-btn"
                  onClick={handleDownload}
                  title="Download Avatar PNG"
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  id="avatar-share-btn"
                  onClick={handleShareLink}
                  title="Copy Shareable Link"
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Profile Info & Command Station (7 cols on lg) */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            {/* Owner Active Controls Banner */}
            {isOwnerConnected && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>You are viewing your connected Roblox account</span>
                </div>
                {onOpenPermissions && (
                  <button
                    onClick={onOpenPermissions}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Adjust Permissions</span>
                  </button>
                )}
              </div>
            )}

            {/* Custom Owner Showcase Note */}
            {permissions?.showBioNote && permissions?.customBioNote && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5 text-xs text-amber-200">
                <MessageSquare className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 mr-1.5 uppercase text-[10px] tracking-wider">Owner Status:</span>
                  <span>&quot;{permissions.customBioNote}&quot;</span>
                </div>
              </div>
            )}

            {/* Private Account Shield Guard */}
            {isProfilePrivate ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">This Account is Set to Private</h3>
                <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
                  The owner of this Roblox account has configured their BloxLook privacy settings to restrict public viewing.
                </p>
              </div>
            ) : (
              <>
                {/* Header: Names & Badges */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {displayName}
                      </h1>
                      {user.hasVerifiedBadge && !isAnonymous && (
                        <span title="Verified Roblox Creator" className="inline-flex">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 fill-blue-400/20" />
                        </span>
                      )}
                      {permissions?.showOnlineStatus && !isAnonymous && (
                        <span title="Verified BloxLook Member" className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" />
                          <span>BloxLook Member</span>
                        </span>
                      )}
                      {user.isBanned && (
                        <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-400 border border-red-500/30">
                          Banned
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-mono text-sm text-zinc-400">@{usernameHandle}</span>
                      {!isAnonymous && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <span className="font-mono text-zinc-500">ID: {user.id}</span>
                            <button
                              onClick={handleCopyId}
                              title="Copy User ID"
                              className="p-1 text-zinc-400 hover:text-white transition"
                            >
                              {copiedId ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Primary Interaction Buttons: Favorite & Official Profile */}
                  <div className="flex items-center gap-2">
                    <button
                      id="avatar-favorite-btn"
                      onClick={onToggleFavorite}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                        isFavorite
                          ? "border-red-500/50 bg-red-950/60 text-red-300 hover:bg-red-900/60"
                          : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-red-400 fill-red-400/20" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          <span>Save Fit</span>
                        </>
                      )}
                    </button>

                    {!isAnonymous && (
                      <a
                        href={getRobloxProfileUrl(user.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                      >
                        <span>Roblox</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Social & Account Stats Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* Join Date */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      <span>Joined</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white truncate">{joinFormatted}</div>
                    <div className="text-[11px] text-zinc-500">{yearsAgo}</div>
                  </div>

                  {/* Followers */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Followers</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {(user.followersCount || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-zinc-500">Global Roblox fans</div>
                  </div>

                  {/* Friends */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Friends</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {(user.friendsCount || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-zinc-500">Connected friends</div>
                  </div>

                  {/* Real Outfit Robux Value & Cost Breakdown Trigger */}
                  <button
                    onClick={!isCostHidden ? onOpenCostBreakdown : undefined}
                    disabled={isCostHidden}
                    title={isCostHidden ? "Fit cost hidden by owner" : "Click to view full Real Fit Cost breakdown"}
                    className={`group text-left rounded-2xl border p-3 transition-all ${
                      isCostHidden
                        ? "border-zinc-800 bg-zinc-950/50 cursor-not-allowed opacity-80"
                        : "border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-zinc-900/90 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 active:scale-98 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-xs text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400">R$</span>
                        <span>Real Fit Cost</span>
                      </div>
                      {!isCostHidden && (
                        <ChevronRight className="h-3.5 w-3.5 text-amber-400/70 group-hover:translate-x-0.5 transition" />
                      )}
                    </div>

                    <div className="mt-1 text-sm font-bold text-amber-300 truncate">
                      {isCostHidden ? (
                        <span className="text-zinc-500 font-normal">🔒 Hidden by User</span>
                      ) : (breakdown?.totalRealRobux ?? totalRobux) > 0 ? (
                        `${(breakdown?.totalRealRobux ?? totalRobux).toLocaleString()} R$`
                      ) : (
                        "0 R$"
                      )}
                    </div>

                    <div className="text-[11px] text-amber-400/80 truncate">
                      {isCostHidden
                        ? "Privacy Active"
                        : breakdown?.limitedItemsCount
                        ? `💎 Includes ${breakdown.limitedItemsCount} Limited(s)`
                        : "View Full Breakdown ↗"}
                    </div>
                  </button>
                </div>

                {/* Profile Bio / About */}
                {user.description && !isAnonymous && (
                  <div className="mt-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-3.5 text-xs text-zinc-300">
                    <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">
                      About
                    </div>
                    <p className={`whitespace-pre-wrap ${!isBioExpanded ? "line-clamp-3" : ""}`}>
                      {user.description}
                    </p>
                    {user.description.length > 160 && (
                      <button
                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                        className="mt-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition"
                      >
                        {isBioExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Feature Trigger Action Banner: AI Fit Check & Try-On Studio */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-5">
              <button
                id="hero-ai-stylist-btn"
                onClick={onOpenAIStylist}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-violet-500 active:scale-98"
              >
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>AI Fit Rating & Fashion Critic</span>
              </button>

              <button
                id="hero-tryon-btn"
                onClick={onOpenTryOn}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/90 px-4 py-3 text-xs font-semibold text-zinc-100 shadow-md transition hover:bg-zinc-700 hover:text-white active:scale-98"
              >
                <Shirt className="h-4 w-4 text-amber-400" />
                <span>Try On in Virtual Fitting Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
