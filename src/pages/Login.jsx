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
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
            const res = await authAPI.login(email, password);
            login(res.data.access_token, res.data.user);
            toast({ title: "Welcome back!", description: `Logged in as ${res.data.user.name}` });
            navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
        }
        catch (err) {
            toast({
                title: "Login failed",
                description: err.response?.data?.detail || err.message || "Invalid credentials",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary-foreground"/>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Sign in to ExamPro</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>
          <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Need an employee account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>);
};
export default Login;
