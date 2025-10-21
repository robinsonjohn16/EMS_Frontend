import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Users,
  Settings,
  Plus,
  Search,
  ChevronRight,
  LogOut,
  User,
  BarChart3,
  FileText,
  Calendar,
  Mail,
  Shield,
  Bell
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { fetchOrganizations } from '@/store/slices/organizationSlice';
import { logoutUser } from '@/store/slices/authSlice';

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { organizations, loading } = useSelector((state) => state.organizations);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationsExpanded, setOrganizationsExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(false);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // const filteredOrganizations = organizations.filter(org =>
  //   org.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const isActive = (path) => location.pathname === path;

  const mainNavigation = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      url: '/dashboard',
    },
    {
      title: 'Users',
      icon: Users,
      url: '/dashboard/users',
    },
    {
      title: 'Settings',
      icon: Settings,
      url: '/dashboard/settings',
    },
  ];

  const organizationNavigation = [
    {
      title: 'All Organizations',
      icon: Building2,
      url: '/dashboard/organizations',
    },
    {
      title: 'Create Organization',
      icon: Plus,
      url: '/dashboard/organizations/create',
    },
  ];

  const reportsNavigation = [
    {
      title: 'Analytics',
      icon: BarChart3,
      url: '/dashboard/reports/analytics',
    },
    {
      title: 'Documents',
      icon: FileText,
      url: '/dashboard/reports/documents',
    },
    {
      title: 'Calendar',
      icon: Calendar,
      url: '/dashboard/reports/calendar',
    },
  ];

  const adminNavigation = [
    {
      title: 'User Management',
      icon: Shield,
      url: '/dashboard/admin/users',
    },
    {
      title: 'Tenant Users',
      icon: Users,
      url: '/dashboard/admin/tenant-users',
    },
    {
      title: 'System Settings',
      icon: Settings,
      url: '/dashboard/admin/settings',
    },
    {
      title: 'Notifications',
      icon: Bell,
      url: '/dashboard/admin/notifications',
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">EMS Pro</span>
            <span className="truncate text-xs text-muted-foreground">
              Enterprise Management
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
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Organizations */}
        <SidebarGroup>
          <SidebarGroupLabel>Organizations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationNavigation.map((item) => (
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
              
              {/* Organization Search */}
              <SidebarMenuItem>
                <div className="px-2 py-1">
                  <SidebarInput
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </SidebarMenuItem>

              {/* Organization List */}
              {/* {filteredOrganizations.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    {filteredOrganizations.slice(0, 5).map((org) => (
                      <SidebarMenuSubItem key={org._id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(`/dashboard/organizations/${org._id}`)}
                        >
                          <Link to={`/dashboard/organizations/${org._id}`}>
                            <Building2 className="size-3" />
                            <span className="truncate">{org.name}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {org.type}
                            </Badge>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    {filteredOrganizations.length > 5 && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/dashboard/organizations">
                            <span className="text-muted-foreground">
                              +{filteredOrganizations.length - 5} more
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              )} */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavigation.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Administration */}
        {user?.role === 'super_admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.username}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;