import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    useEffect(() => {
        if (!authLoading && user) {
            navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
        }
    }, [authLoading, navigate, user]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.register(form);
            login(res.data.access_token, res.data.user);
            toast({
                title: "Account created",
                description: `Welcome, ${res.data.user.name}`,
            });
            navigate("/dashboard");
        }
        catch (err) {
            toast({
                title: "Registration failed",
                description: err.response?.data?.detail || err.message || "Unable to create your account",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary-foreground"/>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Create your employee account</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Employee registration is open here. Admin accounts can only be created by an existing admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Optional phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Optional address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}/>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required/>
            </div>
          </div>

          <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Register as Employee"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>);
};
export default Register;
