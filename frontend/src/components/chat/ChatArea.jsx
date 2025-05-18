
"use client";

import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function ChatArea({ messages, typingUsers, isLoading = false, className }) {
  const scrollAreaRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading, typingUsers]); 

  useEffect(() => {
    if (typingUsers.length > 0) {
      console.log("ChatArea: typingUsers received:", typingUsers);
    }
  }, [typingUsers]);

  return (
    <Card className={cn("h-full flex flex-col rounded-lg shadow-md", className)}>
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Chat Room</h2>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4" ref={viewportRef}>
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading messages...</p>
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <p className="text-center text-muted-foreground pt-10">
              No messages yet. Select a user and start chatting!
            </p>
          )}
          {!isLoading && messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
      <div className="h-8 p-2 text-sm text-muted-foreground border-t">
        {typingUsers.length > 0 && (
          <p className="italic animate-pulse">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </p>
        )}
      </div>
    </Card>
  );
}
