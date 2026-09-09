import React, { useState, useRef } from "react";
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Trash2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Check
} from "lucide-react";
import { AppBackupData, ConnectedRobloxAccount, RobloxUserDetail, SavedCustomFit, RobloxAsset } from "../types";
import confetti from "canvas-confetti";

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccount: ConnectedRobloxAccount | null;
  favorites: { user: RobloxUserDetail; avatarUrl: string }[];
  savedCustomFits: SavedCustomFit[];
  tryOnItems: RobloxAsset[];
  recentSearches: string[];
  onRestoreData: (backup: AppBackupData, mode: "merge" | "replace") => void;
  onClearAllData: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  connectedAccount,
  favorites,
  savedCustomFits,
  tryOnItems,
  recentSearches,
  onRestoreData,
  onClearAllData,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [manualSaveFeedback, setManualSaveFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compute total saved items
  const totalRecords =
    (connectedAccount ? 1 : 0) +
    favorites.length +
    savedCustomFits.length +
    tryOnItems.length +
    recentSearches.length;

  const handleExportData = () => {
    const backup: AppBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      connectedAccount,
      favorites,
      savedCustomFits,
      tryOnItems,
      recentSearches,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bloxlook-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid JSON file format.");
        }

        // Basic validation
        const backup: AppBackupData = {
          version: parsed.version || 1,
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          connectedAccount: parsed.connectedAccount || null,
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          savedCustomFits: Array.isArray(parsed.savedCustomFits) ? parsed.savedCustomFits : [],
          tryOnItems: Array.isArray(parsed.tryOnItems) ? parsed.tryOnItems : [],
          recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
        };

        onRestoreData(backup, "merge");
        setImportSuccess(
          `Successfully restored backup from ${new Date(backup.exportedAt).toLocaleDateString()}!`
        );

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      } catch (err: any) {
        setImportError(err.message || "Failed to read backup file.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleManualSave = () => {
    setManualSaveFeedback(true);
    setTimeout(() => setManualSaveFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 shadow-md shadow-red-600/30">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white">
                Data & Storage Manager
              </h2>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Auto-Save Active
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Manage local persistence, export backup JSON files, and restore saved wardrobes
            </p>
          </div>
        </div>

        {/* Storage Health & Summary Grid */}
        <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 text-center">
          <div className="p-2">
            <span className="block font-display text-lg font-bold text-white">
              {favorites.length}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Favorite Avatars</span>
          </div>

          <div className="p-2">
            <span className="block font-display text-lg font-bold text-amber-400">
              {savedCustomFits.length}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Custom Fits</span>
          </div>

          <div className="p-2">
            <span className="block font-display text-lg font-bold text-purple-400">
              {tryOnItems.length}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Try-On Items</span>
          </div>

          <div className="p-2">
            <span className="block font-display text-lg font-bold text-emerald-400">
              {connectedAccount ? "Connected" : "Guest"}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Account Status</span>
          </div>
        </div>

        {/* Auto-Save Status Banner */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>All changes are automatically saved to your browser storage</span>
          </div>

          <button
            onClick={handleManualSave}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-600/50 transition"
          >
            {manualSaveFeedback ? (
              <>
                <Check className="h-3 w-3 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                <span>Save Now</span>
              </>
            )}
          </button>
        </div>

        {/* Export & Import Action Cards */}
        <div className="space-y-3">
          {/* Export */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3.5 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Export Backup File</h4>
                <p className="text-[11px] text-zinc-400">
                  Save all {totalRecords} items as a portable JSON file to prevent data loss
                </p>
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .JSON</span>
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3.5 hover:border-zinc-700 transition">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Restore from Backup</h4>
                <p className="text-[11px] text-zinc-400">
                  Import previously exported data to restore your favorites & fits
                </p>
              </div>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 transition active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import .JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {importSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Clear Data Section */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          {showClearConfirm ? (
            <div className="flex items-center justify-between w-full rounded-xl bg-red-950/40 p-2 border border-red-500/30">
              <span className="text-[11px] font-semibold text-red-300">
                Are you sure? This erases all saved fits and favorites!
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-500"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[11px] text-zinc-500">
                Stored in browser local storage for domain
              </span>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition"
              >
                <Trash2 className="h-3 w-3" />
                <span>Reset All Saved Data</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
