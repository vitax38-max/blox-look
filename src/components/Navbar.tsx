import React from "react";
import {
  User,
  Sparkles,
  Bookmark,
  Shirt,
  CheckCircle2,
  LogOut,
  ShoppingBag,
  Database
} from "lucide-react";
import { ConnectedRobloxAccount } from "../types";

interface NavbarProps {
  activeTab: "avatar" | "catalog";
  onTabChange: (tab: "avatar" | "catalog") => void;
  connectedAccount: ConnectedRobloxAccount | null;
  onOpenConnectModal: () => void;
  onDisconnectAccount: () => void;
  onOpenFavorites: () => void;
  onOpenTryOn: () => void;
  onOpenAIStylist: () => void;
  onOpenDataBackup: () => void;
  onLoadMyAvatar: () => void;
  favoritesCount: number;
  hasLoadedUser: boolean;
  tryOnCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  connectedAccount,
  onOpenConnectModal,
  onDisconnectAccount,
  onOpenFavorites,
  onOpenTryOn,
  onOpenAIStylist,
  onOpenDataBackup,
  onLoadMyAvatar,
  favoritesCount,
  hasLoadedUser,
  tryOnCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo & Mode Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => onTabChange("avatar")}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-500 to-amber-500 shadow-md shadow-red-500/20 ring-1 ring-white/20">
              <div className="h-4 w-4 rotate-12 rounded-[3px] border-2 border-white bg-white/30 backdrop-blur-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  Blox<span className="text-red-500">Look</span>
                </span>
                <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400 border border-red-500/20">
                  v2.0
                </span>
              </div>
              <p className="hidden text-[11px] text-zinc-400 lg:block">
                Avatar Searcher & Catalog Try-On Hub
              </p>
            </div>
          </button>

          {/* Navigation Mode Switcher */}
          <nav className="flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800">
            <button
              id="nav-avatar-tab-btn"
              onClick={() => onTabChange("avatar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "avatar"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Avatars</span>
            </button>

            <button
              id="nav-catalog-tab-btn"
              onClick={() => onTabChange("catalog")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "catalog"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Roblox Catalog</span>
            </button>
          </nav>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI Stylist Button (when in avatar tab and user loaded) */}
          {activeTab === "avatar" && hasLoadedUser && (
            <button
              id="nav-ai-stylist-btn"
              onClick={onOpenAIStylist}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-900/60 hover:text-purple-100 hover:border-purple-400/50"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span className="hidden md:inline">AI Fit Check</span>
              <span className="md:hidden">Fit AI</span>
            </button>
          )}

          {/* Try-On Studio Button */}
          <button
            id="nav-tryon-btn"
            onClick={onOpenTryOn}
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            <Shirt className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Try-On Studio</span>
            <span className="sm:hidden">Try-On</span>
            {tryOnCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
                {tryOnCount}
              </span>
            )}
          </button>

          {/* Saved Favorites Drawer Button */}
          <button
            id="nav-favorites-btn"
            onClick={onOpenFavorites}
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            <Bookmark className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Data & Backup Manager Button */}
          <button
            id="nav-data-backup-btn"
            onClick={onOpenDataBackup}
            title="Data Save & Backup Manager"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden xl:inline">Data Save</span>
          </button>

          {/* Connect Roblox Account Button / Badge */}
          {connectedAccount ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-1 pl-2">
              <button
                id="nav-my-avatar-btn"
                onClick={onLoadMyAvatar}
                title="View your connected avatar"
                className="flex items-center gap-2 text-left group"
              >
                <div className="relative h-6 w-6 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-emerald-500/50">
                  {connectedAccount.user && (connectedAccount.user as any).avatarUrl ? (
                    <img
                      src={(connectedAccount.user as any).avatarUrl}
                      alt={connectedAccount.user.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-4 w-4 m-1 text-emerald-400" />
                  )}
                  <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
                </div>
                <div className="hidden flex-col sm:flex">
                  <span className="text-[11px] font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1 leading-tight">
                    @{connectedAccount.user.name}
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  </span>
                  <span className="text-[9px] text-emerald-400/80">My Avatar</span>
                </div>
              </button>

              <button
                id="nav-disconnect-btn"
                onClick={onDisconnectAccount}
                title="Disconnect Account"
                className="ml-1 rounded p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              id="nav-connect-account-btn"
              onClick={onOpenConnectModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-red-600/30 transition-all hover:bg-red-500 hover:shadow-red-500/40 active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Connect Roblox</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
