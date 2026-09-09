import React, { useState } from "react";
import {
  X,
  Shirt,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Bookmark,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { RobloxAsset, ConnectedRobloxAccount } from "../types";
import { formatRobux, copyToClipboard, getRobloxCatalogUrl } from "../utils/roblox";

interface TryOnStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  tryOnItems: RobloxAsset[];
  onRemoveItem: (assetId: number) => void;
  onClearAll: () => void;
  connectedAccount: ConnectedRobloxAccount | null;
  onSaveOutfit: (name: string, items: RobloxAsset[]) => void;
}

export const TryOnStudioModal: React.FC<TryOnStudioModalProps> = ({
  isOpen,
  onClose,
  tryOnItems,
  onRemoveItem,
  onClearAll,
  connectedAccount,
  onSaveOutfit,
}) => {
  const [copiedBatch, setCopiedBatch] = useState<string | null>(null);
  const [outfitName, setOutfitName] = useState("My Custom Drip Fit");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const totalCost = tryOnItems.reduce((acc, item) => {
    return acc + (typeof item.price === "number" ? item.price : 0);
  }, 0);

  const handleCopyIds = async () => {
    const ids = tryOnItems.map((a) => a.id).join(", ");
    const ok = await copyToClipboard(ids);
    if (ok) {
      setCopiedBatch("ids");
      setTimeout(() => setCopiedBatch(null), 2000);
    }
  };

  const handleCopyCommand = async () => {
    const cmd = `/item ${tryOnItems.map((a) => a.id).join(" ")}`;
    const ok = await copyToClipboard(cmd);
    if (ok) {
      setCopiedBatch("cmd");
      setTimeout(() => setCopiedBatch(null), 2000);
    }
  };

  const handleSave = () => {
    if (tryOnItems.length === 0) return;
    onSaveOutfit(outfitName, tryOnItems);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
            <Shirt className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Virtual Try-On Fitting Room
            </h2>
            <p className="text-xs text-zinc-400">
              Stack accessories and clothes from any avatar, calculate total Robux, and export
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="my-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Top Bar: Connected status & Total Value */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-950/70 p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              {connectedAccount?.user && (connectedAccount.user as any).avatarUrl ? (
                <img
                  src={(connectedAccount.user as any).avatarUrl}
                  alt={connectedAccount.user.name}
                  className="h-10 w-10 rounded-full border border-emerald-500/40 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-white">
                  {connectedAccount ? `Fitting for @${connectedAccount.user.name}` : "Guest Fitting Room"}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {tryOnItems.length} {tryOnItems.length === 1 ? "item" : "items"} currently staged
                </div>
              </div>
            </div>

            {/* Total Estimated Cost */}
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Total Fit Price
              </span>
              <span className="font-mono text-base font-bold text-amber-400">
                {totalCost > 0 ? `${totalCost.toLocaleString()} R$` : "0 R$ (or Off-Sale)"}
              </span>
            </div>
          </div>

          {/* Staged Items List */}
          {tryOnItems.length === 0 ? (
            <div className="my-10 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl">
              <Shirt className="h-12 w-12 text-zinc-700 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">Your Fitting Room is Empty</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                Browse any Roblox user avatar and click <span className="text-amber-400 font-semibold">+ Try On</span> on any accessory or clothing item to stack it here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tryOnItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="h-10 w-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Shirt className="h-6 w-6 text-zinc-600" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500">#{item.id}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-medium">
                          {formatRobux(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <a
                      href={getRobloxCatalogUrl(item.id)}
                      target="_blank"
                      rel="noreferrer"
                      title="View in Catalog"
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove from fitting room"
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {tryOnItems.length > 0 && (
          <div className="border-t border-zinc-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-zinc-400 hover:text-red-400 transition"
            >
              Clear All ({tryOnItems.length})
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {/* Copy IDs */}
              <button
                onClick={handleCopyIds}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
              >
                {copiedBatch === "ids" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied IDs!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy All IDs</span>
                  </>
                )}
              </button>

              {/* In-Game Command */}
              <button
                onClick={handleCopyCommand}
                title="Copy /item command for Catalog Avatar Creator"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 transition"
              >
                {copiedBatch === "cmd" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Command Copied!</span>
                  </>
                ) : (
                  <>
                    <Code className="h-3.5 w-3.5" />
                    <span>/item Command</span>
                  </>
                )}
              </button>

              {/* Save Fit to Wardrobe */}
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-red-500 hover:to-rose-500 transition active:scale-95"
              >
                {isSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved to Wardrobe!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Save Custom Fit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
