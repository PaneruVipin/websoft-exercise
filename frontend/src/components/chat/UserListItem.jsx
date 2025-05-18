
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


export default function UserListItem({ user, onClick, isSelected, isTyping }) {
  const MAX_LAST_MESSAGE_LENGTH = 28;
  
  const displayLastMessage = user.lastMessageContent
    ? user.lastMessageContent.length > MAX_LAST_MESSAGE_LENGTH
      ? `${user.lastMessageContent.substring(0, MAX_LAST_MESSAGE_LENGTH)}...`
      : user.lastMessageContent
    : 'No messages yet';

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "bg-accent/70"
      )}
      onClick={() => onClick?.(user)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(user)}
      aria-label={`Chat with ${user.fullname}`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.fullname ? user.fullname[0].toUpperCase() : 'U'}`} alt={user.fullname || 'User Avatar'} data-ai-hint="avatar person"/>
          <AvatarFallback>{user.fullname ? user.fullname[0].toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
        <Circle
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            user.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
          )}
          aria-label={user.status}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate">{user.fullname}</p>
          
          {(user.unreadCount ?? 0) > 0 && !isTyping && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs shrink-0">
              {user.unreadCount > 9 ? '9+' : user.unreadCount}
            </Badge>
          )}
        </div>
        <p className={cn(
            "text-xs truncate",
            isTyping ? 'text-primary italic' : 'text-muted-foreground'
          )}
        >
          {isTyping ? 'typing...' : displayLastMessage}
        </p>
      </div>
    </div>
  );
}
