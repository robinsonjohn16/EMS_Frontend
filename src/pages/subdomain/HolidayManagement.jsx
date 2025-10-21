import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import holidayApi from '../../services/holidayApi';

const currentYear = new Date().getFullYear();

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: new Date(),
    recurrence: 'none',
    isActive: true,
  });

  const fetchHolidays = async (yr = year) => {
    try {
      setLoading(true);
      const res = await holidayApi.listHolidays({ year: yr });
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setHolidays(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to fetch holidays', e);
      toast.error(e?.response?.data?.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays(year);
  }, [year]);

  const resetForm = () => {
    setForm({ name: '', description: '', date: new Date(), recurrence: 'none', isActive: true });
    setEditingHoliday(null);
  };

  const emitSync = () => {
    try { window.dispatchEvent(new Event('tenant-holidays-updated')); } catch (_) {}
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || '',
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        recurrence: form.recurrence || 'none',
        isActive: !!form.isActive,
      };
      const res = editingHoliday
        ? await holidayApi.updateHoliday(editingHoliday._id, payload)
        : await holidayApi.createHoliday(payload);
      const msg = editingHoliday ? 'Holiday updated' : 'Holiday created';
      toast.success(res?.message || msg);
      setOpenDialog(false);
      resetForm();
      fetchHolidays(year);
      emitSync();
    } catch (e) {
      console.error('Save holiday failed', e);
      toast.error(e?.response?.data?.message || 'Failed to save holiday');
    }
  };

  const handleDelete = async (holiday) => {
    if (!window.confirm(`Delete holiday: ${holiday.name}?`)) return;
    try {
      await holidayApi.deleteHoliday(holiday._id);
      toast.success('Holiday deleted');
      fetchHolidays(year);
      emitSync();
    } catch (e) {
      console.error('Delete holiday failed', e);
      toast.error(e?.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const toggleActive = async (holiday, nextActive) => {
    try {
      await holidayApi.updateHoliday(holiday._id, { isActive: nextActive });
      toast.success(`Holiday ${nextActive ? 'activated' : 'deactivated'}`);
      fetchHolidays(year);
      emitSync();
    } catch (e) {
      console.error('Toggle active failed', e);
      toast.error(e?.response?.data?.message || 'Failed to update holiday');
    }
  };

  const openEdit = (holiday) => {
    setEditingHoliday(holiday);
    const date = holiday?.occurrenceDate || holiday?.date;
    setForm({
      name: holiday?.name || '',
      description: holiday?.description || '',
      date: date ? new Date(date) : new Date(),
      recurrence: holiday?.recurrence || 'none',
      isActive: !!holiday?.isActive,
    });
    setOpenDialog(true);
  };

  const yearOptions = useMemo(() => {
    const range = [];
    for (let y = currentYear - 3; y <= currentYear + 3; y++) range.push(y);
    return range;
  }, []);

  const filteredHolidays = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return holidays;
    return holidays.filter((h) => (h.name || '').toLowerCase().includes(q));
  }, [holidays, query]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Holiday Management</CardTitle>
          <CardDescription>Create, edit, and manage organization holidays.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Label>Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <Input placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setOpenDialog(true); }}>Add Holiday</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Recurrence</Label>
                    <Select value={form.recurrence} onValueChange={(v) => setForm((p) => ({ ...p, recurrence: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Date</Label>
                    <Calendar mode="single" selected={form.date} onSelect={(d) => d && setForm((p) => ({ ...p, date: d }))} className="rounded-md border" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>{editingHoliday ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : filteredHolidays?.length ? (
                  filteredHolidays.map((h) => {
                    const occ = h.occurrenceDate || h.date;
                    const dateText = occ ? new Date(occ).toLocaleDateString() : '-';
                    return (
                      <TableRow key={h._id || h.name + dateText} className={!h.isActive ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">{h.name}</TableCell>
                        <TableCell className="max-w-[280px] truncate">{h.description || '-'}</TableCell>
                        <TableCell>{dateText}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{h.recurrence || 'none'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!h.isActive} onCheckedChange={(val) => toggleActive(h, !!val)} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(h)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(h)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>No holidays found for {year}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidayManagement;