import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Shirt,
  Sparkles,
  Filter,
  Loader2,
  TrendingUp,
  Flame,
  Tag,
  SlidersHorizontal,
  Coins,
  Heart,
  ChevronDown,
  RefreshCw,
  Eye
} from "lucide-react";
import { RobloxCatalogItem, RobloxAsset } from "../types";
import { formatRobux, copyToClipboard } from "../utils/roblox";

interface CatalogExplorerProps {
  onTryOnItem: (asset: RobloxAsset) => void;
  triedOnAssetIds: number[];
}

// Preset popular search tags
const TRENDING_TAGS = [
  "Valkyrie",
  "Dominus",
  "Fedora",
  "Anime Hair",
  "Y2K",
  "Streetwear",
  "Wings",
  "Cyber Mask",
  "Golden Crown",
  "Bacon",
  "Classic Noob",
  "Headless",
  "Korblox",
];

// Categories configuration
const CATALOG_CATEGORIES = [
  { label: "All Items", category: "All", subcategory: "" },
  { label: "Hats & Head", category: "Accessories", subcategory: "HeadAccessories" },
  { label: "Hair", category: "Body", subcategory: "HairAccessories" },
  { label: "Faces", category: "Accessories", subcategory: "FaceAccessories" },
  { label: "Neck & Shoulders", category: "Accessories", subcategory: "NeckAccessories" },
  { label: "Back & Front", category: "Accessories", subcategory: "BackAccessories" },
  { label: "Waist", category: "Accessories", subcategory: "WaistAccessories" },
  { label: "Shirts & Tops", category: "Clothing", subcategory: "ShirtAccessories" },
  { label: "Pants & Shorts", category: "Clothing", subcategory: "PantsAccessories" },
  { label: "Classic Clothing", category: "Clothing", subcategory: "ClassicShirts" },
  { label: "Gear", category: "Accessories", subcategory: "Gear" },
];

