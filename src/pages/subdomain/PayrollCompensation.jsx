import React, { useEffect, useState } from 'react';
import payrollApi from '../../services/payrollApi';
import employeeApi from '../../services/employeeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

const PayrollCompensation = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [baseSalary, setBaseSalary] = useState('');
  // Earnings components: support fixed/percent
  const [components, setComponents] = useState([]); // { name, type, value }
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('fixed');
  const [componentValue, setComponentValue] = useState('');

  // Deductions: support fixed/percent, optional cap and apply toggle
  const [deductions, setDeductions] = useState([]); // { name, type, value, apply, capAmount }
  const [deductionName, setDeductionName] = useState('');
  const [deductionType, setDeductionType] = useState('fixed');
  const [deductionValue, setDeductionValue] = useState('');
  const [deductionCap, setDeductionCap] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await employeeApi.details.getAllEmployees({ limit: 200 });
        const raw = res?.data?.employees || res?.data || res;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.employees) ? raw.employees : []);
        const mapped = list.map((e) => {
          const u = e.userId || e.user || {};
          const id = u?._id || u?.id || u;
          const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'User';
          if (!id) return null;
          return { id, name, email: u?.email };
        }).filter(Boolean);
        setEmployees(mapped);
      } catch (e) {
        console.error(e);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    const loadComp = async () => {
      if (!selectedUserId) return;
      setMessage('');
      try {
        const res = await payrollApi.getCompensation(selectedUserId);
        if (res) {
          setBaseSalary(res.baseSalary ?? '');
          const allows = Array.isArray(res.allowances) ? res.allowances : [];
          const vars = Array.isArray(res.variableComponents) ? res.variableComponents : [];
          const mergedEarnings = [...allows, ...vars].map((a) => ({
            name: a.label || a.code || '',
            type: a.type || 'fixed',
            value: Number(a.value ?? a.amount ?? 0) || 0,
          }));
          setComponents(mergedEarnings);

          const dedos = Array.isArray(res.deductionOverrides) ? res.deductionOverrides : [];
          const mappedDeds = dedos.map((d) => ({
            name: d.label || d.code || '',
            type: d.type || 'fixed',
            value: Number(d.value ?? 0) || 0,
            apply: d.apply !== false,
            capAmount: d.capAmount != null ? Number(d.capAmount) : ''
          }));
          setDeductions(mappedDeds);
        }
      } catch (e) {
        setBaseSalary('');
        setComponents([]);
        setDeductions([]);
      }
    };
    loadComp();
  }, [selectedUserId]);

  const addComponent = () => {
    if (!componentName || componentValue === '') return;
    const val = Number(componentValue);
    if (Number.isNaN(val)) return;
    setComponents([...components, { name: componentName, type: componentType, value: val }]);
    setComponentName('');
    setComponentType('fixed');
    setComponentValue('');
  };

  const removeComponent = (idx) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  const addDeduction = () => {
    if (!deductionName || deductionValue === '') return;
    const val = Number(deductionValue);
    const cap = deductionCap === '' ? '' : Number(deductionCap);
    if (Number.isNaN(val)) return;
    if (cap !== '' && Number.isNaN(cap)) return;
    setDeductions([...deductions, { name: deductionName, type: deductionType, value: val, apply: true, capAmount: cap }]);
    setDeductionName('');
    setDeductionType('fixed');
    setDeductionValue('');
    setDeductionCap('');
  };

  const removeDeduction = (idx) => {
    setDeductions(deductions.filter((_, i) => i !== idx));
  };

  const toggleDeductionApply = (idx) => {
    setDeductions(deductions.map((d, i) => (i === idx ? { ...d, apply: !d.apply } : d)));
  };

  const saveCompensation = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setMessage('');
    try {
      const allowances = (components || []).map((c) => ({
        code: String(c.name || '').toLowerCase().replace(/\s+/g, '_').slice(0, 32),
        label: String(c.name || '').trim(),
        type: c.type || 'fixed',
        value: Number(c.value) || 0,
      }));
      const deductionOverrides = (deductions || []).map((d) => ({
        code: String(d.name || '').toLowerCase().replace(/\s+/g, '_').slice(0, 32),
        label: String(d.name || '').trim(),
        type: d.type || 'fixed',
        value: Number(d.value) || 0,
        apply: d.apply !== false,
        capAmount: d.capAmount === '' ? null : Number(d.capAmount)
      }));
      const payload = {
        baseSalary: Number(baseSalary) || 0,
        allowances,
        variableComponents: [],
        deductionOverrides,
      };
      await payrollApi.upsertCompensation(selectedUserId, payload);
      toast.success('Compensation saved');
      // Refresh
      try {
        const res = await payrollApi.getCompensation(selectedUserId);
        setBaseSalary(res?.baseSalary ?? '');
        const allows2 = Array.isArray(res?.allowances) ? res.allowances : [];
        const vars2 = Array.isArray(res?.variableComponents) ? res.variableComponents : [];
        setComponents([...allows2, ...vars2].map((a) => ({ name: a.label || a.code || '', type: a.type || 'fixed', value: Number(a.value ?? a.amount ?? 0) || 0 })));
        const dedos2 = Array.isArray(res?.deductionOverrides) ? res.deductionOverrides : [];
        setDeductions(dedos2.map((d) => ({ name: d.label || d.code || '', type: d.type || 'fixed', value: Number(d.value ?? 0) || 0, apply: d.apply !== false, capAmount: d.capAmount != null ? Number(d.capAmount) : '' })));
      } catch {}
    } catch (e) {
      console.error(e);
      toast.error(typeof e === 'string' ? e : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Compensation Management</h1>
      <p className="text-gray-700">Select an employee and configure their salary, components, and deductions.</p>

      <div className="space-y-2">
        <Label>Employee</Label>
        <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingEmployees ? 'Loading...' : 'Select employee'} />
          </SelectTrigger>
          <SelectContent>
            {(Array.isArray(employees) ? employees : []).map((emp) => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                {emp.name || emp.email || emp.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUserId && (
        <div className="space-y-4">
          <div>
            <Label>Base Salary</Label>
            <Input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="e.g., 50000"
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                className="flex-1"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="Earning name (e.g., HRA)"
              />
              <Select value={componentType} onValueChange={setComponentType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="w-40"
                value={componentValue}
                onChange={(e) => setComponentValue(e.target.value)}
                placeholder={componentType === 'percent' ? 'Value (%)' : 'Amount'}
              />
              <Button onClick={addComponent}>Add</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compensation Components</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.map((c, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell className="capitalize">{c.type}</TableCell>
                        <TableCell>{c.value}</TableCell>
                        <TableCell>
                          <Button variant="link" className="text-red-600 px-0" onClick={() => removeComponent(idx)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {components.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>No components</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                className="flex-1"
                value={deductionName}
                onChange={(e) => setDeductionName(e.target.value)}
                placeholder="Deduction name (e.g., PF)"
              />
              <Select value={deductionType} onValueChange={setDeductionType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="w-32"
                value={deductionValue}
                onChange={(e) => setDeductionValue(e.target.value)}
                placeholder={deductionType === 'percent' ? 'Value (%)' : 'Amount'}
              />
              <Input
                type="number"
                className="w-32"
                value={deductionCap}
                onChange={(e) => setDeductionCap(e.target.value)}
                placeholder="Cap (optional)"
              />
              <Button onClick={addDeduction}>Add</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Cap</TableHead>
                      <TableHead>Apply</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductions.map((d, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{d.name}</TableCell>
                        <TableCell className="capitalize">{d.type}</TableCell>
                        <TableCell>{d.value}</TableCell>
                        <TableCell>{d.capAmount === '' ? '-' : d.capAmount}</TableCell>
                        <TableCell>
                          <Button variant="secondary" onClick={() => toggleDeductionApply(idx)}>{d.apply ? 'Yes' : 'No'}</Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" className="text-red-600 px-0" onClick={() => removeDeduction(idx)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deductions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>No deductions</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={saveCompensation} disabled={saving}>
              {saving ? 'Saving...' : 'Save Compensation'}
            </Button>
            {message && <span className="text-sm text-gray-700">{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollCompensation;