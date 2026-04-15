import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Award, BookOpen, Shield, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Smart Exams", desc: "MCQ-based assessments with auto-scoring and timed sessions" },
  { icon: Award, title: "Certificates", desc: "Earn downloadable certificates upon passing exams" },
  { icon: Shield, title: "Secure Platform", desc: "JWT-based auth with role-based access control" },
  { icon: BarChart3, title: "Analytics", desc: "Track performance with detailed dashboards and charts" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg hero-gradient flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">ExamPro</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/register">
              <Button size="sm" variant="outline">Register</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4" />
              Employee Assessment Platform
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Assess, Certify &{" "}
              <span className="gradient-text">Grow</span>
              {" "}Your Team
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A modern platform for creating exams, tracking employee performance, 
              and issuing verified certificates — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="outline" className="px-8">
                  Register as Employee
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="hero-gradient border-0 text-primary-foreground gap-2 px-8">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="stat-card text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2024 ExamPro. Built with FastAPI & React.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
