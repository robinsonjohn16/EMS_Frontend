import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import employeeApi from '../../services/employeeApi';
import tenantApi from '../../services/tenantApi';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { CalendarIcon, Eye, Edit, Plus, Search, Filter, Download, MoreHorizontal, FileText, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pendingDetails: 0
  });

  const { user, isHROrManager, isManager, isHR } = useTenantAuth();
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEmployeeDetailsDialog, setShowEmployeeDetailsDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newUser, setNewUser] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    role: 'employee',
    phone: '',
    department: '',
    position: ''
  });
  
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    dateOfJoining: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    esicIpNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    isActive: true
  });

  useEffect(() => {
    fetchEmployees();
    // fetchStats();
  }, [page, limit, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.details.getAllEmployees({
        page,
        limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setEmployees(response.data.employees || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalEmployees(response.data.pagination?.total || 0);
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        inactive: 0,
        pendingDetails: 0
      });
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.firstName) {
        toast.error('First name and email are required');
        return;
      }
      // Role restriction: HR can only create employees; Manager can create employee or hr
      const allowedRoles = isManager() ? ['employee', 'hr'] : ['employee'];
      if (!allowedRoles.includes(newUser.role)) {
        toast.error('You are not allowed to create this role');
        return;
      }
      setCreating(true);
      const payload = {
        firstName: newUser.firstName.trim(),
        lastName: (newUser.lastName || '').trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        phone: newUser.phone?.trim(),
        department: newUser.department?.trim(),
        position: newUser.position?.trim(),
        isActive: true
      };
      const res = await tenantApi.subdomainUsers.createUser(payload);
      const created = res?.data?.user || res?.data || res;
      toast.success('Employee created successfully');
      setShowCreateDialog(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'employee', phone: '', department: '', position: '' });
      fetchEmployees();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create employee');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditEmployee = (employee) => {
    const userData = employee.userId || employee;
    setEditUser({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      department: userData.department || '',
      position: userData.position || '',
      employeeId: userData.employeeId || '',
      dateOfJoining: userData.dateOfJoining ? format(new Date(userData.dateOfJoining), 'yyyy-MM-dd') : '',
      gender: userData.gender || '',
      panNumber: userData.panNumber || '',
      aadhaarNumber: userData.aadhaarNumber || '',
      uanNumber: userData.uanNumber || '',
      esicIpNumber: userData.esicIpNumber || '',
      bankAccountNumber: userData.bankAccountNumber || '',
      ifscCode: userData.ifscCode || '',
      isActive: userData.isActive !== false
    });
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      if (!editUser.firstName || !editUser.email) {
        toast.error('First name and email are required');
        return;
      }
      setUpdating(true);
      const payload = {
        firstName: editUser.firstName.trim(),
        lastName: editUser.lastName.trim(),
        email: editUser.email.trim().toLowerCase(),
        phone: editUser.phone.trim(),
        department: editUser.department.trim(),
        position: editUser.position.trim(),
        employeeId: editUser.employeeId.trim(),
        dateOfJoining: editUser.dateOfJoining,
        gender: editUser.gender,
        panNumber: editUser.panNumber.trim(),
        aadhaarNumber: editUser.aadhaarNumber.trim(),
        uanNumber: editUser.uanNumber.trim(),
        esicIpNumber: editUser.esicIpNumber.trim(),
        bankAccountNumber: editUser.bankAccountNumber.trim(),
        ifscCode: editUser.ifscCode.trim(),
        isActive: editUser.isActive
      };
      
      await tenantApi.subdomainUsers.updateUser(selectedEmployee.userId?._id || selectedEmployee._id, payload);
      toast.success('Employee updated successfully');
      setShowEditDialog(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update employee');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewDialog(true);
  };

  const handleViewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetailsDialog(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleOpenCreate = () => setShowCreateDialog(true);
  const handleCloseCreate = () => {
    if (!creating) {
      setShowCreateDialog(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'employee', phone: '', department: '', position: '' });
    }
  };

  const handleCloseEdit = () => {
    if (!updating) {
      setShowEditDialog(false);
      setSelectedEmployee(null);
    }
  };

  const handleCloseView = () => {
    setShowViewDialog(false);
    setSelectedEmployee(null);
  };

  const handleCloseEmployeeDetails = () => {
    setShowEmployeeDetailsDialog(false);
    setSelectedEmployee(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'manager':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Manager</Badge>;
      case 'hr':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">HR</Badge>;
      case 'employee':
        return <Badge variant="outline">Employee</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization's employees</p>
        </div>
        <div className="flex gap-3">
          {isHROrManager() && (
            <Button onClick={handleOpenCreate} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/employee-field-management">
              <Filter className="w-4 h-4 mr-2" />
              Field Categories
          </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              {/* <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              {/* <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              {/* <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Details</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingDetails}</p>
              </div>
              {/* <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-0">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search employees by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({totalEmployees})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first employee.</p>
              {isHROrManager() && (
                <Button onClick={handleOpenCreate} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const userData = employee.userId || employee;
                    const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <TableRow key={employee._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={userData.avatar} />
                              <AvatarFallback className="bg-yellow-100 text-yellow-800">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{userData.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {userData.employeeId || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>{getRoleBadge(userData.role)}</TableCell>
                        {/* <TableCell>{userData.isActive}</TableCell> */}
                        <TableCell>{getStatusBadge(userData.isActive === true ? 'active' : userData.isActive === false ? 'inactive' : 'pending')}</TableCell>
                        <TableCell>
                          {userData.dateOfJoining ? format(new Date(userData.dateOfJoining), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEmployee(employee)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isHROrManager() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {isHROrManager() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEmployeeDetails(employee)}
                                title="View Employee Field Details"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !creating && setShowCreateDialog(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="employee@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  {isManager() && <SelectItem value="hr">HR</SelectItem>}
                </SelectContent>
              </Select>
              {!isManager() && (
                <p className="text-xs text-gray-500">HR can only create Employee users</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g., Engineering, Sales"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={newUser.position}
                onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                placeholder="e.g., Software Developer, Manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreate} disabled={creating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={creating}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {creating ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => !updating && setShowEditDialog(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email Address *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
        </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone Number</Label>
                  <Input
                    id="editPhone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
        </div>
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={editUser.department}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  />
        </div>
                <div className="space-y-2">
                  <Label htmlFor="editPosition">Position</Label>
                  <Input
                    id="editPosition"
                    value={editUser.position}
                    onChange={(e) => setEditUser({ ...editUser, position: e.target.value })}
                  />
        </div>
      </div>
            </TabsContent>
            
            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmployeeId">Employee ID</Label>
                  <Input
                    id="editEmployeeId"
                    value={editUser.employeeId}
                    onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })}
                    placeholder="EMP001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editJoiningDate">Joining Date</Label>
            <Input
                    id="editJoiningDate"
                    type="date"
                    value={editUser.dateOfJoining}
                    onChange={(e) => setEditUser({ ...editUser, dateOfJoining: e.target.value })}
            />
          </div>
                <div className="space-y-2">
                  <Label htmlFor="editGender">Gender</Label>
                  <Select value={editUser.gender} onValueChange={(val) => setEditUser({ ...editUser, gender: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editUser.isActive ? 'active' : 'inactive'} onValueChange={(val) => setEditUser({ ...editUser, isActive: val === 'active' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPanNumber">PAN Number</Label>
                  <Input
                    id="editPanNumber"
                    value={editUser.panNumber}
                    onChange={(e) => setEditUser({ ...editUser, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="editAadhaarNumber"
                    value={editUser.aadhaarNumber}
                    onChange={(e) => setEditUser({ ...editUser, aadhaarNumber: e.target.value })}
                    placeholder="1234 5678 9012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUanNumber">UAN Number</Label>
                  <Input
                    id="editUanNumber"
                    value={editUser.uanNumber}
                    onChange={(e) => setEditUser({ ...editUser, uanNumber: e.target.value })}
                    placeholder="123456789012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEsicIpNumber">ESIC IP Number</Label>
                  <Input
                    id="editEsicIpNumber"
                    value={editUser.esicIpNumber}
                    onChange={(e) => setEditUser({ ...editUser, esicIpNumber: e.target.value })}
                    placeholder="123456789012345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBankAccount">Bank Account Number</Label>
                  <Input
                    id="editBankAccount"
                    value={editUser.bankAccountNumber}
                    onChange={(e) => setEditUser({ ...editUser, bankAccountNumber: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIfscCode">IFSC Code</Label>
                  <Input
                    id="editIfscCode"
                    value={editUser.ifscCode}
                    onChange={(e) => setEditUser({ ...editUser, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit} disabled={updating}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEmployee} 
              disabled={updating}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {updating ? 'Updating...' : 'Update Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.userId?.avatar} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-800 text-lg">
                    {`${selectedEmployee.userId?.firstName?.[0] || ''}${selectedEmployee.userId?.lastName?.[0] || ''}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedEmployee.userId?.firstName} {selectedEmployee.userId?.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedEmployee.userId?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(selectedEmployee.userId?.role)}
                    {getStatusBadge(selectedEmployee.userId?.isActive ? 'active' : 'inactive')}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">First Name</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.lastName || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Department</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.department || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Position</Label>
                        <p className="text-gray-900">{selectedEmployee.userId?.position || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Role</Label>
                        <div className="mt-1">{getRoleBadge(selectedEmployee.userId?.role)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedEmployee.userId?.isActive ? 'active' : 'inactive')}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="employment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.employeeId || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Joining Date</Label>
                        <p className="text-gray-900">
                          {selectedEmployee.userId?.dateOfJoining 
                            ? format(new Date(selectedEmployee.userId.dateOfJoining), 'MMMM dd, yyyy')
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Gender</Label>
                        <p className="text-gray-900 capitalize">{selectedEmployee.userId?.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Created At</Label>
                        <p className="text-gray-900">
                          {selectedEmployee.userId?.createdAt 
                            ? format(new Date(selectedEmployee.userId.createdAt), 'MMMM dd, yyyy')
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                        <p className="text-gray-900">
                          {selectedEmployee.userId?.lastLogin 
                            ? format(new Date(selectedEmployee.userId.lastLogin), 'MMMM dd, yyyy HH:mm')
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">PAN Number</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.panNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Aadhaar Number</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.aadhaarNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">UAN Number</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.uanNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">ESIC IP Number</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.esicIpNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Bank Account Number</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.bankAccountNumber || 'N/A'}</p>
          </div>
          <div>
                        <Label className="text-sm font-medium text-gray-500">IFSC Code</Label>
                        <p className="text-gray-900 font-mono">{selectedEmployee.userId?.ifscCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseView}>
              Close
            </Button>
            {isHROrManager() && (
              <Button 
                onClick={() => {
                  handleCloseView();
                  handleEditEmployee(selectedEmployee);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Employee
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Field Details Dialog */}
      <Dialog open={showEmployeeDetailsDialog} onOpenChange={setShowEmployeeDetailsDialog}>
        <DialogContent className="sm:max-w-5xl max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Field Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeFieldDetailsView 
              employee={selectedEmployee} 
              onClose={handleCloseEmployeeDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Employee Field Details Component
const EmployeeFieldDetailsView = ({ employee, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [profileValues, setProfileValues] = useState({
    employeeId: '',
    dateOfJoining: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    esicIpNumber: '',
    bankAccountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        // Fetch field categories with user data included
        const categoriesResponse = await employeeApi.fields.getFieldCategories();
        const fetchedCategories = categoriesResponse.data.categories || [];
        const userData = categoriesResponse.data.userData || {};
        const profile = categoriesResponse.data.profile || null;
        
        setCategories(fetchedCategories);
        
        const transformedFields = {};
        fetchedCategories.forEach(category => {
          transformedFields[category.name] = {};
          
          if (category.fields && category.fields.length > 0) {
            category.fields.forEach(field => {
              if (field.value !== undefined) {
                transformedFields[category.name][field.name] = field.value;
              } 
              else if (userData[field._id]) {
                transformedFields[category.name][field.name] = userData[field._id];
              }
              else if (userData[field.name]) {
                transformedFields[category.name][field.name] = userData[field.name];
              }
              else if (userData[`${category.name}.${field.name}`]) {
                transformedFields[category.name][field.name] = userData[`${category.name}.${field.name}`];
              }
              else if (userData[category.name] && userData[category.name][field.name]) {
                transformedFields[category.name][field.name] = userData[category.name][field.name];
              }
              else {
                transformedFields[category.name][field.name] = field.defaultValue || '';
              }
            });
          }
        });
        
        setFormValues(transformedFields);
        
        // Set employee data for approval status
        setEmployeeData(categoriesResponse.data.employee || {});
        
        // Initialize Employment & Identity section from returned profile
        const toDateInput = (d) => {
          if (!d) return '';
          try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          } catch {
            return '';
          }
        };
        setProfileValues({
          employeeId: profile?.employeeId || '',
          dateOfJoining: toDateInput(profile?.dateOfJoining),
          gender: profile?.gender || '',
          panNumber: profile?.panNumber || '',
          aadhaarNumber: profile?.aadhaarNumber || '',
          uanNumber: profile?.uanNumber || '',
          esicIpNumber: profile?.esicIpNumber || '',
          bankAccountNumber: profile?.bankAccountNumber || '',
          ifscCode: profile?.ifscCode || ''
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
        toast.error('Failed to load employee field details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employee]);

  const getApprovalStatusInfo = () => {
    const status = employeeData?.approvalStatus?.status || 'draft';
    
    switch (status) {
      case 'submitted':
        return {
          status: 'submitted',
          text: 'Submitted for Review',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          variant: 'secondary',
          submittedAt: employeeData?.approvalStatus?.submittedAt
        };
      case 'approved':
        return {
          status: 'approved',
          text: 'Approved by HR',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          variant: 'default',
          reviewedAt: employeeData?.approvalStatus?.reviewedAt,
          reviewComments: employeeData?.approvalStatus?.reviewComments
        };
      case 'rejected':
        return {
          status: 'rejected',
          text: 'Rejected by HR',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          icon: XCircle,
          variant: 'destructive',
          reviewedAt: employeeData?.approvalStatus?.reviewedAt,
          reviewComments: employeeData?.approvalStatus?.reviewComments
        };
      default:
        return {
          status: 'draft',
          text: 'Draft',
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          icon: FileText,
          variant: 'outline'
        };
    }
  };

  const computeCategoryProgress = (category) => {
    const visibleFields = (category.fields || []).filter(f => f.isVisible !== false);
    const total = visibleFields.length;
    let completed = 0;
    visibleFields.forEach(field => {
      const val = formValues[category.name]?.[field.name];
      let isDone = false;
      if (field.type === 'file' || field.type === 'image') {
        const filesArray = Array.isArray(val) ? val : (val ? [val] : []);
        isDone = filesArray.length > 0;
      } else if (Array.isArray(val)) {
        isDone = val.length > 0;
      } else {
        isDone = val !== undefined && val !== null && String(val).trim() !== '';
      }
      if (isDone) completed += 1;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  const approvalInfo = getApprovalStatusInfo();
  const userData = employee.userId || employee;

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userData.avatar} />
          <AvatarFallback className="bg-yellow-100 text-yellow-800 text-lg">
            {`${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {userData.firstName} {userData.lastName}
          </h3>
          <p className="text-gray-600">{userData.email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline">{userData.role}</Badge>
            <Badge variant={approvalInfo.variant} className="px-3 py-1">
              {approvalInfo.icon && <approvalInfo.icon className="h-4 w-4 mr-1" />}
              {approvalInfo.text}
            </Badge>
          </div>
        </div>
      </div>

      {/* Basic Info section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                <p className="text-gray-900 font-mono">{profileValues.employeeId || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Date of Joining</Label>
                <p className="text-gray-900">
                  {profileValues.dateOfJoining 
                    ? format(new Date(profileValues.dateOfJoining), 'MMMM dd, yyyy')
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-gray-900 capitalize">{profileValues.gender || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">PAN Number</Label>
                <p className="text-gray-900 font-mono">{profileValues.panNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Aadhaar Number</Label>
                <p className="text-gray-900 font-mono">{profileValues.aadhaarNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">UAN Number</Label>
                <p className="text-gray-900 font-mono">{profileValues.uanNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">ESIC IP Number</Label>
                <p className="text-gray-900 font-mono">{profileValues.esicIpNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Bank Account Number</Label>
                <p className="text-gray-900 font-mono">{profileValues.bankAccountNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">IFSC Code</Label>
                <p className="text-gray-900 font-mono">{profileValues.ifscCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Field Categories */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Fields Configured</h3>
            <p className="text-gray-500 mb-4">No employee fields have been defined yet.</p>
            <p className="text-gray-500">Please set up employee fields in Field Management.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const progress = computeCategoryProgress(category);
            return (
              <Card key={category._id}>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{category.name}</CardTitle>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700 whitespace-nowrap">{progress.completed}/{progress.total} completed</div>
                      <div className="w-40 h-2 bg-gray-200 rounded">
                        <div style={{ width: `${progress.percent}%` }} className="h-2 bg-blue-600 rounded"></div>
                      </div>
                      <Badge className={progress.percent === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {progress.percent}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {category.fields && category.fields.some(f => f.isVisible !== false) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {category.fields.filter(f => f.isVisible !== false).map((field) => {
                        const value = formValues[category.name]?.[field.name] ?? '';
                        return (
                          <div key={field._id} className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              {field.label || field.name}
                            </Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                              {field.type === 'file' || field.type === 'image' ? (
                                <div className="space-y-2">
                                  {Array.isArray(value) ? value.map((file, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-700">{file}</span>
                                    </div>
                                  )) : value ? (
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-700">{value}</span>
          </div>
        ) : (
                                    <span className="text-sm text-gray-500">No file uploaded</span>
                                  )}
                                </div>
                              ) : Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-1">
                                  {value.map((item, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-900">{value || 'Not provided'}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No fields defined in this category yet.</p>
          </div>
        )}
                </CardContent>
              </Card>
            );
          })}
      </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </div>
  );
};

export default EmployeeManagement;