import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ExamList = () => {
  const [exams, setExams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    examsAPI.list().then((r) => setExams(r.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Available Exams</h1>
        {exams.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No exams available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="stat-card flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {exam.duration_minutes} min
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{exam.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{exam.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{exam.question_count} questions</span>
                  <span>Pass: {exam.pass_percentage}%</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  Certificate Unlock: {exam.currency} {exam.certificate_price}
                </div>
                <Button className="w-full gap-2" onClick={() => navigate(`/exams/${exam.id}`)}>
                  Start Exam <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamList;
