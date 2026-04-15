import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    examsAPI.get(Number(id)).then((r) => {
      setExam(r.data);
      setTimeLeft(r.data.duration_minutes * 60);
    }).catch(() => navigate("/exams"));
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([qid, opt]) => ({
        question_id: Number(qid),
        selected_option: typeof opt === "string" && opt.length === 1 ? opt : undefined,
        coding_answer: typeof opt === "string" && opt.length > 1 ? opt : undefined,
      }));
      const res = await examsAPI.submit(Number(id), { answers: answerList });
      setResult(res.data);
      toast({ title: res.data.passed ? "🎉 Congratulations!" : "Keep trying!", description: `Score: ${res.data.percentage}%` });
    } catch {
      toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [answers, id, submitting, result]);

  useEffect(() => {
    if (!started || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, started, result, handleSubmit]);

  if (!exam) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className={cn("h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4", result.passed ? "bg-success/10" : "bg-destructive/10")}>
            <CheckCircle className={cn("h-8 w-8", result.passed ? "text-success" : "text-destructive")} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{result.passed ? "You Passed! 🎉" : "Not Quite 😔"}</h2>
          <p className="text-muted-foreground mb-4">Score: {result.score}/{result.total_marks} ({result.percentage}%)</p>
          {result.passed && <p className="text-sm text-success mb-4">A certificate has been requested for approval.</p>}
          <Button onClick={() => navigate("/dashboard")} className="w-full">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-lg w-full text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{exam.title}</h2>
          <p className="text-muted-foreground mb-6">{exam.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div className="stat-card !p-3"><p className="text-muted-foreground">Questions</p><p className="font-bold text-foreground">{exam.questions.length}</p></div>
            <div className="stat-card !p-3"><p className="text-muted-foreground">Duration</p><p className="font-bold text-foreground">{exam.duration_minutes}m</p></div>
            <div className="stat-card !p-3"><p className="text-muted-foreground">Pass</p><p className="font-bold text-foreground">{exam.pass_percentage}%</p></div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Certificate unlock after passing: {exam.currency} {exam.certificate_price}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/exams")} className="flex-1"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            <Button onClick={() => setStarted(true)} className="flex-1 hero-gradient border-0 text-primary-foreground">Start Exam</Button>
          </div>
        </div>
      </div>
    );
  }

  const q = exam.questions[current];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background">
      {/* Timer bar */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-heading font-semibold text-foreground text-sm">{exam.title}</span>
        <span className={cn("flex items-center gap-1 text-sm font-mono font-bold", timeLeft < 60 ? "text-destructive" : "text-foreground")}>
          <Clock className="h-4 w-4" /> {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {exam.questions.map((_: any, i: number) => (
            <div
              key={i}
              className={cn("h-2 flex-1 rounded-full cursor-pointer transition-colors", i === current ? "bg-primary" : answers[exam.questions[i].id] ? "bg-primary/40" : "bg-muted")}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-2">Question {current + 1} of {exam.questions.length}</p>
        <h3 className="font-heading text-xl font-semibold text-foreground mb-6">{q.question_text}</h3>

        <div className="space-y-3 mb-8">
          {q.question_type === "coding" ? (
            <>
              {q.code_template && (
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Starter code</p>
                  <pre className="whitespace-pre-wrap text-sm text-foreground">{q.code_template}</pre>
                </div>
              )}
              <Textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                className="min-h-[260px] font-mono"
                placeholder="Write your solution here..."
              />
            </>
          ) : (
            [
              { key: "a", text: q.option_a },
              { key: "b", text: q.option_b },
              { key: "c", text: q.option_c },
              { key: "d", text: q.option_d },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAnswers({ ...answers, [q.id]: opt.key })}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  answers[q.id] === opt.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold mr-3",
                  answers[q.id] === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {opt.key.toUpperCase()}
                </span>
                <span className="text-foreground">{opt.text}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="flex-1" />
          {current < exam.questions.length - 1 ? (
            <Button onClick={() => setCurrent(current + 1)} className="gap-1">Next <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="hero-gradient border-0 text-primary-foreground gap-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Exam"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
