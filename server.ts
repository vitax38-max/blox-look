import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Roblox BrickColor ID to Hex color code mapping for accurate body colors
const BRICK_COLORS: Record<number, string> = {
  1: "#F2F3F2", 2: "#A1A5A2", 3: "#C4C9C9", 5: "#D8DDDC", 9: "#E8AB2D",
  11: "#80BBDB", 12: "#CB8442", 18: "#CC8E68", 21: "#C4281B", 22: "#C4704B",
  23: "#0D69AC", 24: "#F5CD2F", 25: "#624732", 26: "#1B2A34", 27: "#694027",
  28: "#27462D", 29: "#A1C48B", 36: "#F3B980", 37: "#4B974B", 38: "#A05F34",
  40: "#E3A06B", 41: "#CD6298", 42: "#94BE46", 43: "#E5ADC8", 44: "#DE9C59",
  45: "#D98B5F", 100: "#FBE697", 101: "#DA8540", 102: "#4B5482", 103: "#BAB6B5",
  104: "#6B327C", 105: "#E29B3F", 106: "#DA8641", 107: "#008F9C", 108: "#692E15",
  110: "#435493", 119: "#A4BD46", 120: "#D7C599", 125: "#EAB892", 128: "#D06D4F",
  133: "#CC9E82", 135: "#74869D", 141: "#282B48", 151: "#789082", 153: "#958994",
  192: "#698887", 194: "#A3A2A5", 199: "#635F61", 208: "#E5E1E6", 217: "#7C5C46",
  1001: "#F8F8F8", 1002: "#CDCDCD", 1003: "#111111", 1004: "#BC9B5D", 1005: "#FF98DC",
  1006: "#E29B3F", 1007: "#A34B4B", 1008: "#C1BE42", 1009: "#CAAD43", 1010: "#EEEC7B",
  1011: "#89A7BF", 1012: "#9B8B9B", 1013: "#664F3C", 1014: "#88593A", 1015: "#C19E67",
  1016: "#DCBC81", 1017: "#E7BE86", 1018: "#E5B88A", 1019: "#A3704C", 1020: "#825432",
  1021: "#603A20", 1022: "#462B18", 1023: "#8C5B3E", 1024: "#AF7444", 1025: "#D08F55",
  1026: "#E8AB75", 1027: "#F5CD9E", 1028: "#FDE3BF", 1029: "#FFEECB", 1030: "#FFF6E1",
  1031: "#FFFFFF", 1032: "#626569"
};

function getBrickHex(id: number): string {
  return BRICK_COLORS[id] || "#A3A2A5";
}

const ROBLOX_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Search Roblox Users by Keyword
app.get("/api/roblox/search", async (req: Request, res: Response) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.json({ data: [] });
  }

  try {
    const url = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(url, { headers: ROBLOX_HEADERS });
    if (!response.ok) {
      // If user search fails or limits, attempt username lookup directly
      const direct = await fetchDirectUser(query);
      return res.json({ data: direct ? [direct] : [] });
    }
    const json = await response.json();
    const users = json.data || [];

    // Fetch avatar thumbnails for the searched users
    if (users.length > 0) {
      const ids = users.map((u: any) => u.id).join(",");
      const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids}&size=150x150&format=Png&isCircular=false`;
      const thumbRes = await fetch(thumbUrl, { headers: ROBLOX_HEADERS });
      if (thumbRes.ok) {
        const thumbJson = await thumbRes.json();
        const thumbMap = new Map((thumbJson.data || []).map((t: any) => [t.targetId, t.imageUrl]));
        for (const user of users) {
          user.headshotUrl = thumbMap.get(user.id) || "";
        }
      }
    }

    res.json({ data: users });
  } catch (err: any) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search users", message: err.message });
  }
});

// Helper for exact username lookup
async function fetchDirectUser(username: string) {
  try {
    const postRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { ...ROBLOX_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    if (postRes.ok) {
      const data = await postRes.json();
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }
    }
  } catch {}
  return null;
}

// Lookup by exact username or ID
app.get("/api/roblox/user-lookup", async (req: Request, res: Response) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    let userId: number | null = null;
    let userInfo: any = null;

    // Check if query is numeric ID
    if (/^\d+$/.test(query)) {
      userId = parseInt(query, 10);
      const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, { headers: ROBLOX_HEADERS });
      if (userRes.ok) {
        userInfo = await userRes.json();
      }
    }

    // If not numeric or not found by ID, look up by username
    if (!userInfo) {
      const userMatch = await fetchDirectUser(query);
      if (userMatch) {
        userId = userMatch.id;
        const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, { headers: ROBLOX_HEADERS });
        if (userRes.ok) {
          userInfo = await userRes.json();
        } else {
          userInfo = userMatch;
        }
      }
    }

    if (!userInfo || !userId) {
      return res.status(404).json({ error: `Roblox user '${query}' not found` });
    }

    // Social counts (friends, followers)
    let friendsCount = 0;
    let followersCount = 0;
    try {
      const [fRes, folRes] = await Promise.all([
        fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`, { headers: ROBLOX_HEADERS }),
        fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`, { headers: ROBLOX_HEADERS })
      ]);
      if (fRes.ok) {
        const fj = await fRes.json();
        friendsCount = fj.count || 0;
      }
      if (folRes.ok) {
        const folj = await folRes.json();
        followersCount = folj.count || 0;
      }
    } catch {}

    userInfo.friendsCount = friendsCount;
    userInfo.followersCount = followersCount;
    userInfo.profileUrl = `https://www.roblox.com/users/${userId}/profile`;

    res.json({ user: userInfo });
  } catch (err: any) {
    console.error("User lookup error:", err);
    res.status(500).json({ error: "Failed to lookup user", details: err.message });
  }
});

