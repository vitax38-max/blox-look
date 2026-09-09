import React, { useState } from "react";
import {
  X,
  Shield,
  Eye,
  EyeOff,
  DollarSign,
  Shirt,
  Sparkles,
  Lock,
  Globe,
  UserCheck,
  Check,
  Save,
  MessageSquare,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { ConnectedRobloxAccount, AccountPermissions } from "../types";

interface AccountPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccount: ConnectedRobloxAccount | null;
  onSavePermissions: (permissions: AccountPermissions) => void;
}

const DEFAULT_PERMISSIONS: AccountPermissions = {
  allowPublicView: true,
  showFitCost: true,
  allowOutfitInspection: true,
  allowTryOnMyFits: true,
  showOnlineStatus: true,
  showBioNote: false,
  customBioNote: "",
  anonymousMode: false,
};

export const AccountPermissionsModal: React.FC<AccountPermissionsModalProps> = ({
  isOpen,
  onClose,
  connectedAccount,
  onSavePermissions,
}) => {
  if (!isOpen || !connectedAccount) return null;

  const currentPermissions = connectedAccount.permissions || DEFAULT_PERMISSIONS;

  const [permissions, setPermissions] = useState<AccountPermissions>({
    ...DEFAULT_PERMISSIONS,
    ...currentPermissions,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (key: keyof AccountPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBioNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermissions((prev) => ({
      ...prev,
      customBioNote: e.target.value.slice(0, 120),
    }));
  };

  const handleResetDefaults = () => {
    setPermissions(DEFAULT_PERMISSIONS);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Sync with backend so other clients respect these privacy rules
      await fetch("/api/roblox/account/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: connectedAccount.user.id,
          permissions,
        }),
      });
    } catch (err) {
      console.warn("Failed to sync permissions with server:", err);
    } finally {
      onSavePermissions(permissions);
      setIsSubmitting(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                  Account Privacy & Permissions
                </h2>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  Owner Controls
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Choose what other BloxLook users can see when searching your account.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Connected Account User Card */}
        <div className="border-b border-zinc-850 bg-zinc-900/40 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-emerald-500/40">
              {(connectedAccount.user as any).avatarUrl ? (
                <img
                  src={(connectedAccount.user as any).avatarUrl}
                  alt={connectedAccount.user.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserCheck className="h-5 w-5 m-2 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span>{connectedAccount.user.displayName || connectedAccount.user.name}</span>
                <span className="text-zinc-500 font-normal">(@{connectedAccount.user.name})</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                Verified Connected Account
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-750">
            {permissions.allowPublicView ? (
              <>
                <Globe className="h-3 w-3 text-emerald-400" />
                <span>Public Profile</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-red-400" />
                <span>Private Profile</span>
              </>
            )}
          </div>
        </div>

        {/* Permissions Form / Toggles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Permission 1: Allow Public View */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                {permissions.allowPublicView ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Allow Others to See My Account</span>
                  {!permissions.allowPublicView && (
                    <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[9px] font-bold text-red-300">
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  When enabled, other visitors can search for and view your avatar. When disabled, your profile displays a private shield.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("allowPublicView")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.allowPublicView ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.allowPublicView ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 2: Show Fit Cost */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Display Real Fit Cost & Robux Valuation</span>
                  {!permissions.showFitCost && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  When disabled, your outfit valuation and Robux cost is masked with &quot;[🔒 Fit Cost Hidden by User]&quot;.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("showFitCost")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.showFitCost ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.showFitCost ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 3: Allow Outfit Inspection */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
                <Shirt className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Allow Wardrobe & Asset Inspection
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Allow others to view your equipped asset IDs, item breakdown, and catalog links.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("allowOutfitInspection")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.allowOutfitInspection ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.allowOutfitInspection ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 4: Allow Others to Try On My Fits */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-rose-500/10 p-2 text-rose-400 border border-rose-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Allow Others to Try On My Fits
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Permits other players to test your worn items in the Virtual Fitting Studio.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("allowTryOnMyFits")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.allowTryOnMyFits ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.allowTryOnMyFits ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 5: Show Verified Connection Badge */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Show Verified BloxLook Member Badge
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Displays a verified green checkmark and connection date on your avatar hero.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("showOnlineStatus")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.showOnlineStatus ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.showOnlineStatus ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 6: Anonymous Mode */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-zinc-700/20 p-2 text-zinc-400 border border-zinc-700/30">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Anonymous Collector Mode
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Masks your username as &quot;Verified Collector [Hidden]&quot; on public share links.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("anonymousMode")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                permissions.anonymousMode ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  permissions.anonymousMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Permission 7: Custom Bio / Trade Note */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Showcase Status Note / Trade Message
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Pin a custom message on your avatar card (e.g. &quot;Trading Valkyrie / DM me on Discord&quot;).
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggle("showBioNote")}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  permissions.showBioNote ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    permissions.showBioNote ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {permissions.showBioNote && (
              <div className="pt-2">
                <input
                  type="text"
                  value={permissions.customBioNote}
                  onChange={handleBioNoteChange}
                  placeholder="e.g. Trading Valkyrie! Open to limited swaps or item offers."
                  maxLength={120}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="mt-1 text-right text-[10px] text-zinc-500">
                  {permissions.customBioNote.length}/120 characters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-900/60 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Reset to Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Permissions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
