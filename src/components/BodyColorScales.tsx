import React, { useState } from "react";
import { Copy, Check, Sliders, Palette } from "lucide-react";
import { RobloxAvatarData } from "../types";
import { copyToClipboard } from "../utils/roblox";

interface BodyColorScalesProps {
  avatarData: RobloxAvatarData;
}

export const BodyColorScales: React.FC<BodyColorScalesProps> = ({ avatarData }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = async (hex?: string) => {
    if (!hex) return;
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
    }
  };

  const { bodyColors, scales, playerAvatarType } = avatarData;

  const bodyParts = [
    { name: "Head", id: bodyColors.headColorId, hex: bodyColors.headHex },
    { name: "Torso", id: bodyColors.torsoColorId, hex: bodyColors.torsoHex },
    { name: "Right Arm", id: bodyColors.rightArmColorId, hex: bodyColors.rightArmHex },
    { name: "Left Arm", id: bodyColors.leftArmColorId, hex: bodyColors.leftArmHex },
    { name: "Right Leg", id: bodyColors.rightLegColorId, hex: bodyColors.rightLegHex },
    { name: "Left Leg", id: bodyColors.leftLegColorId, hex: bodyColors.leftLegHex },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left: Body Colors & Interactive Mannequin (7 cols) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl backdrop-blur-xl md:col-span-7">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-400" />
              <h3 className="font-display text-lg font-bold text-white">
                Avatar Body Colors & Palette
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">BrickColor Standard</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-12 items-center">
            {/* Visual Block Mannequin (5 cols) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Color Layout
              </span>

              {/* Head */}
              <div
                style={{ backgroundColor: bodyColors.headHex || "#F5CD2F" }}
                className="h-10 w-10 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                title={`Head: ${bodyColors.headHex} (ID: ${bodyColors.headColorId})`}
              />

              {/* Torso & Arms */}
              <div className="mt-1 flex items-center justify-center gap-1">
                {/* Right Arm */}
                <div
                  style={{ backgroundColor: bodyColors.rightArmHex || "#F5CD2F" }}
                  className="h-16 w-6 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                  title={`Right Arm: ${bodyColors.rightArmHex}`}
                />
                {/* Torso */}
                <div
                  style={{ backgroundColor: bodyColors.torsoHex || "#0D69AC" }}
                  className="h-16 w-14 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                  title={`Torso: ${bodyColors.torsoHex}`}
                />
                {/* Left Arm */}
                <div
                  style={{ backgroundColor: bodyColors.leftArmHex || "#F5CD2F" }}
                  className="h-16 w-6 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                  title={`Left Arm: ${bodyColors.leftArmHex}`}
                />
              </div>

              {/* Legs */}
              <div className="mt-1 flex items-center justify-center gap-1">
                {/* Right Leg */}
                <div
                  style={{ backgroundColor: bodyColors.rightLegHex || "#A4BD46" }}
                  className="h-16 w-6 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                  title={`Right Leg: ${bodyColors.rightLegHex}`}
                />
                {/* Left Leg */}
                <div
                  style={{ backgroundColor: bodyColors.leftLegHex || "#A4BD46" }}
                  className="h-16 w-6 rounded-md border-2 border-zinc-900 shadow-md transition hover:scale-105"
                  title={`Left Leg: ${bodyColors.leftLegHex}`}
                />
              </div>
            </div>

            {/* Hex Color List with 1-click copy (7 cols) */}
            <div className="sm:col-span-7 grid grid-cols-2 gap-2">
              {bodyParts.map((part) => (
                <button
                  key={part.name}
                  onClick={() => handleCopyHex(part.hex)}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 text-left transition hover:border-zinc-700 hover:bg-zinc-800/70 group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: part.hex || "#999" }}
                      className="h-4 w-4 rounded-full border border-black/30 shadow-xs flex-shrink-0"
                    />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">{part.name}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{part.hex}</div>
                    </div>
                  </div>
                  <div className="text-zinc-500 group-hover:text-white transition">
                    {copiedHex === part.hex ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scale & Proportions Inspector (5 cols) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl backdrop-blur-xl md:col-span-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-cyan-400" />
              <h3 className="font-display text-lg font-bold text-white">Rig & Scale Matrix</h3>
            </div>
            <span
              className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                playerAvatarType === "R6"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {playerAvatarType} RIG
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Height</span>
                <span className="font-mono text-cyan-400">{scales?.height ?? 1}x</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(10, ((scales?.height ?? 1) / 1.2) * 100))}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Width</span>
                <span className="font-mono text-cyan-400">{scales?.width ?? 1}x</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(10, ((scales?.width ?? 1) / 1.2) * 100))}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Head Scale</span>
                <span className="font-mono text-cyan-400">{scales?.head ?? 1}x</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(10, (scales?.head ?? 1) * 100))}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Body Type</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((scales?.bodyType ?? 0) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(5, (scales?.bodyType ?? 0) * 100))}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Proportions</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((scales?.proportion ?? 0) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(5, (scales?.proportion ?? 0) * 100))}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
