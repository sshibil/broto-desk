import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap, Users, User, Mail, Lock, Loader2, KeyRound, CheckCircle2, Clock, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating bubble background effect */}
      <div className="floating-bubbles">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">BROTO</span>
              <span className="text-2xl font-bold text-primary">TYPE.</span>
            </div>
            <nav className="hidden md:flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-2 py-1 border border-border/50">
              <button className="nav-pill nav-pill-active">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-foreground rounded-full"></span>
                  Complaints
                </span>
              </button>
              <button className="nav-pill nav-pill-inactive">Dashboard</button>
              <button className="nav-pill nav-pill-inactive">Support</button>
            </nav>
            <Button className="hidden md:flex rounded-full bg-transparent border border-border text-foreground hover:bg-card hover:border-primary/50 gap-2">
              Book now
              <ArrowRight className="h-4 w-4 -rotate-45" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              {/* Main Hero Card */}
              <Card className="premium-card green-glow animate-in fade-in slide-in-from-left duration-700">
                <CardContent className="p-8 md:p-12 relative overflow-hidden">
                  {/* Background watermark text */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
                    <span className="text-[200px] font-bold text-primary whitespace-nowrap">COMPLAINTS</span>
                  </div>
                  
                  <div className="relative z-10 space-y-8">
                    {/* Small description */}
                    <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                      Brototype Complaints Is For Students And Staff. Anyone That Wants To Report Something And Track Resolution.
                    </p>

                    {/* Main headline */}
                    <div className="space-y-2">
                      <h1 className="text-display text-foreground leading-none">
                        WHERE
                      </h1>
                      <h1 className="text-display text-foreground leading-none">
                        <span className="gradient-text">AMBITION</span>
                      </h1>
                      <h1 className="text-display text-foreground leading-none">
                        MEETS
                      </h1>
                    </div>

                    {/* CTA Button */}
                    <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 gap-3 pl-5 pr-3 py-6 group">
                      Submit Complaint
                      <span className="arrow-button arrow-button-primary">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>

                    {/* Tags */}
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-muted-foreground text-sm">Quality //</span>
                      <span className="text-muted-foreground text-sm">Transparency //</span>
                      <span className="text-muted-foreground text-sm">Resolution //</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="premium-card animate-in fade-in slide-in-from-left duration-700 delay-200">
                <CardContent className="p-8 relative overflow-hidden">
                  {/* Background watermark */}
                  <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                    <span className="text-[120px] font-bold text-primary leading-none">SLA</span>
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                      FAST RESOLUTION<br />
                      <span className="text-primary">IN THE HEART OF</span>
                    </h2>
                    <h2 className="text-5xl md:text-6xl font-bold gradient-text">
                      BROTOTYPE.
                    </h2>
                    
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-primary font-bold">//01</span>
                        Complaints In Real-Time
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">24/7 Tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">SLA Monitoring</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Full Transparency</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground text-primary">All Staff</span>
                      </div>
                    </div>

                    {/* Navigation arrows */}
                    <div className="flex items-center gap-3 pt-4">
                      <button className="arrow-button arrow-button-secondary">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                      </button>
                      <button className="arrow-button arrow-button-primary">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Auth & Info Cards */}
            <div className="space-y-8">
              {/* Community Card */}
              <Card className="premium-card bg-primary overflow-hidden animate-in fade-in slide-in-from-right duration-700">
                <CardContent className="p-8 relative">
                  <div className="flex items-center justify-between mb-6">
                    <button className="arrow-button bg-background/20 text-foreground hover:bg-background/30">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button className="arrow-button bg-background text-primary hover:scale-110">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-primary-foreground/70 text-sm uppercase tracking-wider">Designed For</span>
                    <h3 className="text-4xl md:text-5xl font-bold text-primary-foreground leading-tight">
                      COMMUNITY<br />
                      <span className="font-normal text-3xl">BUILDING</span>
                    </h3>
                  </div>
                </CardContent>
              </Card>

              {/* Marquee Banner */}
              <div className="overflow-hidden bg-primary rounded-full py-3">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                  <span className="text-primary-foreground font-semibold">• QUALITY</span>
                  <span className="text-primary-foreground font-semibold">• TRANSPARENCY</span>
                  <span className="text-primary-foreground font-semibold">• RESOLUTION</span>
                  <span className="text-primary-foreground font-semibold">• QUALITY</span>
                  <span className="text-primary-foreground font-semibold">• TRANSPARENCY</span>
                  <span className="text-primary-foreground font-semibold">• RESOLUTION</span>
                  <span className="text-primary-foreground font-semibold">• QUALITY</span>
                  <span className="text-primary-foreground font-semibold">• TRANSPARENCY</span>
                  <span className="text-primary-foreground font-semibold">• RESOLUTION</span>
                </div>
              </div>

              {/* What Is Brototype Card */}
              <Card className="premium-card bg-primary overflow-hidden animate-in fade-in slide-in-from-right duration-700 delay-100">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <h3 className="text-4xl md:text-5xl font-bold text-primary-foreground leading-tight">
                        WHAT IS<br />
                        <span className="gradient-text">BROTOTYPE</span>
                      </h3>
                      <Button className="rounded-full bg-background text-foreground hover:bg-background/90 gap-3 pl-5 pr-3 py-5 group">
                        Get Started
                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-primary-foreground transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </div>
                    <div className="hidden md:block">
                      <span className="px-4 py-2 rounded-full border border-primary-foreground/30 text-primary-foreground text-sm">
                        ABOUT US
                      </span>
                    </div>
                  </div>
                  <p className="mt-6 text-primary-foreground/80 text-sm leading-relaxed">
                    Brototype Complaints Is For Students And Staff. Anyone That Wants To Report Something Out Of Nothing. And It Is For People Brototype Is For Creators And Ambitious People.
                  </p>
                </CardContent>
              </Card>

              {/* Login/Signup Card */}
              <Card className="premium-card bg-card animate-in fade-in slide-in-from-right duration-700 delay-200">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center green-glow">
                        <User className="h-10 w-10 text-primary-foreground" />
                      </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 h-12 rounded-full bg-muted/50 p-1">
                        <TabsTrigger value="login" className="rounded-full font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-full font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
                        <TabsTrigger value="forgot" className="rounded-full font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Forgot</TabsTrigger>
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
                              />
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            size="lg" 
                            disabled={isLoading}
                            className="w-full h-14 rounded-full bg-primary hover:bg-primary-light text-primary-foreground shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
                              />
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            size="lg" 
                            disabled={isLoading}
                            className="w-full h-14 rounded-full bg-primary hover:bg-primary-light text-primary-foreground shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
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
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
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
                                className="pl-12 h-14 rounded-full border-2 border-border bg-input focus:border-primary transition-all"
                              />
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            size="lg" 
                            disabled={isLoading}
                            className="w-full h-14 rounded-full bg-primary hover:bg-primary-light text-primary-foreground shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
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
                            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            Back to Sign In
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Special Facilities Card */}
              <Card className="premium-card bg-card animate-in fade-in slide-in-from-right duration-700 delay-300">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 rounded-full border border-border text-foreground text-sm font-medium">
                      SPECIAL FEATURES
                    </span>
                    <button className="arrow-button arrow-button-primary">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
                    A PLATFORM
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Brototype Complaints Is For Students And Staff. Anyone That Wants To Report Something Out Of Nothing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;