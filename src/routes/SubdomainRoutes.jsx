import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../pages/subdomain/Login';
import Dashboard from '../pages/subdomain/Dashboard';
import Profile from '../pages/subdomain/Profile';
import EmployeeDetails from '../pages/subdomain/EmployeeDetails';
import EmployeeManagement from '../pages/subdomain/EmployeeManagement';
import EmployeeFieldManagement from '../pages/subdomain/EmployeeFieldManagement';
import EmployeeApprovals from '../pages/subdomain/EmployeeApprovals';
import EditEmployee from '../pages/subdomain/EditEmployee';
import HolidayManagement from '../pages/subdomain/HolidayManagement';
import { initializeTenantAuth } from '../store/slices/tenantAuthSlice';
import TenantDashboardLayout from '../layouts/TenantDashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import AttendanceConfig from '../pages/subdomain/AttendanceConfig';
import UserAttendanceOverrides from '../pages/subdomain/UserAttendanceOverrides';
import WorkCalendar from '../pages/subdomain/WorkCalendar';
import ApplyLeave from '../pages/subdomain/ApplyLeave';
import HRLeaveApproval from '../pages/subdomain/HRLeaveApproval';
import HRAttendanceMarking from '../pages/subdomain/HRAttendanceMarking';
import PayrollDashboard from '../pages/subdomain/PayrollDashboard';
import PayrollCompensation from '../pages/subdomain/PayrollCompensation';
import PayrollDeductionRules from '../pages/subdomain/PayrollDeductionRules';
import PayrollSalarySlip from '../pages/subdomain/PayrollSalarySlip';
import OrganizationSettings from '../pages/subdomain/OrganizationSettings';
import Chat from '../pages/subdomain/Chat';
import SocketProvider from '../contexts/SocketContext';


// Protected route component
let ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state) => state.tenantAuth);
  const location = useLocation();

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL so that after login user returns to the same page
    const fromPath = `${location.pathname}${location.search}${location.hash}`;
    try {
      localStorage.setItem('redirectPath', fromPath);
    } catch (e) {
      // no-op if storage is unavailable
    }
    // Remove stray debug logs
    return <Navigate to="/login" replace state={{ from: fromPath }} />;
  }

  return children;
};

// HR or Manager role protected route
const HRProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.tenantAuth);
  const isHROrManager = user && (user.role === 'hr' || user.role === 'manager');

  if (!isHROrManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const SubdomainRoutes = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.tenantAuth);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeTenantAuth());
    }
  }, [dispatch, isInitialized]);

  return (
    <ErrorBoundary>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <TenantDashboardLayout />
            </ProtectedRoute>
          }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Employee routes */}
        <Route path="my-details" element={<EmployeeDetails />} />
        
        {/* HR/Manager protected routes */}
        <Route path="employee-management" element={
          <HRProtectedRoute>
            <EmployeeManagement />
          </HRProtectedRoute>
        } />
        <Route path="employee-field-management" element={
          <HRProtectedRoute>
            <EmployeeFieldManagement />
          </HRProtectedRoute>
        } />
        <Route path="employee-approvals" element={
          <HRProtectedRoute>
            <EmployeeApprovals />
          </HRProtectedRoute>
        } />
        <Route path="edit-employee/:id" element={
          <HRProtectedRoute>
            <EditEmployee />
          </HRProtectedRoute>
        } />
        <Route path="employee-details/:id" element={
          <HRProtectedRoute>
            <EditEmployee />
          </HRProtectedRoute>
        } />
        <Route path="add-employee" element={
          <HRProtectedRoute>
            <EditEmployee />
          </HRProtectedRoute>
        } />
        <Route path="attendance-config" element={
          <HRProtectedRoute>
            <AttendanceConfig />
          </HRProtectedRoute>
        } />
        <Route path="user-attendance-overrides" element={
          <HRProtectedRoute>
            <UserAttendanceOverrides />
          </HRProtectedRoute>
        } />
        <Route path="attendance-marking" element={
          <HRProtectedRoute>
            <HRAttendanceMarking />
          </HRProtectedRoute>
        } />
        <Route path="holiday-management" element={
          <HRProtectedRoute>
            <HolidayManagement />
          </HRProtectedRoute>
        } />
        <Route path="leave-approvals" element={
          <HRProtectedRoute>
            <HRLeaveApproval />
          </HRProtectedRoute>
        } />

        {/* Payroll routes */}
        <Route path="payroll" element={
          <HRProtectedRoute>
            <PayrollDashboard />
          </HRProtectedRoute>
        } />
        <Route path="payroll/compensation" element={
          <HRProtectedRoute>
            <PayrollCompensation />
          </HRProtectedRoute>
        } />
        <Route path="payroll/deduction-rules" element={
          <HRProtectedRoute>
            <PayrollDeductionRules />
          </HRProtectedRoute>
        } />
        <Route path="payroll/slips" element={
          <HRProtectedRoute>
            <PayrollSalarySlip />
          </HRProtectedRoute>
        } />
        <Route path="organization-settings" element={
          <HRProtectedRoute>
            <OrganizationSettings />
          </HRProtectedRoute>
        } />

        <Route path="work-calendar" element={<WorkCalendar />} />
        <Route path="apply-leave" element={<ApplyLeave />} />
        <Route path="chat" element={<Chat />} />
        

        <Route path="reports" element={<div>Reports Page Coming Soon</div>} />
        <Route path="settings" element={<div>Settings Page Coming Soon</div>} />
        <Route path="notifications" element={<div>Notifications Page Coming Soon</div>} />
      </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </SocketProvider>
    </ErrorBoundary>
  );
};

export default SubdomainRoutes;