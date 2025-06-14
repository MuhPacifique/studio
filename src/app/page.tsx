"use client";

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Stethoscope, ActivitySquare, MessageSquareQuote, FlaskConical, Video, CreditCard, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';

const features = [
  {
    title: "Order Medicines",
    description: "Browse our catalog and order your medicines online.",
    href: "/medicines",
    icon: Pill,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    title: "View Medical Tests",
    description: "Access information about available medical tests.",
    href: "/medical-tests",
    icon: Stethoscope,
    color: "text-green-500",
    bgColor: "bg-green-50 hover:bg-green-100",
  },
  {
    title: "Symptom Analyzer",
    description: "Get insights based on your symptoms. (AI Powered)",
    href: "/symptom-analyzer",
    icon: ActivitySquare,
    color: "text-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
  {
    title: "Medical FAQ",
    description: "Find answers to common medical questions. (AI Powered)",
    href: "/faq",
    icon: MessageSquareQuote,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
  },
  {
    title: "Test Yourself",
    description: "Input symptoms for potential disease info. (AI Powered)",
    href: "/test-yourself",
    icon: FlaskConical,
    color: "text-red-500",
    bgColor: "bg-red-50 hover:bg-red-100",
  },
  {
    title: "Online Consultation",
    description: "Consult with doctors online via video call.",
    href: "/online-consultation",
    icon: Video,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
  },
];

export default function HomePage() {
  return (
    <AppLayout>
      <PageHeader title="Welcome to MediServe Hub" />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Your Integrated Health Companion</CardTitle>
            <CardDescription>
              MediServe Hub provides a seamless experience for managing your health needs, from ordering medicines to consulting with doctors online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore our services designed to make healthcare more accessible and convenient for you.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} legacyBehavior>
              <a className="block group">
                <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{feature.title}</CardTitle>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="flex items-center pt-4 text-sm font-medium text-primary group-hover:underline">
                      Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Need to make a payment?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <p className="text-muted-foreground mb-4 sm:mb-0">Securely process your payments for services and orders.</p>
            <Button asChild>
              <Link href="/payment">
                <CreditCard className="mr-2 h-4 w-4" />
                Go to Payments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
