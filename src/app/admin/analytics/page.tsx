
"use client";

import React from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIconLucide, LineChart as LineChartIconLucide, PieChart as PieChartIconLucide, Users, Activity, DollarSign, Download } from 'lucide-react'; // Aliased to avoid conflict
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Line, Pie, ResponsiveContainer, Cell, TooltipProps, CartesianGrid, XAxis, YAxis, LineChart, PieChart, BarChart } from "recharts" // Imported LineChart and PieChart
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

const lineChartData = [
  { month: "January", users: 186, revenue: 800000 },
  { month: "February", users: 305, revenue: 950000 },
  { month: "March", users: 237, revenue: 700000 },
  { month: "April", users: 273, revenue: 1100000 },
  { month: "May", users: 209, revenue: 850000 },
  { month: "June", users: 250, revenue: 1200000 },
]

const barChartData = [
  { service: "Consultations", count: 450, fill: "hsl(var(--chart-1))" },
  { service: "Med Orders", count: 320, fill: "hsl(var(--chart-2))" },
  { service: "Lab Tests", count: 280, fill: "hsl(var(--chart-3))" },
  { service: "Wellness Checks", count: 150, fill: "hsl(var(--chart-4))" },
];

const pieChartData = [
  { name: 'Medicine Orders', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Consultations', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Medical Tests', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Other Services', value: 200, fill: 'hsl(var(--chart-4))' },
];

const lineChartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue (RWF)",
    color: "hsl(var(--chart-2))",
  },
} satisfies Record<string, { label: string; color: string }>;

const barChartConfig = {
  count: {
    label: "Service Count",
  }
} satisfies Record<string, { label: string; color?: string }>;


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg text-sm">
        <p className="label font-medium text-foreground mb-1">{`${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.color || pld.payload.fill }} className="flex items-center">
             <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: pld.color || pld.payload.fill }} />
            {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export default function AdminAnalyticsPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Platform Analytics" 
        breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Admin", href: "/admin/dashboard"}, {label: "Analytics"}]}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,600,050 RWF</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+85 since last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567 Actions Today</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><LineChartIconLucide className="mr-2 h-5 w-5 text-primary" />User Growth & Revenue</CardTitle>
            <CardDescription>Monthly new users and revenue generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => value.toLocaleString()}/>
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}/>
                  <ChartTooltip content={<CustomTooltip />} cursor={false}/>
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2.5} dot={{ r: 4, strokeWidth:2, fill:"var(--background)" }} activeDot={{ r: 6, className: "fill-primary" }}/>
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={{ r: 4, strokeWidth:2, fill:"var(--background)" }} activeDot={{ r: 6, className: "fill-accent" }} />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><PieChartIconLucide className="mr-2 h-5 w-5 text-primary" />Service Revenue Distribution</CardTitle>
            <CardDescription>Breakdown of revenue by service type.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-xs">
                 <PieChart>
                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} 
                       label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                  >
                     {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} className="focus:outline-none hover:opacity-80 transition-opacity" />
                     ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} cursor={false}/>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card className="mt-6 shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><BarChartIconLucide className="mr-2 h-5 w-5 text-primary" />Service Usage Frequency</CardTitle>
          <CardDescription>Comparison of how frequently different services are used.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => value.toLocaleString()}/>
              <YAxis dataKey="service" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={100} />
              <ChartTooltip content={<CustomTooltip />} cursor={false}/>
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                 {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none hover:opacity-80 transition-opacity" />
                 ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Download className="mr-2 h-5 w-5 text-primary"/>Detailed Reports</CardTitle>
          <CardDescription>Download comprehensive reports for further analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                <Download className="mr-2 h-4 w-4"/>Download User Activity Report (CSV)
            </Button>
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                <Download className="mr-2 h-4 w-4"/>Download Financial Report (PDF)
            </Button>
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                <Download className="mr-2 h-4 w-4"/>Download Inventory Stock Report (Excel)
            </Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
