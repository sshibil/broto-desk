import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap, Users, MapPin, User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
              <div className="space-y-8">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-foreground">Sign In</h3>
                  <p className="text-muted-foreground">Access your complaint dashboard</p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="Enter your email"
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
                        className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all group font-semibold text-lg"
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-muted-foreground">OR</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="w-full h-14 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-lg"
                  >
                    Create Account
                  </Button>
                </div>
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
