import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import TenantSidebar from '@/components/TenantSidebar';

const TenantDashboardLayout = () => {
  const { pathname } = useLocation();
  const labelMap = {
    '/dashboard': 'Overview',
    '/user-attendance-overrides': 'User Attendance Overrides',
    '/attendance-config': 'Attendance Configuration',
    '/work-calendar': 'Work Calendar',
    '/attendance-marking': 'Attendance Marking',
  };
  const currentLabel = labelMap[pathname] || pathname.split('/').filter(Boolean).map((seg)=>seg.replace(/-/g,' ')).map((s)=>s.charAt(0).toUpperCase()+s.slice(1)).join(' / ');
  return (
    <SidebarProvider>
      <TenantSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentLabel || 'Overview'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TenantDashboardLayout;