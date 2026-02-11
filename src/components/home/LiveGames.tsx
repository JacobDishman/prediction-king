import { games } from "@/data/mock";
import { cn } from "@/lib/utils";

const LiveGames = () => {
  return (
    <section className="px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base font-bold uppercase tracking-wide text-foreground">
          Live & Upcoming
        </h2>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {games.filter((g) => g.live).length} Live
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {games.map((game) => (
          <div
            key={game.id}
            className={cn(
              "flex min-w-[220px] flex-col rounded-xl border bg-card p-3 transition-colors",
              game.live && "border-ck-red/30"
            )}
          >
            {/* Header: sport tag + time/live */}
            <div className="flex items-center justify-between mb-3">
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                {game.sport}
              </span>
              {game.live ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ck-red opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ck-red" />
                  </span>
                  <span className="text-[10px] font-bold text-ck-red uppercase">Live</span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-muted-foreground">{game.time}</span>
              )}
            </div>

            {/* Matchup row */}
            <div className="flex items-center justify-between gap-2">
              {/* Team A */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white"
                  style={{ backgroundColor: game.teamA.color }}
                >
                  {game.teamA.abbrev}
                </div>
                <span className="text-sm font-semibold truncate">{game.teamA.name}</span>
              </div>
              {game.live && game.scoreA !== undefined && (
                <span className="text-lg font-bold tabular-nums">{game.scoreA}</span>
              )}
            </div>

            <div className="my-1.5 border-t border-border/50" />

            {/* Team B */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white"
                  style={{ backgroundColor: game.teamB.color }}
                >
                  {game.teamB.abbrev}
                </div>
                <span className="text-sm font-semibold truncate">{game.teamB.name}</span>
              </div>
              {game.live && game.scoreB !== undefined && (
                <span className="text-lg font-bold tabular-nums">{game.scoreB}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveGames;
