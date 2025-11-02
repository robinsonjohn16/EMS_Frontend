import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Eye, CheckCircle, XCircle, Search, Calendar as CalendarIcon, User } from 'lucide-react';
import leaveApi from '../../services/leaveApi';
import { tenantOrganizationApi, tenantUtils } from '../../services/tenantApi';
import { attendanceConfigApi } from '../../services/attendanceConfigApi';
import holidayApi from '../../services/holidayApi';

const HRLeaveApproval = () => {
  const { user } = useSelector((state) => state.tenantAuth);

  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvePayStatus, setApprovePayStatus] = useState('paid');
  const [approveDays, setApproveDays] = useState('');
  const [approvedDaysDetails, setApprovedDaysDetails] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attendanceSettings, setAttendanceSettings] = useState(null);
  const [holidaySets, setHolidaySets] = useState({ fixed: new Set(), yearlyMD: new Set() });
  // Add quota state for right-side panel
  const [quota, setQuota] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaError, setQuotaError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Resolve organizationId
        let orgId = user?.organization?._id || user?.organizationId || user?.organization;
        if (!orgId) {
          const sub = tenantUtils.getSubdomain();
          console.log('Subdomain:', sub);
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
      } catch (err) {
        console.error('Init error', err);
        toast.error('Failed to initialize HR leaves');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const fetchLeaves = async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const res = await leaveApi.getOrganizationLeaves(String(organizationId), { status: 'pending' });
      console.log('API Response:', res);
      const data = res?.data?.leaves || res?.leaves || res?.data || res || [];
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load organization leaves', err);
      toast.error(err?.response?.data?.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, statusFilter]);

  const filteredLeaves = useMemo(() => {
    if (!search) return leaves;
    const term = search.toLowerCase();
    return leaves.filter((lv) => {
      const emp = lv.employeeId || {};
      return (
        String(emp.firstName || '').toLowerCase().includes(term) ||
        String(emp.lastName || '').toLowerCase().includes(term) ||
        String(emp.email || '').toLowerCase().includes(term) ||
        String(lv.leaveType || '').toLowerCase().includes(term) ||
        String(lv.reason || '').toLowerCase().includes(term)
      );
    });
  }, [leaves, search]);

  // Safe date helpers to avoid off-by-one due to timezone parsing
  const isYMD = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const parseYMD = (v) => {
    try {
      if (!v) return null;
      if (typeof v === 'object' && v && '$date' in v) {
        return new Date(v.$date);
      }
      if (isYMD(v)) {
        const [y, m, d] = String(v).split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(v);
    } catch {
      return null;
    }
  };
  const fmtLocalDate = (v) => {
    const d = parseYMD(v);
    const tz = attendanceSettings?.timezone || 'UTC';
    if (!d || isNaN(d)) return String(v ?? '');
    // Use local YMD formatting to avoid timezone off-by-one issues
    const ymd = toLocalYMD(d, tz); // YYYY-MM-DD
    const [y, m, dd] = ymd.split('-');
    return `${dd}/${m}/${y}`;
  };
  const daysInclusive = (start, end) => {
    const s = parseYMD(start);
    const e = parseYMD(end);
    if (!s || !e || isNaN(s) || isNaN(e)) return 0;
    const sMid = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const eMid = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    const ms = eMid - sMid;
    return Math.round(ms / (24 * 60 * 60 * 1000)) + 1;
  };

  const requestedDays = useMemo(() => {
    if (!selectedLeave) return 0;
    const s = parseYMD(selectedLeave.startDate);
    const e = parseYMD(selectedLeave.endDate);
    const diff = daysInclusive(selectedLeave.startDate, selectedLeave.endDate);
    return selectedLeave.isHalfDay && s && e && s.getTime() === e.getTime() ? 0.5 : diff;
  }, [selectedLeave]);

  const toLocalYMD = (date, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(date);
  const weekdayNumber = (date, tz) => {
    const w = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(date);
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return map[w] ?? 0;
  };
  const isWorkingDay = (weekdayNum, config, date) => {
    if (!config) return true;
    const wd = config.workingDays || {};
    const baseWorking = [wd.sunday, wd.monday, wd.tuesday, wd.wednesday, wd.thursday, wd.friday, wd.saturday][weekdayNum] ?? true;
    const names = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const rules = config.weekdayRules || {};
    const dayRuleObj = rules[names[weekdayNum]] || {};
    const dayRule = dayRuleObj.rule || (names[weekdayNum] === 'saturday' ? config.saturdayRule : 'all');
    if (dayRule === 'none') return false;
    if (dayRule === 'all' || !dayRule) return baseWorking;
    const dayOfMonth = Number(new Intl.DateTimeFormat('en-US', { timeZone: config.timezone, day: 'numeric' }).format(date));
    const isOdd = dayOfMonth % 2 === 1;
    return baseWorking && ((dayRule === 'odd' && isOdd) || (dayRule === 'even' && !isOdd));
  };

  // Helper to load leave quota for selected employee
  const loadQuotaForEmployee = async (emp) => {
    const empId = typeof emp === 'string' ? emp : (emp?._id || emp?.id || emp);
    if (!empId || !organizationId) {
      setQuota(null);
      return;
    }
    try {
      setQuotaLoading(true);
      setQuotaError(null);
      const res = await leaveApi.getLeaveQuota(String(empId), String(organizationId));
      const q = res?.data?.data?.leaveQuota || res?.data?.leaveQuota || res?.leaveQuota || res;
      setQuota(q || null);
    } catch (err) {
      console.error('Failed to load leave quota', err);
      setQuota(null);
      setQuotaError(err?.response?.data?.message || 'Failed to load leave quota');
    } finally {
      setQuotaLoading(false);
    }
  };

  const openApproveModal = async (leave) => {
    setSelectedLeave(leave);
    await loadQuotaForEmployee(leave?.employeeId);
    setApprovePayStatus('paid');

    // Ensure we have organization timezone before building per-day details
    let tz = attendanceSettings?.timezone || 'UTC';
    if (!attendanceSettings) {
      try {
        const cfgResp = await attendanceConfigApi.get();
        const cfg = cfgResp?.data?.attendanceConfig || cfgResp?.attendanceConfig || cfgResp || null;
        setAttendanceSettings(cfg);
        tz = cfg?.timezone || tz;
      } catch {}
    }

    const s = parseYMD(leave.startDate);
    const e = parseYMD(leave.endDate);
    const diff = daysInclusive(leave.startDate, leave.endDate);
    const defDays = leave.isHalfDay && s && e && s.getTime() === e.getTime() ? 0.5 : diff;
    setApproveDays(String(defDays));
    
    // Initialize approved days details using requestedDaysDetails when available
    const reqDetails = Array.isArray(leave.requestedDaysDetails) ? leave.requestedDaysDetails : [];
    const details = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    for (let i = 0; i < diff; i++) {
      const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(cur);
      const req = reqDetails.find((d) => {
        const base = typeof d.date === 'string' ? d.date : parseYMD(d.date);
        const dStr = typeof base === 'string' ? base : new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(base);
        return dStr === ymd;
      });
      const isHalf = req ? Boolean(req.isHalfDay) : (leave.isHalfDay && s.getTime() === e.getTime() && i === 0);
      const period = req ? (req.halfDayPeriod || null) : (isHalf ? (leave.halfDayPeriod || 'morning') : null);
      details.push({
        date: ymd,
        isHalfDay: isHalf,
        halfDayPeriod: isHalf ? period : null,
        approved: true,
      });
      cur.setDate(cur.getDate() + 1);
    }
    setApprovedDaysDetails(details);

    // Load attendance config and holidays for UI validation
    try {
      const [cfgResp, holResp] = await Promise.all([
        attendanceConfigApi.get(),
        holidayApi.listHolidays({ active: true })
      ]);
      const cfg = cfgResp?.data?.attendanceConfig || cfgResp?.attendanceConfig || cfgResp || null;
      setAttendanceSettings(cfg);
      const timezone = cfg?.timezone || 'UTC';
      const fixed = new Set();
      const yearlyMD = new Set();
      const holidays = (holResp?.data?.holidays || holResp?.holidays || holResp?.data || holResp || []).filter(h => h?.isActive !== false);
      for (const h of holidays) {
        const ymd = toLocalYMD(parseYMD(h.date), timezone);
        if (h.recurrence === 'yearly') yearlyMD.add(ymd.slice(5)); else fixed.add(ymd);
      }
      setHolidaySets({ fixed, yearlyMD });
    } catch (err) {
      console.error('Failed to load config/holidays', err);
    }

    setShowApproveModal(true);
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedLeave) return;
    
    // Get approved days from details
    const approvedDetails = approvedDaysDetails.filter(d => d.approved);
    if (approvedDetails.length === 0) {
      toast.error('Please select at least one day to approve');
      return;
    }

    // Validate against non-working days and holidays
    if (attendanceSettings) {
      const tz = attendanceSettings.timezone || 'UTC';
      for (const d of approvedDetails) {
        const dateObj = parseYMD(d.date);
        const ymd = toLocalYMD(dateObj, tz);
        const weekday = weekdayNumber(dateObj, tz);
        const working = isWorkingDay(weekday, attendanceSettings, dateObj);
        const isHoliday = holidaySets.fixed.has(ymd) || holidaySets.yearlyMD.has(ymd.slice(5));
        if (!working || isHoliday) {
          toast.error(`Cannot approve non-working/holiday date: ${fmtLocalDate(d.date)}`);
          return;
        }
        if (d.isHalfDay && d.halfDayPeriod && !['morning','afternoon'].includes(d.halfDayPeriod)) {
          toast.error('Half-day period must be morning or afternoon');
          return;
        }
      }
    }
    
    // Calculate total approved days (considering half days)
    const totalApproved = approvedDetails.reduce((sum, d) => {
      return sum + (d.isHalfDay ? 0.5 : 1);
    }, 0);

    // Guard: totalApproved cannot exceed requested
    if (totalApproved > requestedDays) {
      toast.error('Approved days cannot exceed requested days');
      return;
    }
    
    try {
      setSubmitting(true);
      await leaveApi.processLeaveRequest(String(selectedLeave._id), {
        status: 'approved',
        payStatus: approvePayStatus,
        deductQuota: approvePayStatus === 'paid',
        approvedDays: totalApproved,
        approvedDaysDetails: approvedDetails.map(d => ({
          date: d.date,
          isHalfDay: d.isHalfDay,
          halfDayPeriod: d.halfDayPeriod
        }))
      });
      toast.success('Leave approved');
      setShowApproveModal(false);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      console.error('Approve failed', err);
      toast.error(err?.response?.data?.message || 'Failed to approve leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;
    if (!rejectReason || rejectReason.trim().length < 3) {
      toast.error('Provide a brief rejection reason');
      return;
    }
    try {
      setSubmitting(true);
      await leaveApi.processLeaveRequest(String(selectedLeave._id), {
        status: 'rejected',
        rejectionReason: rejectReason.trim(),
      });
      toast.success('Leave rejected');
      setShowRejectModal(false);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      console.error('Reject failed', err);
      toast.error(err?.response?.data?.message || 'Failed to reject leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Approvals</CardTitle>
              <CardDescription>HR review and pay classification for leave requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !organizationId ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search by name, type, reason…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={fetchLeaves}>Refresh</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                   {loading ? (
                     <div className="space-y-2">
                       <Skeleton className="h-10 w/full" />
                       <Skeleton className="h-10 w/full" />
                       <Skeleton className="h-10 w/full" />
                     </div>
                   ) : filteredLeaves.length === 0 ? (
                     <div className="text-sm text-muted-foreground">No leave requests found.</div>
                   ) : (
                     <div className="divide-y">
                       {filteredLeaves.map((lv) => {
                         const days = (() => {
                           const s = parseYMD(lv.startDate);
                           const e = parseYMD(lv.endDate);
                           const diff = daysInclusive(lv.startDate, lv.endDate);
                           return lv.isHalfDay && s && e && s.getTime() === e.getTime() ? 0.5 : diff;
                         })();
                         return (
                           <div key={lv._id} className="py-3">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                   <User className="h-5 w-5" />
                                 </div>
                                 <div>
                                   <div className="font-semibold">
                                     {lv.employeeId?.firstName} {lv.employeeId?.lastName}
                                     <span className="ml-2 text-xs text-muted-foreground">{lv.employeeId?.email}</span>
                                   </div>
                                   <div className="text-sm text-muted-foreground flex items-center gap-3">
                                     <span className="capitalize">Type: {lv.leaveType}</span>
                                     <span className="flex items-center">
                                       <CalendarIcon className="h-4 w-4 mr-1" />
                                       {fmtLocalDate(lv.startDate)} → {fmtLocalDate(lv.endDate)} ({days} day{days === 1 ? '' : 's'})
                                     </span>
                                     {lv.isHalfDay && (
                                       <span className="capitalize">Half-day: {lv.halfDayPeriod}</span>
                                     )}
                                   </div>
                                   {lv.reason && (
                                     <div className="text-sm mt-1">Reason: {lv.reason}</div>
                                   )}
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 {lv.status === 'pending' ? (
                                   <>
                                     <Button variant="secondary" onClick={() => openApproveModal(lv)}>
                                       <CheckCircle className="h-4 w-4 mr-2" />
                                       Approve
                                     </Button>
                                     <Button variant="destructive" onClick={() => openRejectModal(lv)}>
                                       <XCircle className="h-4 w-4 mr-2" />
                                       Reject
                                     </Button>
                                   </>
                                 ) : (
                                   <div className="text-sm">
                                     Status: <span className="capitalize">{lv.status}</span>{lv.payStatus ? ` • ${lv.payStatus}` : ''}
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
                 <div>
                   <Card>
                     <CardHeader>
                       <CardTitle>Leave Quota {quota?.year ? `(${quota.year})` : ''}</CardTitle>
                       <CardDescription>Selected employee</CardDescription>
                     </CardHeader>
                     <CardContent>
                       {quotaLoading ? (
                         <div className="space-y-2">
                           <Skeleton className="h-6 w-2/3" />
                           <Skeleton className="h-6 w-1/2" />
                           <Skeleton className="h-6 w-3/4" />
                         </div>
                       ) : !quota ? (
                         <div className="text-sm text-muted-foreground">Select a leave to view quota.</div>
                       ) : (
                         <div className="space-y-3">
                           {(quota?.quotas || []).length === 0 && (
                             <div className="text-sm text-muted-foreground">No quota data available.</div>
                           )}
                           {(quota?.quotas || []).map((q, idx) => (
                             <div key={q.leaveType || idx} className="flex items-center justify-between">
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
                 </div>
               </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={showApproveModal && !!selectedLeave} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Leave</DialogTitle>
            <DialogDescription>
              Applicant: {selectedLeave?.employeeId?.firstName} {selectedLeave?.employeeId?.lastName} <span className="ml-1">({selectedLeave?.employeeId?.email})</span>
              <div className="mt-1">
                {fmtLocalDate(selectedLeave?.startDate)} → {fmtLocalDate(selectedLeave?.endDate)} • Type: {selectedLeave?.leaveType}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Pay Status</Label>
            <Select value={approvePayStatus} onValueChange={(v) => setApprovePayStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pay status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mt-4">
            <Label>Select Days to Approve</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {approvedDaysDetails.map((day, idx) => {
                const tz = attendanceSettings?.timezone || 'UTC';
                const ymd = toLocalYMD(parseYMD(day.date), tz);
                const weekday = weekdayNumber(parseYMD(day.date), tz);
                const working = isWorkingDay(weekday, attendanceSettings, parseYMD(day.date));
                const isHoliday = holidaySets.fixed.has(ymd) || holidaySets.yearlyMD.has(ymd.slice(5));
                const disabled = isHoliday || !working;
                return (
                  <div key={day.date} className={`flex items-center justify-between p-2 border rounded ${disabled ? 'opacity-60' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={day.approved}
                        onCheckedChange={(checked) => {
                          const updated = [...approvedDaysDetails];
                          updated[idx].approved = checked;
                          setApprovedDaysDetails(updated);
                        }}
                        // disabled={disabled}
                      />
                      <div>
                        <div className="font-medium">{fmtLocalDate(day.date)}</div>
                        {day.isHalfDay && (
                          <div className="text-xs text-muted-foreground">Half-day ({day.halfDayPeriod})</div>
                        )}
                        {disabled && (
                          <div className="text-xs text-red-600">Non-working{isHoliday ? '/Holiday' : ''} day</div>
                        )}
                      </div>
                    </div>
                    {day.isHalfDay && (
                      <Select
                        value={day.halfDayPeriod || 'morning'}
                        onValueChange={(period) => {
                          const updated = [...approvedDaysDetails];
                          updated[idx].halfDayPeriod = period;
                          setApprovedDaysDetails(updated);
                        }}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              Requested: {requestedDays} day{requestedDays === 1 ? '' : 's'}.{' '}
              Selected: {approvedDaysDetails.filter(d => d.approved).reduce((sum, d) => sum + (d.isHalfDay ? 0.5 : 1), 0)} day{approvedDaysDetails.filter(d => d.approved).reduce((sum, d) => sum + (d.isHalfDay ? 0.5 : 1), 0) === 1 ? '' : 's'}.
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={submitting}>{submitting ? 'Approving…' : 'Approve'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal && !!selectedLeave} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave</DialogTitle>
            <DialogDescription>Provide a brief reason for rejection.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input placeholder="E.g. documentation missing, exceeds policy, etc." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>{submitting ? 'Rejecting…' : 'Reject'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRLeaveApproval;