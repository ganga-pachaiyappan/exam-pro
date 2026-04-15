import { useEffect, useState } from "react";
import { certificatesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Award } from "lucide-react";
const AdminCertificates = () => {
    const [certs, setCerts] = useState([]);
    const [approving, setApproving] = useState(null);
    const { toast } = useToast();
    const load = () => certificatesAPI.all().then((r) => setCerts(r.data)).catch(() => { });
    useEffect(() => { load(); }, []);
    const handleApprove = async (id) => {
        setApproving(id);
        try {
            await certificatesAPI.approve(id);
            toast({ title: "Certificate approved!" });
            load();
        }
        catch {
            toast({ title: "Error", variant: "destructive" });
        }
        finally {
            setApproving(null);
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage Certificates</h1>
        {certs.length === 0 ? (<div className="glass-card p-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <p className="text-muted-foreground">No certificates yet</p>
          </div>) : (<div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">Employee</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Exam</th>
                    <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Score</th>
                    <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Payment</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c) => (<tr key={c.id} className="border-t border-border">
                      <td className="p-3 text-foreground font-medium">{c.user_name}</td>
                      <td className="p-3 text-muted-foreground">{c.exam_title}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.percentage}%</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {c.is_payment_completed ? "Paid" : "Pending"}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.is_approved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {c.is_approved ? <><CheckCircle className="h-3 w-3"/> Approved</> : <><Clock className="h-3 w-3"/> Pending</>}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!c.is_approved && (<Button size="sm" onClick={() => handleApprove(c.id)} disabled={approving === c.id}>
                            Approve
                          </Button>)}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
};
export default AdminCertificates;
