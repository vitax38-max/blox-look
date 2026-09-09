import React, { useState } from "react";
import {
  Shirt,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Plus,
  Filter,
  Sparkles,
  Layers,
  Code,
  Lock,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { RobloxAsset, FitCostBreakdown } from "../types";
import { formatRobux, copyToClipboard, getRobloxCatalogUrl } from "../utils/roblox";

interface WardrobeInspectorProps {
  assets: RobloxAsset[];
  onTryOnItem: (asset: RobloxAsset) => void;
  triedOnAssetIds?: number[];
  fitCostBreakdown?: FitCostBreakdown | null;
  onOpenCostBreakdown?: () => void;
  allowInspection?: boolean;
}

type FilterCategory = "all" | "accessories" | "clothing" | "body";

export const WardrobeInspector: React.FC<WardrobeInspectorProps> = ({
  assets,
  onTryOnItem,
  triedOnAssetIds = [],
  fitCostBreakdown,
  onOpenCostBreakdown,
  allowInspection = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedBatch, setCopiedBatch] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  if (!allowInspection) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Worn Assets & Wardrobe Hidden
          </h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            The owner of this account has restricted wardrobe inspection. Individual asset IDs and layer details are private.
          </p>
        </div>
      </div>
    );
  }

  const categorizeAsset = (asset: RobloxAsset): "accessories" | "clothing" | "body" => {
    const type = (asset.assetType?.name || "").toLowerCase();
    if (
      type.includes("shirt") ||
      type.includes("pant") ||
      type.includes("jacket") ||
      type.includes("sweater") ||
      type.includes("dress") ||
      type.includes("t-shirt") ||
      type.includes("tshirt")
    ) {
      return "clothing";
    }
    if (
      type.includes("torso") ||
      type.includes("arm") ||
      type.includes("leg") ||
      type.includes("head") ||
      type.includes("animation") ||
      type.includes("mood") ||
      type.includes("emote")
    ) {
      return "body";
    }
    return "accessories";
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory =
      activeCategory === "all" || categorizeAsset(asset) === activeCategory;
    const matchesSearch =
      !searchFilter.trim() ||
      asset.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (asset.assetType?.name || "").toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopySingleId = async (id: number) => {
    const ok = await copyToClipboard(id.toString());
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleCopyAllIds = async () => {
    const ids = assets.map((a) => a.id).join(", ");
    const ok = await copyToClipboard(ids);
    if (ok) {
      setCopiedBatch("ids");
      setTimeout(() => setCopiedBatch(null), 2000);
    }
  };

  const handleCopyCatalogCommand = async () => {
    // Standard format for Roblox Catalog Avatar Creator game
    const command = `/item ${assets.map((a) => a.id).join(" ")}`;
    const ok = await copyToClipboard(command);
    if (ok) {
      setCopiedBatch("command");
      setTimeout(() => setCopiedBatch(null), 2000);
    }
  };

  // Stats
  const accessoriesCount = assets.filter((a) => categorizeAsset(a) === "accessories").length;
  const clothingCount = assets.filter((a) => categorizeAsset(a) === "clothing").length;
  const bodyCount = assets.filter((a) => categorizeAsset(a) === "body").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl backdrop-blur-xl">
        {/* Section Header & Batch Commands */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-500" />
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                Worn Assets & Wardrobe
              </h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                {assets.length} items
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Inspect equipped accessories, clothing layers, and parts with direct marketplace links.
            </p>
          </div>

          {/* Batch Export / Copy buttons & Real Fit Cost indicator */}
          <div className="flex flex-wrap items-center gap-2">
            {fitCostBreakdown && onOpenCostBreakdown && (
              <button
                id="wardrobe-real-cost-pill-btn"
                onClick={onOpenCostBreakdown}
                title="View Real Fit Cost Valuation & Resale Breakdown"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-900/60 hover:text-white shadow-sm shadow-amber-500/10"
              >
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                <span>Fit Cost: {fitCostBreakdown.totalRealRobux.toLocaleString()} R$</span>
                <ChevronRight className="h-3 w-3 text-amber-400/80" />
              </button>
            )}

            <button
              id="copy-all-ids-btn"
              onClick={handleCopyAllIds}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              {copiedBatch === "ids" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied All IDs!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Copy All IDs</span>
                </>
              )}
            </button>

            <button
              id="copy-game-command-btn"
              onClick={handleCopyCatalogCommand}
              title="Copy /item command for Roblox Catalog Avatar Creator game"
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-900/60 hover:text-white"
            >
              {copiedBatch === "command" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Command Copied!</span>
                </>
              ) : (
                <>
                  <Code className="h-3.5 w-3.5 text-red-400" />
                  <span>In-Game /item Command</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-950/60 p-1 ring-1 ring-zinc-800">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === "all"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({assets.length})
            </button>
            <button
              onClick={() => setActiveCategory("accessories")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === "accessories"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Accessories ({accessoriesCount})
            </button>
            <button
              onClick={() => setActiveCategory("clothing")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === "clothing"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Clothing ({clothingCount})
            </button>
            <button
              onClick={() => setActiveCategory("body")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === "body"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Body & Rigs ({bodyCount})
            </button>
          </div>

          {/* Quick Filter Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter items..."
              className="h-9 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 pl-3 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Asset Cards Grid */}
        {filteredAssets.length === 0 ? (
          <div className="my-10 flex flex-col items-center justify-center text-center text-zinc-400">
            <Layers className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-medium">No items found matching filter</p>
            <span className="text-xs text-zinc-500">Try changing your category or search term</span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredAssets.map((asset) => {
              const isTriedOn = triedOnAssetIds.includes(asset.id);
              const isLimited = asset.isLimited;

              return (
                <div
                  key={asset.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-lg"
                >
                  {/* Top: Asset Type Badge & Price Tag */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {asset.assetType?.name || "Asset"}
                    </span>

                    {/* Price / Limited badge */}
                    {isLimited ? (
                      <span
                        title={asset.lowestResalePrice ? `Lowest Resale Price: ${asset.lowestResalePrice.toLocaleString()} R$` : "Limited Collectible"}
                        className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30"
                      >
                        {asset.lowestResalePrice
                          ? `💎 ${asset.lowestResalePrice.toLocaleString()} R$`
                          : asset.realPrice
                          ? `💎 ${asset.realPrice.toLocaleString()} R$`
                          : "LIMITED"}
                      </span>
                    ) : asset.priceType === "free" || asset.price === 0 ? (
                      <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                        Free
                      </span>
                    ) : asset.price !== undefined && asset.price !== null && asset.price > 0 ? (
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {formatRobux(asset.price)}
                      </span>
                    ) : (
                      <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                        Off Sale
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative my-2 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-900/80 border border-zinc-800/60 group-hover:border-zinc-700/60 transition">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="max-h-28 max-w-28 object-contain transition duration-200 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Shirt className="h-10 w-10 text-zinc-700" />
                    )}
                  </div>

                  {/* Item Name & ID */}
                  <div className="mt-2">
                    <h3
                      title={asset.name}
                      className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition"
                    >
                      {asset.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono text-zinc-500">#{asset.id}</span>
                      {asset.creatorName && (
                        <span className="truncate max-w-[100px] text-zinc-500">
                          by {asset.creatorName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions: Copy ID, Try On, Open Marketplace */}
                  <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/80 pt-3">
                    <button
                      onClick={() => handleCopySingleId(asset.id)}
                      title="Copy Item ID"
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800 px-2 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>ID</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onTryOnItem(asset)}
                      title="Try this item on in Try-On Studio"
                      className={`inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                        isTriedOn
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-zinc-800 text-zinc-300 hover:bg-amber-950/60 hover:text-amber-300 hover:border-amber-500/30"
                      }`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isTriedOn ? "Wearing" : "Try On"}</span>
                    </button>

                    <a
                      href={getRobloxCatalogUrl(asset.id)}
                      target="_blank"
                      rel="noreferrer"
                      title="View in Roblox Catalog"
                      className="inline-flex items-center justify-center rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
