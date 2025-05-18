
"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { useAppContext } from '@/context/AppContext';
import UserList from '@/components/chat/UserList';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';
import Header from '@/components/shared/Header';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMessagesForThread, markThreadAsRead } from '@/services/messageService';


export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentApiUser, isLoading: authIsLoading } = useSelector((state) => state.auth);

  const {
    users: contextUsers,
    addUserIfNotExists,
    messages: liveSocketMessages, 
    addMessage: sendLiveMessageViaContext,
    typingUsers, 
    sendTypingIndicator,
    socketConnected,
    mapBackendMessageToFrontend,
    clearUserUnreadCount
  } = useAppContext();

  const [selectedUser, setSelectedUser] = useState(null);
  const [historicalMessages, setHistoricalMessages] = useState([]);
  const prevMessagesLengthRef = useRef(0);


  const { data: threadMessagesData, isLoading: isLoadingThreadMessages, error: threadMessagesError, isFetching: isFetchingThreadMessages } = useQuery(
    {
      queryKey: ['threadMessages', selectedUser?.id],
      queryFn: async () => {
        if (!selectedUser) {
          console.log("ChatPage Query: No selected user, not fetching thread messages.");
          return { page:1, limit: 30, messages: []};
        }
        console.log(`ChatPage Query: Fetching messages for ${selectedUser.fullname} (ID: ${selectedUser.id}) using fetchMessagesForThread.`);
        try {
            const data = await fetchMessagesForThread(selectedUser.id);
            console.log(`ChatPage Query: Successfully received ${data.messages.length} messages for ${selectedUser.fullname}.`);
            return data;
        } catch (err) {
            console.error(`ChatPage Query: Error fetching messages for ${selectedUser.id}:`, err.message, err);
            toast({
                title: "Error fetching messages",
                description: err.message || "Could not load message history.",
                variant: "destructive",
            });
            throw err;
        }
      },
      select: (data) => data.messages,
      enabled: !!selectedUser && !!currentApiUser,
      staleTime: 1000 * 30, 
      refetchOnWindowFocus: false, 
      retry: 1,
    }
  );

  useEffect(() => {
    if (threadMessagesError && selectedUser) {
      console.error(`ChatPage: Error from useQuery for threadMessages (user: ${selectedUser.fullname}):`, threadMessagesError.message);
    }
  }, [threadMessagesError, selectedUser]);

  useEffect(() => {
    console.log(`ChatPage: useEffect for threadMessagesData triggered. SelectedUser: ${selectedUser?.fullname}, IsLoading: ${isLoadingThreadMessages}, IsFetching: ${isFetchingThreadMessages}, Data length: ${threadMessagesData?.length}`);
    if (selectedUser && currentApiUser) {
      if (threadMessagesData) {
        console.log(`ChatPage: Processing ${threadMessagesData.length} historical backend messages for ${selectedUser.fullname}`);
        const mappedMessages = threadMessagesData.map(msg =>
          mapBackendMessageToFrontend(msg, [currentApiUser, selectedUser], currentApiUser.id)
        ).sort((a, b) => a.timestamp - b.timestamp);
        console.log(`ChatPage: Mapped ${mappedMessages.length} historical messages. Setting historicalMessages.`);
        setHistoricalMessages(mappedMessages);
      } else if (!isLoadingThreadMessages && !isFetchingThreadMessages) {
        console.log(`ChatPage: No historical messages data and not loading/fetching for ${selectedUser.fullname}. Setting historicalMessages to empty array.`);
        setHistoricalMessages([]);
      }
    } else if (!selectedUser) {
        console.log("ChatPage: No selected user, clearing historical messages.");
        setHistoricalMessages([]);
    }
  }, [threadMessagesData, selectedUser, currentApiUser, mapBackendMessageToFrontend, isLoadingThreadMessages, isFetchingThreadMessages]);


  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleSelectUser = useCallback(async (user) => {
    console.log(`ChatPage: handleSelectUser called with user: ${user.fullname} (ID: ${user.id})`);
    if (selectedUser?.id !== user.id) {
        console.log("ChatPage: New user selected. Previous:", selectedUser?.fullname, "New:", user.fullname);
        addUserIfNotExists(user); 
        setHistoricalMessages([]); 
        setSelectedUser(user); 
        console.log(`ChatPage: setSelectedUser to ${user.fullname}. Query for messages should re-trigger.`);

        if (user.unreadCount && user.unreadCount > 0 && currentApiUser) {
          console.log(`ChatPage: User ${user.fullname} has ${user.unreadCount} unread messages. Marking as read.`);
          try {
            await markThreadAsRead(user.id);
            console.log(`ChatPage: Successfully called markThreadAsRead for ${user.id}.`);
            clearUserUnreadCount(user.id); 
            queryClient.invalidateQueries({ queryKey: ['messageThreads', currentApiUser.id] });
            console.log(`ChatPage: Invalidated messageThreads query for current user ${currentApiUser.id}.`);
          } catch (error) {
            console.error(`ChatPage: Failed to mark thread as read for ${user.id}`, error);
            toast({
              title: "Error",
              description: "Could not mark messages as read.",
              variant: "destructive",
            });
          }
        }

    } else {
      console.log("ChatPage: Same user selected, no change:", user.fullname);
    }
  }, [selectedUser, addUserIfNotExists, clearUserUnreadCount, queryClient, currentApiUser, toast]); 


  const handleSendMessage = (text) => {
    if (!currentApiUser) {
      toast({ title: "Error", description: "You must be logged in to send messages.", variant: "destructive" });
      return;
    }
    if (!selectedUser) {
      toast({ title: "No recipient", description: "Please select a user to chat with.", variant: "destructive" });
      return;
    }
    if (!socketConnected) {
      toast({ title: "Not Connected", description: "Socket not connected. Cannot send message.", variant: "destructive" });
      return;
    }
    console.log(`ChatPage: Sending message from ${currentApiUser.fullname} to ${selectedUser.fullname} (ID: ${selectedUser.id})`);
    sendLiveMessageViaContext(text, selectedUser.id);
  };

  const handleTyping = useCallback((isTyping) => {
    console.log(`ChatPage: handleTyping called. isTyping: ${isTyping}, selectedUser: ${selectedUser?.fullname}, socketConnected: ${socketConnected}`);
    if (!currentApiUser || !selectedUser || !socketConnected) {
        console.log(`ChatPage: handleTyping - cannot send typing indicator. currentApiUser: ${!!currentApiUser}, selectedUser: ${!!selectedUser}, socketConnected: ${socketConnected}`);
        return;
    }
    sendTypingIndicator(isTyping, selectedUser.id);
  }, [currentApiUser, selectedUser, sendTypingIndicator, socketConnected]);

  const displayedMessages = useMemo(() => {
    if (!selectedUser || !currentApiUser) {
      console.log("ChatPage displayedMessages: No selectedUser or currentApiUser, returning empty array.");
      return [];
    }
    console.log("ChatPage displayedMessages: Recalculating for selectedUser:", selectedUser.fullname);
    console.log("ChatPage displayedMessages: Historical messages count:", historicalMessages.length, historicalMessages.map(m=> ({id: m.id, text:m.text.substring(0,10)})));
    console.log("ChatPage displayedMessages: Live socket messages count (total in context):", liveSocketMessages.length, liveSocketMessages.map(m=> ({id: m.id, text:m.text.substring(0,10), dir: m.direction, to:m.receiverId, from: m.userId })));

    const relevantLiveMessages = liveSocketMessages.filter(msg =>
      (msg.userId === currentApiUser.id && msg.receiverId === selectedUser.id) ||
      (msg.userId === selectedUser.id && msg.receiverId === currentApiUser.id)   
    );
    console.log("ChatPage displayedMessages: Relevant live messages for this chat:", relevantLiveMessages.length, relevantLiveMessages.map(m=> ({id: m.id, text:m.text.substring(0,10)})));

    const combined = [...historicalMessages];
    const historicalMessageIds = new Set(historicalMessages.map(msg => msg.id));

    relevantLiveMessages.forEach(liveMsg => {
      if (!historicalMessageIds.has(liveMsg.id)) {
        if (liveMsg.id.startsWith('temp-')) {
          const confirmedId = liveMsg.id.replace('temp-', '');
          if (!historicalMessageIds.has(confirmedId)) {
            console.log("ChatPage displayedMessages: Adding temp live message not in historical (nor its confirmed version):", liveMsg.id);
            combined.push(liveMsg);
          } else {
             console.log("ChatPage displayedMessages: Temp live message's confirmed version IS in historical, not adding:", liveMsg.id, "->", confirmedId);
          }
        } else {
          console.log("ChatPage displayedMessages: Adding non-temp live message not in historical:", liveMsg.id);
          combined.push(liveMsg);
        }
      } else {
        console.log("ChatPage displayedMessages: Live message IS already in historical, not adding:", liveMsg.id);
      }
    });

    const sorted = combined.sort((a, b) => a.timestamp - b.timestamp);
    console.log(`ChatPage displayedMessages: Final for ${selectedUser.fullname}. Historical: ${historicalMessages.length}, Relevant Live: ${relevantLiveMessages.length}, Combined Before Sort: ${combined.length}, Final Sorted: ${sorted.length}`);
    return sorted;
  }, [historicalMessages, liveSocketMessages, selectedUser, currentApiUser]);

  const filteredTypingUsersForChatArea = useMemo(() => {
    if (!selectedUser) return [];
    const selectedUserIsTyping = typingUsers.includes(selectedUser.fullname);
    console.log(`ChatPage: filteredTypingUsersForChatArea. SelectedUser: ${selectedUser.fullname}, All typing: [${typingUsers.join(', ')}], Is selectedUser typing? ${selectedUserIsTyping}`);
    return selectedUserIsTyping ? [selectedUser.fullname] : [];
  }, [typingUsers, selectedUser]);

  
  useEffect(() => {
    if (!selectedUser || !currentApiUser || !socketConnected) {
      return;
    }

    const currentMessagesLength = displayedMessages.length;
    if (currentMessagesLength > prevMessagesLengthRef.current) {
      const lastMessage = displayedMessages[currentMessagesLength - 1];
      
      if (lastMessage && lastMessage.userId === selectedUser.id) {
        console.log(`ChatPage: New message from ${selectedUser.fullname} detected in open chat. Marking thread as read.`);
        markThreadAsRead(selectedUser.id)
          .then(() => {
            console.log(`ChatPage: Successfully called markThreadAsRead for ${selectedUser.id} after new message.`);
            clearUserUnreadCount(selectedUser.id);
            queryClient.invalidateQueries({ queryKey: ['messageThreads', currentApiUser.id] });
            console.log(`ChatPage: Invalidated messageThreads query for current user ${currentApiUser.id} after new message.`);
          })
          .catch(error => {
            console.error(`ChatPage: Failed to mark thread as read for ${selectedUser.id} after new message:`, error);
            toast({
              title: "Error",
              description: "Could not mark new messages as read.",
              variant: "destructive",
            });
          });
      }
    }
    prevMessagesLengthRef.current = currentMessagesLength;
  }, [
    displayedMessages, 
    selectedUser, 
    currentApiUser, 
    socketConnected, 
    clearUserUnreadCount, 
    queryClient, 
    toast
  ]);


  if (authIsLoading || (!isAuthenticated && !authIsLoading)) {
     return (
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 p-4 gap-4 overflow-hidden">
            <div className="w-1/4 hidden md:block">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>
        </div>
     );
  }

  if (!currentApiUser) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p>Error: User data not available. Please try logging in again.</p>
        <Button onClick={() => router.push('/login')}>Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen max-h-screen bg-muted/40">
      <Header />
      <main className="flex flex-1 p-4 gap-4 overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 hidden md:block h-full max-h-[calc(100vh-theme(spacing.16)-theme(spacing.8))]">
          <UserList
            users={contextUsers} 
            currentUser={currentApiUser}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        </aside>
        <section className="flex-1 flex flex-col h-full max-h-[calc(100vh-theme(spacing.16)-theme(spacing.8))]">
          <ChatArea
            className="flex-1 min-h-0"
            messages={displayedMessages}
            isLoading={(isLoadingThreadMessages || isFetchingThreadMessages) && !!selectedUser}
            typingUsers={filteredTypingUsersForChatArea} 
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!selectedUser || !socketConnected || ((isLoadingThreadMessages || isFetchingThreadMessages) && !!selectedUser) }
          />
           {!socketConnected && (
            <p className="p-2 text-center text-xs text-destructive bg-destructive/10">
              Not connected to chat server. Real-time features may be unavailable.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
