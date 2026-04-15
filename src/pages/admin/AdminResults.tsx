import { useEffect, useState } from "react";
import { examsAPI, paymentsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(160, 70%, 42%)", "hsl(0, 75%, 55%)", "hsl(220, 80%, 50%)", "hsl(38, 92%, 50%)"];

const AdminResults = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    examsAPI.allAttempts().then((r) => setAttempts(r.data)).catch(() => {});
    paymentsAPI.all().then((r) => setPayments(r.data)).catch(() => {});
  }, []);

  const passed = attempts.filter((a) => a.passed).length;
  const failed = attempts.length - passed;
  const pieData = [
    { name: "Passed", value: passed },
    { name: "Failed", value: failed },
  ];

  const examScores: Record<string, number[]> = {};
  attempts.forEach((a) => {
    if (!examScores[a.exam_title]) examScores[a.exam_title] = [];
    examScores[a.exam_title].push(a.percentage);
  });
  const barData = Object.entries(examScores).map(([name, scores]) => ({
    name: name.slice(0, 20),
    avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    attempts: scores.length,
  }));

  const paymentData = payments.reduce((acc: Record<string, number>, payment: any) => {
    const key = payment.provider || "demo";
    acc[key] = (acc[key] || 0) + payment.amount;
    return acc;
  }, {});
  const revenueBars = Object.entries(paymentData).map(([name, amount]) => ({ name, amount }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Results & Analytics</h1>

        {attempts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Pass/Fail Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Average Score by Exam</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-semibold text-foreground">Revenue by Payment Provider</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="p-4 border-b border-border">
                <h3 className="font-heading font-semibold text-foreground">All Attempts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-muted-foreground font-medium">Exam</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Score</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.slice().reverse().map((a) => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="p-3 text-foreground">{a.exam_title}</td>
                        <td className="p-3 text-foreground">{a.percentage}%</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {a.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminResults;
