
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';


export default function ChatInput({ onSendMessage, onTyping, disabled = false }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (disabled || !message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
    onTyping(false); 
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    textareaRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (disabled) return;

    onTyping(true); 
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false); 
    }, 2000); 
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t bg-background">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Select a user to chat with or wait for connection..." : "Type a message..."}
        className="flex-1 resize-none min-h-[40px] max-h-[120px] rounded-full px-4 py-2 focus-visible:ring-primary"
        rows={1}
        disabled={disabled}
      />
      <Button 
        type="submit" 
        size="icon" 
        className="rounded-full shrink-0 aspect-square h-10 w-10" 
        disabled={disabled || !message.trim()}
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
