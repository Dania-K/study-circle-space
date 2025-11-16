import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Brain, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/rooms");
    }
  }, [user, loading, navigate]);

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Student Productivity Reimagined
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground">
          Welcome to{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            StudiCircle
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Focus better, achieve more, and level up your study game with AI-powered
          productivity tools designed for students.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-hover transition-all"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-primary/20">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Focus Rooms</h3>
          <p className="text-muted-foreground">
            Join virtual study spaces with shared Pomodoro timers and connect with
            students working on similar subjects.
          </p>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-secondary/20">
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-semibold">AI Study Plans</h3>
          <p className="text-muted-foreground">
            Get personalized study schedules and smart task breakdowns powered by
            AI to help you stay organized.
          </p>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-accent/20">
          <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Gamification</h3>
          <p className="text-muted-foreground">
            Earn XP, maintain streaks, collect badges, and raise your virtual pet
            as you complete tasks and focus sessions.
          </p>
        </Card>
      </div>

      {/* Stats Preview */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-0">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1,234</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-secondary mb-2">5,678</div>
            <div className="text-muted-foreground">Study Sessions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">9,012</div>
            <div className="text-muted-foreground">Tasks Completed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