// Get User Profile Details
app.get("/api/roblox/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, { headers: ROBLOX_HEADERS });
    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: "User not found" });
    }
    const user = await userRes.json();
    user.profileUrl = `https://www.roblox.com/users/${userId}/profile`;

    // Friends and followers
    try {
      const [fRes, folRes] = await Promise.all([
        fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`, { headers: ROBLOX_HEADERS }),
        fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`, { headers: ROBLOX_HEADERS })
      ]);
      if (fRes.ok) user.friendsCount = (await fRes.json()).count || 0;
      if (folRes.ok) user.followersCount = (await folRes.json()).count || 0;
    } catch {}

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Avatar Thumbnails (Full Body 720x720, Bust 420x420, Headshot 150x150, 3D obj URL)
app.get("/api/roblox/thumbnails/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const [fullRes, bustRes, headRes] = await Promise.all([
      fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`, { headers: ROBLOX_HEADERS }),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userId}&size=420x420&format=Png&isCircular=false`, { headers: ROBLOX_HEADERS }),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`, { headers: ROBLOX_HEADERS })
    ]);

    let fullBody = "";
    let bust = "";
    let headshot = "";

    if (fullRes.ok) {
      const d = await fullRes.json();
      fullBody = d.data?.[0]?.imageUrl || "";
    }
    if (bustRes.ok) {
      const d = await bustRes.json();
      bust = d.data?.[0]?.imageUrl || "";
    }
    if (headRes.ok) {
      const d = await headRes.json();
      headshot = d.data?.[0]?.imageUrl || "";
    }

    res.json({
      fullBody,
      bust: bust || fullBody,
      headshot: headshot || bust || fullBody
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Avatar Details: Currently Worn Assets, Scales, Rig Type, Body Colors, and enriched prices
app.get("/api/roblox/avatar/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const avatarRes = await fetch(`https://avatar.roblox.com/v1/users/${userId}/avatar`, { headers: ROBLOX_HEADERS });
    if (!avatarRes.ok) {
      return res.status(avatarRes.status).json({ error: "Failed to fetch avatar" });
    }
    const rawAvatar = await avatarRes.json();

    // Map body colors to hex codes
    const bodyColors = {
      ...rawAvatar.bodyColors,
      headHex: getBrickHex(rawAvatar.bodyColors?.headColorId),
      torsoHex: getBrickHex(rawAvatar.bodyColors?.torsoColorId),
      rightArmHex: getBrickHex(rawAvatar.bodyColors?.rightArmColorId),
      leftArmHex: getBrickHex(rawAvatar.bodyColors?.leftArmColorId),
      rightLegHex: getBrickHex(rawAvatar.bodyColors?.rightLegColorId),
      leftLegHex: getBrickHex(rawAvatar.bodyColors?.leftLegColorId),
    };

    const assets = rawAvatar.assets || [];
    const assetIds: number[] = assets.map((a: any) => a.id);

    // Enrich assets with thumbnails in batches
    if (assetIds.length > 0) {
      try {
        const thumbUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(",")}&size=420x420&format=Png`;
        const thumbRes = await fetch(thumbUrl, { headers: ROBLOX_HEADERS });
        if (thumbRes.ok) {
          const thumbJson = await thumbRes.json();
          const thumbMap = new Map((thumbJson.data || []).map((t: any) => [t.targetId, t.imageUrl]));
          for (const asset of assets) {
            asset.thumbnailUrl = thumbMap.get(asset.id) || `https://www.roblox.com/asset-thumbnail/image?assetId=${asset.id}&width=420&height=420&format=png`;
          }
        }
      } catch (err) {
        console.warn("Asset thumbnail batch error:", err);
      }

      // Enrich assets with price & catalog data via catalog API
      try {
        const catalogItems = assetIds.slice(0, 30).map(id => ({ itemType: "Asset", id }));
        const catalogRes = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
          method: "POST",
          headers: { ...ROBLOX_HEADERS, "Content-Type": "application/json" },
          body: JSON.stringify({ items: catalogItems })
        });
        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          const itemMap = new Map<number, any>((catalogData.data || []).map((c: any) => [c.id, c]));
          for (const asset of assets) {
            const cat: any = itemMap.get(asset.id);
            if (cat) {
              asset.price = cat.price !== undefined ? cat.price : (cat.lowestPrice || null);
              asset.creatorName = cat.creatorName;
              asset.creatorType = cat.creatorType;
              asset.isLimited = (cat.itemRestrictions || []).includes("Limited") || (cat.itemRestrictions || []).includes("LimitedUnique");
              asset.isLimitedUnique = (cat.itemRestrictions || []).includes("LimitedUnique");
              asset.isForSale = cat.priceStatus !== "Off Sale";
              asset.itemRestrictions = cat.itemRestrictions || [];
            }
          }
        }
      } catch (err) {
        console.warn("Catalog details error:", err);
      }
    }

    res.json({
      scales: rawAvatar.scales,
      playerAvatarType: rawAvatar.playerAvatarType || "R15",
      bodyColors,
      assets,
      defaultShirtApplied: rawAvatar.defaultShirtApplied,
      defaultPantsApplied: rawAvatar.defaultPantsApplied,
      emotes: rawAvatar.emotes || []
    });
  } catch (err: any) {
    console.error("Avatar fetch error:", err);
    res.status(500).json({ error: "Failed to fetch avatar details", message: err.message });
  }
});

