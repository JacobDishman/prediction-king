import { games } from "@/data/mock";
import { cn } from "@/lib/utils";

const LiveGames = () => {
  return (
    <section className="px-4 pt-4">
      <h2 className="mb-3 font-heading text-lg font-bold">Live & Upcoming</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex min-w-[200px] flex-col rounded-xl border bg-card p-3 shadow-sm"
          >
            {game.live && (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-ck-red" />
                <span className="text-xs font-bold text-ck-red uppercase">Live</span>
              </div>
            )}
            {!game.live && (
              <div className="mb-2">
                <span className="text-xs font-medium text-muted-foreground">{game.time}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: game.teamA.color }}
                >
                  {game.teamA.abbrev}
                </div>
                <span className="text-xs font-medium">{game.teamA.name}</span>
                {game.live && (
                  <span className="text-sm font-bold">{game.scoreA}</span>
                )}
              </div>
              <span className="text-xs font-bold text-muted-foreground">VS</span>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: game.teamB.color }}
                >
                  {game.teamB.abbrev}
                </div>
                <span className="text-xs font-medium">{game.teamB.name}</span>
                {game.live && (
                  <span className="text-sm font-bold">{game.scoreB}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveGames;
