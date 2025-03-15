
import { useState, useEffect, useCallback } from 'react';
import { useFollow } from '@/hooks/use-follow';
import { UserCard } from '@/components/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Search, Users, UserPlus, Heart } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const Friends = () => {
  const { 
    users, 
    followings, 
    followers, 
    loading, 
    fetchUsers, 
    fetchFollowings, 
    fetchFollowers,
    toggleFollow 
  } = useFollow();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  
  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchUserData = useCallback(() => {
    fetchUsers();
    fetchFollowings();
    fetchFollowers();
  }, [fetchUsers, fetchFollowings, fetchFollowers]);
  
  // Load all data when component first mounts
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  // Load data when active tab changes
  useEffect(() => {
    if (activeTab === 'discover') {
      fetchUsers();
    } else if (activeTab === 'following') {
      fetchFollowings();
    } else if (activeTab === 'followers') {
      fetchFollowers();
    }
  }, [activeTab, fetchUsers, fetchFollowings, fetchFollowers]);
  
  // Filter user lists based on search
  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFollowings = followings.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFollowers = followers.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Friends & Followers" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pt-6 lg:p-8 overflow-auto w-full">
          <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="discover" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="discover" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Discover</span>
                  </TabsTrigger>
                  <TabsTrigger value="following" className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Following</span>
                    <span className="ml-1 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {followings.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="followers" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Followers</span>
                    <span className="ml-1 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {followers.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="discover" className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onToggleFollow={toggleFollow}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No other users available.'}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="following" className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredFollowings.length > 0 ? (
                    filteredFollowings.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onToggleFollow={toggleFollow}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm 
                        ? 'No followed users found matching your search.' 
                        : 'You are not following anyone yet. Discover users in the "Discover" tab.'}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="followers" className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredFollowers.length > 0 ? (
                    filteredFollowers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onToggleFollow={toggleFollow}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm 
                        ? 'No followers found matching your search.' 
                        : 'You have no followers yet.'}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Friends;
