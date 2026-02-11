import { MessageSquare, Activity, Crown, Users, History, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: MessageSquare, label: "Chats", desc: "All your group chats", path: "/chats" },
  { icon: Activity, label: "My Activity", desc: "Prediction history & stats", path: "/activity" },
  { icon: Crown, label: "King Status", desc: "How the crown works", path: "/rules" },
  { icon: Users, label: "Friends", desc: "Manage friends & codes", path: "/friends" },
  { icon: History, label: "History & Stats", desc: "Detailed performance data", path: "/activity" },
  { icon: ShieldCheck, label: "Rules & Fair Play", desc: "Points system & strike rules", path: "/rules" },
];

const MenuPage = () => {
  return (
    <div className="px-4 pt-4">
      <h2 className="mb-4 font-heading text-lg font-bold">Menu</h2>
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <item.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
