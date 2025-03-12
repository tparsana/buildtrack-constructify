
import { supabase } from "@/integrations/supabase/client";
import { User } from "./data";

// Fetch profiles for a list of user IDs with efficient batching
export const fetchUserProfiles = async (userIds: string[]): Promise<Map<string, User>> => {
  if (userIds.length === 0) return new Map();
  
  try {
    // Use a single query with an "in" clause for better performance
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar, role')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Create a map of user IDs to user objects
    const userMap = new Map<string, User>();
    profilesData.forEach(profile => {
      userMap.set(profile.id, {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar || '',
        role: profile.role
      });
    });
    
    return userMap;
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return new Map();
  }
};
