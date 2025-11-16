import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data));
      supabase.from('pets').select('*').eq('owner_id', user.id).single().then(({ data }) => setPet(data));
    }
  }, [user]);

  if (loading || !profile || !pet) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <Badge>Level {profile.level}</Badge>
        </div>
        <h3 className="text-2xl font-bold mb-2">{profile.xp} XP</h3>
        <Progress value={(profile.xp / (profile.level * 500)) * 100} />
      </Card>
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Your Study Buddy</h2>
        <div className="text-9xl">{pet.level < 3 ? "🥚" : pet.level < 7 ? "🐣" : "🐦"}</div>
      </Card>
    </div>
  );
};

export default Dashboard;