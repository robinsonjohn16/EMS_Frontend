import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DashboardCard = ({ title, description, to }) => (
  <Link to={to} className="block">
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

const PayrollDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payroll</h1>
      <p className="text-gray-700">Manage compensation and monthly salary slips.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Compensation"
          description="Set salaries and compensation components per employee."
          to="/payroll/compensation"
        />
        {/* Deduction Rules removed per new per-user flow */}
        <DashboardCard
          title="Salary Slips"
          description="Generate, review, edit and finalize monthly salary slips."
          to="/payroll/slips"
        />
      </div>
    </div>
  );
};

export default PayrollDashboard;