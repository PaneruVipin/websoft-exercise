
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMessageThreads } from '@/services/messageService';

const SOCKET_URL = 'https://websoft-exercise.onrender.com';

const AppContext = createContext(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const mapBackendMessageToFrontendHelper = (
  backendMsg,
  participatingUsers,
  currentUserId
) => {
  const safeParticipatingUsers = Array.isArray(participatingUsers) ? participatingUsers : [];

  let senderId;
  let receiverId;
  let senderFromPayload;

  if (backendMsg.sender && typeof backendMsg.sender === 'object' && '_id' in backendMsg.sender) {
    const apiSender = backendMsg.sender;
    senderId = apiSender._id;
    senderFromPayload = mapApiUserToAppUser(apiSender);
  } else if (typeof backendMsg.sender === 'string') {
    senderId = backendMsg.sender;
  }

  if (backendMsg.receiver && typeof backendMsg.receiver === 'object' && '_id' in backendMsg.receiver) {
    const apiReceiver = backendMsg.receiver;
    receiverId = apiReceiver._id;
  } else if (typeof backendMsg.receiver === 'string') {
    receiverId = backendMsg.receiver;
  }

  const sender = senderId
    ? safeParticipatingUsers.find(u => u.id === senderId) || senderFromPayload
    : senderFromPayload;

  const senderName = sender?.fullname || (senderId === currentUserId ? "You" : 'User');
  const senderAvatarCharacter = senderName && senderName.length > 0 ? senderName[0].toUpperCase() : 'U';
  const senderAvatar = sender?.avatar || `https://placehold.co/40x40.png?text=${senderAvatarCharacter}`;

  let determinedDirection;
  if (backendMsg.direction) {
    determinedDirection = backendMsg.direction;
  } else {
    determinedDirection = senderId === currentUserId ? 'sent' : 'received';
  }

  return {
    id: backendMsg._id,
    userId: sender?.id || senderId || 'unknown-sender',
    userName: senderName,
    avatar: senderAvatar,
    text: backendMsg.content,
    timestamp: new Date(backendMsg.createdAt).getTime(),
    receiverId: receiverId || 'unknown-receiver',
    isRead: backendMsg.isRead,
    direction: determinedDirection,
  };
};

export const mapApiUserToAppUser = (apiUser) => {
  const fullname = apiUser.fullname || apiUser.email?.split('@')[0] || 'User';
  return {
    id: apiUser._id,
    fullname: fullname,
    email: apiUser.email,
    status: apiUser.isOnline === true ? 'online' : 'offline', 
    avatar: `https://placehold.co/40x40.png?text=${fullname && fullname.length > 0 ? fullname[0].toUpperCase() : 'U'}`,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    isOnline: apiUser.isOnline === true,
    lastMessageContent: apiUser.lastMessageContent,
    unreadCount: apiUser.unreadCount,
  };
};


const AppProvider = ({ children }) => {
  const { user: currentApiUser, token } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  const [users, setUsersState] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const typingTimeoutsRef = useRef(new Map());
  const usersRef = useRef(users);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const { data: threadsData, error: threadsError, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['messageThreads', currentApiUser?.id],
    queryFn: fetchMessageThreads,
    enabled: !!currentApiUser && !!token,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (threadsError) {
      console.error('AppContext: Error fetching message threads:', threadsError.message, threadsError);
      toast({
        title: 'Failed to load chats',
        description: threadsError.message || 'Could not fetch recent conversations.',
        variant: 'destructive',
      });
    }
  }, [threadsError, toast]);

 useEffect(() => {
    if (!currentApiUser || !token) {
      console.log('AppContext: No user or token. Clearing users and ensuring socket is disconnected.');
      setUsersState([]);
      return;
    }

    if (threadsData) {
      console.log('AppContext: Received threadsData. Processing for user:', currentApiUser.fullname, threadsData.threads.length, "threads.");
      
      const usersFromApiThreads = threadsData.threads.map(thread => {
        const baseUser = mapApiUserToAppUser(thread.user);
        return {
          ...baseUser,
          lastMessageContent: thread.lastMessage?.content,
          unreadCount: thread.unreadCount,
        };
      }).filter(apiUser => apiUser && currentApiUser && apiUser.id !== currentApiUser.id);

      setUsersState(prevUsers => {
        const finalUsersMap = new Map();
        
        usersFromApiThreads.forEach(threadUserFromApi => {
          const existingPrevUser = prevUsers.find(u => u.id === threadUserFromApi.id);
          if (existingPrevUser) {
            finalUsersMap.set(threadUserFromApi.id, {
              ...threadUserFromApi, 
              status: existingPrevUser.status === 'online' ? 'online' : (threadUserFromApi.status || existingPrevUser.status), 
              isOnline: existingPrevUser.status === 'online' ? true : (threadUserFromApi.isOnline || existingPrevUser.isOnline),
              lastMessageContent: threadUserFromApi.lastMessageContent || existingPrevUser.lastMessageContent,
              unreadCount: threadUserFromApi.unreadCount !== undefined ? threadUserFromApi.unreadCount : existingPrevUser.unreadCount,
            });
          } else {
            finalUsersMap.set(threadUserFromApi.id, threadUserFromApi);
          }
        });

        prevUsers.forEach(prevUser => {
          if (!finalUsersMap.has(prevUser.id)) {
            finalUsersMap.set(prevUser.id, prevUser);
          }
        });
        
        const newUsersArray = Array.from(finalUsersMap.values());
        console.log('AppContext: Users state updated from threadsData. Total users:', newUsersArray.length, newUsersArray.map(u => ({id: u.id, name: u.fullname, status: u.status, unread: u.unreadCount, lastMessage: u.lastMessageContent})));
        usersRef.current = newUsersArray; 
        return newUsersArray;
      });
    } else if (!isLoadingThreads && !threadsData && currentApiUser) {
      console.log('AppContext: No thread data (or query finished with no data) for user:', currentApiUser.fullname, '. Current users in context:', usersRef.current.length);
    }
  }, [threadsData, currentApiUser, isLoadingThreads, token]);


  const updateUserStatus = useCallback((userId, status) => {
    console.log(`AppContext: Updating status for ${userId} to ${status}`);
    setUsersState(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, status, isOnline: status === 'online' } : u)));
  }, []);

  const addUserIfNotExists = useCallback((newUser) => {
    setUsersState(prevUsers => {
      const existingUserIndex = prevUsers.findIndex(u => u.id === newUser.id);
      if (existingUserIndex === -1) {
        console.log('AppContext addUserIfNotExists: Adding new user:', newUser.fullname, 'Status:', newUser.status);
        return [...prevUsers, { ...newUser, lastMessageContent: newUser.lastMessageContent || undefined, unreadCount: newUser.unreadCount || 0 }];
      } else {
        const updatedUsers = [...prevUsers];
        const contextUser = updatedUsers[existingUserIndex];
        console.log('AppContext addUserIfNotExists: User already exists. Context user:', contextUser.fullname, 'Status:', contextUser.status, 'vs NewUser:', newUser.fullname, 'Status:', newUser.status);
        updatedUsers[existingUserIndex] = {
          ...contextUser,
          ...newUser, 
          status: contextUser.status === 'online' ? 'online' : (newUser.status || contextUser.status),
          isOnline: contextUser.status === 'online' ? true : (newUser.isOnline || contextUser.isOnline),
          lastMessageContent: newUser.lastMessageContent || contextUser.lastMessageContent || undefined,
          unreadCount: newUser.unreadCount !== undefined ? newUser.unreadCount : (contextUser.unreadCount || 0),
        };
        console.log('AppContext addUserIfNotExists: Updated user in context:', updatedUsers[existingUserIndex].fullname, 'Resolved status:', updatedUsers[existingUserIndex].status);
        return updatedUsers;
      }
    });
  }, []);

  const clearUserUnreadCount = useCallback((userIdToClear) => {
    console.log(`AppContext: Clearing unread count for userId: ${userIdToClear}`);
    setUsersState(prevUsers =>
      prevUsers.map(user =>
        user.id === userIdToClear ? { ...user, unreadCount: 0 } : user
      )
    );
  }, []);


  useEffect(() => {
    if (currentApiUser && token) {
      if (!socketRef.current) {
        console.log('AppContext: Attempting to connect socket to:', SOCKET_URL);
        const newSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling']
        });
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log('AppContext: Socket connected:', newSocket.id);
          setSocketConnected(true);
          newSocket.emit('user_connected');
        });

        newSocket.on('disconnect', (reason) => {
          console.log('AppContext: Socket disconnected:', reason, '- Socket.io client will attempt auto-reconnection.');
          setSocketConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('AppContext: Socket connection error:', error.message, error.data);
          toast({ title: 'Chat Connection Error', description: `Failed to connect: ${error.message}`, variant: 'destructive' });
          setSocketConnected(false);
        });

        newSocket.on('error', (errorData) => {
          console.error('AppContext: Socket server error:', errorData.message);
          toast({ title: 'Chat Server Error', description: errorData.message, variant: 'destructive'});
        });

        newSocket.on('user_status_change', ({ userId, isOnline }) => {
          console.log('AppContext Event: user_status_change received', { userId, isOnline });
          updateUserStatus(userId, isOnline ? 'online' : 'offline');
        });

        newSocket.on('receive_message', (backendMessage) => {
           console.log('AppContext Event: receive_message received', backendMessage);
           if (!currentApiUser) return;

           const newMessage = mapBackendMessageToFrontendHelper(backendMessage, usersRef.current, currentApiUser.id);
            
           setMessages(prevMessages => {
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              console.log('AppContext: receive_message - message already exists in live feed, not adding:', newMessage.id);
              return prevMessages;
            }
            console.log('AppContext: receive_message - adding new message to live feed:', newMessage.id, newMessage.text.substring(0,20));
            return [...prevMessages, newMessage];
          });

           let senderIdFromMessage;
           if (backendMessage.sender && typeof backendMessage.sender === 'object' && '_id' in backendMessage.sender) {
            senderIdFromMessage = backendMessage.sender._id;
           } else if (typeof backendMessage.sender === 'string') {
            senderIdFromMessage = backendMessage.sender;
           }
           
           const otherUserIdInChat = senderIdFromMessage === currentApiUser.id ? 
             (typeof backendMessage.receiver === 'string' ? backendMessage.receiver : backendMessage.receiver?._id) 
             : senderIdFromMessage;

           if (otherUserIdInChat) {
             console.log(`AppContext: Invalidating threadMessages for other user: ${otherUserIdInChat} (due to received message)`);
             queryClient.invalidateQueries({ queryKey: ['threadMessages', otherUserIdInChat] });
             setUsersState(prev => prev.map(u => 
                u.id === otherUserIdInChat
                ? { ...u, lastMessageContent: newMessage.text } 
                : u
             ));
           }
           console.log(`AppContext: Invalidating messageThreads for current user: ${currentApiUser.id} (due to received message)`);
           queryClient.invalidateQueries({ queryKey: ['messageThreads', currentApiUser.id] });
        });

        newSocket.on('message_sent', (data) => {
          console.log('AppContext Event: message_sent confirmation, ID:', data.messageId, 'Temp ID:', data.tempId);
           setMessages(prevMessages => prevMessages.map(msg =>
            (data.tempId && msg.id === data.tempId) ? { ...msg, id: data.messageId, timestamp: msg.timestamp } : msg
          ));
        });

        newSocket.on('typing', ({ fromUserId }) => {
          console.log(`AppContext Event: 'typing' received fromUserId: ${fromUserId}`);
          const fromUser = usersRef.current.find(u => u.id === fromUserId);
          if (fromUser && (!currentApiUser || fromUser.id !== currentApiUser.id)) {
            console.log(`AppContext: User ${fromUser.fullname} is typing.`);
            setTypingUsers(prevTyping => {
              if (!prevTyping.includes(fromUser.fullname)) {
                console.log(`AppContext: Adding ${fromUser.fullname} to typingUsers.`);
                return [...prevTyping, fromUser.fullname];
              }
              return prevTyping;
            });

            if (typingTimeoutsRef.current.has(fromUserId)) {
              clearTimeout(typingTimeoutsRef.current.get(fromUserId));
            }
            const timeoutId = setTimeout(() => {
              console.log(`AppContext: Timeout for ${fromUser.fullname} typing. Removing.`);
              setTypingUsers(prevTyping => prevTyping.filter(name => name !== fromUser.fullname));
              typingTimeoutsRef.current.delete(fromUserId);
            }, 3000);
            typingTimeoutsRef.current.set(fromUserId, timeoutId);
          }
        });
      }
    } else {
      
      if (socketRef.current) {
        console.log('AppContext: No currentApiUser/token, ensuring existing socket is disconnected and nullified.');
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
        socketRef.current = null;
        setSocketConnected(false);
      }
      
      setMessages([]);
      setTypingUsers([]);
      
    }

    return () => {
      typingTimeoutsRef.current.forEach(clearTimeout);
      typingTimeoutsRef.current.clear();
       if (socketRef.current && (!currentApiUser || !token)) {
        console.log('AppContext: Cleanup - disconnecting socket because user/token became null.');
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
        socketRef.current = null;
        setSocketConnected(false);
      }
    };
  }, [currentApiUser, token, toast, updateUserStatus, queryClient]);

  const addMessage = useCallback((text, receiverId) => {
    if (!currentApiUser || !socketRef.current || !socketRef.current.connected) {
      toast({ title: 'Error', description: 'Not connected. Cannot send message.', variant: 'destructive'});
      return;
    }

    const localMessageTimestamp = Date.now();
    const tempId = `temp-${localMessageTimestamp}`;
    const optimisticMessage = {
      id: tempId,
      userId: currentApiUser.id,
      userName: currentApiUser.fullname || "You",
      avatar: currentApiUser.avatar || `https://placehold.co/40x40.png?text=${(currentApiUser.fullname && currentApiUser.fullname.length > 0) ? currentApiUser.fullname[0].toUpperCase() : 'U'}`,
      text,
      timestamp: localMessageTimestamp,
      receiverId: receiverId,
      direction: 'sent',
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    setUsersState(prev => prev.map(u =>
        u.id === receiverId
        ? { ...u, lastMessageContent: text }
        : u
    ));

    console.log('AppContext: Emitting send_message', { receiver: receiverId, content: text, tempId });
    socketRef.current.emit('send_message', {
      receiver: receiverId,
      content: text,
      tempId: tempId,
    });
  }, [currentApiUser, toast]);

  const sendTypingIndicator = useCallback((isTyping, toUserId) => {
    if (!socketRef.current || !socketRef.current.connected || !currentApiUser) {
        console.log(`AppContext: sendTypingIndicator - cannot send. Socket connected: ${!!(socketRef.current && socketRef.current.connected)}, currentApiUser: ${!!currentApiUser}`);
        return;
    }
    if (isTyping) {
      console.log(`AppContext: Emitting 'typing' to toUserId: ${toUserId}`);
      socketRef.current.emit('typing', { toUserId });
    }
  }, [currentApiUser]);


  return (
    <AppContext.Provider value={{
      users,
      setUsers: setUsersState,
      addUserIfNotExists,
      messages,
      setMessages,
      addMessage,
      typingUsers,
      setTypingUsers,
      updateUserStatus,
      sendTypingIndicator,
      socketConnected,
      mapBackendMessageToFrontend: (backendMsg, participatingUsers, currentUserId) =>
        mapBackendMessageToFrontendHelper(backendMsg, participatingUsers, currentUserId || (currentApiUser?.id ?? '')),
      clearUserUnreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
