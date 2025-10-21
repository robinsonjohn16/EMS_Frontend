import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import calendarApi from '../../services/calendarApi';
import { employeeDetailsApi } from '../../services/employeeApi';
import attendanceConfigApi from '../../services/attendanceConfigApi';
import { userAttendanceConfigApi } from '../../services/userAttendanceConfigApi';
import attendanceApi from '../../services/attendanceApi';

import { useSelector } from 'react-redux';

const WorkCalendar = () => {
  const { user } = useSelector((state) => state.tenantAuth);
  const isHROrManager = user && (user.role === 'hr' || user.role === 'manager');

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [calendarRange, setCalendarRange] = useState(() => {
    const start = new Date();
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    return { start, end };
  });

  const [events, setEvents] = useState([]);
  const [quota, setQuota] = useState({ year: new Date().getFullYear(), quotas: [] });
  const [meta, setMeta] = useState({ timezone: 'UTC' });
  const [workingSettings, setWorkingSettings] = useState(null);
  const [orgPolicy, setOrgPolicy] = useState(null);
  const [effectivePolicy, setEffectivePolicy] = useState(null);

  // Attendance state
  const [monthlyAttendance, setMonthlyAttendance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState(null);

  // Track last fetched range+employee to prevent duplicate requests
  const lastFetchKeyRef = useRef(null);
  const lastMonthlyKeyRef = useRef('');

  const buildHiddenDays = useCallback((settings) => {
    if (!settings) return [];
    const wd = settings.workingDays || {};
    const rules = settings.weekdayRules || {};
    const satRule = settings.saturdayRule || 'none';

    const hidden = [];
    // Sunday
    if (wd.sunday === false) hidden.push(0);
    // Monday-Friday
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    days.forEach((d, i) => {
      const rule = rules[d]?.rule ?? (wd[d] === false ? 'none' : 'all');
      if (rule === 'none' || wd[d] === false) hidden.push(i + 1); // Monday=1
    });
    // Saturday
    if (wd.saturday === false || satRule === 'none') hidden.push(6);

    return hidden;
  }, []);

  const buildNonWorkingBackgroundEvents = useCallback((start, end, settings) => {
    if (!settings) return [];
    const rules = settings.weekdayRules || {};
    const satRule = settings.saturdayRule || 'none';
    const wd = settings.workingDays || {};

    const formatLocalDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const events = [];
    const d = new Date(start);
    d.setHours(0,0,0,0);
    const endDate = new Date(end);
    endDate.setHours(0,0,0,0);

    while (d <= endDate) {
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const rule = (rules?.[weekday]?.rule ?? (wd[weekday] === false ? 'none' : (weekday === 'saturday' ? satRule : 'all')));

      let isWorking = rule !== 'none';
      if (rule === 'odd' || rule === 'even') {
        const year = d.getFullYear();
        const month = d.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const dow = d.getDay(); // 0-6
        const offset = (dow - firstOfMonth.getDay() + 7) % 7; // days to first occurrence of this weekday
        const firstOccurrenceDate = 1 + offset;
        const occurrenceIndex = Math.floor((d.getDate() - firstOccurrenceDate) / 7) + 1; // 1-based occurrence within month
        const isOddOccurrence = occurrenceIndex % 2 === 1;
        isWorking = rule === 'odd' ? isOddOccurrence : !isOddOccurrence;
      }

      if (!isWorking) {
        events.push({
          id: `nonwork-${formatLocalDate(d)}`,
          title: 'Non-working Day',
          start: formatLocalDate(d),
          allDay: true,
          display: 'background',
          backgroundColor: '#fde68a',
          borderColor: '#f59e0b'
        });
      } else if (rule === 'half') {
        events.push({
          id: `halfday-${formatLocalDate(d)}`,
          title: 'Half Working Day',
          start: formatLocalDate(d),
          allDay: true,
          display: 'background',
          backgroundColor: '#e2e8f0',
          borderColor: '#cbd5e1'
        });
      }

      d.setDate(d.getDate() + 1);
    }

    return events;
  }, []);

  const fetchCalendar = useCallback(async (start, end, employeeId) => {
    const key = `${start.toISOString().split('T')[0]}|${end.toISOString().split('T')[0]}|${employeeId || ''}`;
    if (lastFetchKeyRef.current === key) {
      return; // Skip duplicate fetch for same parameters
    }
    lastFetchKeyRef.current = key;

    setLoading(true);
    try {
      const data = await calendarApi.getCalendarData({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        employeeId: employeeId || undefined,
      });

      const toDateOnly = (v) => {
        if (!v) return undefined;
        const formatLocalDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };
        if (typeof v === 'string') {
          const m = v.match(/^\d{4}-\d{2}-\d{2}/);
          return m ? m[0] : formatLocalDate(new Date(v));
        }
        try {
          return formatLocalDate(new Date(v));
        } catch {
          return undefined;
        }
      };

      const holidayEvents = (data.events?.holidays || []).map(h => ({
        id: `holiday-${h.id}`,
        title: h.title,
        start: toDateOnly(h.date || h.start),
        allDay: true,
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        textColor: '#0f172a'
      })).filter(e => !!e.start);

      const leaveEvents = (data.events?.leaves || []).map(l => ({
        id: `leave-${l.id}`,
        title: l.title,
        start: l.start,
        end: l.end,
        allDay: true,
        backgroundColor: l.status === 'approved' ? '#dcfce7' : l.status === 'pending' ? '#fef9c3' : '#fee2e2',
        borderColor: l.status === 'approved' ? '#22c55e' : l.status === 'pending' ? '#eab308' : '#ef4444',
        textColor: '#0f172a'
      }));

      const settings = data.workingSettings || null;
      setWorkingSettings(settings);

      const nonWorking = buildNonWorkingBackgroundEvents(start, end, settings);

      setEvents((prev) => {
        const prevAttendance = prev.filter((e) => e.id && String(e.id).startsWith('att-'));
        return [...nonWorking, ...holidayEvents, ...leaveEvents, ...prevAttendance];
      });
      setQuota(data.quota || { year: new Date().getFullYear(), quotas: [] });
      setMeta(data.meta || { timezone: 'UTC' });

      // If backend provides effective policy in meta, prefer it
      if (data.meta?.effectiveLeavePolicy) {
        setEffectivePolicy(data.meta.effectiveLeavePolicy);
      }
    } catch (e) {
      console.error('Failed to load calendar data', e);
    } finally {
      setLoading(false);
    }
  }, [buildNonWorkingBackgroundEvents]);

  // Attendance helpers
  const formatDateKey = useCallback((date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Build attendance summary events to render on calendar
  const buildAttendanceEvents = useCallback((doc, start, end) => {
    if (!doc?.days) return [];
    const startDate = new Date(start);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(end);
    endDate.setHours(0,0,0,0);

    return Object.keys(doc.days).sort().filter((dk) => {
      const d = new Date(`${dk}T00:00:00`);
      return d >= startDate && d <= endDate;
    }).map((dk) => {
      const day = doc.days[dk];
      const hasCheckIn = !!day?.checkIn;
      const isWorking = day?.workingDay && !day?.isHoliday;

      let status = '';
      let backgroundColor = '#94a3b8'; // slate for default/non-working
      let borderColor = '#64748b';

      if (day?.isHoliday) {
        status = day.holidayName ? `Holiday • ${day.holidayName}` : 'Holiday';
        backgroundColor = '#fef3c7';
        borderColor = '#f59e0b';
      }else if(day.isPresent){
        status = 'Present';
        backgroundColor = '#dcfce7';
        borderColor = '#22c55e';
      } 
      else if (!isWorking) {
        status = 'Non-working';
        backgroundColor = '#e2e8f0';
        borderColor = '#cbd5e1';
      } else if (hasCheckIn) {
        status = day.checkIn.withinGrace ? 'On time' : `Late ${day.checkIn.minutesLate}m`;
        if (day.outsideGeofence) status += ' • Outside geofence';
        backgroundColor = day.outsideGeofence ? '#fee2e2' : (day.checkIn.withinGrace ? '#dcfce7' : '#fef9c3');
        borderColor = day.outsideGeofence ? '#ef4444' : (day.checkIn.withinGrace ? '#22c55e' : '#eab308');
      } else {
        status = 'Absent';
        backgroundColor = '#fee2e2';
        borderColor = '#ef4444';
      }

      return {
        id: `att-${dk}`,
        title: status,
        start: dk,
        allDay: true,
        backgroundColor,
        borderColor,
        textColor: '#0f172a'
      };
    });
  }, []);

  const refreshMonthly = useCallback(async () => {
    try {
      const y = calendarRange.start.getFullYear();
      const m = String(calendarRange.start.getMonth() + 1).padStart(2, '0');
      const monthStr = `${y}-${m}`;

      if (lastMonthlyKeyRef.current === monthStr) {
        return; // Skip duplicate monthly fetch for same month
      }
      lastMonthlyKeyRef.current = monthStr;

      const doc = await attendanceApi.getMonthly({ month: monthStr });
      // Parse MongoDB date objects in the response
      const parsedDoc = doc ? {
        ...doc,
        days: doc.days ? Object.keys(doc.days).reduce((acc, dateKey) => {
          const dayData = doc.days[dateKey];
          acc[dateKey] = {
            ...dayData,
            checkIn: dayData.checkIn ? {
              ...dayData.checkIn,
              timestamp: dayData.checkIn.timestamp?.$date 
                ? new Date(dayData.checkIn.timestamp.$date)
                : dayData.checkIn.timestamp
            } : null,
            checkOut: dayData.checkOut ? {
              ...dayData.checkOut,
              timestamp: dayData.checkOut.timestamp?.$date 
                ? new Date(dayData.checkOut.timestamp.$date)
                : dayData.checkOut.timestamp
            } : null
          };
          return acc;
        }, {}) : {}
      } : null;
      
      setMonthlyAttendance(parsedDoc);
      const key = formatDateKey(new Date());
      const day = parsedDoc?.days?.[key] || null;
      setTodayAttendance(day);

      // Merge attendance events into calendar
      const attEvents = buildAttendanceEvents(parsedDoc, calendarRange.start, calendarRange.end);
      setEvents((prev) => {
        const withoutOld = prev.filter((e) => !(e.id && String(e.id).startsWith('att-')));
        return [...withoutOld, ...attEvents];
      });

    } catch (e) {
      console.error('Failed to load monthly attendance', e);
      setAttError('Failed to load attendance data');
    }
  }, [calendarRange.start, calendarRange.end, formatDateKey, buildAttendanceEvents]);

  useEffect(() => {
    (async () => {
      await fetchCalendar(calendarRange.start, calendarRange.end, selectedEmployeeId);
      await refreshMonthly();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarRange, selectedEmployeeId]);

  const onDatesSet = useCallback((arg) => {
    const gridStart = new Date(arg.view?.currentStart || arg.start);
    const anchor = new Date(gridStart);
    anchor.setDate(anchor.getDate() + 20); // move into the middle of the displayed month
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

    setCalendarRange((prev) => {
      const same = prev.start.getTime() === monthStart.getTime() && prev.end.getTime() === monthEnd.getTime();
      return same ? prev : { start: monthStart, end: monthEnd };
    });
    // Do not call fetchCalendar here; let the effect above handle it
  }, []);

  const quotaSummary = useMemo(() => quota.quotas || [], [quota]);

  const workingSummary = useMemo(() => {
    if (!workingSettings) return '';
    const s = workingSettings;
    const days = [];
    const add = (label, val) => { if (val) days.push(label); };
    add('Mon', s.workingDays?.monday);
    add('Tue', s.workingDays?.tuesday);
    add('Wed', s.workingDays?.wednesday);
    add('Thu', s.workingDays?.thursday);
    add('Fri', s.workingDays?.friday);
    if (s.workingDays?.saturday) add('Sat', true);
    if (s.workingDays?.sunday) add('Sun', true);
    return `${s.startTime || '09:30'}–${s.endTime || '18:00'} (${s.timezone || 'UTC'}) • Days: ${days.join(', ')}`;
  }, [workingSettings]);

  // Load organization leave policy, then derive effective policy when employee changes
  useEffect(() => {
    (async () => {
      try {
        const res = await attendanceConfigApi.get();
        const cfg = res?.data?.data || res?.data || res;
        const org = cfg?.leavePolicy || null;
        setOrgPolicy(org);
        setEffectivePolicy((prev) => prev || org); // seed until user override fetched
      } catch (err) {
        // no-op
      }
    })();
  }, []);

  const getBrowserLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported by browser');
        return resolve(null);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    });
  }, []);

  const handleCheckIn = useCallback(async () => {
    setAttLoading(true);
    setAttError(null);
    try {
      const loc = await getBrowserLocation();
      const result = await attendanceApi.checkIn({ timestamp: new Date().toISOString(), location: loc, source: 'web' });

      let summary = result?.summary || result?.data?.summary || null;
      if (summary?.checkIn?.timestamp?.$date) {
        summary = {
          ...summary,
          checkIn: {
            ...summary.checkIn,
            timestamp: new Date(summary.checkIn.timestamp.$date)
          }
        };
      }

      setTodayAttendance(summary);
      await refreshMonthly();
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to check in. Please try again.';
      setAttError(errorMsg);
      console.error('Check-in error:', e);
    } finally {
      setAttLoading(false);
    }
  }, [getBrowserLocation, refreshMonthly]);

  const handleCheckOut = useCallback(async () => {
    setAttLoading(true);
    setAttError(null);
    try {
      const loc = await getBrowserLocation();
      await attendanceApi.checkOut({ timestamp: new Date().toISOString(), location: loc, source: 'web' });
      await refreshMonthly();
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to check out. Please try again.';
      setAttError(errorMsg);
      console.error('Check-out error:', e);
    } finally {
      setAttLoading(false);
    }
  }, [getBrowserLocation, refreshMonthly]);

  useEffect(() => {
    (async () => {
      if (!selectedEmployeeId) {
        setEffectivePolicy(orgPolicy);
        return;
      }
      try {
        const res = await userAttendanceConfigApi.get(selectedEmployeeId);
        const cfg = res?.data?.data || res?.data || res;
        const userPolicy = cfg?.leavePolicy;
        if (userPolicy && (
          userPolicy.sick || userPolicy.paid || (Array.isArray(userPolicy.customTypes) && userPolicy.customTypes.length > 0)
        )) {
          setEffectivePolicy(userPolicy);
        } else {
          setEffectivePolicy(orgPolicy);
        }
      } catch (err) {
        setEffectivePolicy(orgPolicy);
      }
    })();
  }, [selectedEmployeeId, orgPolicy]);



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Work Calendar</CardTitle>
          <CardDescription>Working days, holidays, and leaves</CardDescription>
        </CardHeader>
        <CardContent>
          {isHROrManager && (
            <div className="mb-4 flex items-center gap-4">
              <Label className="w-32">Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-[320px]">
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {(e.baseInfo?.employeeId ? `${e.baseInfo.employeeId} - ` : '')}
                      {e.userId?.firstName} {e.userId?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {workingSettings && (
            <div className="mb-3 text-sm text-muted-foreground">{workingSummary}</div>
          )}

          <div className="relative">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height={600}
              events={events}
              datesSet={onDatesSet}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            />
            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
                <Skeleton className="h-[600px] w-full" />
              </div>
            )}
          </div>

          {/* Attendance actions and summary */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Attendance (Today)</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCheckIn} disabled={attLoading || !!todayAttendance?.checkIn}>Check In</Button>
                <Button size="sm" variant="secondary" onClick={handleCheckOut} disabled={attLoading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}>Check Out</Button>
              </div>
            </div>
            {attError && <div className="text-sm text-red-600">{attError}</div>}
            <div className="text-sm">
              {todayAttendance ? (
                <div className="space-y-1">
                  <div>Working Day: {todayAttendance.workingDay ? 'Yes' : 'No'}</div>
                  {todayAttendance.isHoliday && <div>Holiday: {todayAttendance.holidayName || 'Holiday'}</div>}
                  {todayAttendance.checkIn ? (
                    <div>
                      Check-in: {new Date(todayAttendance.checkIn.timestamp).toLocaleString()}
                      {' • '}
                      {todayAttendance.checkIn.withinGrace ? 'On time' : `Late by ${todayAttendance.checkIn.minutesLate} min`}
                      {todayAttendance.outsideGeofence ? ' • Outside geofence' : ''}
                    </div>
                  ) : (
                    <div>No check-in yet.</div>
                  )}
                  {todayAttendance.checkOut ? (
                    <div>Check-out: {new Date(todayAttendance.checkOut.timestamp).toLocaleString()}</div>
                  ) : (
                    todayAttendance.checkIn && <div>No check-out yet.</div>
                  )}
                </div>
              ) : (
                <div>No attendance record for today yet.</div>
              )}
            </div>

            {monthlyAttendance && monthlyAttendance.days && (
              <div className="pt-2 border-t">
                <div className="font-medium mb-2">This Month</div>
                <div className="space-y-1">
                  {Object.keys(monthlyAttendance.days).sort().map((dk) => {
                    const d = monthlyAttendance.days[dk];
                    const baseStatus = d?.checkIn
                      ? (d.checkIn.withinGrace ? 'On time' : `Late ${d.checkIn.minutesLate}m`)
                      : (d?.workingDay && !d?.isHoliday ? 'Absent' : 'Non-working');
                    const status = d?.notes ? d.notes : baseStatus;
                    return (
                      <div key={dk} className="flex items-center justify-between text-sm">
                        <div>{dk}{d?.isHoliday ? ` • ${d.holidayName || 'Holiday'}` : ''}</div>
                        <div className="text-muted-foreground">{status}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Quota ({quota.year})</CardTitle>
          <CardDescription>Used, pending, and remaining</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
            <div className="space-y-3">
              {quotaSummary.length === 0 && (
                <div className="text-sm text-muted-foreground">No quota data available.</div>
              )}
              {quotaSummary.map((q) => (
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
          <CardTitle>Leave Policy ({selectedEmployeeId ? 'User' : 'Organization'})</CardTitle>
          <CardDescription>{selectedEmployeeId ? 'Overrides for selected user' : 'HR-configured annual limits'}</CardDescription>
        </CardHeader>
        <CardContent>
          {effectivePolicy ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sick Leave</div>
                <div className="text-sm text-muted-foreground">{effectivePolicy?.sick?.perYearDays || 0} days {effectivePolicy?.sick?.carryForward ? '• CF' : ''}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">Paid Leave</div>
                <div className="text-sm text-muted-foreground">{effectivePolicy?.paid?.perYearDays || 0} days {effectivePolicy?.paid?.carryForward ? '• CF' : ''}</div>
              </div>
              {(effectivePolicy.customTypes || []).map((ct) => (
                <div key={ct.code} className="flex items-center justify-between">
                  <div className="font-medium">{ct.label || ct.code}</div>
                  <div className="text-sm text-muted-foreground">{ct.perYearDays || 0} days {ct.carryForward ? '• CF' : ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading policy...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkCalendar;