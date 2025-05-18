
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


export default function MessageBubble({ message }) {
  const isSentByCurrentUser = message.direction === 'sent';

  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[75%] mb-4 animate-fadeInSlideUp",
        isSentByCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isSentByCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={message.avatar || `https://placehold.co/40x40.png?text=${message.userName[0].toUpperCase()}`} alt={message.userName} data-ai-hint="avatar person"/>
          <AvatarFallback>{message.userName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "p-3 rounded-xl shadow-md",
          isSentByCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        {!isSentByCurrentUser && (
          <p className="text-xs font-semibold mb-1">{message.userName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <p className={cn(
            "text-xs mt-1",
            isSentByCurrentUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}
        >
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
