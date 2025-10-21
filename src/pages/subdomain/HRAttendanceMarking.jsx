import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Calendar as CalendarIcon, Users, Search, Loader2 } from 'lucide-react';
import attendanceApi from '../../services/attendanceApi';
import employeeApi from '../../services/employeeApi';
import leaveApi from '../../services/leaveApi';
import calendarApi from '../../services/calendarApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

const todayYMD = () => {
  const now = new Date();
  // Use en-CA to get YYYY-MM-DD reliably
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
};

const HRAttendanceMarking = () => {
  const [date, setDate] = useState(todayYMD());
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');
  const [applyToAll, setApplyToAll] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Quick calendar marking state
  const [calendarEmployeeId, setCalendarEmployeeId] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [quickStatus, setQuickStatus] = useState('present');
  const [markedStatuses, setMarkedStatuses] = useState({}); // { 'YYYY-MM-DD': 'present'|'absent'|'half-day'|'paid-leave' }
  
  // Calendar restrictions and existing data
  const [holidays, setHolidays] = useState([]);
  const [workingDays, setWorkingDays] = useState({});
  const [workingSettings, setWorkingSettings] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  // Leave quota and type management
  const [leaveQuota, setLeaveQuota] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState('paid');
  const [showLeaveTypeDialog, setShowLeaveTypeDialog] = useState(false);
  const [pendingLeaveDate, setPendingLeaveDate] = useState(null);

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Load calendar data for restrictions and existing attendance
  const loadCalendarData = async (employeeId) => {
    if (!employeeId) return;
    
    try {
      setCalendarLoading(true);
      
      // Determine current month range based on selected calendar month
      const monthStartDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
      const monthEndDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
      const start = formatDateKey(monthStartDate);
      const end = formatDateKey(monthEndDate);

      // Single API call: fetch working settings and holidays for range
      const calendarData = await calendarApi.getCalendarData({ start, end, employeeId });

      // Working/non-working days and settings
      if (calendarData?.workingSettings) {
        setWorkingSettings(calendarData.workingSettings);
        setWorkingDays(calendarData.workingSettings.workingDays || {});
      }

      // Holidays for current range (already resolved for recurrence)
      const holidayEvents = calendarData?.events?.holidays || [];
      setHolidays(holidayEvents);
      
      // Load existing attendance for current month
      const monthKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`;
      const attendanceRes = await attendanceApi.getMonthly({ month: monthKey });
      const attendanceData = attendanceRes?.days || {};
      
      // Convert attendance data to our format
      const existingData = {};
      Object.keys(attendanceData).forEach(dateKey => {
        const dayData = attendanceData[dateKey];
        if (dayData.isPresent !== undefined) {
          if (dayData.isLeaveApproved) {
            existingData[dateKey] = 'paid-leave';
          } else if (dayData.isHalfDay) {
            existingData[dateKey] = 'half-day';
          } else if (dayData.isPresent) {
            existingData[dateKey] = 'present';
          } else {
            existingData[dateKey] = 'absent';
          }
        }
      });
      
      setExistingAttendance(existingData);
      setMarkedStatuses(existingData); // Initialize with existing data
      
      // Load leave quota for the employee
      try {
        const employee = employees.find(e => String(e._id) === employeeId);
        if (employee?.organizationId) {
          const quotaRes = await leaveApi.getLeaveQuota(employeeId, employee.organizationId);
          setLeaveQuota(quotaRes?.data || quotaRes);
        }
      } catch (quotaErr) {
        console.error('Failed to load leave quota', quotaErr);
        // Don't show error toast for quota as it's not critical for calendar display
      }
      
    } catch (err) {
      console.error('Failed to load calendar data', err);
      toast.error('Failed to load calendar data');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    // Seed preview employee for calendar marking
    if (!calendarEmployeeId && employees.length > 0) {
      setCalendarEmployeeId(String(employees[0]._id));
    }
  }, [employees, calendarEmployeeId]);

  // Load calendar data when employee or month changes
  useEffect(() => {
    if (calendarEmployeeId) {
      loadCalendarData(calendarEmployeeId);
    }
  }, [calendarEmployeeId, calendarMonth]);

  const presentDates = useMemo(() => (
    Object.keys(markedStatuses)
      .filter((k) => markedStatuses[k] === 'present')
      .map((k) => new Date(`${k}T00:00:00`))
  ), [markedStatuses]);

  const absentDates = useMemo(() => (
    Object.keys(markedStatuses)
      .filter((k) => markedStatuses[k] === 'absent')
      .map((k) => new Date(`${k}T00:00:00`))
  ), [markedStatuses]);

  const halfDates = useMemo(() => (
    Object.keys(markedStatuses)
      .filter((k) => markedStatuses[k] === 'half-day')
      .map((k) => new Date(`${k}T00:00:00`))
  ), [markedStatuses]);

  const paidLeaveDates = useMemo(() => (
    Object.keys(markedStatuses)
      .filter((k) => markedStatuses[k] === 'paid-leave')
      .map((k) => new Date(`${k}T00:00:00`))
  ), [markedStatuses]);

  // Check if a date is a holiday
  const isHoliday = (date) => {
    const dateStr = formatDateKey(date);
    return holidays.some(evt => {
      const evtDate = new Date(evt.date);
      return formatDateKey(evtDate) === dateStr;
    });
  };

  // Check if a date is a working day
  const isWorkingDay = (date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    // Get base working day setting
    const baseWorking = workingDays[dayName] === true;
    if (!baseWorking) return false;
    
    // Check for specific weekday rules from workingSettings
    const weekdayRules = workingSettings?.weekdayRules || {};
    const saturdayRule = workingSettings?.saturdayRule || 'none';
    
    // Get the rule for this day (use saturdayRule for Saturday if no specific rule)
    const dayRule = weekdayRules[dayName]?.rule || (dayName === 'saturday' ? saturdayRule : 'all');
    
    // Handle different rules
    if (dayRule === 'none') return false;
    if (dayRule === 'all') return true;
    
    // Handle odd/even rules (for alternate Saturdays or other days)
    if (dayRule === 'odd' || dayRule === 'even') {
      // Calculate which occurrence of this weekday in the month
      const year = date.getFullYear();
      const month = date.getMonth();
      const dayOfWeek = date.getDay();
      
      // Find the first occurrence of this weekday in the month
      const firstOfMonth = new Date(year, month, 1);
      const firstWeekday = firstOfMonth.getDay();
      const daysToFirstOccurrence = (dayOfWeek - firstWeekday + 7) % 7;
      const firstOccurrenceDate = 1 + daysToFirstOccurrence;
      
      // Calculate which occurrence this date is (1st, 2nd, 3rd, etc.)
      const currentDate = date.getDate();
      const occurrenceNumber = Math.floor((currentDate - firstOccurrenceDate) / 7) + 1;
      
      // Check if this occurrence matches the rule
      const isOddOccurrence = occurrenceNumber % 2 === 1;
      return dayRule === 'odd' ? isOddOccurrence : !isOddOccurrence;
    }
    
    return true;
  };

  // Get disabled dates (holidays and non-working days)
  const disabledDates = useMemo(() => {
    const disabled = [];
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // Get all dates in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (isHoliday(date) || !isWorkingDay(date)) {
        disabled.push(date);
      }
    }
    return disabled;
  }, [holidays, workingDays, calendarMonth]);

  const handlePaidLeaveConfirm = async () => {
    try {
      if (!pendingLeaveDate || !calendarEmployeeId) {
        toast.error('Missing required information for leave marking');
        return;
      }

      const employee = employees.find(e => String(e._id) === calendarEmployeeId);
      if (!employee) {
        toast.error('Employee not found');
        return;
      }

      // Validate leave quota
      if (leaveQuota) {
        const leaveTypeQuota = leaveQuota.find(q => q.leaveType === selectedLeaveType);
        if (leaveTypeQuota) {
          const remaining = leaveTypeQuota.totalDays - leaveTypeQuota.usedDays;
          if (remaining <= 0) {
            toast.error(`No ${selectedLeaveType} leave quota remaining. Available: ${remaining} days`);
            return;
          }
          if (remaining < 1) {
            toast.error(`Insufficient ${selectedLeaveType} leave quota. Available: ${remaining} days`);
            return;
          }
        } else {
          toast.warning(`No quota information found for ${selectedLeaveType} leave type`);
        }
      }

      // Create leave application
      const leaveData = {
        leaveType: selectedLeaveType,
        startDate: pendingLeaveDate,
        endDate: pendingLeaveDate,
        isHalfDay: false,
        reason: `HR marked ${selectedLeaveType} leave`,
        requestedDaysDetails: [{
          date: pendingLeaveDate,
          isHalfDay: false,
          halfDayPeriod: null
        }]
      };

      await leaveApi.applyLeave(employee._id, employee.organizationId, leaveData);
      
      // Auto-approve the leave
      const leaves = await leaveApi.getEmployeeLeaves(employee._id, { status: 'pending' });
      const pendingLeave = leaves?.leaves?.find(l => 
        l.startDate === pendingLeaveDate && l.endDate === pendingLeaveDate && l.leaveType === selectedLeaveType
      );
      
      if (pendingLeave) {
        await leaveApi.processLeaveRequest(pendingLeave._id, {
          status: 'approved',
          approvedDays: 1,
          payStatus: selectedLeaveType === 'paid' ? 'paid' : 'unpaid',
          approvedDaysDetails: [{
            date: pendingLeaveDate,
            isHalfDay: false,
            halfDayPeriod: null,
            approved: true
          }]
        });
      }
      
      // Update marked statuses
      setMarkedStatuses((prev) => ({ ...prev, [pendingLeaveDate]: 'paid-leave' }));
      
      // Refresh leave quota
      try {
        const quotaRes = await leaveApi.getLeaveQuota(calendarEmployeeId, employee.organizationId);
        setLeaveQuota(quotaRes?.data || quotaRes);
      } catch (quotaErr) {
        console.error('Failed to refresh leave quota', quotaErr);
      }
      
      toast.success(`${selectedLeaveType.charAt(0).toUpperCase() + selectedLeaveType.slice(1)} leave marked for ${pendingLeaveDate} and quota updated`);
      
      // Close dialog
      setShowLeaveTypeDialog(false);
      setPendingLeaveDate(null);
      
    } catch (err) {
      console.error('Failed to mark paid leave', err);
      toast.error(err?.response?.data?.message || 'Failed to mark paid leave');
    }
  };

  const handleDayClick = async (day) => {
    try {
      if (!calendarEmployeeId) {
        toast.error('Select an employee to mark on calendar');
        return;
      }

      // Check if date is disabled
      if (disabledDates.some(disabledDate => 
        disabledDate.getTime() === day.getTime()
      )) {
        toast.error('Cannot mark attendance on holidays or non-working days');
        return;
      }

      const key = formatDateKey(day);
      
      if (quickStatus === 'paid-leave') {
        // Handle paid leave - show leave type selection dialog
        setPendingLeaveDate(key);
        setShowLeaveTypeDialog(true);
        return;
      } else {
        // Handle regular attendance
        // FIX: use linked userId instead of employeeId to avoid duplicate records
        const employee = employees.find(e => String(e._id) === calendarEmployeeId);
        const targetUserId = employee?.userId?._id ? String(employee.userId._id) : null;
        if (!targetUserId) {
          toast.error('Selected employee has no linked userId');
          return;
        }
        await attendanceApi.adminSetStatusForUser(targetUserId, { date: key, status: quickStatus, notes });
        toast.success(`Marked ${quickStatus.replace('-', ' ')} for ${key}`);
      }
      
      setMarkedStatuses((prev) => ({ ...prev, [key]: quickStatus }));
    } catch (err) {
      console.error('Failed to mark day', err);
      toast.error(err?.response?.data?.message || 'Failed to mark day');
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await employeeApi.details.getAllEmployees({ page: 1, limit: 200, status: 'active' });
        const list = res?.data?.employees || [];
        setEmployees(list);
        if (applyToAll) {
          setSelectedUserIds(new Set());
        }
      } catch (err) {
        console.error('Failed to load employees', err);
        setError(err?.response?.data?.message || 'Failed to load employees');
        toast.error(err?.response?.data?.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [applyToAll]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const t = searchTerm.toLowerCase();
    return employees.filter((e) => {
      const name = `${e.userId?.firstName || ''} ${e.userId?.lastName || ''}`.toLowerCase();
      const email = (e.userId?.email || '').toLowerCase();
      const empId = (e.baseInfo?.employeeId || '').toLowerCase();
      return name.includes(t) || email.includes(t) || empId.includes(t);
    });
  }, [employees, searchTerm]);

  const toggleSelect = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const ids = filteredEmployees.map((e) => String(e.userId?._id));
    setSelectedUserIds(new Set(ids));
  };

  const clearSelection = () => setSelectedUserIds(new Set());

  const handleSubmit = async () => {
    try {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        toast.error('Please select a valid date (YYYY-MM-DD)');
        return;
      }
      if (!['present','absent','half-day','paid-leave'].includes(status)) {
        toast.error('Select a valid status: present, absent, half-day, or paid leave');
        return;
      }

      setSubmitting(true);
      
      if (status === 'paid-leave') {
        // Handle paid leave for bulk operations
        let targetEmployees = [];
        if (applyToAll) {
          targetEmployees = employees.filter(e => e.baseInfo?.status === 'active');
        } else {
          const ids = Array.from(selectedUserIds).filter(Boolean);
          if (ids.length === 0) {
            toast.error('Please select at least one user');
            return;
          }
          targetEmployees = employees.filter(e => ids.includes(String(e.userId?._id)));
        }

        let successCount = 0;
        let failCount = 0;

        for (const employee of targetEmployees) {
          try {
            // Create leave application
            const leaveData = {
              leaveType: 'paid',
              startDate: date,
              endDate: date,
              isHalfDay: false,
              reason: notes || 'HR marked paid leave',
              requestedDaysDetails: [{
                date: date,
                isHalfDay: false,
                halfDayPeriod: null
              }]
            };

            await leaveApi.applyLeave(employee._id, employee.organizationId, leaveData);
            
            // Auto-approve the leave
            const leaves = await leaveApi.getEmployeeLeaves(employee._id, { status: 'pending' });
            const pendingLeave = leaves?.leaves?.find(l => 
              l.startDate === date && l.endDate === date && l.leaveType === 'paid'
            );
            
            if (pendingLeave) {
              await leaveApi.processLeaveRequest(pendingLeave._id, {
                status: 'approved',
                approvedDays: 1,
                payStatus: 'paid',
                approvedDaysDetails: [{
                  date: date,
                  isHalfDay: false,
                  halfDayPeriod: null,
                  approved: true
                }]
              });
            }
            successCount++;
          } catch (err) {
            console.error(`Failed to mark paid leave for employee ${employee._id}`, err);
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Paid leave marked for ${successCount} employee(s) and quotas updated`);
        }
        if (failCount > 0) {
          toast.error(`Failed to mark paid leave for ${failCount} employee(s)`);
        }
      } else {
        // Handle regular attendance
        if (applyToAll) {
          const res = await attendanceApi.adminBulkSetStatus({ date, status, notes, all: true });
          toast.success(res?.message || 'Attendance marked for all active users');
        } else {
          const ids = Array.from(selectedUserIds).filter(Boolean);
          if (ids.length === 0) {
            toast.error('Please select at least one user');
            return;
          }
          const res = await attendanceApi.adminBulkSetStatus({ date, status, notes, userIds: ids, all: false });
          toast.success(res?.message || `Attendance marked for ${ids.length} user(s)`);
        }
      }
    } catch (err) {
      console.error('Failed to set attendance status', err);
      toast.error(err?.response?.data?.message || 'Failed to set attendance status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Marking</h1>
            <p className="text-gray-600">Set present / absent / half-day for any date</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="mb-1 block">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                  <SelectItem value="paid-leave">Paid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block">Notes (optional)</Label>
              <Input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. HR override due to manual correction" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="applyAll" checked={applyToAll} onCheckedChange={(checked) => setApplyToAll(!!checked)} />
              <Label htmlFor="applyAll" className="text-sm">Apply to all active users</Label>
            </div>
            {!applyToAll && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllFiltered}>Select all in list</Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>Clear selection</Button>
              </div>
            )}
          </div>
          <div className="mt-6">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</span>
              ) : (
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Mark Attendance</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Calendar: user-specific and click-to-mark */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Calendar (Quick Mark)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label className="block">Employee</Label>
              <Select value={calendarEmployeeId} onValueChange={setCalendarEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={String(e._id)}>
                      {(e.baseInfo?.employeeId ? `${e.baseInfo.employeeId} - ` : '')}{e.userId?.firstName} {e.userId?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label className="block">Status to mark</Label>
              <RadioGroup value={quickStatus} onValueChange={setQuickStatus} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="present" id="qs-present" />
                  <Label htmlFor="qs-present">Present</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="absent" id="qs-absent" />
                  <Label htmlFor="qs-absent">Absent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="half-day" id="qs-half" />
                  <Label htmlFor="qs-half">Half Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid-leave" id="qs-paid" />
                  <Label htmlFor="qs-paid">Paid Leave</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">Click a date to apply the selected status.</p>
            </div>

            <div className="md:col-span-2">
              {calendarLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading calendar data...</span>
                </div>
              ) : (
                <>
                  <Calendar
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onDayClick={handleDayClick}
                    disabled={disabledDates}
                    modifiers={{
                      present: presentDates,
                      absent: absentDates,
                      half: halfDates,
                      paidLeave: paidLeaveDates,
                    }}
                    modifiersClassNames={{
                      present: "bg-green-200 text-green-900",
                      absent: "bg-red-200 text-red-900",
                      half: "bg-yellow-200 text-yellow-900",
                      paidLeave: "bg-blue-200 text-blue-900",
                    }}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">Present</Badge>
                    <Badge variant="outline" className="bg-red-100 text-red-800">Absent</Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Half Day</Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Paid Leave</Badge>
                  </div>
                  {disabledDates.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Grayed out dates are holidays or non-working days and cannot be marked.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee selection */}
      {!applyToAll && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Select Employees</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, ID" className="pl-8 pr-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <XCircle className="h-10 w-10 mx-auto text-red-600" />
              <p className="mt-2 text-red-600">{error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">No matching employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {
                    const uid = String(employee.userId?._id);
                    const isSelected = selectedUserIds.has(uid);
                    return (
                      <tr key={employee._id} className={isSelected ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(uid)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.baseInfo?.employeeId || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.userId?.firstName} {employee.userId?.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.userId?.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leave Type Selection Dialog */}
      <Dialog open={showLeaveTypeDialog} onOpenChange={setShowLeaveTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Leave Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Date: {pendingLeaveDate}</Label>
            </div>
            
            {/* Leave Quota Display */}
            {leaveQuota && leaveQuota.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <Label className="text-sm font-medium mb-2 block">Available Leave Quota:</Label>
                <div className="space-y-1">
                  {leaveQuota.map((quota) => {
                    const remaining = quota.totalDays - quota.usedDays;
                    return (
                      <div key={quota.leaveType} className="flex justify-between text-sm">
                        <span className="capitalize">{quota.leaveType}:</span>
                        <span className={remaining > 0 ? 'text-green-600' : 'text-red-600'}>
                          {remaining} / {quota.totalDays} days
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Leave Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Leave Type:</Label>
              <RadioGroup value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid">Paid Leave</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sick" id="sick" />
                  <Label htmlFor="sick">Sick Leave</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual">Casual Leave</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual">Annual Leave</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpaid" id="unpaid" />
                  <Label htmlFor="unpaid">Unpaid Leave</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaidLeaveConfirm}>
              Confirm Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRAttendanceMarking;