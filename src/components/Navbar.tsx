
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { Building, CheckSquare, LayoutDashboard, Settings, Users } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2">
          <Building className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">BuildTrack</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
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
            <SidebarMenuButton isActive={false} asChild>
              <Link to="#" className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                <span>Team</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton isActive={false} asChild>
              <Link to="#" className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm font-medium">JS</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">John Smith</p>
              <p className="text-xs text-gray-500">Project Manager</p>
            </div>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navbar;
