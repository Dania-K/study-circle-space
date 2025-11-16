import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

interface PomodoroTimerProps {
  timeLeft: number;
  totalMinutes: number;
  subject: string;
  mood: string;
}

export const PomodoroTimer = ({ timeLeft, totalMinutes, subject, mood }: PomodoroTimerProps) => {
  const [rotation, setRotation] = useState(0);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalMinutes * 60 - timeLeft) / (totalMinutes * 60)) * 100;

  useEffect(() => {
    setRotation((progress / 100) * 360);
  }, [progress]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-[3rem] blur-3xl animate-pulse" />
      
      <Card className="relative glass-card p-10 shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 text-sm font-semibold shadow-lg">
            {mood}
          </Badge>
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-6 py-2 text-sm font-semibold shadow-lg">
            {subject}
          </Badge>
        </div>

        <div className="relative w-80 h-80 mx-auto">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20 blur-2xl animate-glow" />
          
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/20"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-60 h-60 rounded-full glass-card flex flex-col items-center justify-center shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-primary animate-pulse" />
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-7xl font-bold gradient-text mb-2 tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Focus Time</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Session in progress</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
