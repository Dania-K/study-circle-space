import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Star, Plus, Send, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
  is_spotlight: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

const CATEGORIES = ["Motivation", "Study Tips", "Goals", "Struggles", "Wins", "General"];

const Community = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [dailyQuestion, setDailyQuestion] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  useEffect(() => {
    if (selectedPost) loadComments(selectedPost.id);
  }, [selectedPost]);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('is_spotlight', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPosts(data);
      const spotlight = data.find(p => p.is_spotlight);
      setDailyQuestion(spotlight || null);
    }
  };

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (!error && data) setComments(data);
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, username')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      username: profile?.name || profile?.username || 'Anonymous',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      is_spotlight: false
    });

    if (!error) {
      setNewPost({ title: "", content: "", category: "General" });
      setIsCreating(false);
      loadPosts();
      toast({ title: "Post created!" });
    }
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user!.id);

    if (!error) {
      loadPosts();
      toast({ title: "Post deleted" });
    }
  };

  const likePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !user) return;

    await supabase
      .from('community_posts')
      .update({ likes: post.likes + 1 })
      .eq('id', postId);

    // Award XP if this is the daily question and first upvote
    if (post.is_spotlight && post.likes === 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, total_lifetime_xp')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            xp: profile.xp + 10,
            total_lifetime_xp: (profile.total_lifetime_xp || 0) + 10
          })
          .eq('id', user.id);

        toast({ 
          title: "🎉 +10 XP!", 
          description: "Your answer to the Daily AI Question was upvoted!"
        });
      }
    }

    loadPosts();
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost || !user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, username')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('community_comments').insert({
      post_id: selectedPost.id,
      user_id: user.id,
      username: profile?.name || profile?.username || 'Anonymous',
      content: newComment
    });

    if (!error) {
      setNewComment("");
      loadComments(selectedPost.id);
      toast({ title: "Comment added!" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (selectedPost) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setSelectedPost(null)}>
            ← Back to Community
          </Button>

          <Card className="p-8 glass-card">
            {selectedPost.is_spotlight && (
              <Badge className="mb-4 bg-gradient-accent">
                <Star className="w-3 h-3 mr-1" />
                AI Spotlight
              </Badge>
            )}
            <Badge variant="secondary" className="mb-4">{selectedPost.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{selectedPost.title}</h1>
            <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
              <Avatar className="w-8 h-8 bg-primary/20" />
              <span>{selectedPost.username}</span>
              <span>•</span>
              <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-foreground mb-6 whitespace-pre-wrap">{selectedPost.content}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => likePost(selectedPost.id)}>
                <Heart className="w-4 h-4 mr-2" />
                {selectedPost.likes}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                {comments.length} comments
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <h3 className="font-semibold mb-4">Comments</h3>
            <ScrollArea className="h-[300px] mb-4">
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6 bg-primary/20" />
                      <span className="text-sm font-medium">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment()}
              />
              <Button onClick={addComment} size="icon" className="bg-gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            ← Cancel
          </Button>

          <Card className="p-8 glass-card">
            <h2 className="text-2xl font-bold mb-6">Create a Post</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat}
                      variant={newPost.category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPost({ ...newPost, category: cat })}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="What's on your mind?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Share your thoughts, tips, or experiences..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={8}
                />
              </div>
              <Button
                className="w-full bg-gradient-primary"
                onClick={createPost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                Post to Community
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community</h1>
            <p className="text-muted-foreground">Share, learn, and motivate each other</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="grid gap-4">
          {posts.map(post => (
            <Card
              key={post.id}
              className="p-6 glass-card hover:shadow-elegant transition-all cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.is_spotlight && (
                      <Badge className="bg-gradient-accent">
                        <Star className="w-3 h-3 mr-1" />
                        Spotlight
                      </Badge>
                    )}
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Avatar className="w-6 h-6 bg-primary/20" />
                      <span>{post.username}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    likePost(post.id);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {post.likes}
                </Button>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">View discussion</span>
                </div>
                {post.user_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost(post.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
