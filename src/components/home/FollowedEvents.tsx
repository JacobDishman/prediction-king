import { games } from "@/data/mock";

const upcomingGames = games.filter((g) => !g.live);

const FollowedEvents = () => {
  return (
    <section className="px-4 pt-6 pb-4">
      <h2 className="mb-3 font-heading text-lg font-bold">Followed Events</h2>
      <div className="grid grid-cols-2 gap-3">
        {upcomingGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm"
          >
            <span className="mb-2 text-xs font-medium text-muted-foreground">{game.time}</span>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: game.teamA.color }}
              >
                {game.teamA.abbrev}
              </div>
              <span className="text-xs font-bold text-muted-foreground">vs</span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: game.teamB.color }}
              >
                {game.teamB.abbrev}
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-center">
              {game.teamA.name} vs {game.teamB.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FollowedEvents;
