import { useEffect, useState } from "react";
import { dashboardAPI, examsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Award, CheckCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [attempts, setAttempts] = useState([]);
    useEffect(() => {
        dashboardAPI.me().then((r) => setStats(r.data)).catch(() => { });
        examsAPI.myAttempts().then((r) => setAttempts(r.data)).catch(() => { });
    }, []);
    const chartData = attempts.slice(-10).map((a) => ({
        name: a.exam_title?.slice(0, 15) || "Exam",
        score: a.percentage,
    }));
    const statCards = stats ? [
        { label: "Available Exams", value: stats.total_exams, icon: BookOpen, color: "text-primary" },
        { label: "Exams Taken", value: stats.attempted_exams, icon: CheckCircle, color: "text-info" },
        { label: "Exams Passed", value: stats.passed_exams, icon: TrendingUp, color: "text-success" },
        { label: "Avg Score", value: `${stats.avg_score}%`, icon: Award, color: "text-warning" },
        { label: "Leaderboard Rank", value: `#${stats.leaderboard_rank}`, icon: TrendingUp, color: "text-accent" },
        { label: "Certificates Locked", value: stats.certificates_locked, icon: Award, color: "text-destructive" },
        { label: "Total Spent", value: `INR ${stats.total_spent}`, icon: Award, color: "text-info" },
    ] : [];
    return (<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your performance overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statCards.map((s, i) => (<motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-5 w-5 ${s.color}`}/>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
            </motion.div>))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (<div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Recent Exam Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}/>
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}/>
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>)}

        {/* Recent attempts */}
        {attempts.length > 0 && (<div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground">Recent Attempts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">Exam</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Score</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(-5).reverse().map((a) => (<tr key={a.id} className="border-t border-border">
                      <td className="p-3 text-foreground">{a.exam_title}</td>
                      <td className="p-3 text-foreground">{a.percentage}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {a.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(a.submitted_at).toLocaleDateString()}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
};
export default Dashboard;
