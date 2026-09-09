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
  isForSale?: boolean;
  isLimited?: boolean;
  isLimitedUnique?: boolean;
  creatorName?: string;
  creatorType?: string;
  itemRestrictions?: string[];
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

export interface ConnectedRobloxAccount {
  user: RobloxUser;
  connectedAt: string;
  verificationMethod: 'bio-words' | 'bio-code';
  savedOutfits: SavedCustomFit[];
  favorites: number[]; // User IDs of favorited avatars
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
