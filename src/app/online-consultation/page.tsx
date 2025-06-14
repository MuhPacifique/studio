"use client";

import React from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone, UserCheck, CalendarDays, Mic, VideoOff, MicOff, ScreenShare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mockDoctors = [
  { id: "doc1", name: "Dr. Emily Carter", specialty: "General Physician", available: true, avatarHint: "doctor portrait" },
  { id: "doc2", name: "Dr. Ben Adams", specialty: "Pediatrician", available: false, avatarHint: "physician headshot" },
  { id: "doc3", name: "Dr. Olivia Chen", specialty: "Cardiologist", available: true, avatarHint: "medical professional" },
];


export default function OnlineConsultationPage() {
  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  // Mock function to start/end call
  const toggleCall = () => setIsCallActive(!isCallActive);
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  return (
    <AppLayout>
      <PageHeader title="Online Doctor Consultation" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Online Consultation"}]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <Video className="mr-2 h-6 w-6 text-primary" /> 
                {isCallActive ? "Virtual Consultation Room" : "Ready for your consultation?"}
              </CardTitle>
              <CardDescription>
                {isCallActive ? "You are currently in a consultation with Dr. Emily Carter." : "Connect with our qualified doctors from the comfort of your home."}
              </CardDescription>
            </CardHeader>
            <CardContent className="aspect-[16/9] bg-gray-900 flex items-center justify-center relative">
              {isCallActive ? (
                <>
                  <Image 
                    src="https://placehold.co/800x450.png" 
                    alt="Doctor's Video Feed" 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint="doctor video call"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center space-x-4">
                    <Button variant="secondary" onClick={toggleMute} className="rounded-full p-3">
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button variant="destructive" onClick={toggleCall} className="rounded-full p-3">
                      <Phone className="h-5 w-5" />
                    </Button>
                     <Button variant="secondary" onClick={toggleVideo} className="rounded-full p-3">
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <Button variant="secondary" className="rounded-full p-3">
                      <ScreenShare className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg">
                    <Image 
                        src="https://placehold.co/200x112.png" 
                        alt="Patient's Video Feed" 
                        width={160} 
                        height={90} 
                        className="rounded"
                        data-ai-hint="patient video"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-white">
                  <Video className="h-24 w-24 mx-auto mb-4 text-primary" />
                  <p className="text-xl mb-2">Your video call will appear here.</p>
                  <p className="text-muted-foreground">Select a doctor and start your consultation.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" /> Available Doctors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDoctors.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint={doc.avatarHint} />
                      <AvatarFallback>{doc.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={toggleCall} disabled={!doc.available || isCallActive}>
                    {doc.available ? (isCallActive ? 'In Call' : 'Start Call') : 'Offline'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/> Consultation Tips</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Ensure you have a stable internet connection.</li>
                    <li>Find a quiet, well-lit space for your call.</li>
                    <li>Have your medical history or relevant documents ready.</li>
                    <li>Prepare a list of questions or concerns beforehand.</li>
                </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
