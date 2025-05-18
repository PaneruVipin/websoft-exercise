
import React, { useState, useEffect, useRef, useMemo } from 'react';
import UserListItem from './UserListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Users as UsersIcon, Loader2, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/services/userService';
import { useAppContext, mapApiUserToAppUser } from '@/context/AppContext';


export default function UserList({ users: threadUsers, currentUser, onSelectUser, selectedUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const { typingUsers: contextTypingUsers } = useAppContext();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const { data: searchApiResultsData, isLoading: isLoadingSearch, error: searchError } = useQuery({
    queryKey: ['searchUsers', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm.trim()) {
        return { page: 1, limit: 0, total: 0, totalPages: 1, users: [] };
      }
      console.log(`UserList: Searching users with term "${debouncedSearchTerm}"`);
      return searchUsers(debouncedSearchTerm);
    },
    enabled: !!debouncedSearchTerm.trim(),
    placeholderData: (previousData) => previousData,
  });

  const mappedSearchApiResults = useMemo(() => {
    const results = (searchApiResultsData?.users || []).map(mapApiUserToAppUser);
    console.log(`UserList: Mapped ${results.length} API search results for term "${debouncedSearchTerm}"`);
    return results;
  }, [searchApiResultsData, debouncedSearchTerm]);

  const usersToDisplay = useMemo(() => {
    let list;
    const isSearching = debouncedSearchTerm.trim();

    if (isSearching) {
      list = mappedSearchApiResults.filter(searchUser => searchUser.id !== currentUser?.id);
      console.log(`UserList: Displaying ${list.length} SEARCH results (not current user) for term "${debouncedSearchTerm}"`);
    } else {
      list = threadUsers.filter(user => user.id !== currentUser?.id);
      console.log(`UserList: Displaying ${list.length} THREAD users (no active search, not current user)`);
    }
    return list;
  }, [debouncedSearchTerm, mappedSearchApiResults, threadUsers, currentUser]);


  const handleStartNewChatClick = () => {
    searchInputRef.current?.focus();
  };

  return (
    <Card className="h-full flex flex-col rounded-lg shadow-md">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Users</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleStartNewChatClick} aria-label="Start new chat">
            <PlusCircle className="h-5 w-5 text-primary" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search users to chat..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 p-2">
        {isLoadingSearch && debouncedSearchTerm.trim() && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Searching...</p>
          </div>
        )}
        {!isLoadingSearch && searchError && debouncedSearchTerm.trim() && (
          <p className="p-4 text-center text-destructive">Error searching users: {searchError.message}</p>
        )}
        {!isLoadingSearch && usersToDisplay.length > 0 ? (
          <div className="space-y-1">
            {usersToDisplay.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                onClick={() => {
                    console.log(`UserList: Clicked on user: ${user.fullname} (ID: ${user.id})`);
                    onSelectUser(user);
                    if (debouncedSearchTerm.trim()) { 
                        setSearchTerm('');
                    }
                }}
                isSelected={selectedUser?.id === user.id}
                isTyping={contextTypingUsers.includes(user.fullname)}
              />
            ))}
          </div>
        ) : (
          !isLoadingSearch && !searchError && (
             <p className="p-4 text-center text-muted-foreground">
              {debouncedSearchTerm.trim()
                ? 'No new users found for your search.'
                : (threadUsers.filter(u => u.id !== currentUser?.id).length === 0
                    ? 'No recent chats. Search or click "+" to start a new one!'
                    : 'Select a user to chat or search for new users.')
              }
            </p>
          )
        )}
      </ScrollArea>
    </Card>
  );
}
