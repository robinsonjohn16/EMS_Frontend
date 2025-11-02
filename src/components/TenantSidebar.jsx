import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Calendar,
  Clock,
  // LogOut,
  User,
  BarChart3,
  Building2,
  BriefcaseIcon,
  Bell,
  CheckCircle,
  ChevronsUpDown,
  MessageSquare,
  // Building
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logoutTenantUser } from '@/store/slices/tenantAuthSlice';
import ChatNotification from './ChatNotification';

const TenantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useIsMobile()
  
  const { user, organization } = useSelector((state) => state.tenantAuth);
  
  const handleLogout = () => {
    dispatch(logoutTenantUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const mainNavigation = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      url: '/dashboard',
    },

    {
      title: 'My Details',
      icon: User,
      url: '/my-details',
    },
    {
      title: 'Work Calendar',
      icon: Calendar,
      url: '/work-calendar',
    },
    {
      title: 'Apply Leave',
      icon: BriefcaseIcon,
      url: '/apply-leave',
    },
    {
      title: 'Chat',
      icon: MessageSquare,
      url: '/chat',
    },
    // {
    //   title: 'Reports',
    //   icon: BarChart3,
    //   url: '/reports',
    // },
  ];

  // HR specific navigation items
  const hrNavigation = [
    {
      title: 'Employee Management',
      icon: Users,
      url: '/employee-management',
    },
    {
      title: 'Field Management',
      icon: Settings,
      url: '/employee-field-management',
    },
    // Attendance-related items will be grouped under a single "Attendance" parent
    {
      title: 'Payroll',
      icon: BriefcaseIcon,
      url: '/payroll',
    },
  ];

  const attendanceNavigation = [
    {
      title: 'Attendance Config',
      icon: Calendar,
      url: '/attendance-config',
    },
    {
      title: 'User Specific Attendance',
      icon: Clock,
      url: '/user-attendance-overrides',
    },
    {
      title: 'Attendance Marking',
      icon: Calendar,
      url: '/attendance-marking',
    },
        {
      title: 'Holiday Management',
      icon: Calendar,
      url: '/holiday-management',
    },
    {
      title: 'Leave Approvals',
      icon: CheckCircle,
      url: '/leave-approvals',
    },
  ];

  // Only show HR navigation if user has HR role
  const isHR = user?.role === 'hr' || user?.role === 'manager';

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{organization?.name || 'Organization'}</span>
            <span className="truncate text-xs text-muted-foreground">
              Employee Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="relative">
                      <item.icon />
                      <span>{item.title}</span>
                      {item.title === 'Chat' && <ChatNotification />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* HR Navigation - Only visible to HR users */}
        {isHR && (
          <> 
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>HR Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Top-level HR items (excluding attendance) */}
                  {hrNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Collapsible Attendance group */}
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Attendance">
                      <Calendar />
                      <span>Attendance</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {attendanceNavigation.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url}>
                              <item.icon className="size-3" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/profile')}
                  tooltip="Profile"
                >
                  <Link to="/profile">
                    <User />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/notifications')}
                  tooltip="Notifications"
                >
                  <Link to="/notifications">
                    <Bell />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/settings')}
                  tooltip="Settings"
                >
                  <Link to="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.firstName} {user?.lastName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
};

export default TenantSidebar;