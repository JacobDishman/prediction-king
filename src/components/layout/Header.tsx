import { currentUser, getStrikeColor } from "@/data/mock";
import chatKingsLogo from "@/assets/chatkings-logo.png";
import StrikeBadge from "@/components/StrikeBadge";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-primary px-4 py-3">
      <div className="flex items-center gap-2">
        <img src={chatKingsLogo} alt="ChatKings" className="h-8 w-8 rounded-lg" />
        <h1 className="font-heading text-lg font-bold text-primary-foreground">
          ChatKings
        </h1>
      </div>
      <StrikeBadge strikes={currentUser.strikes} />
    </header>
  );
};

export default Header;