const SORT_OPTIONS = [
  { label: "Most Favorited", value: "2" },
  { label: "Relevance", value: "0" },
  { label: "Price: Low to High", value: "3" },
  { label: "Price: High to Low", value: "4" },
  { label: "Recently Updated", value: "1" },
];

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  onTryOnItem,
  triedOnAssetIds,
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("Valkyrie");
  const [selectedCategory, setSelectedCategory] = useState(CATALOG_CATEGORIES[0]);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].value);
  const [forSaleOnly, setForSaleOnly] = useState(false);

  // Results & Pagination
  const [items, setItems] = useState<RobloxCatalogItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedIdMap, setCopiedIdMap] = useState<{ [id: number]: "id" | "name" | "cmd" | null }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const fetchCatalogItems = useCallback(
    async (searchTerm: string, cat = selectedCategory, sort = selectedSort, cursor?: string) => {
      const isPaginating = !!cursor;
      if (isPaginating) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setErrorMsg(null);
      }

      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.append("keyword", searchTerm.trim());
        }
        params.append("category", cat.category);
        if (cat.subcategory) {
          params.append("subcategory", cat.subcategory);
        }
        params.append("sortType", sort);
        if (cursor) {
          params.append("cursor", cursor);
        }
        params.append("limit", "30");

        const res = await fetch(`/api/roblox/catalog/search?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to search Roblox catalog.");
        }

        const data = await res.json();
        const fetchedItems: RobloxCatalogItem[] = data.data || [];

        if (isPaginating) {
          setItems((prev) => [...prev, ...fetchedItems]);
        } else {
          setItems(fetchedItems);
        }
        setNextCursor(data.nextPageCursor || null);
      } catch (err: any) {
        console.error("Catalog search error:", err);
        setErrorMsg(err.message || "Failed to load catalog items.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedCategory, selectedSort]
  );

  // Initial load
  useEffect(() => {
    fetchCatalogItems(activeKeyword, selectedCategory, selectedSort);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(keywordInput.trim());
    fetchCatalogItems(keywordInput.trim(), selectedCategory, selectedSort);
  };

  const handleSelectTag = (tag: string) => {
    setKeywordInput(tag);
    setActiveKeyword(tag);
    fetchCatalogItems(tag, selectedCategory, selectedSort);
  };

  const handleCategoryChange = (cat: typeof CATALOG_CATEGORIES[0]) => {
    setSelectedCategory(cat);
    fetchCatalogItems(activeKeyword, cat, selectedSort);
  };

  const handleSortChange = (sortVal: string) => {
    setSelectedSort(sortVal);
    fetchCatalogItems(activeKeyword, selectedCategory, sortVal);
  };

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetchCatalogItems(activeKeyword, selectedCategory, selectedSort, nextCursor);
    }
  };

  // Item Actions
  const handleCopyId = async (item: RobloxCatalogItem) => {
    const ok = await copyToClipboard(String(item.id));
    if (ok) {
      setCopiedIdMap((prev) => ({ ...prev, [item.id]: "id" }));
      showToast(`Copied Item ID: ${item.id}`);
      setTimeout(() => {
        setCopiedIdMap((prev) => ({ ...prev, [item.id]: null }));
      }, 2000);
    }
  };

  const handleCopyName = async (item: RobloxCatalogItem) => {
    const ok = await copyToClipboard(item.name);
    if (ok) {
      setCopiedIdMap((prev) => ({ ...prev, [item.id]: "name" }));
      showToast(`Copied Item Name: "${item.name}"`);
      setTimeout(() => {
        setCopiedIdMap((prev) => ({ ...prev, [item.id]: null }));
      }, 2000);
    }
  };

  const handleCopyCommand = async (item: RobloxCatalogItem) => {
    const cmd = `/item ${item.id}`;
    const ok = await copyToClipboard(cmd);
    if (ok) {
      setCopiedIdMap((prev) => ({ ...prev, [item.id]: "cmd" }));
      showToast(`Copied in-game command: "${cmd}"`);
      setTimeout(() => {
        setCopiedIdMap((prev) => ({ ...prev, [item.id]: null }));
      }, 2000);
    }
  };

  const handleTryOn = (item: RobloxCatalogItem) => {
    const asset: RobloxAsset = {
      id: item.id,
      name: item.name,
      assetType: {
        id: item.assetType || 8,
        name: item.taxonomyName || "Accessory",
      },
      thumbnailUrl: item.thumbnailUrl,
      price: item.price !== undefined ? item.price : (item.lowestPrice || null),
      isForSale: !item.isOffSale,
      isLimited: item.isLimited,
      isLimitedUnique: item.isLimitedUnique,
      creatorName: item.creatorName,
    };
    onTryOnItem(asset);
    showToast(`Added "${item.name}" to Try-On Studio!`);
  };

  const filteredItems = forSaleOnly
    ? items.filter((i) => !i.isOffSale || i.isLimited)
    : items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Catalog Search & Filter Header */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                Roblox Catalog Marketplace
              </h2>
              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
                Live Search & Try-On
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Search any item by keyword or Asset ID. Copy IDs & names, try on items instantly, and open directly in Roblox.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="catalog-search-input"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Search catalog by item name or Asset ID (e.g. Valkyrie or 1365767)..."
                className="h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-950 pl-10 pr-24 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
              />
              <button
                type="submit"
                id="catalog-search-submit-btn"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Trending Keywords Quick Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1 text-zinc-400 font-semibold flex-shrink-0">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Popular:</span>
          </div>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelectTag(tag)}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition flex-shrink-0 ${
                activeKeyword.toLowerCase() === tag.toLowerCase()
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Filter Pills & Sort Selector */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {CATALOG_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory.label === cat.label
                    ? "bg-zinc-100 text-zinc-950 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & For Sale Filter */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                id="catalog-sort-select"
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort catalog items"
                className="h-8 rounded-xl border border-zinc-700 bg-zinc-950 px-2.5 pr-7 text-xs font-semibold text-zinc-200 focus:border-red-500 focus:outline-none appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>

            <button
              onClick={() => setForSaleOnly(!forSaleOnly)}
              className={`h-8 rounded-xl px-2.5 text-xs font-semibold transition border ${
                forSaleOnly
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              {forSaleOnly ? "✓ For Sale Only" : "All Statuses"}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Search Results Grid */}
      <div className="mt-6">
        {/* Results Info Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-zinc-400">
            Showing <span className="font-bold text-white">{filteredItems.length}</span> items for{" "}
            <span className="font-semibold text-red-400">"{activeKeyword || selectedCategory.label}"</span>
          </div>

          <button
            onClick={() => fetchCatalogItems(activeKeyword, selectedCategory, selectedSort)}
            title="Refresh search"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <h3 className="mt-4 font-display text-lg font-bold text-white">
              Searching Roblox Marketplace...
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Retrieving live catalog items, thumbnails, and Robux prices
            </p>
          </div>
        ) : errorMsg ? (
          <div className="my-16 rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center text-red-300 max-w-lg mx-auto">
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button
              onClick={() => fetchCatalogItems("Valkyrie")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition"
            >
              Search Valkyrie
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-700 mb-3" />
            <h3 className="text-base font-semibold text-white">No catalog items found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Try searching a different keyword, selecting another category, or browsing popular tags above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredItems.map((item) => {
              const isTriedOn = triedOnAssetIds.includes(item.id);
              const robloxUrl = `https://www.roblox.com/catalog/${item.id}/${encodeURIComponent(
                (item.name || "").replace(/[^a-zA-Z0-9]+/g, "-")
              )}`;
              const robloxAppUri = `roblox://navigation/item_details?itemId=${item.id}`;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition duration-200"
                >
                  {/* Thumbnail Stage */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-950 p-2 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition duration-200"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-700">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}

                    {/* Limited / Status Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                      {item.isLimitedUnique ? (
                        <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider shadow-sm">
                          Limited U
                        </span>
                      ) : item.isLimited ? (
                        <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider shadow-sm">
                          Limited
                        </span>
                      ) : null}

                      {item.isOffSale && !item.isLimited && (
                        <span className="rounded-md bg-zinc-800/90 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 border border-zinc-700/80">
                          Off Sale
                        </span>
                      )}
                    </div>

                    {/* Quick Try-On Overlay on hover */}
                    <button
                      onClick={() => handleTryOn(item)}
                      title="Try this item on your avatar"
                      className={`absolute right-2 top-2 rounded-xl p-2 transition shadow-md ${
                        isTriedOn
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-900/90 text-zinc-300 hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      <Shirt className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Item Info */}
                  <div className="flex flex-1 flex-col p-3">
                    {/* Item Name */}
                    <h3
                      className="line-clamp-1 font-semibold text-xs text-zinc-100 group-hover:text-red-400 transition"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Creator */}
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 truncate">
                      <span>by</span>
                      <span className="truncate text-zinc-300 font-medium">
                        {item.creatorName || "Roblox"}
                      </span>
                      {item.creatorHasVerifiedBadge && (
                        <Check className="h-2.5 w-2.5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Robux Price & Favorites */}
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        {item.price === 0 ? (
                          <span className="text-emerald-300 uppercase text-[10px] font-extrabold tracking-wider">
                            Free
                          </span>
                        ) : item.price ? (
                          <>
                            <span className="font-mono text-emerald-400">R$</span>
                            <span>{formatRobux(item.price)}</span>
                          </>
                        ) : item.lowestResalePrice ? (
                          <>
                            <span className="font-mono text-amber-400">R$</span>
                            <span className="text-amber-300">{formatRobux(item.lowestResalePrice)}</span>
                          </>
                        ) : (
                          <span className="text-zinc-500 text-[10px]">Off Sale</span>
                        )}
                      </div>

                      {item.favoriteCount ? (
                        <div className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                          <Heart className="h-2.5 w-2.5 text-zinc-600" />
                          <span>{item.favoriteCount.toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Bar (Copy ID, Copy Name, Try On, Open Roblox) */}
                    <div className="mt-3 grid grid-cols-4 gap-1 pt-2 border-t border-zinc-800 text-[10px]">
                      {/* 1. Copy Asset ID */}
                      <button
                        onClick={() => handleCopyId(item)}
                        title={`Copy Asset ID: ${item.id}`}
                        className="flex flex-col items-center justify-center rounded-lg bg-zinc-950 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                      >
                        {copiedIdMap[item.id] === "id" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="mt-0.5 text-[9px] font-medium">ID</span>
                      </button>

                      {/* 2. Copy Item Name */}
                      <button
                        onClick={() => handleCopyName(item)}
                        title={`Copy Name: ${item.name}`}
                        className="flex flex-col items-center justify-center rounded-lg bg-zinc-950 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                      >
                        {copiedIdMap[item.id] === "name" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Tag className="h-3.5 w-3.5" />
                        )}
                        <span className="mt-0.5 text-[9px] font-medium">Name</span>
                      </button>

                      {/* 3. Try On */}
                      <button
                        onClick={() => handleTryOn(item)}
                        title="Try On in Fitting Room"
                        className={`flex flex-col items-center justify-center rounded-lg p-1.5 transition ${
                          isTriedOn
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-zinc-950 text-zinc-400 hover:bg-red-600 hover:text-white"
                        }`}
                      >
                        <Shirt className="h-3.5 w-3.5" />
                        <span className="mt-0.5 text-[9px] font-medium">
                          {isTriedOn ? "Equipped" : "Try On"}
                        </span>
                      </button>

                      {/* 4. Open in Roblox */}
                      <a
                        href={robloxUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open item page in Roblox Marketplace"
                        className="flex flex-col items-center justify-center rounded-lg bg-zinc-950 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="mt-0.5 text-[9px] font-medium">Roblox</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Pagination Button */}
        {nextCursor && !isLoading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-zinc-700 hover:border-zinc-600 transition active:scale-95 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  <span>Loading More Items...</span>
                </>
              ) : (
                <>
                  <span>Load More Catalog Items</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-zinc-900/95 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
