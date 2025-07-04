"use client";

interface XPProgressProps {
  level: { name: string };
  nextLevel: { name: string };
  xp: number;
  progress: number;
}

export function XPProgress({
  level,
  nextLevel,
  xp,
  progress,
}: XPProgressProps) {
  return (
    <div className="flex flex-col gap-1 items-end min-w-[200px] max-w-xs">
      <div className="flex justify-between items-center text-xs text-zinc-400 w-full">
        <span className="truncate">{level.name}</span>
        <span className="text-purple-400 font-medium">{xp} XP</span>
        <span className="truncate">{nextLevel.name}</span>
      </div>
      <div
        className="w-full h-2 md:h-3 bg-zinc-800 rounded-full overflow-hidden"
        aria-label="XP progress bar"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
