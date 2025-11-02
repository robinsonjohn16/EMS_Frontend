import React, { useEffect, useMemo, useState } from 'react';

import { attendanceConfigApi } from '../../services/attendanceConfigApi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {Switch} from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import holidayApi from '../../services/holidayApi';
import { employeeDetailsApi } from '../../services/employeeApi';
import { userAttendanceConfigApi } from '../../services/userAttendanceConfigApi'
import GeofenceMap from '../../components/geo/GeofenceMap';

const dayNames = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const AttendanceConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [users, setUsers] = useState([]);
  const [newLocation, setNewLocation] = useState({ lat: '', lng: '', address: '' });
  const [config, setConfig] = useState({
    startTime: '09:30',
    endTime: '18:00',
    breakMinutes: 60,
    gracePeriodMinutes: 10,
    saturdayRule: 'none',
    weekdayRules: {
      monday: { rule: 'all' },
      tuesday: { rule: 'all' },
      wednesday: { rule: 'all' },
      thursday: { rule: 'all' },
      friday: { rule: 'all' },
      saturday: { rule: 'none' },
      sunday: { rule: 'none' },
    },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    timezone: 'UTC',
    totalDailyWorkingMinutes: 480,
    // Extended defaults
    leavePolicy: {
      sick: { perYearDays: 0, carryForward: false },
      paid: { perYearDays: 0, carryForward: false },
      customTypes: [],
    },
    geofencing: { enabled: false, radiusMeters: 100, locations: [] },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await attendanceConfigApi.get();
        const data = res?.data || res;
        setConfig({
          startTime: data.startTime || '09:30',
          endTime: data.endTime || '18:00',
          breakMinutes: typeof data.breakMinutes === 'number' ? data.breakMinutes : 60,
          gracePeriodMinutes: data.gracePeriodMinutes ?? 10,
          saturdayRule: data.saturdayRule || 'none',
          weekdayRules: {
            monday: { rule: data.weekdayRules?.monday?.rule || 'all' },
            tuesday: { rule: data.weekdayRules?.tuesday?.rule || 'all' },
            wednesday: { rule: data.weekdayRules?.wednesday?.rule || 'all' },
            thursday: { rule: data.weekdayRules?.thursday?.rule || 'all' },
            friday: { rule: data.weekdayRules?.friday?.rule || 'all' },
            saturday: { rule: data.weekdayRules?.saturday?.rule || data.saturdayRule || 'none' },
            sunday: { rule: data.weekdayRules?.sunday?.rule || 'none' },
          },
          workingDays: {
            monday: !!data.workingDays?.monday,
            tuesday: !!data.workingDays?.tuesday,
            wednesday: !!data.workingDays?.wednesday,
            thursday: !!data.workingDays?.thursday,
            friday: !!data.workingDays?.friday,
            saturday: !!data.workingDays?.saturday,
            sunday: !!data.workingDays?.sunday,
          },
          timezone: data.timezone || 'UTC',
          totalDailyWorkingMinutes: typeof data.totalDailyWorkingMinutes === 'number' ? data.totalDailyWorkingMinutes : computeTotalMinutes(data.startTime || '09:30', data.endTime || '18:00', data.breakMinutes ?? 60),
          // Extended fields
          leavePolicy: {
            sick: {
              perYearDays: typeof data.leavePolicy?.sick?.perYearDays === 'number' ? data.leavePolicy.sick.perYearDays : 0,
              carryForward: !!data.leavePolicy?.sick?.carryForward,
            },
            paid: {
              perYearDays: typeof data.leavePolicy?.paid?.perYearDays === 'number' ? data.leavePolicy.paid.perYearDays : 0,
              carryForward: !!data.leavePolicy?.paid?.carryForward,
            },
            customTypes: Array.isArray(data.leavePolicy?.customTypes)
              ? data.leavePolicy.customTypes.map((ct) => ({
                  code: String(ct?.code || '').trim(),
                  label: String(ct?.label || '').trim(),
                  perYearDays: Number(ct?.perYearDays || 0),
                  carryForward: !!ct?.carryForward,
                }))
              : [],
          },
          geofencing: {
            enabled: !!data.geofencing?.enabled,
            radiusMeters: typeof data.geofencing?.radiusMeters === 'number' ? data.geofencing.radiusMeters : 100,
            locations: Array.isArray(data.geofencing?.locations) ? data.geofencing.locations.map((l) => ({ lat: l?.latitude ?? l?.lat, lng: l?.longitude ?? l?.lng, address: l?.label ?? l?.address ?? '' })) : [],
          },
        });
      } catch (e) {
        console.error('Failed to fetch attendance config', e);
        toast.error('Failed to load attendance config');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Fetch users for user-specific selections
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await employeeDetailsApi.getAllEmployees();
        const raw = res?.data?.employees || res?.data || res;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.employees) ? raw.employees : []);
        const mapped = list.map((e) => {
          const u = e.userId || e.user || {};
          const id = u?._id || u?.id || u;
          const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'User';
          if (!id) return null;
          return { id, name };
        }).filter(Boolean);
        setUsers(mapped);
      } catch (e) {
        console.error('Failed to fetch users', e);
      }
    };
    fetchUsers();
  }, []);

  const computeTotalMinutes = (start, end, breakMin = 0) => {
    try {
      const [sh, sm] = String(start).split(':').map(Number);
      const [eh, em] = String(end).split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      return Math.max(endMin - startMin - (breakMin || 0), 0);
    } catch {
      return 480;
    }
  };

  const nonWorkingBackgroundEvents = useMemo(() => {
    if (!config) return [];
    const events = [];

    const year = calendarYear;
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const rule = config.weekdayRules?.[weekday]?.rule || (weekday === 'saturday' ? config.saturdayRule || 'none' : 'all');
        let isWorking = rule !== 'none';

        if (rule === 'odd' || rule === 'even') {
          const firstDay = new Date(year, month, 1);
          let count = 0;
          for (let i = firstDay; i <= d; i.setDate(i.getDate() + 7)) {
            if (i.getMonth() !== month) break;
            count++;
            if (i.getDate() === d.getDate()) break;
          }
          const isOdd = count % 2 === 1;
          isWorking = rule === 'odd' ? isOdd : !isOdd;
        }

        if (!isWorking) {
          events.push({
            title: 'Non-working Day',
            start: new Date(d),
            allDay: true,
            display: 'background',
            backgroundColor: '#fde68a'
          });
        }
      }
    }

    return events;
  }, [config, calendarYear]);

  const [holidayEvents, setHolidayEvents] = useState([]);

  const fetchHolidaysForYear = async (year) => {
    try {
      const res = await holidayApi.listHolidays({ year });
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const events = list
        .filter((h) => !!h?.isActive)
        .map((h) => {
          const occ = h.occurrenceDate || h.date;
          return {
            title: h.name,
            start: occ ? new Date(occ) : undefined,
            allDay: true,
            display: 'background',
            backgroundColor: '#93c5fd',
          };
        }).filter((e) => !!e.start);
      setHolidayEvents(events);
    } catch (e) {
      console.error('Failed to fetch holidays', e);
    }
  };

  useEffect(() => {
    fetchHolidaysForYear(calendarYear);
    const handler = () => fetchHolidaysForYear(calendarYear);
    window.addEventListener('tenant-holidays-updated', handler);
    return () => window.removeEventListener('tenant-holidays-updated', handler);
  }, [calendarYear]);

  const onDatesSet = (info) => {
    try {
      const y = info?.view?.currentStart ? new Date(info.view.currentStart).getFullYear() : new Date().getFullYear();
      if (y !== calendarYear) {
        setCalendarYear(y);
        fetchHolidaysForYear(y);
      }
    } catch (_) {}
  };

  const calendarEvents = useMemo(() => {
    return [...nonWorkingBackgroundEvents, ...holidayEvents];
  }, [nonWorkingBackgroundEvents, holidayEvents]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...config,
        // Ensure saturdayRule mirrors weekdayRules.saturday
        saturdayRule: config.weekdayRules?.saturday?.rule || config.saturdayRule || 'none',
        totalDailyWorkingMinutes: computeTotalMinutes(config.startTime, config.endTime, config.breakMinutes),
      };
      // Map UI fields to backend schema
      payload.leavePolicy = {
        sick: {
          perYearDays: Number(config.leavePolicy?.sick?.perYearDays || 0),
          carryForward: !!config.leavePolicy?.sick?.carryForward,
        },
        paid: {
          perYearDays: Number(config.leavePolicy?.paid?.perYearDays || 0),
          carryForward: !!config.leavePolicy?.paid?.carryForward,
        },
        customTypes: (config.leavePolicy?.customTypes || []).map((ct) => ({
          code: String(ct?.code || '').trim(),
          label: String(ct?.label || '').trim(),
          perYearDays: Number(ct?.perYearDays || 0),
          carryForward: !!ct?.carryForward,
        })),
      };
      payload.geofencing = {
        enabled: !!config.geofencing?.enabled,
        radiusMeters: Number(config.geofencing?.radiusMeters || 100),
        locations: (Array.isArray(config.geofencing?.locations) ? config.geofencing.locations : [])
          .map((loc) => ({
            label: (loc?.address || '').trim(),
            latitude: Number(loc?.lat),
            longitude: Number(loc?.lng),
          }))
          .filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude)),
      };
      await attendanceConfigApi.update(payload);
      toast.success('Attendance config saved');
    } catch (e) {
      console.error('Save failed', e);
      toast.error(e?.response?.data?.message || 'Failed to save attendance config');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setConfig((prev) => ({
      ...prev,
      workingDays: { ...prev.workingDays, [day]: !prev.workingDays[day] }
    }));
  };

  const setRule = (day, rule) => {
    setConfig((prev) => ({
      ...prev,
      weekdayRules: { ...prev.weekdayRules, [day]: { rule } },
    }));
  };

  const applySaturdayRuleToOthers = () => {
    const satRule = config.weekdayRules?.saturday?.rule || config.saturdayRule || 'none';
    setConfig((prev) => ({
      ...prev,
      weekdayRules: dayNames.reduce((acc, d) => {
        acc[d] = { rule: d === 'saturday' ? satRule : satRule };
        return acc;
      }, {}),
    }));
    toast.info('Applied Saturday rule to all days');
  };

  const syncWorkingDaysWithRules = () => {
    setConfig((prev) => ({
      ...prev,
      workingDays: dayNames.reduce((acc, d) => {
        const r = prev.weekdayRules?.[d]?.rule || (d === 'saturday' ? prev.saturdayRule || 'none' : 'all');
        acc[d] = r !== 'none';
        return acc;
      }, {}),
    }));
    toast.info('Synced working days with rules');
  };

  // Leave policy helpers
  const setLeave = (type, field, value) => {
    setConfig((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        [type]: {
          ...prev.leavePolicy[type],
          [field]: value,
        },
      },
    }));
  };

  const setCustomLeave = (idx, field, value) => {
    setConfig((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: (prev.leavePolicy?.customTypes || []).map((ct, i) =>
          i === idx
            ? {
                ...ct,
                [field]: field === 'perYearDays' ? Number(value) : value,
              }
            : ct
        ),
      },
    }));
  };

  const addCustomLeave = () => {
    setConfig((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: [
          ...(prev.leavePolicy?.customTypes || []),
          { code: '', label: '', perYearDays: 0, carryForward: false },
        ],
      },
    }));
  };

  const removeCustomLeave = (idx) => {
    setConfig((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: (prev.leavePolicy?.customTypes || []).filter((_, i) => i !== idx),
      },
    }));
  };



  // Geofencing helpers
  const setGeofence = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      geofencing: {
        ...prev.geofencing,
        [field]: value,
      },
    }));
  };

  const updateLocation = (idx, lat, lng) => {
    setConfig((prev) => ({
      ...prev,
      geofencing: {
        ...prev.geofencing,
        locations: (prev.geofencing?.locations || []).map((l, i) => i === idx ? { ...l, lat, lng } : l),
      },
    }));
  };

  const addLocation = () => {
    const lat = parseFloat(newLocation.lat);
    const lng = parseFloat(newLocation.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Please enter valid latitude and longitude');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      geofencing: {
        ...prev.geofencing,
        locations: [...(prev.geofencing?.locations || []), { lat, lng, address: newLocation.address }],
      },
    }));
    setNewLocation({ lat: '', lng: '', address: '' });
  };

  const removeLocation = (idx) => {
    setConfig((prev) => ({
      ...prev,
      geofencing: {
        ...prev.geofencing,
        locations: (prev.geofencing?.locations || []).filter((_, i) => i !== idx),
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Settings</CardTitle>
          <CardDescription>Configure working days, rules, and timings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={config.startTime} onChange={(e) => setConfig((p) => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={config.endTime} onChange={(e) => setConfig((p) => ({ ...p, endTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Break (minutes)</Label>
              <Input type="number" min={0} max={300} value={config.breakMinutes} onChange={(e) => setConfig((p) => ({ ...p, breakMinutes: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Grace Period (minutes)</Label>
              <Input type="number" min={0} max={180} value={config.gracePeriodMinutes} onChange={(e) => setConfig((p) => ({ ...p, gracePeriodMinutes: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={config.timezone} onChange={(e) => setConfig((p) => ({ ...p, timezone: e.target.value }))} />
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayNames.map((day) => (
                  <div key={day} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox id={`wd-${day}`} checked={!!config.workingDays?.[day]} onCheckedChange={() => toggleDay(day)} />
                      <Label htmlFor={`wd-${day}`} className="capitalize">{day}</Label>
                    </div>
                    <Select value={config.weekdayRules?.[day]?.rule || 'all'} onValueChange={(val) => setRule(day, val)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (non-working)</SelectItem>
                        <SelectItem value="all">All (every week)</SelectItem>
                        <SelectItem value="odd">Odd weeks</SelectItem>
                        <SelectItem value="even">Even weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                {/* <Button variant="outline" onClick={applySaturdayRuleToOthers}>Apply Saturday rule to all days</Button> */}
                {/* <Button variant="outline" onClick={syncWorkingDaysWithRules}>Sync working days with rules</Button> */}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        </CardFooter>
      </Card>

      {/* Leave Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policies</CardTitle>
          <CardDescription>Configure global sick and paid leave limits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sick Leave */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Sick Leave</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sick-cf" >Carry forward</Label>
                  <Checkbox id="sick-cf" checked={!!config.leavePolicy?.sick?.carryForward} onCheckedChange={(v)=>setLeave('sick','carryForward',!!v)} />
                </div>
              </div>
              <div>
                <Label>Days per year</Label>
                <Input className="mt-2" type="number" min={0} value={config.leavePolicy?.sick?.perYearDays ?? 0} onChange={(e)=>setLeave('sick','perYearDays',Number(e.target.value))} />
              </div>
            </div>
            {/* Paid Leave */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Paid Leave</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="paid-cf">Carry forward</Label>
                  <Checkbox id="paid-cf" checked={!!config.leavePolicy?.paid?.carryForward} onCheckedChange={(v)=>setLeave('paid','carryForward',!!v)} />
                </div>
              </div>
              <div>
                <Label>Days per year</Label>
                <Input className="mt-2" type="number" min={0} value={config.leavePolicy?.paid?.perYearDays ?? 0} onChange={(e)=>setLeave('paid','perYearDays',Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Custom Leave Types */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Custom Leave Types</h3>
              <Button variant="outline" onClick={addCustomLeave}>Add Type</Button>
            </div>
            {(config.leavePolicy?.customTypes || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No custom leave types added yet.</p>
            )}
            <div className="space-y-3">
              {(config.leavePolicy?.customTypes || []).map((ct, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 border rounded-md p-3">
                  <div className="space-y-1">
                    <Label htmlFor={`clt-code-${idx}`}>Code</Label>
                    <Input id={`clt-code-${idx}`} placeholder="e.g. WFH" value={ct.code || ''} onChange={(e)=>setCustomLeave(idx,'code',e.target.value)} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor={`clt-label-${idx}`}>Label</Label>
                    <Input id={`clt-label-${idx}`} placeholder="e.g. Work From Home" value={ct.label || ''} onChange={(e)=>setCustomLeave(idx,'label',e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`clt-days-${idx}`}>Days/year</Label>
                    <Input id={`clt-days-${idx}`} type="number" min={0} value={ct.perYearDays ?? 0} onChange={(e)=>setCustomLeave(idx,'perYearDays',Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id={`clt-cf-${idx}`} checked={!!ct.carryForward} onCheckedChange={(v)=>setCustomLeave(idx,'carryForward',!!v)} />
                    <Label htmlFor={`clt-cf-${idx}`}>Carry forward</Label>
                  </div>
                  <div className="md:col-span-5 flex justify-end">
                    <Button variant="destructive" size="sm" onClick={()=>removeCustomLeave(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geofencing */}
      <Card>
        <CardHeader>
          <CardTitle>Geofencing</CardTitle>
          <CardDescription>Restrict attendance marking within defined locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox id="geo-enabled" checked={!!config.geofencing?.enabled} onCheckedChange={(v)=>setGeofence('enabled',!!v)} />
              <Label htmlFor="geo-enabled">Enable geofencing</Label>
            </div>
            <div>
              <Label>Radius (meters)</Label>
              <Input type="number" min={10} max={10000} value={config.geofencing?.radiusMeters ?? 100} onChange={(e)=>setGeofence('radiusMeters',Number(e.target.value))} />
            </div>

            {/* Map with pointer and geocoding */}
            <GeofenceMap
              radiusMeters={config.geofencing?.radiusMeters ?? 100}
              locations={config.geofencing?.locations || []}
              onAddLocation={(lat, lng, address) => {
                setConfig((prev) => ({
                  ...prev,
                  geofencing: {
                    ...prev.geofencing,
                    // enforce single marker
                    locations: [{ lat, lng, address }],
                  },
                }));
              }}
              onMoveLocation={(idx, lat, lng) => {
                setConfig((prev) => ({
                  ...prev,
                  geofencing: {
                    ...prev.geofencing,
                    locations: [(prev.geofencing?.locations || [])[0] ? { ...(prev.geofencing.locations[0]), lat, lng } : { lat, lng }],
                  },
                }));
              }}
            />

            <div className="space-y-2">
              <Label>Locations</Label>
              <div className="space-y-2">
                {(config.geofencing?.locations || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No locations added.</p>
                )}
                {(config.geofencing?.locations || []).map((loc, idx)=> (
                  <div key={idx} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <p className="text-sm font-medium">{loc.lat}, {loc.lng}</p>
                      {loc.address && (<p className="text-xs text-muted-foreground">{loc.address}</p>)}
                    </div>
                    <Button variant="destructive" size="sm" onClick={()=>removeLocation(idx)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Working Calendar</CardTitle>
              <CardDescription>Background highlights show non-working days based on rules. Holidays are overlaid.</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link to="/holiday-management">Manage Holidays</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" events={calendarEvents} height="auto" datesSet={onDatesSet} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceConfig;