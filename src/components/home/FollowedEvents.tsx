import { games } from "@/data/mock";

const upcomingGames = games.filter((g) => !g.live);

const FollowedEvents = () => {
  return (
    <section className="px-4 pt-5 pb-4">
      <h2 className="mb-3 font-heading text-base font-bold uppercase tracking-wide text-foreground">
        Upcoming
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {upcomingGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col rounded-xl border border-border bg-card p-3"
          >
            {/* Sport + Time */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                {game.sport}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">{game.time}</span>
            </div>

            {/* Team A */}
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: game.teamA.color }}
              >
                {game.teamA.abbrev}
              </div>
              <span className="text-xs font-medium truncate">{game.teamA.name}</span>
            </div>

            {/* Team B */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: game.teamB.color }}
              >
                {game.teamB.abbrev}
              </div>
              <span className="text-xs font-medium truncate">{game.teamB.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FollowedEvents;
