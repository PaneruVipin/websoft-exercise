
"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

export default function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setMessages, setTypingUsers } = useAppContext();

  const handleLogout = () => {
    dispatch(logoutUser());
    queryClient.clear(); 
    setMessages([]);
    setTypingUsers([]);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MessageSquareText className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">React Chat</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated && currentUser ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || `https://placehold.co/40x40.png?text=${currentUser.fullname ? currentUser.fullname[0].toUpperCase() : 'U'}`} alt={currentUser.fullname} data-ai-hint="avatar"/>
                  <AvatarFallback>{currentUser.fullname ? currentUser.fullname[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser.fullname}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
