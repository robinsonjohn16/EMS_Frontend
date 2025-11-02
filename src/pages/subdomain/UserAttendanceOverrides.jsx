import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../../components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { employeeDetailsApi } from '../../services/employeeApi';
import { userAttendanceConfigApi } from '../../services/userAttendanceConfigApi';
import GeofenceMap from '../../components/geo/GeofenceMap';

const UserAttendanceOverrides = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userOverride, setUserOverride] = useState({
    leavePolicy: { sick: { perYearDays: 0, carryForward: false }, paid: { perYearDays: 0, carryForward: false }, customTypes: [] },
    geofencing: { enabled: false, radiusMeters: 100, locations: [] },
  });
  const [newUserLocation, setNewUserLocation] = useState({ lat: '', lng: '', address: '' });
  const [openPicker, setOpenPicker] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)

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
        toast.error('Failed to load employees');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const loadOverride = async () => {
      if (!selectedUserId) return;
      try {
        const res = await userAttendanceConfigApi.get(selectedUserId);
        const data = res?.data?.data ?? res?.data ?? res;
        setUserOverride({
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
                  code: ct?.code || '',
                  label: ct?.label || '',
                  perYearDays: typeof ct?.perYearDays === 'number' ? ct.perYearDays : 0,
                  carryForward: !!ct?.carryForward,
                }))
              : [],
          },
          geofencing: {
            enabled: !!data.geofencing?.enabled,
            radiusMeters: typeof data.geofencing?.radiusMeters === 'number' ? data.geofencing.radiusMeters : 100,
            locations: Array.isArray(data.geofencing?.locations)
              ? data.geofencing.locations.map((l) => ({
                  lat: l?.latitude ?? l?.lat,
                  lng: l?.longitude ?? l?.lng,
                  address: l?.label ?? l?.address ?? '',
                }))
              : [],
          },
        });
      } catch (e) {
        console.error('Failed to load user override', e);
        toast.error('Failed to load user-specific settings');
      }
    };
    loadOverride();
  }, [selectedUserId]);

  const setUserLeave = (type, field, value) => {
    setUserOverride((prev) => ({
      ...prev,
      leavePolicy: { ...prev.leavePolicy, [type]: { ...prev.leavePolicy[type], [field]: value } },
    }));
  };

  const setUserGeofence = (field, value) => {
    setUserOverride((prev) => ({
      ...prev,
      geofencing: { ...prev.geofencing, [field]: value },
    }));
  };

  // Custom types handlers
  const setUserCustomLeave = (idx, field, value) => {
    setUserOverride((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: (prev.leavePolicy.customTypes || []).map((ct, i) =>
          i === idx ? { ...ct, [field]: field === 'perYearDays' ? Number(value) : value } : ct
        ),
      },
    }));
  };

  const addUserCustomLeave = () => {
    setUserOverride((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: [
          ...(prev.leavePolicy.customTypes || []),
          { code: '', label: '', perYearDays: 0, carryForward: false },
        ],
      },
    }));
  };

  const removeUserCustomLeave = (idx) => {
    setUserOverride((prev) => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        customTypes: (prev.leavePolicy.customTypes || []).filter((_, i) => i !== idx),
      },
    }));
  };

  const removeUserLocation = (idx) => {
    setUserOverride((prev) => ({
      ...prev,
      geofencing: { ...prev.geofencing, locations: (prev.geofencing.locations || []).filter((_, i) => i !== idx) },
    }));
  };

  const handleSaveUserOverride = async () => {
    try {
      if (!selectedUserId) {
        toast.error('Select a user to save settings');
        return;
      }
      setSaving(true);
      const payload = {
        leavePolicy: {
          sick: { perYearDays: Number(userOverride.leavePolicy.sick.perYearDays || 0), carryForward: !!userOverride.leavePolicy.sick.carryForward },
          paid: { perYearDays: Number(userOverride.leavePolicy.paid.perYearDays || 0), carryForward: !!userOverride.leavePolicy.paid.carryForward },
          customTypes: (userOverride.leavePolicy.customTypes || [])
            .map((ct) => ({
              code: String(ct.code || '').toLowerCase().trim(),
              label: (ct.label || '').trim(),
              perYearDays: Number(ct.perYearDays || 0),
              carryForward: !!ct.carryForward,
            }))
            .filter((ct) => !!ct.code),
        },
        geofencing: {
          enabled: !!userOverride.geofencing.enabled,
          radiusMeters: Number(userOverride.geofencing.radiusMeters || 100),
          locations: (userOverride.geofencing.locations || [])
            .map((loc) => ({ label: (loc.address || '').trim(), latitude: Number(loc.lat), longitude: Number(loc.lng) }))
            .filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude)),
        },
      };
      const savedRes = await userAttendanceConfigApi.update(selectedUserId, payload);
      const saved = savedRes?.data?.data ?? savedRes?.data ?? savedRes;
      setUserOverride({
        leavePolicy: {
          sick: {
            perYearDays: typeof saved.leavePolicy?.sick?.perYearDays === 'number' ? saved.leavePolicy.sick.perYearDays : 0,
            carryForward: !!saved.leavePolicy?.sick?.carryForward,
          },
          paid: {
            perYearDays: typeof saved.leavePolicy?.paid?.perYearDays === 'number' ? saved.leavePolicy.paid.perYearDays : 0,
            carryForward: !!saved.leavePolicy?.paid?.carryForward,
          },
          customTypes: Array.isArray(saved.leavePolicy?.customTypes)
            ? saved.leavePolicy.customTypes.map((ct) => ({
                code: ct?.code || '',
                label: ct?.label || '',
                perYearDays: typeof ct?.perYearDays === 'number' ? ct.perYearDays : 0,
                carryForward: !!ct?.carryForward,
              }))
            : [],
        },
        geofencing: {
          enabled: !!saved.geofencing?.enabled,
          radiusMeters: typeof saved.geofencing?.radiusMeters === 'number' ? saved.geofencing.radiusMeters : 100,
          locations: Array.isArray(saved.geofencing?.locations)
            ? saved.geofencing.locations.map((l) => ({
                lat: l?.latitude ?? l?.lat,
                lng: l?.longitude ?? l?.lng,
                address: l?.label ?? l?.address ?? '',
              }))
            : [],
        },
      });
      toast.success('User-specific settings saved');
    } catch (e) {
      console.error('Failed to save user override', e);
      toast.error(e?.response?.data?.message || 'Failed to save user-specific settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Attendance Overrides</CardTitle>
          <CardDescription>Set user-specific leave policies and geofencing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Select User</Label>
                <Popover open={openPicker} onOpenChange={setOpenPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openPicker} className="w-full justify-between">
                      {selectedUserId ? (users.find(u => String(u.id) === String(selectedUserId))?.name || 'Selected user') : 'Search user'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." value={userQuery} onValueChange={setUserQuery} />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {(users || []).filter(u => !userQuery || (u.name?.toLowerCase().includes(userQuery.toLowerCase()) || u.email?.toLowerCase().includes(userQuery.toLowerCase()))).map(u => (
                            <CommandItem
                              key={String(u.id)}
                              value={String(u.id)}
                              onSelect={(val) => {
                                setSelectedUserId(val)
                                setOpenPicker(false)
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${String(u.id) === String(selectedUserId) ? "opacity-100" : "opacity-0"}`} />
                              <span className="truncate">{u.name}</span>
                              {u.email && <span className="ml-2 text-xs text-muted-foreground truncate">{u.email}</span>}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {!selectedUserId && (
                <p className="text-sm text-muted-foreground">Pick a user to edit settings.</p>
              )}
            {selectedUserId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sick Leave</CardTitle>
                    <CardDescription>User-specific sick leave policy.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div>
                      <Label>Days per year</Label>
                      <Input type="number" min="0" value={userOverride.leavePolicy.sick.perYearDays} onChange={(e)=>setUserLeave('sick','perYearDays',Number(e.target.value))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!userOverride.leavePolicy.sick.carryForward} onCheckedChange={(v)=>setUserLeave('sick','carryForward',!!v)} />
                      <Label>Carry forward</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Paid Leave</CardTitle>
                    <CardDescription>User-specific paid leave policy.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div>
                      <Label>Days per year</Label>
                      <Input type="number" min="0" value={userOverride.leavePolicy.paid.perYearDays} onChange={(e)=>setUserLeave('paid','perYearDays',Number(e.target.value))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!userOverride.leavePolicy.paid.carryForward} onCheckedChange={(v)=>setUserLeave('paid','carryForward',!!v)} />
                      <Label>Carry forward</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Custom Leave Types</CardTitle>
                    <CardDescription>User-specific custom leave types.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {(userOverride.leavePolicy.customTypes || []).map((ct, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <Label>Code</Label>
                          <Input value={ct.code} onChange={(e)=>setUserCustomLeave(idx,'code',e.target.value)} placeholder="e.g., casual" />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input value={ct.label} onChange={(e)=>setUserCustomLeave(idx,'label',e.target.value)} placeholder="Casual Leave" />
                        </div>
                        <div>
                          <Label>Days per year</Label>
                          <Input type="number" min="0" value={ct.perYearDays} onChange={(e)=>setUserCustomLeave(idx,'perYearDays',Number(e.target.value))} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={!!ct.carryForward} onCheckedChange={(v)=>setUserCustomLeave(idx,'carryForward',!!v)} />
                          <Label>Carry forward</Label>
                          <Button variant="destructive" onClick={()=>removeUserCustomLeave(idx)} className="ml-auto">Remove</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={addUserCustomLeave}>Add Custom Type</Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Geofencing</CardTitle>
                    <CardDescription>User-specific geofencing settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={!!userOverride.geofencing.enabled} onCheckedChange={(v)=>setUserGeofence('enabled',!!v)} />
                      <Label>Enable Geofencing</Label>
                    </div>
                    <div>
                      <Label>Radius (meters)</Label>
                      <Input type="number" min="10" max="10000" value={userOverride.geofencing.radiusMeters} onChange={(e)=>setUserGeofence('radiusMeters',Number(e.target.value))} />
                    </div>

                    {/* Map for user-specific geofence (single marker) */}
                    <GeofenceMap
                      radiusMeters={userOverride.geofencing.radiusMeters}
                      locations={userOverride.geofencing.locations || []}
                      onAddLocation={(lat, lng, address) => {
                        setUserOverride((prev) => ({
                          ...prev,
                          geofencing: {
                            ...prev.geofencing,
                            locations: [{ lat, lng, address }],
                          },
                        }));
                      }}
                      onMoveLocation={(idx, lat, lng) => {
                        setUserOverride((prev) => ({
                          ...prev,
                          geofencing: {
                            ...prev.geofencing,
                            locations: [(prev.geofencing.locations || [])[0] ? { ...(prev.geofencing.locations[0]), lat, lng } : { lat, lng }],
                          },
                        }));
                      }}
                    />

                    {/* Summary list and remove */}
                    <div>
                      <Label>Locations</Label>
                      {(userOverride.geofencing.locations || []).length === 0 && (
                        <p className="text-sm text-muted-foreground">No location set.</p>
                      )}
                      {(userOverride.geofencing.locations || []).map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between border rounded-md p-2 mt-2">
                          <div>
                            <p className="text-sm font-medium">{loc.lat}, {loc.lng}</p>
                            {loc.address && (<p className="text-xs text-muted-foreground">{loc.address}</p>)}
                          </div>
                          <Button variant="destructive" size="sm" onClick={()=>removeUserLocation(idx)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAttendanceOverrides;