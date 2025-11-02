import React, { useEffect, useState } from 'react';
import payrollApi from '../../services/payrollApi';

const PayrollDeductionRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'fixed', amount: '', percentage: '', condition: '' });
  const [message, setMessage] = useState('');

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await payrollApi.listDeductionRules();
      const list = res?.rules || res?.data || res || [];
      setRules(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const saveRule = async () => {
    setMessage('');
    try {
      const payload = {
        code: form.code,
        name: form.name,
        type: form.type,
        amount: form.type === 'fixed' ? Number(form.amount) || 0 : undefined,
        percentage: form.type === 'percentage' ? Number(form.percentage) || 0 : undefined,
        condition: form.condition || undefined,
      };
      await payrollApi.upsertDeductionRule(payload);
      setMessage('Saved');
      setForm({ code: '', name: '', type: 'fixed', amount: '', percentage: '', condition: '' });
      loadRules();
    } catch (e) {
      setMessage('Failed to save');
    }
  };

  const deleteRule = async (code) => {
    try {
      await payrollApi.deleteDeductionRule(code);
      loadRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Deduction Rules</h1>
      <p className="text-gray-700">Create and manage organization-wide deduction rules.</p>

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Code</label>
            <input className="border rounded p-2 w-full" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., PF" />
          </div>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="border rounded p-2 w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Provident Fund" />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="border rounded p-2 w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          {form.type === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input type="number" className="border rounded p-2 w-full" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Percentage</label>
              <input type="number" className="border rounded p-2 w-full" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Condition (optional)</label>
            <input className="border rounded p-2 w-full" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g., baseSalary > 50000" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={saveRule}>Save Rule</button>
          {message && <span className="text-sm text-gray-700">{message}</span>}
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Value</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.code} className="border-t">
                <td className="p-2">{r.code}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.type === 'fixed' ? r.amount : `${r.percentage}%`}</td>
                <td className="p-2">
                  <button className="text-red-600" onClick={() => deleteRule(r.code)}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td className="p-2" colSpan="5">{loading ? 'Loading...' : 'No rules'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollDeductionRules;