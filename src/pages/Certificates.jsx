import { useEffect, useState } from "react";
import { certificatesAPI, paymentsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Award, Download, Clock, CheckCircle, CreditCard, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const Certificates = () => {
    const [certs, setCerts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [payingId, setPayingId] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        certificatesAPI.mine().then((r) => setCerts(r.data)).catch(() => { });
        paymentsAPI.mine().then((r) => setPayments(r.data)).catch(() => { });
    }, []);
    const reload = async () => {
        const [certRes, paymentRes] = await Promise.all([certificatesAPI.mine(), paymentsAPI.mine()]);
        setCerts(certRes.data);
        setPayments(paymentRes.data);
    };
    const handleDownload = async (id) => {
        try {
            const res = await certificatesAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `certificate_${id}.pdf`;
            a.click();
        }
        catch {
            toast({ title: "Error", description: "Failed to download", variant: "destructive" });
        }
    };
    const handlePay = async (id) => {
        setPayingId(id);
        try {
            await paymentsAPI.checkoutCertificate(id, "stripe-demo");
            toast({ title: "Payment successful", description: "Certificate unlock and invoice are now available." });
            await reload();
        }
        catch (err) {
            toast({ title: "Payment failed", description: err.response?.data?.detail || "Unable to process payment", variant: "destructive" });
        }
        finally {
            setPayingId(null);
        }
    };
    const handleInvoice = async (paymentId) => {
        try {
            const res = await paymentsAPI.downloadInvoice(paymentId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice_${paymentId}.pdf`;
            a.click();
        }
        catch {
            toast({ title: "Error", description: "Failed to download invoice", variant: "destructive" });
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My Certificates</h1>
        {certs.length === 0 ? (<div className="glass-card p-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <p className="text-muted-foreground">No certificates yet. Pass an exam to earn one!</p>
          </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.map((c) => (<div key={c.id} className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.is_approved ? "bg-success/10" : "bg-warning/10"}`}>
                    {c.is_approved ? <CheckCircle className="h-5 w-5 text-success"/> : <Clock className="h-5 w-5 text-warning"/>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{c.exam_title}</h3>
                    <p className="text-xs text-muted-foreground">{c.percentage}% score</p>
                  </div>
                </div>
                <p className={`text-xs font-medium mb-3 ${c.is_approved ? "text-success" : "text-warning"}`}>
                  {c.is_approved ? "Approved" : "Pending Approval"}
                </p>
                <p className={`text-xs font-medium mb-3 ${c.is_payment_completed ? "text-success" : "text-warning"}`}>
                  {c.is_payment_completed ? "Payment completed" : "Payment required to unlock"}
                </p>
                {!c.is_payment_completed ? (<Button size="sm" className="w-full gap-2" onClick={() => handlePay(c.id)} disabled={payingId === c.id}>
                    <CreditCard className="h-3 w-3"/> {payingId === c.id ? "Processing..." : "Pay & Unlock"}
                  </Button>) : (<div className="space-y-2">
                    {c.is_approved && (<Button size="sm" className="w-full gap-2" onClick={() => handleDownload(c.id)}>
                        <Download className="h-3 w-3"/> Download Certificate
                      </Button>)}
                    {(() => {
                        const payment = payments.find((p) => p.certificate_id === c.id);
                        return payment ? (<Button size="sm" variant="outline" className="w-full gap-2" onClick={() => handleInvoice(payment.id)}>
                          <Receipt className="h-3 w-3"/> Download Invoice
                        </Button>) : null;
                    })()}
                  </div>)}
              </div>))}
          </div>)}
      </div>
    </DashboardLayout>);
};
export default Certificates;
