import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Zap, Star, Heart } from "lucide-react";

const Dashboard = () => {
  const userLevel = 12;
  const userXP = 2450;
  const xpForNextLevel = 3000;
  const currentStreak = 7;
  const petHealth = 85;
  const petLevel = 5;

  const badges = [
    { name: "First Focus", icon: "🎯", earned: true },
    { name: "Week Warrior", icon: "⚔️", earned: true },
    { name: "Task Master", icon: "✅", earned: true },
    { name: "Night Owl", icon: "🦉", earned: false },
    { name: "Early Bird", icon: "🐦", earned: false },
    { name: "Social Studier", icon: "👥", earned: true },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and grow your study companion
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <Badge className="bg-primary/20 text-primary">Level {userLevel}</Badge>
          </div>
          <h3 className="text-2xl font-bold mb-2">{userXP} XP</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {xpForNextLevel - userXP} XP to level {userLevel + 1}
          </p>
          <Progress value={(userXP / xpForNextLevel) * 100} className="h-2" />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-destructive/5 to-secondary/10 border-2 border-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-secondary-foreground" />
            </div>
            <Badge className="bg-secondary/20 text-secondary-foreground">{currentStreak} days</Badge>
          </div>
          <h3 className="text-2xl font-bold mb-2">Current Streak</h3>
          <p className="text-sm text-muted-foreground">
            Keep it up! You're on fire 🔥
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-foreground" />
            </div>
            <Badge className="bg-accent/20 text-accent-foreground">
              {badges.filter(b => b.earned).length}/{badges.length}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-2">Badges Earned</h3>
          <p className="text-sm text-muted-foreground">
            Collect them all!
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Virtual Pet */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>Your Study Buddy</span>
            <Badge variant="secondary">Level {petLevel}</Badge>
          </h2>
          
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-9xl animate-float">
              {petLevel < 3 ? "🥚" : petLevel < 7 ? "🐣" : petLevel < 12 ? "🐥" : "🐦"}
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-destructive" />
                  Health
                </span>
                <span className="font-medium">{petHealth}%</span>
              </div>
              <Progress value={petHealth} className="h-2" />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Care Tips:</p>
            <ul className="space-y-1">
              <li>• Complete tasks to keep your buddy healthy</li>
              <li>• Join focus sessions to help it grow</li>
              <li>• Maintain your streak to level up faster</li>
            </ul>
          </div>
        </Card>

        {/* Badges Collection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Badge Collection</h2>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  badge.earned
                    ? "bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <span className="text-4xl">{badge.icon}</span>
                <span className="text-xs font-medium text-center">{badge.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Weekly Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-0">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Weekly Summary</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tasks Completed</h3>
              <p className="text-3xl font-bold text-primary">24 tasks</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Focus Time</h3>
              <p className="text-3xl font-bold text-secondary">18.5 hours</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Top Subject</h3>
              <p className="text-3xl font-bold text-accent">Mathematics</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-medium mb-2">🎯 Highlights</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maintained a 7-day study streak</li>
                <li>• Completed all high-priority tasks</li>
                <li>• Joined 12 focus room sessions</li>
              </ul>
            </div>
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-medium mb-2">💪 Keep Growing</h3>
              <p className="text-sm text-muted-foreground">
                You're doing amazing! Try studying earlier in the day to boost your
                productivity. Your focus is strongest between 9-11 AM.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
