"use client"

import * as React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "./card"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table"
import { KPICard, MetricCard } from "./kpi-card"
import { 
  Navigation, 
  NavigationGroup, 
  NavigationItem 
} from "./navigation"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Home,
  Settings,
  BarChart3
} from "lucide-react"

export function ComponentShowcase() {
  return (
    <div className="space-section max-w-7xl mx-auto px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-display bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Modern UI Components
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            A showcase of our modern design system components with dark theme, glassmorphism effects, and enhanced accessibility.
          </p>
        </div>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Modern Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>
                  A simple card with modern styling and glassmorphism effects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">
                  This card demonstrates the new design system with proper spacing and typography.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>
                  Enhanced glassmorphism effect for premium feel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">
                  This card uses the glass variant for overlay elements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card with Action</CardTitle>
                <CardDescription>
                  Card with action button in header.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Action
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* KPI Cards Section */}
        <section className="space-y-6">
          <h2 className="text-h2">KPI & Metric Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value="$45,231"
              delta={{ value: "+12.5%", trend: "up" }}
              description="vs last month"
              icon={<DollarSign className="h-5 w-5" />}
            />
            
            <KPICard
              title="Active Users"
              value="2,350"
              delta={{ value: "-2.1%", trend: "down" }}
              description="vs last week"
              icon={<Users className="h-5 w-5" />}
            />

            <MetricCard
              title="Conversion Rate"
              value="3.2%"
              subtitle="Last 30 days"
              trend={{ value: "+0.5%", direction: "up", period: "vs prev" }}
              icon={<TrendingUp className="h-5 w-5" />}
            />

            <MetricCard
              title="Page Views"
              value="12,345"
              subtitle="Today"
              trend={{ value: "+8.2%", direction: "up", period: "vs yesterday" }}
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Modern Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="modern">Modern</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Modern buttons feature:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Enhanced hover effects with scale transforms</li>
              <li>• Modern shadows and glassmorphism</li>
              <li>• Improved focus states for accessibility</li>
              <li>• Smooth transitions and animations</li>
            </ul>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Modern Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-body-sm font-medium">Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <label className="text-body-sm font-medium">Password</label>
              <Input type="password" placeholder="Enter your password" />
            </div>
            <div className="space-y-2">
              <label className="text-body-sm font-medium">Search</label>
              <Input type="search" placeholder="Search..." />
            </div>
            <div className="space-y-2">
              <label className="text-body-sm font-medium">Disabled</label>
              <Input disabled placeholder="Disabled input" />
            </div>
          </div>
          <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Modern inputs feature:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Glassmorphism background with backdrop blur</li>
              <li>• Enhanced focus states with ring effects</li>
              <li>• Smooth hover and focus transitions</li>
              <li>• Improved accessibility with proper contrast</li>
            </ul>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Modern Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Modern badges feature:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Rounded pill design with subtle borders</li>
              <li>• Hover effects with scale transforms</li>
              <li>• Enhanced color variants for better contrast</li>
              <li>• Smooth transitions and animations</li>
            </ul>
          </div>
        </section>

        {/* Table Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Table</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob Johnson</TableCell>
                <TableCell>
                  <Badge variant="destructive">Inactive</Badge>
                </TableCell>
                <TableCell>bob@example.com</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Navigation Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Navigation</h2>
          <div className="max-w-xs">
            <Navigation>
              <NavigationGroup>
                <NavigationItem
                  icon={<Home className="h-4 w-4" />}
                  label="Dashboard"
                  isActive={true}
                />
                <NavigationItem
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Analytics"
                  badge="3"
                />
                <NavigationItem
                  icon={<Users className="h-4 w-4" />}
                  label="Users"
                />
              </NavigationGroup>
              <NavigationGroup title="Settings">
                <NavigationItem
                  icon={<Settings className="h-4 w-4" />}
                  label="Preferences"
                />
              </NavigationGroup>
            </Navigation>
          </div>
        </section>
      </div>
    </div>
  )
}

