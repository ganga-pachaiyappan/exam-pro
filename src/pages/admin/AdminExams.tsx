import { useEffect, useState } from "react";
import { examsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, X, Edit } from "lucide-react";

interface QuestionForm {
  question_type: "mcq" | "coding";
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  code_template: string;
  expected_answer: string;
  marks: number;
}

const emptyQuestion: QuestionForm = {
  question_type: "mcq",
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",
  code_template: "",
  expected_answer: "",
  marks: 1,
};

const AdminExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    total_marks: 100,
    pass_percentage: 50,
    certificate_price: 499,
    currency: "INR",
  });
  const [questions, setQuestions] = useState<QuestionForm[]>([{ ...emptyQuestion }]);

  const load = () => examsAPI.list().then((r) => setExams(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", duration_minutes: 30, total_marks: 100, pass_percentage: 50, certificate_price: 499, currency: "INR" });
    setQuestions([{ ...emptyQuestion }]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (id: number) => {
    const res = await examsAPI.getAdmin(id);
    const exam = res.data;
    setForm({
      title: exam.title,
      description: exam.description,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      pass_percentage: exam.pass_percentage,
      certificate_price: exam.certificate_price,
      currency: exam.currency,
    });
    setQuestions(exam.questions.map((q: any) => ({
      question_type: q.question_type,
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option || "a",
      code_template: q.code_template || "",
      expected_answer: q.expected_answer || "",
      marks: q.marks,
    })));
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = { ...form, questions };
      if (editingId) {
        await examsAPI.update(editingId, data);
        toast({ title: "Exam updated!" });
      } else {
        await examsAPI.create(data);
        toast({ title: "Exam created!" });
      }
      resetForm();
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam?")) return;
    try {
      await examsAPI.delete(id);
      toast({ title: "Exam deleted" });
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const updateQuestion = (i: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[i] as any)[field] = value;
    setQuestions(updated);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Manage Exams</h1>
          <Button onClick={() => showForm ? resetForm() : setShowForm(true)} className="gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Create Exam"}
          </Button>
        </div>

        {showForm && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <h3 className="font-heading font-semibold text-foreground">{editingId ? "Edit Exam" : "New Exam"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Pass %</Label><Input type="number" value={form.pass_percentage} onChange={(e) => setForm({ ...form, pass_percentage: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Certificate Price</Label><Input type="number" value={form.certificate_price} onChange={(e) => setForm({ ...form, certificate_price: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-foreground">Questions ({questions.length})</h4>
                <Button variant="outline" size="sm" onClick={() => setQuestions([...questions, { ...emptyQuestion }])} className="gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {questions.map((q, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Q{i + 1}</span>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, j) => j !== i))} className="h-7 w-7 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Question Type</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={q.question_type}
                      onChange={(e) => updateQuestion(i, "question_type", e.target.value)}
                    >
                      <option value="mcq">MCQ</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>
                  <Textarea placeholder="Question text" value={q.question_text} onChange={(e) => updateQuestion(i, "question_text", e.target.value)} />
                  {q.question_type === "mcq" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Option A" value={q.option_a} onChange={(e) => updateQuestion(i, "option_a", e.target.value)} />
                        <Input placeholder="Option B" value={q.option_b} onChange={(e) => updateQuestion(i, "option_b", e.target.value)} />
                        <Input placeholder="Option C" value={q.option_c} onChange={(e) => updateQuestion(i, "option_c", e.target.value)} />
                        <Input placeholder="Option D" value={q.option_d} onChange={(e) => updateQuestion(i, "option_d", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Correct Answer</Label>
                          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={q.correct_option} onChange={(e) => updateQuestion(i, "correct_option", e.target.value)}>
                            <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Marks</Label>
                          <Input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", Number(e.target.value))} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Starter Code</Label>
                          <Textarea placeholder="function solve(input) { return input; }" value={q.code_template} onChange={(e) => updateQuestion(i, "code_template", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Expected Keywords / Answer Hints</Label>
                          <Textarea placeholder="return, loop, array" value={q.expected_answer} onChange={(e) => updateQuestion(i, "expected_answer", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Marks</Label>
                        <Input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={loading || !form.title} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Questions</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Duration</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3 text-foreground font-medium">{e.title}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{e.question_count}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{e.duration_minutes} min</td>
                    <td className="p-3 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(e.id)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminExams;
