import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap, Users, MapPin, User, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await resetPassword(forgotEmail);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setActiveTab("login");
      setForgotEmail("");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] relative overflow-hidden">
      {/* Floating bubble background effect */}
      <div className="floating-bubbles">
        <div className="bubble" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="bubble" style={{ left: '30%', animationDelay: '2s' }}></div>
        <div className="bubble" style={{ left: '50%', animationDelay: '4s' }}></div>
        <div className="bubble" style={{ left: '70%', animationDelay: '1s' }}></div>
        <div className="bubble" style={{ left: '90%', animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-accent opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl mb-6">
              <Zap className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Brototype Complaints
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A transparent and efficient platform for students to submit complaints and track their resolution with real-time updates
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Card - Gradient Info Card */}
          <Card className="rounded-[30px] overflow-hidden shadow-xl border-0 animate-in fade-in slide-in-from-left duration-1000 delay-200">
            <div className="relative h-full bg-gradient-to-br from-primary via-primary-light to-accent p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <CardContent className="relative z-10 p-0 h-full flex flex-col justify-between min-h-[500px]">
                <div className="space-y-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white">
                      Welcome Back
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed">
                      Your complaints are our priority. Track status, get updates, and experience transparent resolution management.
                    </p>
                  </div>

                  <div className="space-y-6 pt-8">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">Fast Resolution</h4>
                        <p className="text-white/80 text-sm">Clear SLA targets ensure prompt responses</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">Transparent Tracking</h4>
                        <p className="text-white/80 text-sm">Real-time updates on your complaint status</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">Collaborative Resolution</h4>
                        <p className="text-white/80 text-sm">Staff work together for efficient solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Right Card - Login/Signup Card */}
          <Card className="rounded-[30px] shadow-xl border-0 bg-white animate-in fade-in slide-in-from-right duration-1000 delay-300">
            <CardContent className="p-10">
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-12 rounded-2xl bg-muted/50">
                    <TabsTrigger value="login" className="rounded-xl font-semibold">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-xl font-semibold">Sign Up</TabsTrigger>
                    <TabsTrigger value="forgot" className="rounded-xl font-semibold">Forgot</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login" className="mt-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        size="lg" 
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  {/* Signup Tab */}
                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="text" 
                            placeholder="Enter your name"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Min. 6 characters"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        size="lg" 
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  {/* Forgot Password Tab */}
                  <TabsContent value="forgot" className="mt-6">
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="text-center space-y-2 mb-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <KeyRound className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Reset Password</h3>
                        <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        size="lg" 
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>

                      <Button 
                        type="button"
                        variant="ghost"
                        onClick={() => setActiveTab("login")}
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        Back to Sign In
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Map Card */}
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <Card className="rounded-[30px] shadow-xl border-0 bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-64 bg-gradient-to-br from-primary/10 via-accent/10 to-primary-light/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-foreground mb-2">Join Our Community</h4>
                      <p className="text-muted-foreground">Thousands of students trust our platform for complaint resolution</p>
                    </div>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/20"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary-light/20"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  );
};

export default Index;