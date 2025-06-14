
"use client";

import React from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart as LineChartIcon, PieChart as PieChartIcon, Users, Activity, DollarSign } from 'lucide-react'; // Aliased to avoid conflict
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Line, Pie, ResponsiveContainer, Cell, TooltipProps, CartesianGrid, XAxis, YAxis, LineChart, PieChart } from "recharts" // Imported LineChart and PieChart
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

const chartData = [
  { month: "January", users: 186, revenue: 8000 },
  { month: "February", users: 305, revenue: 9500 },
  { month: "March", users: 237, revenue: 7000 },
  { month: "April", users: 273, revenue: 11000 },
  { month: "May", users: 209, revenue: 8500 },
  { month: "June", users: 250, revenue: 12000 },
]

const pieChartData = [
  { name: 'Medicine Orders', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Consultations', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Medical Tests', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Other Services', value: 200, fill: 'hsl(var(--chart-4))' },
];

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies Record<string, { label: string; color: string }>;


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg">
        <p className="label font-medium">{`${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
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
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$56,000.50</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+85 since last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
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
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">User Growth & Revenue</CardTitle>
            <CardDescription>Monthly new users and revenue generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" tickLine={false} axisLine={false} tickMargin={8}/>
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" tickLine={false} axisLine={false} tickMargin={8}/>
                  <ChartTooltip content={<CustomTooltip />} cursor={false}/>
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Service Revenue Distribution</CardTitle>
            <CardDescription>Breakdown of revenue by service type.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-xs">
                 <PieChart>
                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label >
                     {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} cursor={false}/>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Detailed Reports</CardTitle>
          <CardDescription>Download comprehensive reports for further analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <Button variant="outline">Download User Activity Report (CSV)</Button>
            <Button variant="outline">Download Financial Report (PDF)</Button>
            <Button variant="outline">Download Inventory Stock Report (Excel)</Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
