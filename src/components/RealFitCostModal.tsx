import React, { useState } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Gift,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Shirt,
  Share2,
  DollarSign,
  Layers,
  ChevronRight
} from "lucide-react";
import { RobloxAsset, FitCostBreakdown, RobloxUserDetail } from "../types";
import { formatRobux, copyToClipboard, getRobloxCatalogUrl } from "../utils/roblox";

interface RealFitCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RobloxUserDetail | null;
  assets: RobloxAsset[];
  breakdown: FitCostBreakdown | null;
  onTryOnItem: (asset: RobloxAsset) => void;
  onOpenTryOnStudio: () => void;
}

type CostFilter = "all" | "limited" | "retail" | "free" | "off_sale";

export const RealFitCostModal: React.FC<RealFitCostModalProps> = ({
  isOpen,
  onClose,
  user,
  assets,
  breakdown,
  onTryOnItem,
  onOpenTryOnStudio,
}) => {
  const [filter, setFilter] = useState<CostFilter>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !user) return null;

  // Safe fallback calculation if breakdown isn't provided
  const totalRobux =
    breakdown?.totalRealRobux ??
    assets.reduce((sum, a) => sum + (a.realPrice ?? (typeof a.price === "number" ? a.price : 0)), 0);

  const limitedSubtotal =
    breakdown?.resaleRobux ??
    assets
      .filter((a) => a.isLimited)
      .reduce((sum, a) => sum + (a.lowestResalePrice ?? a.realPrice ?? 0), 0);

  const retailSubtotal =
    breakdown?.retailRobux ??
    assets
      .filter((a) => !a.isLimited && a.priceType !== "off_sale" && (a.price ?? 0) > 0)
      .reduce((sum, a) => sum + (a.price ?? 0), 0);

  const usdMin = breakdown?.usdEstimatedMin ?? Math.round(totalRobux * 0.0035 * 100) / 100;
  const usdMax = breakdown?.usdEstimatedMax ?? Math.round(totalRobux * 0.0125 * 100) / 100;

  // Filtered items sorted by price descending
  const filteredAssets = [...assets]
    .filter((asset) => {
      if (filter === "all") return true;
      if (filter === "limited") return asset.isLimited;
      if (filter === "retail") return !asset.isLimited && (asset.priceType === "retail" || (asset.price ?? 0) > 0);
      if (filter === "free") return asset.priceType === "free" || asset.price === 0;
      if (filter === "off_sale") return asset.priceType === "off_sale" || (!asset.isForSale && !asset.isLimited);
      return true;
    })
    .sort((a, b) => {
      const priceA = a.realPrice ?? a.lowestResalePrice ?? a.price ?? 0;
      const priceB = b.realPrice ?? b.lowestResalePrice ?? b.price ?? 0;
      return priceB - priceA;
    });

  const handleCopyId = async (id: number) => {
    const ok = await copyToClipboard(id.toString());
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleCopyBreakdownSummary = async () => {
    const lines = [
      `🎮 Roblox Real Fit Cost Breakdown for @${user.name}:`,
      `💰 Total Valuation: ${totalRobux.toLocaleString()} R$ (~$${usdMin.toLocaleString()} - $${usdMax.toLocaleString()} USD)`,
      `💎 Limiteds Resale: ${limitedSubtotal.toLocaleString()} R$ (${breakdown?.limitedItemsCount || assets.filter(a => a.isLimited).length} items)`,
      `🛒 Retail Catalog: ${retailSubtotal.toLocaleString()} R$ (${breakdown?.retailItemsCount || assets.filter(a => !a.isLimited && (a.price ?? 0) > 0).length} items)`,
      `👔 Total Items Equipped: ${assets.length}`,
      `Verified with BloxLook Avatar Explorer`
    ];
    const text = lines.join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <span className="font-display font-extrabold text-lg">R$</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                  Real Fit Cost Breakdown
                </h2>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  Live Valuation
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Detailed market value calculation for <span className="text-zinc-200 font-semibold">@{user.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBreakdownSummary}
              title="Copy formatted summary to clipboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Share Summary</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Hero Total Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Total Real Fit Valuation</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-300">
                    {totalRobux.toLocaleString()}
                  </span>
                  <span className="font-display text-xl font-bold text-amber-400">Robux (R$)</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Calculated from live marketplace resale prices + active catalog retail costs.
                </p>
              </div>

              {/* USD Conversion Box */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 sm:text-right min-w-[200px]">
                <div className="flex items-center sm:justify-end gap-1 text-xs text-zinc-400">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Real-World USD Estimate</span>
                </div>
                <div className="mt-1 text-base font-bold text-emerald-300">
                  ${usdMin.toLocaleString()} - ${usdMax.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500">
                  DevEx (~$0.0035) to Buy Rate (~$0.0125)
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-amber-500/20 pt-5">
              {/* Limiteds */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Limiteds Resale</span>
                </div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {limitedSubtotal.toLocaleString()} R$
                </div>
                <div className="text-[11px] text-amber-400/80">
                  {breakdown?.limitedItemsCount ?? assets.filter(a => a.isLimited).length} collectible item(s)
                </div>
              </div>

              {/* Retail Shop */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Catalog Retail</span>
                </div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {retailSubtotal.toLocaleString()} R$
                </div>
                <div className="text-[11px] text-emerald-400/80">
                  {breakdown?.retailItemsCount ?? assets.filter(a => !a.isLimited && (a.price ?? 0) > 0).length} in-shop item(s)
                </div>
              </div>

              {/* Free Items */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                  <Gift className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Free / Events</span>
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  0 R$
                </div>
                <div className="text-[11px] text-cyan-400/80">
                  {breakdown?.freeItemsCount ?? assets.filter(a => a.priceType === "free" || a.price === 0).length} free item(s)
                </div>
              </div>

              {/* Off-Sale */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
                  <Lock className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Off-Sale / Legacy</span>
                </div>
                <div className="mt-1 text-sm font-bold text-zinc-300">
                  Archived
                </div>
                <div className="text-[11px] text-zinc-500">
                  {breakdown?.offSaleItemsCount ?? assets.filter(a => a.priceType === "off_sale").length} unavailable item(s)
                </div>
              </div>
            </div>
          </div>

          {/* Item Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setFilter("limited")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "limited" ? "bg-amber-950/70 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                }`}
              >
                Limiteds ({assets.filter(a => a.isLimited).length})
              </button>
              <button
                onClick={() => setFilter("retail")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "retail" ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-white"
                }`}
              >
                Retail Shop ({assets.filter(a => !a.isLimited && (a.price ?? 0) > 0).length})
              </button>
              <button
                onClick={() => setFilter("free")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "free" ? "bg-cyan-950/70 text-cyan-300 border border-cyan-500/30" : "text-zinc-400 hover:text-white"
                }`}
              >
                Free ({assets.filter(a => a.priceType === "free" || a.price === 0).length})
              </button>
            </div>

            <button
              onClick={onOpenTryOnStudio}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition"
            >
              <Shirt className="h-3.5 w-3.5" />
              <span>Try Entire Fit in Studio</span>
            </button>
          </div>

          {/* Itemized List */}
          <div className="space-y-2.5">
            {filteredAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No items match the selected price filter.
              </div>
            ) : (
              filteredAssets.map((asset) => {
                const itemRealPrice = asset.realPrice ?? asset.lowestResalePrice ?? asset.price ?? 0;
                return (
                  <div
                    key={asset.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-850 bg-zinc-900/50 p-3.5 transition hover:border-zinc-750 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center">
                        {asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="h-full w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Shirt className="h-6 w-6 text-zinc-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate max-w-[260px] sm:max-w-[340px]">
                            {asset.name}
                          </span>
                          {asset.isLimited && (
                            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30 flex-shrink-0">
                              LIMITED
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="font-mono text-zinc-500">ID: {asset.id}</span>
                          <span className="text-zinc-600">•</span>
                          <span>{asset.assetType?.name || "Accessory"}</span>
                          {asset.creatorName && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500 truncate max-w-[120px]">by {asset.creatorName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-zinc-800/60 pt-2 sm:border-0 sm:pt-0">
                      {/* Price Badge */}
                      <div className="text-right">
                        {asset.isLimited ? (
                          <div>
                            <div className="text-sm font-bold text-amber-300">
                              {itemRealPrice > 0 ? `${itemRealPrice.toLocaleString()} R$` : "Limited"}
                            </div>
                            <div className="text-[10px] text-amber-400/80">Lowest Resale</div>
                          </div>
                        ) : (asset.price ?? 0) > 0 ? (
                          <div>
                            <div className="text-sm font-bold text-emerald-300">
                              {(asset.price ?? 0).toLocaleString()} R$
                            </div>
                            <div className="text-[10px] text-emerald-400/80">Retail Catalog</div>
                          </div>
                        ) : asset.priceType === "free" || asset.price === 0 ? (
                          <div>
                            <div className="text-sm font-bold text-cyan-300">Free</div>
                            <div className="text-[10px] text-cyan-400/80">0 R$</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-zinc-400">Off-Sale</div>
                            <div className="text-[10px] text-zinc-500">Unavailable</div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyId(asset.id)}
                          title="Copy Asset ID"
                          className="rounded-lg bg-zinc-800 p-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                        >
                          {copiedId === asset.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onTryOnItem(asset)}
                          title="Try on this item"
                          className="rounded-lg bg-zinc-800 p-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                        >
                          <Shirt className="h-3.5 w-3.5 text-amber-400" />
                        </button>

                        <a
                          href={getRobloxCatalogUrl(asset.id)}
                          target="_blank"
                          rel="noreferrer"
                          title="Open on Roblox Catalog"
                          className="rounded-lg bg-zinc-800 p-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Real-time values synchronized with Roblox economy data.</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 font-semibold text-white hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
