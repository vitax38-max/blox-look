import React from "react";
import { FolderHeart, Copy, Check, ExternalLink } from "lucide-react";
import { RobloxOutfit } from "../types";
import { copyToClipboard } from "../utils/roblox";

interface PublicOutfitsProps {
  outfits: RobloxOutfit[];
  username: string;
}

export const PublicOutfits: React.FC<PublicOutfitsProps> = ({ outfits, username }) => {
  const [copiedOutfitId, setCopiedOutfitId] = React.useState<number | null>(null);

  if (outfits.length === 0) {
    return null;
  }

  const handleCopy = async (id: number) => {
    const ok = await copyToClipboard(id.toString());
    if (ok) {
      setCopiedOutfitId(id);
      setTimeout(() => setCopiedOutfitId(null), 1800);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <FolderHeart className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-lg font-bold text-white">
              Public Outfits by @{username}
            </h3>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
              {outfits.length} saved
            </span>
          </div>
          <span className="text-xs text-zinc-400">Roblox Saved Creations</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-900/90">
                {outfit.thumbnailUrl ? (
                  <img
                    src={outfit.thumbnailUrl}
                    alt={outfit.name}
                    className="max-h-24 max-w-24 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <FolderHeart className="h-8 w-8 text-zinc-700" />
                )}
              </div>

              <div className="mt-2">
                <div className="text-xs font-semibold text-white truncate" title={outfit.name}>
                  {outfit.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">ID: {outfit.id}</div>
              </div>

              <button
                onClick={() => handleCopy(outfit.id)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-zinc-800 py-1 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                {copiedOutfitId === outfit.id ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Outfit ID</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
