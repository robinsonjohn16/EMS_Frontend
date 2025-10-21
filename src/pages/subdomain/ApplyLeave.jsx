import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar } from '../../components/ui/calendar';
import calendarApi from '../../services/calendarApi';
import attendanceApi from '../../services/attendanceApi';

import attendanceConfigApi from '../../services/attendanceConfigApi';
import leaveApi from '../../services/leaveApi';
import { employeeDetailsApi } from '../../services/employeeApi';
import { tenantOrganizationApi, tenantUtils } from '../../services/tenantApi';
import { Link } from 'react-router-dom';
import userAttendanceConfigApi from '../../services/userAttendanceConfigApi';

const ApplyLeave = () => {
  const { user } = useSelector((state) => state.tenantAuth);

  const [loadingContext, setLoadingContext] = useState(true);
  const [userId, setUserId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  const [policy, setPolicy] = useState(null);
  const [quota, setQuota] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [form, setForm] = useState({
    leaveType: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  // Calendar multi-select state
  const [selectedDates, setSelectedDates] = useState([]);
  const [dayDetails, setDayDetails] = useState({}); // { 'YYYY-MM-DD': { isHalfDay: boolean, halfDayPeriod: 'morning'|'afternoon' } }
  const [disabledLeaveDates, setDisabledLeaveDates] = useState([]);
  const [disabledNonWorkingDates, setDisabledNonWorkingDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const startDateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
        const endDateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
        const start = startDateObj.toISOString().split('T')[0];
        const end = endDateObj.toISOString().split('T')[0];
        const data = await calendarApi.getCalendarData({
          start,
          end,
          employeeId: userId ? String(userId) : undefined,
        });
        const disabled = [];
        (data?.leaveEvents || []).forEach((ev) => {
          if (ev.status === 'approved') {
            if (ev.specificDay) {
              disabled.push(new Date(ev.start));
            } else {
              const s = new Date(ev.start);
              const e = new Date(ev.end);
              for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
                disabled.push(new Date(d));
              }
            }
          }
        });
        setDisabledLeaveDates(disabled);
      } catch (_) {}
    };
    if (userId && organizationId) {
      loadCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, organizationId, calendarMonth]);

  // Fetch attendance config and calculate non-working days properly
  const [attendanceSettings, setAttendanceSettings] = useState(null);
  
  useEffect(() => {
    const loadAttendanceConfig = async () => {
      try {
        const cfgRes = await attendanceConfigApi.get();
        const cfg = cfgRes?.data?.data || cfgRes?.data || cfgRes;
        setAttendanceSettings(cfg);
      } catch (err) {
        console.error('Failed to load attendance config', err);
      }
    };
    if (userId && organizationId) {
      loadAttendanceConfig();
    }
  }, [userId, organizationId]);

  // Calculate non-working days and holidays using proper weekday rules
  useEffect(() => {
    const calculateNonWorkingDates = () => {
      if (!attendanceSettings) return;
      
      const disabled = [];
      const startDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
      const endDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
      
      const rules = attendanceSettings.weekdayRules || {};
      const satRule = attendanceSettings.saturdayRule || 'none';
      const wd = attendanceSettings.workingDays || {};
      
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      
      while (d <= endDate) {
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const rule = (rules?.[weekday]?.rule ?? (wd[weekday] === false ? 'none' : (weekday === 'saturday' ? satRule : 'all')));
        
        let isWorking = rule !== 'none';
        if (rule === 'odd' || rule === 'even') {
          const year = d.getFullYear();
          const month = d.getMonth();
          const firstOfMonth = new Date(year, month, 1);
          const dow = d.getDay();
          const offset = (dow - firstOfMonth.getDay() + 7) % 7;
          const firstOccurrenceDate = 1 + offset;
          const occurrenceIndex = Math.floor((d.getDate() - firstOccurrenceDate) / 7) + 1;
          const isOddOccurrence = occurrenceIndex % 2 === 1;
          isWorking = rule === 'odd' ? isOddOccurrence : !isOddOccurrence;
        }
        
        if (!isWorking) {
          disabled.push(new Date(d));
        }
        
        d.setDate(d.getDate() + 1);
      }
      
      setDisabledNonWorkingDates(disabled);
    };
    
    calculateNonWorkingDates();
  }, [calendarMonth, attendanceSettings]);

  // Fetch holidays from calendar API
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const startDateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
        const endDateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
        const start = startDateObj.toISOString().split('T')[0];
        const end = endDateObj.toISOString().split('T')[0];
        
        const data = await calendarApi.getCalendarData({
          start,
          end,
          employeeId: userId ? String(userId) : undefined,
        });
        
        const holidayDisabled = [];
        (data?.holidayEvents || []).forEach((holiday) => {
          const holidayDate = new Date(holiday.start);
          holidayDisabled.push(holidayDate);
        });
        
        setDisabledNonWorkingDates(prev => [...prev, ...holidayDisabled]);
      } catch (err) {
        console.error('Failed to load holidays', err);
      }
    };
    
    if (userId && organizationId && attendanceSettings) {
      loadHolidays();
    }
    }, [calendarMonth, userId, organizationId, attendanceSettings]);

  // Replace standalone init and stray hook closure with a proper useEffect
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingContext(true);
        // Removed start/end date initialization; multi-date calendar selection will drive the range.
  
        const userId = user?._id || user?.id || user?.userId;
        // Since employeeId now references TenantUser directly, we use userId
        setUserId(userId ? String(userId) : null);
  
        let orgId = user?.organization?._id || user?.organization?._id || user?.organizationId || user?.organization;
        if (!orgId) {
          const sub = tenantUtils.getSubdomain();
          if (sub) {
            try {
              const resp = await tenantOrganizationApi.getBySubdomain(sub);
              const org = resp?.data?.data || resp?.data || resp;
              orgId = org?._id || org?.id || org?.organizationId || org?.organization?._id;
            } catch (err) {
              console.error('Failed to load organization by subdomain', err);
            }
          }
        }
        setOrganizationId(orgId ? String(orgId) : null);
  
        try {
          let effectivePolicy = null;
          if (userId) {
            try {
              const userCfgRes = await userAttendanceConfigApi.get(String(userId));
              const userCfg = userCfgRes?.data?.data || userCfgRes?.data || userCfgRes;
              effectivePolicy = userCfg?.leavePolicy || userCfg?.policy?.leavePolicy || null;
            } catch (err) {
              // No user-specific override; continue to org-level
            }
          }

          if (!effectivePolicy) {
            const cfgRes = await attendanceConfigApi.get();
            const cfg = cfgRes?.data?.data || cfgRes?.data || cfgRes;
            effectivePolicy = cfg?.leavePolicy || null;
          }

          setPolicy(
            effectivePolicy || { sick: { perYearDays: 0, carryForward: false }, paid: { perYearDays: 0, carryForward: false }, customTypes: [] }
          );
        } catch (err) {
          console.error('Failed to load attendance config', err);
          setPolicy({ sick: { perYearDays: 0, carryForward: false }, paid: { perYearDays: 0, carryForward: false }, customTypes: [] });
        }
  
        if (userId && orgId) {
          try {
            const q = await leaveApi.getLeaveQuota(String(userId), String(orgId));
            setQuota(q?.data?.data?.leaveQuota || q?.data?.leaveQuota || q?.leaveQuota || q);
          } catch (err) {
            console.error('Failed to load leave quota', err);
          }

          // Load pending leaves
          try {
            const leaves = await leaveApi.getEmployeeLeaves(String(userId), { status: 'pending' });
-            setPendingLeaves(leaves?.data || leaves || []);
+            setPendingLeaves(leaves?.data?.leaves || leaves?.leaves || leaves?.data || leaves || []);
          } catch (err) {
            console.error('Failed to load pending leaves', err);
          }
        }
      } catch (err) {
        console.error('Initialization error', err);
        toast.error('Failed to initialize leave form');
      } finally {
        setLoadingContext(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const leaveTypeOptions = useMemo(() => {
    if (!policy) return [];
    const opts = [
      { value: 'sick', label: 'Sick Leave' },
      { value: 'paid', label: 'Paid Leave' },
      { value: 'unpaid', label: 'Non-Paid Leave' },
    ];
    (policy.customTypes || []).forEach((ct) => {
      if (!ct?.code) return;
      opts.push({ value: String(ct.code), label: ct.label || String(ct.code) });
    });
    return opts;
  }, [policy]);

  const selectedQuota = useMemo(() => {
    const type = form.leaveType;
    return (quota?.quotas || []).find((q) => String(q.leaveType) === String(type));
  }, [quota, form.leaveType]);

  const requestedDays = useMemo(() => {
    if (selectedDates.length === 0) return 0;
    try {
      return selectedDates.reduce((sum, d) => {
        const key = d.toISOString().split('T')[0];
        const det = dayDetails[key];
        return sum + (det?.isHalfDay ? 0.5 : 1);
      }, 0);
    } catch {
      return 0;
    }
  }, [selectedDates, dayDetails]);

  const handleSubmit = async () => {
    try {
      if (!userId || !organizationId) {
        toast.error('Missing employee or organization context');
        return;
      }
      if (!form.leaveType) {
        toast.error('Select a leave type');
        return;
      }
      if (selectedDates.length === 0) {
        toast.error('Select at least one day');
        return;
      }
      if (!form.reason || form.reason.trim().length < 4) {
        toast.error('Please provide a brief reason');
        return;
      }

      const sorted = [...selectedDates].sort((a, b) => a - b);
      const startBound = sorted[0].toISOString().split('T')[0];
      const endBound = sorted[sorted.length - 1].toISOString().split('T')[0];
      const requestedDaysDetails = sorted.map((d) => {
        const key = d.toISOString().split('T')[0];
        const det = dayDetails[key] || {};
        return {
          date: key,
          isHalfDay: !!det.isHalfDay,
          halfDayPeriod: det.isHalfDay ? (det.halfDayPeriod || 'morning') : null,
        };
      });

      const payload = {
        leaveType: form.leaveType,
        reason: form.reason.trim(),
        startDate: startBound,
        endDate: endBound,
        requestedDaysDetails,
      };

      setSubmitting(true);
      const res = await leaveApi.applyLeave(String(userId), String(organizationId), payload);
      toast.success(res?.message || 'Leave request submitted');

      // Refresh quota after submission
      try {
        const q = await leaveApi.getLeaveQuota(String(userId), String(organizationId));
        setQuota(q?.data?.data?.leaveQuota || q?.data?.leaveQuota || q?.leaveQuota || q);
      } catch (_) {}

      // Clear selection
      setSelectedDates([]);
      setDayDetails({});
    } catch (err) {
      console.error('Apply leave failed', err);
      toast.error(err?.response?.data?.message || 'Failed to submit leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Apply Leave</CardTitle>
              <CardDescription>Submit a leave request for approval</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link to="/work-calendar">View Calendar</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingContext ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={form.leaveType} onValueChange={(val) => setForm((p) => ({ ...p, leaveType: val }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
  
              {/* New: Multi-date selection calendar */}
              <div className="space-y-2">
                <Label>Select Days (optional)</Label>
                <Calendar
                  mode="multiple"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  disabled={[...disabledLeaveDates, ...disabledNonWorkingDates]}
                />
                {selectedDates.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {selectedDates.map((d) => {
                      const key = d.toISOString().split('T')[0];
                      const det = dayDetails[key] || { isHalfDay: false, halfDayPeriod: 'morning' };
                      return (
                        <div key={key} className="flex items-center gap-3 text-sm">
                          <div className="w-32">{key}</div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`half-${key}`}
                              checked={!!det.isHalfDay}
                              onCheckedChange={(v) => setDayDetails((p) => ({
                                ...p,
                                [key]: { ...det, isHalfDay: !!v, halfDayPeriod: !!v ? (det.halfDayPeriod || 'morning') : null },
                              }))}
                            />
                            <Label htmlFor={`half-${key}`}>Half Day</Label>
                          </div>
                          {!!det.isHalfDay && (
                            <div className="w-40">
                              <Select
                                value={det.halfDayPeriod || 'morning'}
                                onValueChange={(val) => setDayDetails((p) => ({
                                  ...p,
                                  [key]: { ...det, halfDayPeriod: val },
                                }))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">Morning</SelectItem>
                                  <SelectItem value="afternoon">Afternoon</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
  
              {/* Date range inputs removed — use calendar multi-select */}
  
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea rows={4} placeholder="Brief reason for leave" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
              </div>
  
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>Requested: {requestedDays} day{requestedDays === 1 ? '' : 's'}</div>
                {selectedQuota && (
                  <div>
                    Remaining ({form.leaveType || '—'}): {selectedQuota.remaining ?? 0} days
                  </div>
                )}
              </div>
  
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={submitting || !userId || !organizationId || !form.leaveType}>
                  {submitting ? 'Submitting…' : 'Submit Leave Request'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  
      <Card>
        <CardHeader>
          <CardTitle>Leave Quota {quota?.year ? `(${quota.year})` : ''}</CardTitle>
          <CardDescription>Used, pending, remaining by type</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingContext ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
            <div className="space-y-3">
              {(quota?.quotas || []).length === 0 && (
                <div className="text-sm text-muted-foreground">No quota data available.</div>
              )}
              {(quota?.quotas || []).map((q) => (
                <div key={q.leaveType} className="flex items-center justify-between">
                  <div className="font-medium capitalize">{q.leaveType}</div>
                  <div className="text-sm text-muted-foreground">
                    Total: {q.total ?? 0} • Used: {q.used ?? 0} • Pending: {q.pending ?? 0} • Remaining: {q.remaining ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
  
      <Card>
        <CardHeader>
          <CardTitle>Pending Leaves</CardTitle>
          <CardDescription>Your leave requests awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingContext ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave._id || leave.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium capitalize">{leave.leaveType}</div>
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {leave.status || 'Pending'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leave.startDate} to {leave.endDate}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leave.requestedDays || 1} day{(leave.requestedDays || 1) === 1 ? '' : 's'}
                  </div>
                  {leave.reason && (
                    <div className="text-sm mt-1 text-gray-600">
                      {leave.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No pending leave requests</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Policy (Organization)</CardTitle>
          <CardDescription>Annual limits configured by HR</CardDescription>
        </CardHeader>
        <CardContent>
          {policy ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sick Leave</div>
                <div className="text-sm text-muted-foreground">{policy?.sick?.perYearDays || 0} days {policy?.sick?.carryForward ? '• CF' : ''}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">Paid Leave</div>
                <div className="text-sm text-muted-foreground">{policy?.paid?.perYearDays || 0} days {policy?.paid?.carryForward ? '• CF' : ''}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">Non-Paid Leave</div>
                <div className="text-sm text-muted-foreground">Unlimited</div>
              </div>
              {(policy.customTypes || []).map((ct) => (
                <div key={ct.code} className="flex items-center justify-between">
                  <div className="font-medium">{ct.label || ct.code}</div>
                  <div className="text-sm text-muted-foreground">{ct.perYearDays || 0} days {ct.carryForward ? '• CF' : ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading policy…</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;