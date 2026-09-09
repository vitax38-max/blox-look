export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  created?: string;
  isBanned?: boolean;
  hasVerifiedBadge?: boolean;
  profileUrl?: string;
}

export interface RobloxUserDetail extends RobloxUser {
  friendsCount?: number;
  followersCount?: number;
  followingCount?: number;
  badgesCount?: number;
}

export interface RobloxAsset {
  id: number;
  name: string;
  assetType: {
    id: number;
    name: string;
  };
  thumbnailUrl?: string;
  price?: number | null;
  lowestPrice?: number | null;
  lowestResalePrice?: number | null;
  realPrice?: number;
  priceType?: 'retail' | 'resale' | 'free' | 'off_sale';
  isForSale?: boolean;
  isLimited?: boolean;
  isLimitedUnique?: boolean;
  creatorName?: string;
  creatorType?: string;
  itemRestrictions?: string[];
  favoriteCount?: number;
}

export interface RobloxBodyColors {
  headColorId: number;
  torsoColorId: number;
  rightArmColorId: number;
  leftArmColorId: number;
  rightLegColorId: number;
  leftLegColorId: number;
  // Computed Hex colors
  headHex?: string;
  torsoHex?: string;
  rightArmHex?: string;
  leftArmHex?: string;
  rightLegHex?: string;
  leftLegHex?: string;
}

export interface RobloxAvatarScales {
  height: number;
  width: number;
  head: number;
  depth: number;
  proportion: number;
  bodyType: number;
}

export interface RobloxAvatarData {
  scales: RobloxAvatarScales;
  playerAvatarType: 'R6' | 'R15';
  bodyColors: RobloxBodyColors;
  assets: RobloxAsset[];
  defaultShirtApplied?: boolean;
  defaultPantsApplied?: boolean;
}

export interface RobloxThumbnails {
  fullBody: string;
  bust: string;
  headshot: string;
}

export interface RobloxOutfit {
  id: number;
  name: string;
  isEditable: boolean;
  thumbnailUrl?: string;
}

export interface AvatarAIReview {
  rating: number; // 1-10
  aestheticTitle: string; // e.g. "Neo-Cyber Y2K"
  dripVerdict: 'GOD TIER' | 'CLEAN FIT' | 'SOLID CASUAL' | 'MID' | 'GOOFY / MEME' | 'NEEDS RESCUE';
  vibeSummary: string;
  styleStrengths: string[];
  styleCritiques: string[];
  recommendedAdditions: string[];
  estimatedTotalRobux: number;
}

export interface FitCostBreakdown {
  totalRealRobux: number;
  retailRobux: number;
  resaleRobux: number;
  retailItemsCount: number;
  limitedItemsCount: number;
  freeItemsCount: number;
  offSaleItemsCount: number;
  usdEstimatedMin: number; // e.g. DevEx rate: total * 0.0035
  usdEstimatedMax: number; // e.g. Buy rate: total * 0.0125
}

export interface AccountPermissions {
  allowPublicView: boolean; // Allow others to see and search your avatar
  showFitCost: boolean; // Allow others to see your real fit cost and Robux valuation
  allowOutfitInspection: boolean; // Allow others to inspect your worn items and asset IDs
  allowTryOnMyFits: boolean; // Allow others to try on your custom saved outfits
  showOnlineStatus: boolean; // Show verification badge and connected timestamp
  showBioNote: boolean; // Show custom showcase message on your profile
  customBioNote: string; // e.g. "Trading Valkyrie / DM on Discord"
  anonymousMode: boolean; // Masks avatar name as "Verified Collector" or "Anonymous User"
}

export interface ConnectedRobloxAccount {
  user: RobloxUser;
  connectedAt: string;
  verificationMethod: 'bio-words' | 'bio-code';
  savedOutfits: SavedCustomFit[];
  favorites: number[]; // User IDs of favorited avatars
  permissions?: AccountPermissions;
}

export interface SavedCustomFit {
  id: string;
  name: string;
  sourceUser: string;
  savedAt: string;
  thumbnailUrl: string;
  assetIds: number[];
  assetCount: number;
  notes?: string;
}

export interface RobloxCatalogItem {
  id: number;
  name: string;
  description?: string;
  assetType?: number;
  assetTypeName?: string;
  creatorName?: string;
  creatorHasVerifiedBadge?: boolean;
  creatorTargetId?: number;
  price?: number | null;
  lowestPrice?: number | null;
  lowestResalePrice?: number | null;
  favoriteCount?: number;
  isOffSale?: boolean;
  itemRestrictions?: string[];
  isLimited?: boolean;
  isLimitedUnique?: boolean;
  thumbnailUrl?: string;
  taxonomyName?: string;
}

export interface AppBackupData {
  version: number;
  exportedAt: string;
  connectedAccount: ConnectedRobloxAccount | null;
  favorites: { user: RobloxUserDetail; avatarUrl: string }[];
  savedCustomFits: SavedCustomFit[];
  tryOnItems: RobloxAsset[];
  recentSearches: string[];
}
