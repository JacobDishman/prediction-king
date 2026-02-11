import { Crown, ShieldAlert, Award, Coins, Users, Clock, Zap, TrendingUp } from "lucide-react";

const sections = [
  {
    icon: Coins,
    title: "Points System",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      "Points are the only currency — no real money involved",
      "Everyone starts each week with a fresh point total",
      "Points are wagered on predictions created by the King",
      "Winners split the pot proportionally to their wagers",
    ],
  },
  {
    icon: Crown,
    title: "The King",
    color: "text-ck-gold",
    bg: "bg-ck-gold/10",
    items: [
      "The King is the member with the most points in the group",
      "Only the King can create new predictions",
      "The King must place their own wager before publishing",
      "If someone overtakes the King in points, the crown transfers",
    ],
  },
  {
    icon: Zap,
    title: "Predictions",
    color: "text-ck-orange",
    bg: "bg-ck-orange/10",
    items: [
      "Predictions have a question and 2-6 answer options",
      "Members pick an option and wager points",
      "Minimum wager is set by the King",
      "Once placed, wagers are locked until resolution",
    ],
  },
  {
    icon: Award,
    title: "Minority Bonus",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      "If you pick the correct answer AND you were in the minority, you earn a minority bonus",
      "Minority = fewer total points wagered on that option vs others",
      "The minority bonus is an extra 25% on top of normal winnings",
      "Minority wins are tracked on the leaderboard",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Three-Strikes System",
    color: "text-ck-red",
    bg: "bg-ck-red/10",
    items: [
      "Strikes are global — they apply across all your chats",
      "Strike 1 (yellow): Warning — you can still predict",
      "Strike 2 (orange): Careful — one more and you're locked",
      "Strike 3 (red): Locked out of all predictions until midnight",
      "Strikes reset to 0 at midnight every day",
    ],
  },
  {
    icon: TrendingUp,
    title: "Weekly Resets",
    color: "text-muted-foreground",
    bg: "bg-secondary",
    items: [
      "Leaderboard rankings reset weekly (Sunday midnight)",
      "Your all-time stats are preserved in Activity",
      "King status carries over unless someone starts the new week stronger",
    ],
  },
];

const RulesPage = () => {
  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="mb-1 font-heading text-base font-bold uppercase tracking-wide text-foreground">
        Rules & Fair Play
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Points only — no real money. Just bragging rights and the crown.
      </p>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Section header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 ${section.bg}`}>
              <section.icon className={`h-4 w-4 ${section.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${section.color}`}>
                {section.title}
              </span>
            </div>
            {/* Items */}
            <div className="px-3 py-2.5 space-y-2">
              {section.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[10px] text-muted-foreground mt-0.5 w-3 flex-shrink-0">{idx + 1}.</span>
                  <p className="text-xs text-foreground/80 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RulesPage;