// Get User Public Outfits
app.get("/api/roblox/outfits/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const url = `https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=20`;
    const outfitsRes = await fetch(url, { headers: ROBLOX_HEADERS });
    if (!outfitsRes.ok) {
      return res.json({ outfits: [] });
    }
    const data = await outfitsRes.json();
    const outfits = data.data || [];

    if (outfits.length > 0) {
      const outfitIds = outfits.map((o: any) => o.id).join(",");
      const thumbUrl = `https://thumbnails.roblox.com/v1/outfits/avatar?outfitIds=${outfitIds}&size=420x420&format=Png`;
      const thumbRes = await fetch(thumbUrl, { headers: ROBLOX_HEADERS });
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        const map = new Map((thumbData.data || []).map((t: any) => [t.targetId, t.imageUrl]));
        for (const outfit of outfits) {
          outfit.thumbnailUrl = map.get(outfit.id) || "";
        }
      }
    }

    res.json({ outfits });
  } catch (err: any) {
    res.json({ outfits: [] });
  }
});

// Roblox Catalog Marketplace Search
app.get("/api/roblox/catalog/search", async (req: Request, res: Response) => {
  const { keyword, category, subcategory, sortType, cursor, limit } = req.query;
  const searchTerm = (typeof keyword === "string" ? keyword : "").trim();
  const searchCategory = (typeof category === "string" && category ? category : "All");
  const searchLimit = limit ? Math.min(Number(limit), 30) : 30;

  try {
    // If the search term is a purely numeric asset ID, attempt direct asset resolution first
    let directAsset: any = null;
    if (/^\d{3,15}$/.test(searchTerm)) {
      try {
        const econRes = await fetch(`https://economy.roblox.com/v2/assets/${searchTerm}/details`, {
          headers: ROBLOX_HEADERS,
        });
        if (econRes.ok) {
          const item = await econRes.json();
          // Fetch thumbnail
          let thumb = "";
          try {
            const thumbRes = await fetch(
              `https://thumbnails.roblox.com/v1/assets?assetIds=${item.AssetId}&size=420x420&format=Png&isCircular=false`,
              { headers: ROBLOX_HEADERS }
            );
            if (thumbRes.ok) {
              const td = await thumbRes.json();
              thumb = td.data?.[0]?.imageUrl || "";
            }
          } catch {}

          directAsset = {
            id: item.AssetId,
            name: item.Name,
            description: item.Description,
            assetType: item.AssetTypeId,
            creatorName: item.Creator?.Name || "Roblox",
            creatorHasVerifiedBadge: item.Creator?.HasVerifiedBadge || false,
            creatorTargetId: item.Creator?.Id,
            price: item.PriceInRobux ?? (item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null),
            lowestPrice: item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null,
            lowestResalePrice: item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null,
            favoriteCount: 0,
            isOffSale: item.IsForSale === false && !item.IsLimited,
            itemRestrictions: item.IsLimited ? ["Limited"] : (item.IsLimitedUnique ? ["LimitedUnique"] : []),
            isLimited: !!item.IsLimited,
            isLimitedUnique: !!item.IsLimitedUnique,
            thumbnailUrl: thumb,
            taxonomyName: "Direct Asset Match"
          };
        }
      } catch (err) {
        console.warn("Direct asset lookup warning:", err);
      }
    }

    // Call Roblox Catalog v2 Search
    const params = new URLSearchParams();
    if (searchTerm) params.append("keyword", searchTerm);
    params.append("category", searchCategory);
    if (subcategory && typeof subcategory === "string") {
      params.append("subcategory", subcategory);
    }
    if (sortType !== undefined && sortType !== "") {
      params.append("sortType", String(sortType));
    }
    if (cursor && typeof cursor === "string") {
      params.append("cursor", cursor);
    }
    params.append("limit", String(searchLimit));

    const catalogUrl = `https://catalog.roblox.com/v2/search/items/details?${params.toString()}`;
    const catalogRes = await fetch(catalogUrl, { headers: ROBLOX_HEADERS });

    if (!catalogRes.ok) {
      // If v2 fails or rate-limits, return direct asset if available
      if (directAsset) {
        return res.json({ data: [directAsset], nextPageCursor: null });
      }
      return res.status(catalogRes.status).json({
        error: "Failed to search Roblox catalog",
        data: [],
        nextPageCursor: null
      });
    }

    const catalogJson = await catalogRes.json();
    const rawItems = catalogJson.data || [];
    const nextPageCursor = catalogJson.nextPageCursor || null;

    // Fetch batch thumbnails for all returned items
    const assetIds = rawItems.map((i: any) => i.id).filter(Boolean);
    const thumbMap = new Map<number, string>();

    if (assetIds.length > 0) {
      try {
        const thumbUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(",")}&size=420x420&format=Png&isCircular=false`;
        const thumbRes = await fetch(thumbUrl, { headers: ROBLOX_HEADERS });
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          for (const t of thumbData.data || []) {
            thumbMap.set(t.targetId, t.imageUrl);
          }
        }
      } catch (err) {
        console.warn("Catalog thumbnail batch fetch failed:", err);
      }
    }

    const formattedItems = rawItems.map((item: any) => {
      const isLimited = (item.itemRestrictions || []).includes("Limited") || (item.itemRestrictions || []).includes("LimitedUnique");
      const isLimitedUnique = (item.itemRestrictions || []).includes("LimitedUnique");
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        assetType: item.assetType,
        creatorName: item.creatorName,
        creatorHasVerifiedBadge: item.creatorHasVerifiedBadge,
        creatorTargetId: item.creatorTargetId,
        price: item.price !== undefined ? item.price : (item.lowestPrice || null),
        lowestPrice: item.lowestPrice,
        lowestResalePrice: item.lowestResalePrice,
        favoriteCount: item.favoriteCount,
        isOffSale: item.isOffSale,
        itemRestrictions: item.itemRestrictions || [],
        isLimited,
        isLimitedUnique,
        thumbnailUrl: thumbMap.get(item.id) || "",
        taxonomyName: item.taxonomy?.[0]?.taxonomyName || ""
      };
    });

    // If directAsset exists and not already in items, prepend it!
    if (directAsset && !formattedItems.some((i: any) => i.id === directAsset.id)) {
      formattedItems.unshift(directAsset);
    }

    res.json({
      data: formattedItems,
      nextPageCursor,
      keyword: searchTerm,
      category: searchCategory
    });
  } catch (err: any) {
    console.error("Catalog search error:", err);
    res.status(500).json({ error: "Internal error searching catalog", details: err.message, data: [] });
  }
});

// Single Catalog Asset Lookup
app.get("/api/roblox/catalog/item/:assetId", async (req: Request, res: Response) => {
  const { assetId } = req.params;
  try {
    const econRes = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`, {
      headers: ROBLOX_HEADERS,
    });
    if (!econRes.ok) {
      return res.status(econRes.status).json({ error: `Could not find asset ${assetId}` });
    }
    const item = await econRes.json();

    let thumb = "";
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png&isCircular=false`,
        { headers: ROBLOX_HEADERS }
      );
      if (thumbRes.ok) {
        const td = await thumbRes.json();
        thumb = td.data?.[0]?.imageUrl || "";
      }
    } catch {}

    const isLimited = !!item.IsLimited || !!item.IsLimitedUnique;
    res.json({
      id: item.AssetId,
      name: item.Name,
      description: item.Description,
      assetType: item.AssetTypeId,
      creatorName: item.Creator?.Name || "Roblox",
      creatorHasVerifiedBadge: item.Creator?.HasVerifiedBadge || false,
      creatorTargetId: item.Creator?.Id,
      price: item.PriceInRobux ?? (item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null),
      lowestPrice: item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null,
      lowestResalePrice: item.CollectiblesItemDetails?.CollectibleLowestResalePrice ?? null,
      favoriteCount: 0,
      isOffSale: item.IsForSale === false && !item.IsLimited,
      itemRestrictions: item.IsLimited ? ["Limited"] : (item.IsLimitedUnique ? ["LimitedUnique"] : []),
      isLimited,
      isLimitedUnique: !!item.IsLimitedUnique,
      thumbnailUrl: thumb,
      taxonomyName: "Asset Details"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch asset details", details: err.message });
  }
});

// Verify Roblox Account via Mandatory Profile Bio Word Phrase (Filter-Safe)
app.post("/api/roblox/verify-account", async (req: Request, res: Response) => {
  const { usernameOrId, verificationPhrase } = req.body;
  if (!usernameOrId) {
    return res.status(400).json({ error: "Username or User ID is required" });
  }

  const phrase = (verificationPhrase || "").trim();
  if (!phrase) {
    return res.status(400).json({
      error: "Verification phrase is required. Account verification via Roblox profile bio is mandatory."
    });
  }

  try {
    let userId: number | null = null;
    let user: any = null;

    if (/^\d+$/.test(usernameOrId)) {
      userId = parseInt(usernameOrId, 10);
      const uRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, { headers: ROBLOX_HEADERS });
      if (uRes.ok) user = await uRes.json();
    }

    if (!user) {
      const match = await fetchDirectUser(usernameOrId);
      if (match) {
        userId = match.id;
        const uRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, { headers: ROBLOX_HEADERS });
        if (uRes.ok) user = await uRes.json();
        else user = match;
      }
    }

    if (!user || !userId) {
      return res.status(404).json({ error: `Could not find Roblox user: ${usernameOrId}` });
    }

    // Check Bio against verification phrase words
    const rawBio = user.description || "";
    const cleanBio = rawBio.toLowerCase().replace(/[\r\n\t]+/g, " ");
    const phraseWords = phrase.toLowerCase().split(/\s+/).filter(Boolean);

    // Verify all required words from the anti-censor phrase exist in the user's bio
    const missingWords = phraseWords.filter(w => !cleanBio.includes(w));

    if (missingWords.length > 0) {
      const isCensoredByRoblox = rawBio.includes("###");
      let message = "Verification phrase not found in your Roblox About / Bio section.";
      if (isCensoredByRoblox) {
        message = "Roblox censored text in your bio with '###'. Please use the new filter-safe dictionary phrase and save again on Roblox!";
      }

      return res.status(400).json({
        verified: false,
        error: message,
        currentBio: rawBio ? `"${rawBio}"` : "(Your Roblox About / Bio is currently empty)",
        missingWords,
        expectedPhrase: phrase
      });
    }

    // Fetch avatar thumbnail
    let avatarUrl = "";
    try {
      const tRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userId}&size=420x420&format=Png&isCircular=false`, { headers: ROBLOX_HEADERS });
      if (tRes.ok) {
        const tj = await tRes.json();
        avatarUrl = tj.data?.[0]?.imageUrl || "";
      }
    } catch {}

    user.avatarUrl = avatarUrl;
    user.profileUrl = `https://www.roblox.com/users/${userId}/profile`;

    res.json({
      verified: true,
      user,
      method: "bio-words",
      message: `Verified ownership of @${user.name}! Account connected.`
    });
  } catch (err: any) {
    res.status(500).json({ error: "Verification error", details: err.message });
  }
});

