import React, { useEffect, useState } from 'react';
import payrollApi from '../../services/payrollApi';
import employeeApi from '../../services/employeeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'
import tenantApi from '../../services/tenantApi';

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const PayrollSalarySlip = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [slip, setSlip] = useState(null);
  const [message, setMessage] = useState('');
  const selectedEmployee = employees.find((e) => e.id === selectedUserId);

  const [adjustmentName, setAdjustmentName] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paidDays, setPaidDays] = useState(null);
  const [lopDays, setLopDays] = useState(0);
  const [payDate, setPayDate] = useState('');
  // Add local editable line items state
  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [organization, setOrganization] = useState(null);

  // Earnings table handlers
  const addEarning = () => {
    setEarnings((prev) => [...prev, { label: '', amount: 0, code: '' }]);
  };
  const updateEarning = (idx, field, value) => {
    setEarnings((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: field === 'amount' ? Number(value) || 0 : value } : row
      )
    );
  };
  const removeEarning = (idx) => {
    setEarnings((prev) => prev.filter((_, i) => i !== idx));
  };

  // Deductions table handlers
  const addDeduction = () => {
    setDeductions((prev) => [...prev, { label: '', amount: 0, code: '' }]);
  };
  const updateDeduction = (idx, field, value) => {
    setDeductions((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: field === 'amount' ? Number(value) || 0 : value } : row
      )
    );
  };
  const removeDeduction = (idx) => {
    setDeductions((prev) => prev.filter((_, i) => i !== idx));
  }; 

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

  const fetchSlip = async () => {
    if (!selectedUserId) return;
    setLoadingSlip(true);
    setMessage('');
    try {
      const res = await payrollApi.getSlip(selectedUserId, year, month);
      setSlip(res);
    } catch (e) {
      setSlip(null);
      setMessage('No slip found. Generate a draft first.');
      toast.info('No slip found. Generate a draft first.');
    } finally {
      setLoadingSlip(false);
    }
  };

  const generateSlip = async () => {
    if (!selectedUserId) return;
    setMessage('');
    try {
      const res = await payrollApi.generateSlip({ userId: selectedUserId, year, month });
      setSlip(res);
      toast.success('Draft generated');
    } catch (e) {
      toast.error('Failed to generate');
    }
  };

  const addAdjustment = () => {
    if (!adjustmentName || !adjustmentAmount) return;
    const amt = Number(adjustmentAmount);
    if (Number.isNaN(amt)) return;
    setSlip({
      ...slip,
      adjustments: [...(slip?.adjustments || []), { name: adjustmentName, amount: amt }]
    });
    setAdjustmentName('');
    setAdjustmentAmount('');
  };

  // Auto-load or generate slip on user/year/month change
  useEffect(() => {
    const autoLoad = async () => {
      if (!selectedUserId || !year || !month) return;
      setLoadingSlip(true);
      setMessage('');
      try {
        const res = await payrollApi.getSlip(selectedUserId, year, month);
        setSlip(res);
      } catch (e) {
        try {
          const gen = await payrollApi.generateSlip({ userId: selectedUserId, year, month });
          setSlip(gen);
          toast.success('Draft generated');
        } catch (err) {
          setSlip(null);
          toast.error('Failed to load or generate slip');
        }
      } finally {
        setLoadingSlip(false);
      }
    };
    autoLoad();
  }, [selectedUserId, year, month]);

  // Initialize overrides and editable tables from slip
  useEffect(() => {
    const totalDays = new Date(year, month, 0).getDate();
    setPaidDays(slip?.paidDays ?? totalDays);
    setLopDays(slip?.lopDays ?? 0);
    const defaultPayDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    setPayDate(slip?.payDate ?? defaultPayDate);

    const items = Array.isArray(slip?.lineItems) ? slip.lineItems : [];
    setEarnings(items.filter(i => i.type === 'earning' || (i.type === 'adjustment' && Number(i.amount) > 0)).map(i => ({ label: i.label, amount: Number(i.amount) || 0, code: i.code || '' })));
    setDeductions(items.filter(i => i.type === 'deduction' || (i.type === 'adjustment' && Number(i.amount) < 0)).map(i => ({ label: i.label, amount: Number(i.amount) || 0, code: i.code || '' })));
  }, [slip, year, month]);

  const reviewAndGenerate = async () => {
    if (!selectedUserId || !slip) return;
    try {
      const lineItems = [
        ...earnings.map((e, i) => ({ code: e.code || `earn_${i + 1}`, label: e.label || 'Earning', type: 'earning', amount: Number(e.amount) || 0 })),
        ...deductions.map((d, i) => ({ code: d.code || `ded_${i + 1}`, label: d.label || 'Deduction', type: 'deduction', amount: Number(d.amount) || 0 })),
      ];
      const payload = {
        lineItems,
        notes: slip.notes || '',
        paidDays: Number(paidDays) || null,
        lopDays: Number(lopDays) || 0,
        payDate,
      };
      const res = await payrollApi.updateSlip(selectedUserId, year, month, payload);
      setSlip(res);
      setPreviewOpen(true);
    } catch (e) {
      toast.error('Could not prepare slip for generation');
    }
  };

  // Add missing handlers: saveSlip, generatePDF, downloadPDF
  const saveSlip = async () => {
    if (!selectedUserId || !slip) return;
    try {
      const lineItems = [
        ...earnings.map((e, i) => ({ code: e.code || `earn_${i + 1}`, label: e.label || 'Earning', type: 'earning', amount: Number(e.amount) || 0 })),
        ...deductions.map((d, i) => ({ code: d.code || `ded_${i + 1}`, label: d.label || 'Deduction', type: 'deduction', amount: Number(d.amount) || 0 })),
      ];
      const payload = {
        lineItems,
        notes: slip.notes || '',
        paidDays: Number(paidDays) || null,
        lopDays: Number(lopDays) || 0,
        payDate,
      };
      const res = await payrollApi.updateSlip(selectedUserId, year, month, payload);
      setSlip(res);
      toast.success('Changes saved');
    } catch (e) {
      toast.error('Failed to save changes');
    }
  };

  const generatePDF = async () => {
    if (!selectedUserId) return;
    try {
      const result = await payrollApi.generateSlipPDF(selectedUserId, year, month);
      const url = result?.url;
      if (url) {
        window.open(url, '_blank', 'noopener');
      } else {
        toast.info('PDF generated, but no URL returned');
      }
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const downloadPDF = async () => {
    if (!selectedUserId) return;
    try {
      let result = await payrollApi.getSlipPDF(selectedUserId, year, month);
      let url = result?.url;
      if (!url) {
        result = await payrollApi.generateSlipPDF(selectedUserId, year, month);
        url = result?.url;
      }
      if (url) {
        window.open(url, '_blank', 'noopener');
      } else {
        toast.error('PDF not available');
      }
    } catch (e) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Salary Slips</h1>
      <p className="text-gray-700">Generate and manage monthly salary slips for employees.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
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
        <div>
          <Label>Year</Label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
        <div>
          <Label>Month</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {message && <div className="text-sm text-gray-700">{message}</div>}

      {slip && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                 <div>Base Salary: <span className="font-medium">{slip.baseSalary}</span></div>
                 <div>Total Earnings: <span className="font-medium">{slip.totalEarnings}</span></div>
                 <div>Total Deductions: <span className="font-medium">{slip.totalDeductions}</span></div>
                 <div>Net Pay: <span className="font-medium">{slip.netPay}</span></div>
                 <div>Status: <span className="font-medium">{slip.status}</span></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                 <div>
                   <Label className="text-xs">Paid Days</Label>
                   <Input type="number" value={paidDays ?? ''} onChange={(e) => setPaidDays(Number(e.target.value))} />
                 </div>
                 <div>
                   <Label className="text-xs">Loss of Pay Days</Label>
                   <Input type="number" value={lopDays} onChange={(e) => setLopDays(Number(e.target.value))} />
                 </div>
                 <div>
                   <Label className="text-xs">Pay Date</Label>
                   <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                 </div>
               </div>
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings table */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <Button variant="outline" size="sm" onClick={addEarning}>Add Earning</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead className="w-40">Amount</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((row, idx) => (
                      <TableRow key={`earn_${idx}`}>
                        <TableCell>
                          <Input value={row.label} onChange={(e) => updateEarning(idx, 'label', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={row.amount} onChange={(e) => updateEarning(idx, 'amount', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeEarning(idx)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {earnings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-sm text-gray-600">No earnings added</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Deductions table */}
            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <Button variant="outline" size="sm" onClick={addDeduction}>Add Deduction</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead className="w-40">Amount</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductions.map((row, idx) => (
                      <TableRow key={`ded_${idx}`}>
                        <TableCell>
                          <Input value={row.label} onChange={(e) => updateDeduction(idx, 'label', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={row.amount} onChange={(e) => updateDeduction(idx, 'amount', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeDeduction(idx)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deductions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-sm text-gray-600">No deductions added</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={slip.notes || ''} onChange={(e) => setSlip({ ...slip, notes: e.target.value })} className="h-24" />
            </CardContent>
          </Card>

          <div className="flex gap-3">
             <Button onClick={saveSlip} disabled={!selectedUserId}>Save Changes</Button>
             <Button variant="secondary" onClick={reviewAndGenerate} disabled={!selectedUserId}>Review & Generate PDF</Button>
             <Button variant="outline" onClick={downloadPDF} disabled={!selectedUserId}>Download Latest PDF</Button>
           </div>
        </div>
      )}

      {/* Payslip Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Pay Slip</DialogTitle>
          </DialogHeader>
          {slip ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                {/* <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">Logo</div>
                  <div>
                    <div className="text-xl font-bold">{organization?.name || 'Organization'}</div>
                    <div className="text-xs text-gray-600">{organization?.city || ''} {organization?.zipCode || ''} {organization?.country || ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Payslip For the Month</div>
                  <div className="text-lg font-semibold">{months.find(m => m.value === month)?.label} {year}</div>
                </div> */}
              </div>

              {/* Net Pay Summary Card */}
              {/* <div className="flex justify-end">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-72">
                  <div className="text-green-700 text-lg font-semibold">{formatCurrencyINR(slip.netPay)}</div>
                  <div className="text-xs text-green-800">Total Net Pay</div>
                </div>
              </div> */}

              {/* Employee Summary */}
              <div>
                <div className="font-semibold mb-2">Employee Summary</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Employee Name</div>
                    <div className="font-medium">{selectedEmployee?.name || selectedEmployee?.email || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Employee ID</div>
                    <div className="font-medium">{selectedEmployee?.id || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Pay Period</div>
                    <div className="font-medium">{months.find(m => m.value === month)?.label} {year}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Pay Date</div>
                    <div className="font-medium">{(slip.payDate ? new Date(slip.payDate) : new Date(payDate)).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-sm font-semibold">EARNINGS</div>
                  <div className="divide-y">
                    {(slip.lineItems || []).filter(i => i.type === 'earning' || (i.type === 'adjustment' && Number(i.amount) > 0)).map((i, idx) => (
                      <div key={`e_${idx}`} className="px-3 py-2 flex justify-between text-sm">
                        <span>{i.label}</span>
                        <span className="font-medium">{formatCurrencyINR(i.amount)}</span>
                      </div>
                    ))}
                    <div className="px-3 py-2 flex justify-between bg-gray-50 font-medium">
                      <span>Gross Earnings</span>
                      <span>{formatCurrencyINR(slip.grossAmount ?? slip.totalEarnings)}</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-sm font-semibold">DEDUCTIONS</div>
                  <div className="divide-y">
                    {(slip.lineItems || []).filter(i => i.type === 'deduction' || (i.type === 'adjustment' && Number(i.amount) < 0)).map((i, idx) => (
                      <div key={`d_${idx}`} className="px-3 py-2 flex justify-between text-sm">
                        <span>{i.label}</span>
                        <span className="font-medium">{formatCurrencyINR(Math.abs(i.amount))}</span>
                      </div>
                    ))}
                    <div className="px-3 py-2 flex justify-between bg-gray-50 font-medium">
                      <span>Total Deductions</span>
                      <span>{formatCurrencyINR(slip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Net Payable */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                  <div className="md:col-span-3 px-3 py-3 text-sm">
                    <div className="font-semibold">TOTAL NET PAYABLE</div>
                    <div className="text-gray-600">Gross Earnings - Total Deductions</div>
                  </div>
                  <div className="bg-green-50 px-3 py-3 text-right font-semibold">{formatCurrencyINR(slip.netPay ?? ((slip.grossAmount ?? slip.totalEarnings) - slip.totalDeductions))}</div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="text-sm text-gray-700">
                Amount In Words : {amountInWords(slip.netPay ?? 0)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={generatePDF}>Generate PDF</Button>
                <Button variant="outline" onClick={downloadPDF}>Download PDF</Button>
              </div>

              {/* Footer */}
              {/* <div className="text-center text-xs text-gray-500">— This is a system-generated document. —</div> */}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No slip to preview. Generate or load a slip.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollSalarySlip;

// Helpers for formatting
const formatCurrencyINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num);
};
const amountInWords = (value) => {
  const num = Math.round(Number(value) || 0);
  const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const toWordsUnderThousand = (n) => {
    let s = '';
    if (n >= 100) { s += ones[Math.floor(n/100)] + ' Hundred'; n = n % 100; if (n) s += ' '; }
    if (n >= 20) { s += tens[Math.floor(n/10)]; n = n % 10; if (n) s += '-' + ones[n]; }
    else if (n > 0) { s += ones[n]; }
    return s || 'Zero';
  };
  const scales = ['','Thousand','Million','Billion'];
  let words = [];
  let i = 0, n = num;
  while (n > 0 && i < scales.length) {
    const chunk = n % 1000;
    if (chunk) words.unshift(`${toWordsUnderThousand(chunk)}${scales[i] ? ' ' + scales[i] : ''}`);
    n = Math.floor(n/1000); i++;
  }
  const joined = words.join(' ');
  return `Indian Rupee ${joined || 'Zero'} Only`;
};