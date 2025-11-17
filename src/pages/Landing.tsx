import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Sparkles, Trophy, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Headline + CTA */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Study Better,{" "}
              <span className="gradient-text">Together</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Focus rooms, AI study help, and playful gamified motivation for students
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Animated Dashboard Mockup */}
          <div className="relative">
            <Card className="p-6 glass-card hover-lift">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gradient-primary/20 rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-gradient-primary/5">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-xs text-muted-foreground">XP Earned</div>
                  </Card>
                  <Card className="p-3 bg-gradient-primary/5">
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-xs text-muted-foreground">Focus Hours</div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover-lift glass-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Focus Rooms</h3>
            <p className="text-muted-foreground">
              Join shared study sessions with synchronized Pomodoro timers and AI-generated subtasks
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift glass-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-accent flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Homework Help</h3>
            <p className="text-muted-foreground">
              Get instant answers to your study questions with our floating AI assistant
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift glass-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B7D8B5' }}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: '#B7D8B5' }} />
              Gamified Motivation
            </h3>
            <p className="text-muted-foreground">
              Earn XP, level up your pet, unlock badges, and track your progress on the leaderboard
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Built with ❤️ for students everywhere • Created for Hackathon 2025
        </p>
      </footer>
    </div>
  );
};

export default Landing;
