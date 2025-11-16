import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  user_id: string | null;
  profiles?: { name: string | null };
  created_at: string;
}

interface ConvoRoomChatProps {
  roomId: string;
}

export const ConvoRoomChat = ({ roomId }: ConvoRoomChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(name)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      text: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg) => (
          <Card
            key={msg.id}
            className={`p-3 max-w-[80%] ${
              msg.user_id === user?.id
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-xs font-semibold mb-1 opacity-70">
              {msg.profiles?.name || 'Anonymous'}
            </p>
            <p className="text-sm">{msg.text}</p>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage} className="bg-gradient-primary">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
