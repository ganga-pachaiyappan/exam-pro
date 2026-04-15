import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, FileText, Award, BarChart3, Clock, TrendingUp, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    dashboardAPI.admin().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-primary" },
    { label: "Total Exams", value: stats.total_exams, icon: FileText, color: "text-info" },
    { label: "Total Attempts", value: stats.total_attempts, icon: BarChart3, color: "text-success" },
    { label: "Avg Pass Rate", value: `${stats.avg_pass_rate}%`, icon: TrendingUp, color: "text-warning" },
    { label: "Certificates", value: stats.total_certificates, icon: Award, color: "text-accent" },
    { label: "Paid Certificates", value: stats.paid_certificates, icon: CreditCard, color: "text-success" },
    { label: "Pending Approvals", value: stats.pending_certificates, icon: Clock, color: "text-destructive" },
    { label: "Pending Payments", value: stats.pending_payments, icon: Clock, color: "text-warning" },
    { label: "Revenue", value: `INR ${stats.total_revenue}`, icon: CreditCard, color: "text-primary" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{c.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
