
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone, UserCheck, CalendarDays, Mic, VideoOff, MicOff, ScreenShare, PhoneOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mockDoctors = [
  { id: "doc1", name: "Dr. Emily Carter", specialty: "General Physician", available: true, avatarHint: "doctor portrait" },
  { id: "doc2", name: "Dr. Ben Adams", specialty: "Pediatrician", available: false, avatarHint: "physician headshot" },
  { id: "doc3", name: "Dr. Olivia Chen", specialty: "Cardiologist", available: true, avatarHint: "medical professional" },
];


export default function OnlineConsultationPage() {
  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<typeof mockDoctors[0] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isCallActive) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings for video consultation.',
          });
          setIsCallActive(false); // End call if permission is denied
          setSelectedDoctor(null);
        }
      };
      getCameraPermission();
    } else {
      // Stop camera stream when call ends
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCallActive, toast]);

  const handleStartCall = (doctor: typeof mockDoctors[0]) => {
    if (doctor.available) {
      setSelectedDoctor(doctor);
      setIsCallActive(true);
      toast({ title: `Starting call with ${doctor.name}` });
    } else {
      toast({ variant: "destructive", title: `${doctor.name} is offline.` });
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedDoctor(null);
    setIsMuted(false);
    setIsVideoOff(false);
    toast({ title: "Call Ended" });
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = isVideoOff); // Note: isVideoOff is previous state here
    }
  };


  return (
    <AppLayout>
      <PageHeader title="Online Doctor Consultation" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Online Consultation"}]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <Video className="mr-2 h-6 w-6 text-primary" /> 
                {isCallActive && selectedDoctor ? `In call with ${selectedDoctor.name}` : "Ready for your consultation?"}
              </CardTitle>
              <CardDescription>
                {isCallActive ? "You are currently in a virtual consultation." : "Connect with qualified doctors from home."}
              </CardDescription>
            </CardHeader>
            <CardContent className={`aspect-[16/9] bg-gray-900 flex items-center justify-center relative ${isCallActive ? 'border-2 border-primary animate-pulse-border' : ''}`}>
              {isCallActive ? (
                <>
                  {/* Remote Doctor's Video (Placeholder) */}
                  <Image 
                    src="https://placehold.co/800x450.png" 
                    alt="Doctor's Video Feed" 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint="doctor video call"
                    className={`${isVideoOff ? 'opacity-50' : ''}`}
                  />
                   {/* Local User's Video */}
                  <div className="absolute top-4 right-4 p-1 bg-black/50 rounded-lg w-1/4 max-w-[200px] aspect-[16/9]">
                     <video ref={videoRef} className={`w-full h-full rounded-md object-cover ${isVideoOff ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                     {isVideoOff && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-md">
                            <VideoOff className="h-10 w-10 text-white" />
                        </div>
                     )}
                  </div>
                  {hasCameraPermission === false && isCallActive && (
                     <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md z-10">
                        <VideoOff className="h-5 w-5" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera permissions to share your video. You can still hear the doctor.
                        </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center text-white p-4">
                  <Video className="h-24 w-24 mx-auto mb-4 text-primary" />
                  <p className="text-xl mb-2">Your video call will appear here.</p>
                  <p className="text-muted-foreground">Select a doctor to start your consultation.</p>
                </div>
              )}
            </CardContent>
            {isCallActive && (
                <CardContent className="p-4 bg-card border-t flex justify-center space-x-2 sm:space-x-4">
                    <Button variant={isMuted ? "destructive" : "secondary"} onClick={toggleMute} className="rounded-full p-2 sm:p-3 transition-all" aria-label={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button variant="destructive" onClick={handleEndCall} className="rounded-full p-2 sm:p-3 transition-all" aria-label="End Call">
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                     <Button variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo} className="rounded-full p-2 sm:p-3 transition-all" aria-label={isVideoOff ? "Start Video" : "Stop Video"}>
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <Button variant="secondary" className="rounded-full p-2 sm:p-3 transition-all" aria-label="Share Screen (Not Implemented)">
                      <ScreenShare className="h-5 w-5" />
                    </Button>
                </CardContent>
            )}
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
                  <Button size="sm" onClick={() => handleStartCall(doc)} disabled={!doc.available || (isCallActive && selectedDoctor?.id !== doc.id) || (isCallActive && selectedDoctor?.id === doc.id) }>
                    {isCallActive && selectedDoctor?.id === doc.id ? 'In Call' : (doc.available ? 'Start Call' : 'Offline')}
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
      <style jsx global>{`
        @keyframes pulse-border {
          0% { border-color: hsl(var(--primary) / 0.5); }
          50% { border-color: hsl(var(--primary)); }
          100% { border-color: hsl(var(--primary) / 0.5); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </AppLayout>
  );
}
