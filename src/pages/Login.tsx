import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedDotsBackground } from "@/components/magicui/animated-grid-pattern";
import { login } from "@/api/api";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const { setUser } = useAuth();

  const [credentials, setCredentials] = useState({
    user_name: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false); // حالة "تذكرني"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.user_name || !credentials.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await login(credentials.user_name, credentials.password);
      setUser(res.data); // هيتخزن في الـ context

      toast({
        title: "Success",
        description: "Login successful! Redirecting...",
      });

      // Redirect بناءً على الدور
      const role = res.data.role;
      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "/";
        } else if (role === "employee") {
          window.location.href = "/orders";
        } else if (role === "customer") {
          window.location.href = "/products";
        } else {
          window.location.href = "/login";
        }
      }, 1000);

    } catch (err: any) {
      toast({
        title: "Error",
      description: err?.response?.data?.message || "Login failed",
      variant: "destructive",
      });
    }
  };

  // دالة تغيير حالة "تذكرني"
  const toggleRememberMe = () => {
    setRememberMe((prevState) => !prevState);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <AnimatedDotsBackground numDots={80} speed={0.5} dotSize={1.5} className="z-0" />
      <Card className="relative z-10 w-full max-w-md bg-gradient-card border-0 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-muted-foreground">Sign in to your business dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_name">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user_name"
                  type="text"
                  value={credentials.user_name}
                  onChange={(e) =>
                    setCredentials({ ...credentials, user_name: e.target.value })
                  }
                  placeholder="Enter your username"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* زر التبديل لتفعيل "تذكرني" */}
            <div className="flex justify-between items-center pt-4">
              <Label
                htmlFor="rememberMeToggle"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </Label>
              <div
                onClick={toggleRememberMe}
                className={`relative inline-block w-12 h-6 transition-all duration-300 rounded-full cursor-pointer ${
                  rememberMe ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${
                    rememberMe ? "translate-x-6" : ""
                  }`}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
