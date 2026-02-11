import LiveGames from "@/components/home/LiveGames";
import GroupChats from "@/components/home/GroupChats";
import FollowedEvents from "@/components/home/FollowedEvents";

const Index = () => {
  return (
    <div>
      <LiveGames />
      <GroupChats />
      <FollowedEvents />
    </div>
  );
};

export default Index;
