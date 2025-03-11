
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarHeader, 
  SidebarTrigger, 
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  Building, 
  CheckSquare, 
  LayoutDashboard, 
  Settings, 
  Users, 
  LogOut,
  User,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { currentUser, isAdmin, isAuthenticated, logout } = useAuth();
  const { state } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  if (!isAuthenticated) {
    return null; // Don't show navbar on login/register pages
  }
  
  return (
    <>
      {/* Collapsed sidebar menu button that appears when sidebar is collapsed */}
      {state === "collapsed" && (
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-4 left-4 z-50 md:flex hidden"
        >
          <SidebarTrigger>
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
        </Button>
      )}
      
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 px-2">
            <Building className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">BuildTrack</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {isAdmin ? (
              // Admin Menu Items
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/")} asChild>
                    <Link to="/" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/tasks")} asChild>
                    <Link to="/tasks" className="flex items-center">
                      <CheckSquare className="mr-2 h-5 w-5" />
                      <span>Tasks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/team")} asChild>
                    <Link to="/team" className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      <span>Team</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/settings")} asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              // Employee Menu Items
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/employee")} asChild>
                    <Link to="/employee" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      <span>My Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/profile")} asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {currentUser && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
              <SidebarTrigger />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default Navbar;
