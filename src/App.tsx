import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SearchSection } from "./components/SearchSection";
import { AvatarHero } from "./components/AvatarHero";
import { WardrobeInspector } from "./components/WardrobeInspector";
import { BodyColorScales } from "./components/BodyColorScales";
import { PublicOutfits } from "./components/PublicOutfits";
import { CatalogExplorer } from "./components/CatalogExplorer";
import { ConnectAccountModal } from "./components/ConnectAccountModal";
import { TryOnStudioModal } from "./components/TryOnStudioModal";
import { AIStylistModal } from "./components/AIStylistModal";
import { FavoritesDrawer } from "./components/FavoritesDrawer";
import { DataBackupModal } from "./components/DataBackupModal";
import {
  RobloxUserDetail,
  RobloxThumbnails,
  RobloxAvatarData,
  RobloxOutfit,
  RobloxAsset,
  ConnectedRobloxAccount,
  SavedCustomFit,
  AppBackupData,
} from "./types";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export default function App() {
  // Navigation tabs: 'avatar' or 'catalog'
  const [activeMainTab, setActiveMainTab] = useState<"avatar" | "catalog">("avatar");

  // Core user state
  const [currentUser, setCurrentUser] = useState<RobloxUserDetail | null>(null);
  const [thumbnails, setThumbnails] = useState<RobloxThumbnails>({
    fullBody: "",
    bust: "",
    headshot: "",
  });
  const [avatarData, setAvatarData] = useState<RobloxAvatarData | null>(null);
  const [outfits, setOutfits] = useState<RobloxOutfit[]>([]);

  // App statuses
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Persistence: Connected Roblox account
  const [connectedAccount, setConnectedAccount] = useState<ConnectedRobloxAccount | null>(() => {
    try {
      const stored = localStorage.getItem("bloxlook_connected_account");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persistence: Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("bloxlook_recent_searches");
      return stored ? JSON.parse(stored) : ["builderman", "stickmasterluke", "kreekcraft"];
    } catch {
      return ["builderman", "stickmasterluke", "kreekcraft"];
    }
  });

  // Persistence: Favorites & Saved custom fits
  const [favorites, setFavorites] = useState<{ user: RobloxUserDetail; avatarUrl: string }[]>(
    () => {
      try {
        const stored = localStorage.getItem("bloxlook_favorites");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
  );

  const [savedCustomFits, setSavedCustomFits] = useState<SavedCustomFit[]>(() => {
    try {
      const stored = localStorage.getItem("bloxlook_custom_fits");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persistence: Active Try-on items stack
  const [tryOnItems, setTryOnItems] = useState<RobloxAsset[]>(() => {
    try {
      const stored = localStorage.getItem("bloxlook_tryon_items");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals visibility
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [isAIStylistModalOpen, setIsAIStylistModalOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isDataBackupModalOpen, setIsDataBackupModalOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      if (connectedAccount) {
        localStorage.setItem("bloxlook_connected_account", JSON.stringify(connectedAccount));
      } else {
        localStorage.removeItem("bloxlook_connected_account");
      }
    } catch {}
  }, [connectedAccount]);

  useEffect(() => {
    try {
      localStorage.setItem("bloxlook_recent_searches", JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem("bloxlook_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("bloxlook_custom_fits", JSON.stringify(savedCustomFits));
    } catch {}
  }, [savedCustomFits]);

  useEffect(() => {
    try {
      localStorage.setItem("bloxlook_tryon_items", JSON.stringify(tryOnItems));
    } catch {}
  }, [tryOnItems]);

  // Load avatar for a given username or user ID
  const fetchRobloxAvatar = async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. User profile lookup
      const userRes = await fetch(`/api/roblox/user-lookup?q=${encodeURIComponent(query)}`);
      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.error || `Could not find Roblox user: ${query}`);
      }
      const userData = await userRes.json();
      const user: RobloxUserDetail = userData.user;
      setCurrentUser(user);

      // Save to recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== user.name.toLowerCase());
        return [user.name, ...filtered].slice(0, 8);
      });

      // 2. Fetch thumbnails, avatar details, and public outfits in parallel
      const [thumbRes, avatarRes, outfitsRes] = await Promise.all([
        fetch(`/api/roblox/thumbnails/${user.id}`),
        fetch(`/api/roblox/avatar/${user.id}`),
        fetch(`/api/roblox/outfits/${user.id}`),
      ]);

      if (thumbRes.ok) {
        const thumbs = await thumbRes.json();
        setThumbnails(thumbs);
      }

      if (avatarRes.ok) {
        const avData = await avatarRes.json();
        setAvatarData(avData);
      }

      if (outfitsRes.ok) {
        const outData = await outfitsRes.json();
        setOutfits(outData.outfits || []);
      }
    } catch (err: any) {
      console.error("Fetch avatar failed:", err);
      setErrorMessage(err.message || "Failed to load Roblox avatar data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    if (userParam) {
      fetchRobloxAvatar(userParam);
    } else if (connectedAccount) {
      fetchRobloxAvatar(connectedAccount.user.name);
    } else {
      fetchRobloxAvatar("builderman");
    }
  }, []);

  // Try-on handling
  const handleTryOnItem = (asset: RobloxAsset) => {
    setTryOnItems((prev) => {
      if (prev.some((item) => item.id === asset.id)) {
        return prev;
      }
      return [...prev, asset];
    });
    setIsTryOnModalOpen(true);
  };

  const handleRemoveTryOnItem = (assetId: number) => {
    setTryOnItems((prev) => prev.filter((item) => item.id !== assetId));
  };

  const handleClearTryOn = () => {
    setTryOnItems([]);
  };

  const handleSaveCustomOutfit = (name: string, items: RobloxAsset[]) => {
    const newFit: SavedCustomFit = {
      id: `fit-${Date.now()}`,
      name,
      sourceUser: currentUser?.name || "Custom",
      savedAt: new Date().toISOString(),
      thumbnailUrl: items[0]?.thumbnailUrl || "",
      assetIds: items.map((i) => i.id),
      assetCount: items.length,
    };
    setSavedCustomFits((prev) => [newFit, ...prev]);
  };

  // Favorites handling
  const isCurrentFavorite = currentUser
    ? favorites.some((f) => f.user.id === currentUser.id)
    : false;

  const handleToggleFavorite = () => {
    if (!currentUser) return;
    if (isCurrentFavorite) {
      setFavorites((prev) => prev.filter((f) => f.user.id !== currentUser.id));
    } else {
      setFavorites((prev) => [
        {
          user: currentUser,
          avatarUrl: thumbnails.bust || thumbnails.fullBody,
        },
        ...prev,
      ]);
    }
  };

  const handleRemoveFavorite = (userId: number) => {
    setFavorites((prev) => prev.filter((f) => f.user.id !== userId));
  };

  const handleRemoveCustomFit = (fitId: string) => {
    setSavedCustomFits((prev) => prev.filter((f) => f.id !== fitId));
  };

  // Switch to connected user's avatar
  const handleLoadMyAvatar = () => {
    if (connectedAccount) {
      setActiveMainTab("avatar");
      fetchRobloxAvatar(connectedAccount.user.name);
    }
  };

  // Restore backup data
  const handleRestoreData = (backup: AppBackupData, mode: "merge" | "replace") => {
    if (mode === "replace") {
      setFavorites(backup.favorites || []);
      setSavedCustomFits(backup.savedCustomFits || []);
      setTryOnItems(backup.tryOnItems || []);
      setRecentSearches(backup.recentSearches || []);
      if (backup.connectedAccount) {
        setConnectedAccount(backup.connectedAccount);
      }
    } else {
      // Merge unique
      setFavorites((prev) => {
        const existingIds = new Set(prev.map((f) => f.user.id));
        const newItems = (backup.favorites || []).filter((f) => !existingIds.has(f.user.id));
        return [...newItems, ...prev];
      });

      setSavedCustomFits((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newItems = (backup.savedCustomFits || []).filter((f) => !existingIds.has(f.id));
        return [...newItems, ...prev];
      });

      setTryOnItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = (backup.tryOnItems || []).filter((i) => !existingIds.has(i.id));
        return [...prev, ...newItems];
      });

      setRecentSearches((prev) => {
        const existingSet = new Set(prev.map((s) => s.toLowerCase()));
        const newSearches = (backup.recentSearches || []).filter(
          (s) => !existingSet.has(s.toLowerCase())
        );
        return [...newSearches, ...prev].slice(0, 10);
      });

      if (backup.connectedAccount && !connectedAccount) {
        setConnectedAccount(backup.connectedAccount);
      }
    }
  };

  // Clear all saved data
  const handleClearAllData = () => {
    setFavorites([]);
    setSavedCustomFits([]);
    setTryOnItems([]);
    setRecentSearches(["builderman", "stickmasterluke", "kreekcraft"]);
    setConnectedAccount(null);
    localStorage.removeItem("bloxlook_favorites");
    localStorage.removeItem("bloxlook_custom_fits");
    localStorage.removeItem("bloxlook_tryon_items");
    localStorage.removeItem("bloxlook_recent_searches");
    localStorage.removeItem("bloxlook_connected_account");
  };

  // Total Robux calculation
  const totalRobux =
    avatarData?.assets.reduce((sum, item) => {
      return sum + (typeof item.price === "number" ? item.price : 0);
    }, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeMainTab}
        onTabChange={setActiveMainTab}
        connectedAccount={connectedAccount}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onDisconnectAccount={() => setConnectedAccount(null)}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onOpenTryOn={() => setIsTryOnModalOpen(true)}
        onOpenAIStylist={() => setIsAIStylistModalOpen(true)}
        onOpenDataBackup={() => setIsDataBackupModalOpen(true)}
        onLoadMyAvatar={handleLoadMyAvatar}
        favoritesCount={favorites.length + savedCustomFits.length}
        hasLoadedUser={!!currentUser && !!avatarData}
        tryOnCount={tryOnItems.length}
      />

      {/* Main Body Content: Tab 1 = Avatar Explorer, Tab 2 = Roblox Catalog Explorer */}
      {activeMainTab === "avatar" ? (
        <>
          {/* Main Search Bar */}
          <SearchSection
            onSearch={fetchRobloxAvatar}
            isLoading={isLoading}
            recentSearches={recentSearches}
            onClearRecent={() => setRecentSearches([])}
          />

          <main className="flex-1 pb-16">
            {/* Error Alert */}
            {errorMessage && (
              <div className="mx-auto max-w-4xl px-4 py-4">
                <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => fetchRobloxAvatar("builderman")}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-600/30 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-600/50 transition"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Load Builderman</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {isLoading && !currentUser && (
              <div className="my-24 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  Fetching Roblox Avatar Renders & Accessories...
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Connecting to Roblox Avatar and Catalog APIs
                </p>
              </div>
            )}

            {/* Rendered Avatar Content */}
            {currentUser && (
              <>
                {/* Hero Card & 3D Render Display */}
                <AvatarHero
                  user={currentUser}
                  thumbnails={thumbnails}
                  isFavorite={isCurrentFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenAIStylist={() => setIsAIStylistModalOpen(true)}
                  onOpenTryOn={() => setIsTryOnModalOpen(true)}
                  totalRobux={totalRobux}
                />

                {/* Worn Assets & Wardrobe */}
                {avatarData && (
                  <>
                    <WardrobeInspector
                      assets={avatarData.assets}
                      onTryOnItem={handleTryOnItem}
                      triedOnAssetIds={tryOnItems.map((i) => i.id)}
                    />

                    {/* Body Colors & Scales */}
                    <BodyColorScales avatarData={avatarData} />
                  </>
                )}

                {/* Public Outfits by this User */}
                <PublicOutfits outfits={outfits} username={currentUser.name} />
              </>
            )}
          </main>
        </>
      ) : (
        /* Tab 2: Roblox Catalog Marketplace Search & Try-On */
        <main className="flex-1 pb-16">
          <CatalogExplorer
            onTryOnItem={handleTryOnItem}
            triedOnAssetIds={tryOnItems.map((i) => i.id)}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Roblox Public API Connected • Auto-Save Enabled</span>
          </div>
          <p>
            BloxLook is a community avatar explorer and catalog fitting room. Roblox is a registered trademark of Roblox Corporation.
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsDataBackupModalOpen(true)}
              className="text-blue-400 hover:underline"
            >
              Data Save & Backups
            </button>
            <span>•</span>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="text-red-400 hover:underline"
            >
              {connectedAccount ? `@${connectedAccount.user.name}` : "Connect Account"}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAccountConnected={(account) => {
          setConnectedAccount(account);
          fetchRobloxAvatar(account.user.name);
        }}
      />

      <TryOnStudioModal
        isOpen={isTryOnModalOpen}
        onClose={() => setIsTryOnModalOpen(false)}
        tryOnItems={tryOnItems}
        onRemoveItem={handleRemoveTryOnItem}
        onClearAll={handleClearTryOn}
        connectedAccount={connectedAccount}
        onSaveOutfit={handleSaveCustomOutfit}
      />

      {currentUser && avatarData && (
        <AIStylistModal
          isOpen={isAIStylistModalOpen}
          onClose={() => setIsAIStylistModalOpen(false)}
          user={currentUser}
          avatarData={avatarData}
        />
      )}

      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        savedCustomFits={savedCustomFits}
        onSelectUser={(username) => {
          setActiveMainTab("avatar");
          fetchRobloxAvatar(username);
        }}
        onRemoveFavorite={handleRemoveFavorite}
        onRemoveCustomFit={handleRemoveCustomFit}
        onOpenDataBackup={() => setIsDataBackupModalOpen(true)}
      />

      <DataBackupModal
        isOpen={isDataBackupModalOpen}
        onClose={() => setIsDataBackupModalOpen(false)}
        connectedAccount={connectedAccount}
        favorites={favorites}
        savedCustomFits={savedCustomFits}
        tryOnItems={tryOnItems}
        recentSearches={recentSearches}
        onRestoreData={handleRestoreData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
