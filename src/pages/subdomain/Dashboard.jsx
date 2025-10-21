import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  UsersIcon, 
  FileTextIcon, 
  BarChart3Icon, 
  CalendarIcon, 
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BuildingIcon,
  Calendar,
  MapPinIcon,
  BriefcaseIcon,
  UserCheckIcon,
  AlertCircleIcon,
  PlusIcon
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { user, token } = useTenantAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/v1/subdomain/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDashboardData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Provide default data if API fails
        setDashboardData({
          organization: {
            name: 'Your Organization',
            logo: '',
            industry: 'Technology',
            employeeCount: 50
          },
          user: {
            name: user?.firstName + ' ' + user?.lastName || 'User',
            role: user?.role || 'employee',
            avatar: user?.avatar || ''
          },
          stats: {
            totalEmployees: 50,
            departments: 5,
            locations: 2,
            openPositions: 3,
            employeeGrowth: 5,
            applicationsReceived: 12
          },
          recentActivity: []
        });
        toast.error('Using demo data. Connection to server failed.');
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      // Set loading to false if no token to prevent infinite loading
      setLoading(false);
    }
  }, [token, user]);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description, color = "default" }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color === 'success' ? 'text-green-600' : color === 'warning' ? 'text-yellow-600' : color === 'danger' ? 'text-red-600' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend === 'up' ? (
              <TrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendValue}%
            </span>
            <span className="ml-1">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionButton = ({ icon: Icon, title, description, onClick, variant = "outline" }) => (
    <Button 
      variant={variant} 
      className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-5 w-5" />
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} {user?.lastName}! Here's what's happening at {dashboardData?.organization?.name || 'your organization'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <BuildingIcon className="mr-2 h-3 w-3" />
            {dashboardData?.organization?.slug}
          </Badge>
          <Button size="sm">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Organization Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Organization Overview
          </CardTitle>
          <CardDescription>Key information about your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
              <p className="text-lg font-semibold">{dashboardData?.organization?.name || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Subdomain</p>
              <p className="text-lg font-semibold">{dashboardData?.organization?.slug || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-lg font-semibold">{dashboardData?.stats?.totalUsers || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your Role</p>
              <Badge variant="secondary" className="text-sm">
                {user?.role || 'Employee'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={dashboardData?.stats?.totalEmployees || 0}
          icon={UsersIcon}
          trend="up"
          trendValue={dashboardData?.stats?.employeeGrowth || 5}
          description="from last month"
          color="success"
        />
        <StatCard
          title="Departments"
          value={dashboardData?.stats?.departments || 0}
          icon={BarChart3Icon}
          description={`Across ${dashboardData?.stats?.locations || 1} locations`}
        />
        <StatCard
          title="Completion Rate"
          value="87%"
          icon={TrendingUpIcon}
          trend="up"
          trendValue={3}
          description="from last month"
          color="success"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used features and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionButton
                icon={UsersIcon}
                title="Manage Employees"
                description="View, add, or edit employee information"
                onClick={() => console.log('Navigate to employees')}
              />
              <QuickActionButton
                icon={CalendarIcon}
                title="Schedule Management"
                description="Manage work schedules and shifts"
                onClick={() => console.log('Navigate to schedule')}
              />
              <QuickActionButton
                icon={FileTextIcon}
                title="Generate Reports"
                description="Create custom reports and analytics"
                onClick={() => console.log('Navigate to reports')}
              />
              <QuickActionButton
                icon={BriefcaseIcon}
                title="Job Postings"
                description="Manage open positions and hiring"
                onClick={() => console.log('Navigate to jobs')}
              />
              <QuickActionButton
                icon={PlusIcon}
                title="Add New Employee"
                description="Onboard a new team member"
                onClick={() => console.log('Add employee')}
                variant="default"
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="rounded-full bg-primary/10 p-2">
                        <UsersIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type || 'Update'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity to display</p>
                  <p className="text-sm text-muted-foreground">Activity will appear here as your team uses the system</p>
                </div>
              )}
            </CardContent>
            {dashboardData?.recentActivity?.length > 0 && (
              <CardFooter>
                <Button variant="link" className="px-0">
                  View all activity →
                </Button>
              </CardFooter>
            )}
          </Card>

        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>Overview of your workforce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Employees</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats?.activeEmployees || dashboardData?.stats?.totalEmployees || 0}</p>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Hires (This Month)</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats?.newHires || 0}</p>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Departments</p>
                  <p className="text-2xl font-bold">{dashboardData?.stats?.departments || 0}</p>
                  <Progress value={100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                <p className="text-sm text-muted-foreground">Detailed charts and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Documentation</CardTitle>
              <CardDescription>Generate and manage organizational reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Report generation coming soon</p>
                <p className="text-sm text-muted-foreground">Custom reports and documentation will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;