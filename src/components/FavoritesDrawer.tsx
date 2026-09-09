import React, { useState } from "react";
import {
  X,
  Bookmark,
  Trash2,
  ExternalLink,
  Search,
  Download,
  Copy,
  Check,
  Shirt
} from "lucide-react";
import { RobloxUserDetail, SavedCustomFit } from "../types";
import { copyToClipboard } from "../utils/roblox";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: { user: RobloxUserDetail; avatarUrl: string }[];
  savedCustomFits: SavedCustomFit[];
  onSelectUser: (username: string) => void;
  onRemoveFavorite: (userId: number) => void;
  onRemoveCustomFit: (fitId: string) => void;
  onOpenDataBackup?: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  savedCustomFits,
  onSelectUser,
  onRemoveFavorite,
  onRemoveCustomFit,
  onOpenDataBackup,
}) => {
  const [activeTab, setActiveTab] = useState<"avatars" | "custom">("avatars");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      favoriteAvatars: favorites.map((f) => ({
        id: f.user.id,
        username: f.user.name,
        displayName: f.user.displayName,
      })),
      savedCustomFits,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloxlook-saved-fits-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFitIds = async (fit: SavedCustomFit) => {
    const text = fit.assetIds.join(", ");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(fit.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Saved Wardrobe</h2>
              <span className="text-xs text-zinc-400">
                {favorites.length} avatars • {savedCustomFits.length} custom fits
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="my-4 flex rounded-xl bg-zinc-950 p-1 ring-1 ring-zinc-800">
          <button
            onClick={() => setActiveTab("avatars")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === "avatars"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Favorite Avatars ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === "custom"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Custom Fits ({savedCustomFits.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === "avatars" ? (
            favorites.length === 0 ? (
              <div className="my-16 flex flex-col items-center justify-center text-center">
                <Bookmark className="h-10 w-10 text-zinc-700 mb-2" />
                <p className="text-xs font-medium text-zinc-400">No favorite avatars saved yet</p>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Click "Save Fit" on any avatar profile to bookmark them here
                </span>
              </div>
            ) : (
              favorites.map(({ user, avatarUrl }) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 hover:border-zinc-700 transition"
                >
                  <button
                    onClick={() => {
                      onSelectUser(user.name);
                      onClose();
                    }}
                    className="flex items-center gap-3 text-left overflow-hidden flex-1 group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-600">
                          {user.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-red-400 transition truncate">
                        {user.displayName || user.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">@{user.name}</div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => onRemoveFavorite(user.id)}
                      title="Remove from favorites"
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : savedCustomFits.length === 0 ? (
            <div className="my-16 flex flex-col items-center justify-center text-center">
              <Shirt className="h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-xs font-medium text-zinc-400">No custom fits saved yet</p>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                Build custom fits in the Try-On Studio and save them here!
              </span>
            </div>
          ) : (
            savedCustomFits.map((fit) => (
              <div
                key={fit.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{fit.name}</h4>
                    <span className="text-[11px] text-zinc-400">
                      {fit.assetCount} items • {new Date(fit.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveCustomFit(fit.id)}
                    title="Delete fit"
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                  <span className="font-mono text-zinc-500">{fit.assetIds.length} Asset IDs</span>
                  <button
                    onClick={() => handleCopyFitIds(fit)}
                    className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition"
                  >
                    {copiedId === fit.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy IDs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Export & Storage Manager */}
        <div className="border-t border-zinc-800 pt-3 space-y-2">
          {onOpenDataBackup && (
            <button
              onClick={() => {
                onClose();
                onOpenDataBackup();
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/40 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition"
            >
              <span>Manage Storage & Full Backups</span>
            </button>
          )}

          {(favorites.length > 0 || savedCustomFits.length > 0) && (
            <button
              onClick={handleExportJson}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Saved Fits (.json)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
