
"use client";

import React, {useEffect, useState} from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIconLucide, LineChart as LineChartIconLucide, PieChart as PieChartIconLucide, Users, Activity, DollarSign, Download, Loader2 } from 'lucide-react'; 
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Line, Pie, ResponsiveContainer, Cell, TooltipProps, CartesianGrid, XAxis, YAxis, LineChart, PieChart, BarChart } from "recharts" 
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText;

// Mock data - in a real app, this would be fetched from the backend
const lineChartData = [
  { month: "Mutarama", users: 186, revenue: 800000 },
  { month: "Gashyantare", users: 305, revenue: 950000 },
  { month: "Werurwe", users: 237, revenue: 700000 },
  { month: "Mata", users: 273, revenue: 1100000 },
  { month: "Gicurasi", users: 209, revenue: 850000 },
  { month: "Kamena", users: 250, revenue: 1200000 },
];

const barChartDataKn = [
  { service: "Kubonana na Muganga", count: 450, fill: "hsl(var(--chart-1))" },
  { service: "Gutumiza Imiti", count: 320, fill: "hsl(var(--chart-2))" },
  { service: "Ibipimo bya Laboratwari", count: 280, fill: "hsl(var(--chart-3))" },
  { service: "Isuzuma Rusange", count: 150, fill: "hsl(var(--chart-4))" },
];

const pieChartDataKn = [
  { name: 'Imiti Yatumijwe', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Kubonana na Muganga', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Ibipimo bya Muganga', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Izindi Serivisi', value: 200, fill: 'hsl(var(--chart-4))' },
];

const lineChartConfig = {
  users: { label: "Abakoresha", color: "hsl(var(--chart-1))" },
  revenue: { label: "Amafaranga Yinjiye (RWF)", color: "hsl(var(--chart-2))" },
};

const barChartConfig = {
  count: { label: "Umubare wa Serivisi" }
};


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
  const { toast } = useToast();
  const router = useRouter(); // Kept for potential future use
  const [isLoading, setIsLoading] = useState(true);
  // Assume if user reaches this page, they are an "authenticated admin" for prototype purposes.
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(true); 
  
  // Data states for charts, would be populated from backend in a real app
  const [summaryMetrics, setSummaryMetrics] = useState({ totalRevenue: "5,600,050 RWF", activeUsers: "1,234", platformActivity: "Ibikorwa 567 None" });
  const [userGrowthData, setUserGrowthData] = useState(lineChartData);
  const [serviceRevenueData, setServiceRevenueData] = useState(pieChartDataKn);
  const [serviceUsageData, setServiceUsageData] = useState(barChartDataKn);


  useEffect(() => {
    // Simulate fetching analytics data.
    // In a real app, data comes from backend, not localStorage.
    setIsLoading(false);
  }, []);


  const handleDownloadReport = (reportName: string) => {
    toast({
      title: t("Download Started (Mock)", "Kurura Byatangiye (Agateganyo)"),
      description: t(`The ${reportName} will begin downloading shortly. (Backend needed)`, `Raporo ya ${reportName} igiye gutangira kururwa vuba. (Backend irakenewe)`),
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title={t("Platform Analytics", "Isesengura rya Porogaramu")} />
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Loading analytics...", "Gutegura isesengura...")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticatedAdmin) {
    toast({ variant: "destructive", title: t("Access Denied", "Ntabwo Wemerewe") });
    return <AppLayout><PageHeader title={t("Access Denied", "Ntabwo Wemerewe")} /></AppLayout>;
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("Platform Analytics", "Isesengura rya Porogaramu")} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Admin", "Ubuyobozi"), href: "/admin/dashboard"}, 
            {label: t("Analytics", "Isesengura")}
        ]}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Total Revenue", "Amafaranga Yose Yinjiye")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">{t("+15.2% from last month", "+15.2% ugereranyije n'ukwezi gushize")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Active Users", "Abakoresha Bakora")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{t("+85 since last week", "+85 kuva mu cyumweru gishize")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Platform Activity", "Ibikorwa kuri Porogaramu")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.platformActivity}</div>
            <p className="text-xs text-muted-foreground">{t("+12% from yesterday", "+12% kuva ejo")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><LineChartIconLucide className="mr-2 h-5 w-5 text-primary" />{t("User Growth & Revenue", "Ukwiyongera kw'Abakoresha & Amafaranga")}</CardTitle>
            <CardDescription>{t("Monthly new users and revenue generated.", "Abakoresha bashya ba buri kwezi n'amafaranga yinjiye.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
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
            <CardTitle className="font-headline flex items-center"><PieChartIconLucide className="mr-2 h-5 w-5 text-primary" />{t("Service Revenue Distribution", "Ikigabanyo cy'Amafaranga ya Serivisi")}</CardTitle>
            <CardDescription>{t("Breakdown of revenue by service type.", "Isesengura ry'amafaranga yinjiye hashingiwe ku bwoko bwa serivisi.")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-xs">
                 <PieChart>
                  <Pie data={serviceRevenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} 
                       label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                     {serviceRevenueData.map((entry, index) => (
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
          <CardTitle className="font-headline flex items-center"><BarChartIconLucide className="mr-2 h-5 w-5 text-primary" />{t("Service Usage Frequency", "Inshuro Serivisi Zikoreshwa")}</CardTitle>
          <CardDescription>{t("Comparison of how frequently different services are used.", "Ugereranya ry'inshuro serivisi zitandukanye zikoreshwa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={serviceUsageData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => value.toLocaleString()}/>
              <YAxis dataKey="service" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={140} />
              <ChartTooltip content={<CustomTooltip />} cursor={false}/>
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                 {serviceUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none hover:opacity-80 transition-opacity" />
                 ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Download className="mr-2 h-5 w-5 text-primary"/>{t("Detailed Reports", "Raporo Zisesuye")}</CardTitle>
          <CardDescription>{t("Download comprehensive reports for further analysis.", "Kurura raporo zuzuye kugirango usesengure byimbitse.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors" onClick={() => handleDownloadReport(t("User Activity Report", "Raporo y'Ibikorwa by'Abakoresha"))}>
                <Download className="mr-2 h-4 w-4"/>{t("Download User Activity Report (CSV)", "Kurura Raporo y'Ibikorwa by'Abakoresha (CSV)")}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors" onClick={() => handleDownloadReport(t("Financial Report", "Raporo y'Imari"))}>
                <Download className="mr-2 h-4 w-4"/>{t("Download Financial Report (PDF)", "Kurura Raporo y'Imari (PDF)")}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors" onClick={() => handleDownloadReport(t("Inventory Stock Report", "Raporo y'Ububiko"))}>
                <Download className="mr-2 h-4 w-4"/>{t("Download Inventory Stock Report (Excel)", "Kurura Raporo y'Ububiko (Excel)")}
            </Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
```