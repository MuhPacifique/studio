
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone, UserCheck, CalendarDays, Mic, VideoOff, MicOff, ScreenShare, PhoneOff, Loader2, Send, MessageSquare, Volume2, Ear } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const mockDoctors = [
  { id: "doc1", name: "Dr. Emily Carter", specialty: "General Physician", available: true, avatarHint: "doctor portrait professional" },
  { id: "doc2", name: "Dr. Ben Adams", specialty: "Pediatrician", available: false, avatarHint: "physician headshot friendly" },
  { id: "doc3", name: "Dr. Olivia Chen", specialty: "Cardiologist", available: true, avatarHint: "medical professional serious" },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
}

type CallMode = 'video' | 'audio';

export default function OnlineConsultationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(true); // Start with video off by default
  const [selectedDoctor, setSelectedDoctor] = React.useState<typeof mockDoctors[0] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [callMode, setCallMode] = useState<CallMode>('video');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in for online consultations.",
        });
        router.replace('/welcome'); // Redirect to welcome page
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  useEffect(() => {
    if (isCallActive && isAuthenticated && callMode === 'video') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          setIsVideoOff(false); // Turn video on if permission granted
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsVideoOff(true);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings for video consultation.',
          });
        }
      };
      getCameraPermission();
    } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setHasCameraPermission(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallActive, isAuthenticated, callMode]); // Removed toast from dependencies

  const handleStartCall = (doctor: typeof mockDoctors[0]) => {
    if (!isAuthenticated) {
        toast({ variant: "destructive", title: "Please log in first."});
        router.push('/welcome');
        return;
    }
    if (doctor.available) {
      setSelectedDoctor(doctor);
      setIsCallActive(true);
      setChatMessages([
        { id: 'msg1', sender: 'doctor', text: `Hello! I'm ${doctor.name}. How can I help you today?`, timestamp: new Date().toLocaleTimeString() }
      ]);
      toast({ title: `Starting ${callMode} call with ${doctor.name}` });
    } else {
      toast({ variant: "destructive", title: `${doctor.name} is offline.` });
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedDoctor(null);
    setIsMuted(false);
    setIsVideoOff(true);
    setChatMessages([]);
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setHasCameraPermission(null);
    toast({ title: "Call Ended" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `doc_resp${Date.now()}`,
        sender: 'doctor',
        text: "Okay, I understand. Please elaborate on that.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 1500);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => {
    if (callMode === 'audio') {
        toast({title: "Currently in Audio Only mode."});
        return;
    }
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !newVideoState); 
    }
    if (!newVideoState && !hasCameraPermission && isCallActive){ // trying to turn video on
        // Attempt to get permission again if it was denied or not yet granted
         const getCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasCameraPermission(true);
                setIsVideoOff(false); 
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                setHasCameraPermission(false);
                setIsVideoOff(true);
                 toast({ variant: 'destructive', title: 'Camera Access Denied'});
            }
        };
        getCamera();
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Online Consultation...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Online Doctor Consultation" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Online Consultation"}]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-headline flex items-center text-xl mb-2 sm:mb-0">
                  {callMode === 'video' ? <Video className="mr-2 h-6 w-6 text-primary" /> : <Ear className="mr-2 h-6 w-6 text-primary" /> }
                  {isCallActive && selectedDoctor ? `In ${callMode} call with ${selectedDoctor.name}` : `Ready for ${callMode} consultation?`}
                </CardTitle>
                {!isCallActive && (
                    <div className="flex space-x-2">
                        <Button variant={callMode === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('video')}>Video Call</Button>
                        <Button variant={callMode === 'audio' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('audio')}>Audio Only</Button>
                    </div>
                )}
              </div>
              <CardDescription>
                {isCallActive ? "You are currently in a virtual consultation." : `Connect with qualified doctors from home via ${callMode} call.`}
              </CardDescription>
            </CardHeader>
            <CardContent className={`aspect-[16/9] bg-black flex items-center justify-center relative ${isCallActive ? 'border-2 border-primary animate-pulse-border' : 'border-2 border-muted'}`}>
              {isCallActive ? (
                <>
                  {/* Mock Doctor's View */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {callMode === 'video' ? (
                       <Image 
                          src="https://placehold.co/800x450.png" 
                          alt="Doctor's Video Feed (Mock)" 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="doctor professional remote"
                          className={`${isCallActive ? 'opacity-70' : 'opacity-30'}`}
                        />
                    ) : (
                        <Ear className="h-32 w-32 text-primary opacity-50" />
                    )}
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-black/40">
                        <UserCheck className="h-16 w-16 mb-2 opacity-80" />
                        <p className="text-lg font-medium">{selectedDoctor?.name}</p>
                        <p className="text-sm opacity-70">{selectedDoctor?.specialty}</p>
                        {callMode === 'audio' && <p className="text-xs opacity-60 mt-1">(Audio Only Mode)</p>}
                      </div>
                  </div>

                  {/* User's Video Feed (only in video mode) */}
                  {callMode === 'video' && (
                    <div className="absolute top-4 right-4 p-1 bg-black/70 rounded-lg w-1/4 max-w-[200px] aspect-[16/9] shadow-lg border border-primary/50">
                        <video ref={videoRef} className={`w-full h-full rounded-md object-cover ${isVideoOff ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-md">
                                <VideoOff className="h-10 w-10 text-white" />
                            </div>
                        )}
                        <p className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">You</p>
                    </div>
                  )}
                  {hasCameraPermission === false && isCallActive && callMode === 'video' && !isVideoOff && (
                     <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md z-20">
                        <VideoOff className="h-5 w-5" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera permissions to share your video.
                        </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  {callMode === 'video' ? <Video className="h-24 w-24 mx-auto mb-4 text-primary" /> : <Ear className="h-24 w-24 mx-auto mb-4 text-primary" />}
                  <p className="text-xl mb-2">Your {callMode} call will appear here.</p>
                  <p>Select a doctor to start your consultation.</p>
                </div>
              )}
            </CardContent>
            {isCallActive && (
                <CardFooter className="p-4 bg-card border-t flex justify-center space-x-2 sm:space-x-3">
                    <Button variant={isMuted ? "destructive" : "secondary"} onClick={toggleMute} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button variant="destructive" onClick={handleEndCall} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label="End Call">
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                    {callMode === 'video' && (
                        <Button variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={isVideoOff ? "Start Video" : "Stop Video"}>
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                    )}
                    <Button variant="secondary" className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label="Share Screen (Not Implemented)">
                      <ScreenShare className="h-5 w-5" />
                    </Button>
                </CardFooter>
            )}
          </Card>
          
          {isCallActive && selectedDoctor && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center text-lg">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Chat with {selectedDoctor.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full pr-4 border rounded-md p-2">
                  <div className="space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={cn("flex", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-[70%] p-3 rounded-lg shadow", msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={cn("text-xs mt-1", msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70')}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" size="icon" className="transition-transform hover:scale-110 active:scale-95">
                    <Send className="h-4 w-4"/>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" /> Available Doctors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDoctors.map(doc => (
                <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${selectedDoctor?.id === doc.id && isCallActive ? 'bg-primary/10 border-primary shadow-md scale-105' : 'hover:shadow-md hover:scale-[1.02] hover:border-primary/50'}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
                      <AvatarImage src={`https://placehold.co/60x60.png`} data-ai-hint={doc.avatarHint} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{doc.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                      <span className={`text-xs font-semibold ${doc.available ? 'text-green-500' : 'text-red-500'}`}>
                        {doc.available ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartCall(doc)} 
                    disabled={!doc.available || (isCallActive && selectedDoctor?.id !== doc.id) || (isCallActive && selectedDoctor?.id === doc.id) }
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    {isCallActive && selectedDoctor?.id === doc.id ? <PhoneOff className="h-4 w-4 mr-1"/> : <Phone className="h-4 w-4 mr-1"/> }
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
          0% { border-color: hsl(var(--primary) / 0.5); box-shadow: 0 0 5px hsl(var(--primary)/0.2); }
          50% { border-color: hsl(var(--primary)); box-shadow: 0 0 15px hsl(var(--primary)/0.5); }
          100% { border-color: hsl(var(--primary) / 0.5); box-shadow: 0 0 5px hsl(var(--primary)/0.2); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </AppLayout>
  );
}
