import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, History, X, Sparkles, CheckCircle2 } from "lucide-react";
import { POPULAR_CREATORS } from "../utils/roblox";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  recentSearches: string[];
  onClearRecent: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  recentSearches,
  onClearRecent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for live suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const res = await fetch(`/api/roblox/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setShowDropdown(false);
    onSearch(searchTerm.trim());
  };

  const handleSelectSuggestion = (username: string) => {
    setSearchTerm(username);
    setShowDropdown(false);
    onSearch(username);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 pt-6 pb-4 sm:px-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative z-30" ref={dropdownRef}>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-zinc-400">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-red-500" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>

          <input
            id="avatar-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search Roblox username or user ID (e.g. builderman, 156, kreekcraft)..."
            className="h-14 w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/90 pl-12 pr-28 text-sm font-medium text-white shadow-xl shadow-black/40 backdrop-blur-xl transition placeholder:text-zinc-500 focus:border-red-500 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:text-base"
          />

          {/* Clear button if text */}
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSuggestions([]);
              }}
              className="absolute right-24 p-1.5 text-zinc-400 transition hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Submit Search Button */}
          <button
            id="avatar-search-submit-btn"
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="absolute right-2.5 flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 text-xs font-semibold text-white shadow-md shadow-red-600/30 transition hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:px-5 sm:text-sm"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl z-50">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Suggested Roblox Players
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.name)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-zinc-800/80 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                      {item.headshotUrl ? (
                        <img
                          src={item.headshotUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                          {item.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-white text-sm">
                        <span>{item.displayName || item.name}</span>
                        {item.hasVerifiedBadge && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">@{item.name}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">ID: {item.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Popular Presets & Recent Searches */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
        {/* Popular Creator Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 font-semibold text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Trending:
          </span>
          {POPULAR_CREATORS.slice(0, 6).map((creator) => (
            <button
              key={creator.id}
              onClick={() => {
                setSearchTerm(creator.name);
                onSearch(creator.name);
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              {creator.name}
            </button>
          ))}
        </div>

        {/* Recent Search History Chips */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-zinc-500">
              <History className="h-3 w-3" />
              Recent:
            </span>
            {recentSearches.slice(0, 4).map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(query);
                  onSearch(query);
                }}
                className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-2 py-0.5 text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
              >
                {query}
              </button>
            ))}
            <button
              onClick={onClearRecent}
              title="Clear search history"
              className="text-[10px] text-zinc-500 hover:text-red-400 underline underline-offset-2 ml-1"
            >
              clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