// Gemini AI Avatar Fashion Critic & Fit Check
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAiClient;
}

app.post("/api/ai/avatar-stylist", async (req: Request, res: Response) => {
  const { username, displayName, playerAvatarType, assets, scales, bodyColors } = req.body;

  const assetList = (assets || []).map((a: any) => `- ${a.name} (${a.assetType?.name || 'Accessory'})`).join("\n");

  const prompt = `You are "BloxStyle AI", an expert Roblox fashion critic and avatar stylist deeply knowledgeable about Roblox culture, UGC trends, classic retro fits, streetwear, emo/grunge aesthetics, preppy styles, goofy meme avatars, and high-end limiteds.

Review this Roblox Avatar:
Username: @${username} (Display: "${displayName}")
Avatar Rig: ${playerAvatarType || "R15"}
Equipped Items (${assets?.length || 0}):
${assetList || "None (Classic Noob / Default)"}

Scales: Height ${scales?.height || 1}, Width ${scales?.width || 1}, Head ${scales?.head || 1}

Respond strictly with valid JSON with this exact schema:
{
  "rating": number (between 1 and 10, e.g. 8.5),
  "aestheticTitle": string (e.g. "Vintage 2014 Classic", "Dark Techwear Shinobi", "Pastel UGC Dream", "Chaotic Meme Lord"),
  "dripVerdict": "GOD TIER" | "CLEAN FIT" | "SOLID CASUAL" | "MID" | "GOOFY / MEME" | "NEEDS RESCUE",
  "vibeSummary": string (2-3 punchy, entertaining sentences breaking down the fit's aura),
  "styleStrengths": string[] (3 cool compliments about item pairings, color coordination, or theme),
  "styleCritiques": string[] (2 constructive or playful roasts/tips on clipping or clashing items),
  "recommendedAdditions": string[] (3 specific Roblox accessory or item ideas that would level up this look)
}
No markdown outside the JSON block. Return pure JSON.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Intelligent heuristic fallback review if GEMINI_API_KEY is not configured
      const count = assets?.length || 0;
      const isRetro = count <= 3 || playerAvatarType === "R6";
      const rating = Math.min(10, Math.max(5, 6 + Math.floor((count % 4) + (isRetro ? 2 : 1))));

      return res.json({
        rating,
        aestheticTitle: isRetro ? "Classic Blocky Nostalgia" : "Modern UGC Streetwear",
        dripVerdict: rating >= 8 ? "CLEAN FIT" : "SOLID CASUAL",
        vibeSummary: `@${username} rocks a distinctive aesthetic that balances silhouette and Roblox identity. The item composition shows clear intentionality.`,
        styleStrengths: [
          "Well-balanced color accents with avatar skin tones",
          "Distinctive headpiece accessory anchors the look",
          `Clean ${playerAvatarType} rig proportions`
        ],
        styleCritiques: [
          "Could benefit from a complementary waist or back accessory to balance depth",
          "Ensure layered accessories don't clip during dynamic in-game animations"
        ],
        recommendedAdditions: [
          "Aura or particle effect shoulder pal",
          "Matching tonal skate shoes or low-top sneakers",
          "Custom animated face expression pack"
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini stylist error:", err);
    // Return friendly fallback
    res.json({
      rating: 8.0,
      aestheticTitle: "Iconic Bloxian Explorer",
      dripVerdict: "CLEAN FIT",
      vibeSummary: `An eye-catching Roblox avatar fit that stands out in any experience.`,
      styleStrengths: ["Strong theme cohesion", "Eye-catching accessory silhouette"],
      styleCritiques: ["Watch out for accessory clipping in tight spaces"],
      recommendedAdditions: ["Matching shoulder companion", "Themed emote pack"]
    });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Roblox Avatar Searcher server listening on port ${PORT}`);
  });
}

startServer();
