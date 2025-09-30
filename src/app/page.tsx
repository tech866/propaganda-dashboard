import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Shield, 
  TrendingUp, 
  Target, 
  Activity,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Propaganda Dashboard</h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <Badge variant="outline" className="text-sm">
              <Activity className="w-4 h-4 mr-2" />
              Modern Agency Dashboard
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Agency Client Tracking
              <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Track call performance, analyze metrics, and manage your sales team with our comprehensive dashboard. 
              Built for agencies that need real-time insights and seamless multi-tenant management.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signin">
                Sign In to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">
                Create Account
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass hover:shadow-modern-lg transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track Show Rate and Close Rate with real-time calculations. Get insights into your team's performance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-modern-lg transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Multi-Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Manage multiple clients with complete data isolation. Switch between accounts seamlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-modern-lg transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Secure access control for Sales, Admin, and CEO roles. Each user sees only what they need.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">Try the Demo</h3>
          <Card className="glass max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Experience the dashboard with our demo data. See how easy it is to track calls and analyze performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild>
                  <Link href="/auth/signin">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Demo Sign In
                  </Link>
                </Button>
                <Badge variant="outline" className="text-xs">
                  Use: test@example.com / password123
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Propaganda Dashboard. Built with Next.js and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
