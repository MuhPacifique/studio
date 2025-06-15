
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone, UserCheck, CalendarDays, Mic, VideoOff, MicOff, ScreenShare, PhoneOff, Loader2, Send, MessageSquare, Ear } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Translation helper, defaulting to Kinyarwanda
const t = (enText: string, knText: string) => knText;

interface MockDoctor {
  id: string;
  name: string;
  nameKn: string;
  specialty: string;
  specialtyKn: string;
  available: boolean;
  avatarHint: string;
  appointmentId?: string; // For simulation
}

// This data simulates what would be fetched from a backend API.
// For this prototype, it's static.
const mockDoctorsData: MockDoctor[] = [
  { id: "doc1", name: "Dr. Emily Carter", nameKn: "Dr. Emily Carter", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional", appointmentId: "appt-doc1-user" },
  { id: "doc2", name: "Dr. Ben Adams", nameKn: "Dr. Ben Adams", specialty: "Pediatrician", specialtyKn: "Umuganga w'Abana", available: false, avatarHint: "physician headshot friendly", appointmentId: "appt-doc2-user" },
  { id: "doc3", name: "Dr. Olivia Chen", nameKn: "Dr. Olivia Chen", specialty: "Cardiologist", specialtyKn: "Umuganga w'Umutima", available: true, avatarHint: "medical professional serious", appointmentId: "appt-doc3-user" },
  { id: "doc4", name: "Dr. Ntwari Jean", nameKn: "Dr. Ntwari Jean", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional", appointmentId: "appt-doc4-user" },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor' | 'system';
  senderName?: string;
  text: string;
  timestamp: string;
}

type CallMode = 'video' | 'audio';

export default function OnlineConsultationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // `isAuthenticated` will be true if AppLayout allows access to this page.
  // This is a conceptual placeholder; actual auth state is managed by AppLayout.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(true); 
  const [selectedDoctor, setSelectedDoctor] = React.useState<MockDoctor | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [callMode, setCallMode] = useState<CallMode>('video');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingPage, setIsLoadingPage] = useState(true); 
  const [doctors, setDoctors] = useState<MockDoctor[]>([]); // Simulate fetching doctors

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching available doctors
    // In a real app: fetch('/api/doctors?available=true').then(res => res.json()).then(data => setDoctors(data.doctors));
    setDoctors(mockDoctorsData);
    setIsLoadingPage(false);
  }, []);

  // Request camera and microphone permissions
  useEffect(() => {
    if (isCallActive && callMode === 'video' && !isVideoOff) {
      const getMediaPermissions = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Conceptual: Send signal 'USER_MEDIA_READY' to server via WebSocket
          // ws.send(JSON.stringify({ type: 'WEBRTC_USER_MEDIA_READY', payload: { callSessionId: `call-${selectedDoctor?.appointmentId}` } }));
        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasCameraPermission(false);
          setIsVideoOff(true);
          toast({
            variant: 'destructive',
            title: t('Media Access Denied', 'Kwinjira mu Byuma Byanze'),
            description: t('Please enable camera and microphone permissions in your browser settings for video consultation.', 'Nyamuneka fungura uburenganzira bwa kamera na mikoro muri igenamiterere rya mushakisha yawe kugirango ubone ubujyanama bwa videwo.'),
          });
        }
      };
      getMediaPermissions();
    } else if (videoRef.current?.srcObject && (isVideoOff || callMode === 'audio' || !isCallActive)) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isCallActive, callMode, isVideoOff, toast, selectedDoctor]); // Added selectedDoctor to dependencies for callSessionId


  const handleStartCall = async (doctor: MockDoctor) => {
    if (!isAuthenticated) {
        toast({ variant: "destructive", title: t("Please log in first.", "Nyamuneka Injira Mbere.")});
        return;
    }
    if (doctor.available) {
      setSelectedDoctor(doctor);
      setIsCallActive(true);
      setIsVideoOff(callMode === 'audio');
      
      // Simulate API call to initiate consultation session and get chatRoomId/callSessionId
      // Conceptual: const response = await fetch(`/api/consultations/${doctor.appointmentId}/start`, { method: 'POST' });
      // Conceptual: const sessionData = await response.json();
      // Conceptual: const callSessionId = sessionData.callSessionId;
      // Conceptual: const chatRoomId = sessionData.chatRoomId;
      const conceptualCallSessionId = `call-${doctor.appointmentId}`;
      const conceptualChatRoomId = `chat-${doctor.appointmentId}`;

      setChatMessages([
        { id: 'sys1', sender: 'system', text: t(`Attempting to join ${callMode} call room for ${doctor.nameKn}... (Session ID: ${conceptualCallSessionId})`, `Kugerageza kwinjira mu cyumba cya ${callMode === 'video' ? 'videwo' : 'amajwi'} cya ${doctor.nameKn}... (ID y'Igihe: ${conceptualCallSessionId})`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
        // Conceptual: ws.send(JSON.stringify({ type: 'WEBRTC_JOIN_CALL_SESSION', payload: { appointmentId: doctor.appointmentId } }));
        // Conceptual: ws.send(JSON.stringify({ type: 'JOIN_CHAT_ROOM', payload: { roomId: conceptualChatRoomId, roomType: 'consultation' } }));
      ]);
      
      toast({ title: t(`Starting ${callMode} call with ${doctor.nameKn}`, `Gutangira ikiganiro cya ${callMode === 'video' ? 'videwo' : 'amajwi'} na ${doctor.nameKn}`), description: t("This is a simulation. Real-time connection relies on backend.", "Ibi ni igeragezwa. Guhuza mu gihe nyacyo bishingiye kuri seriveri.") });
      
      if (callMode === 'video') {
        setIsVideoOff(false); 
      }

      // Simulate doctor joining and sending first message after a delay
      setTimeout(() => {
        if (isCallActive && selectedDoctor && selectedDoctor.id === doctor.id) { // Check if call is still for this doctor
             setChatMessages(prev => [...prev,
                { id: 'sys_doc_joined', sender: 'system', text: t(`${doctor.nameKn} has joined the session.`, `${doctor.nameKn} yinjiye mu gihe cy'ikiganiro.`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
                { id: `doc_greet_${Date.now()}`, sender: 'doctor', senderName: doctor.nameKn, text: t(`Hello! I'm ${doctor.nameKn}. How can I help you today? (Simulated)`, `Muraho! Nitwa ${doctor.nameKn}. Nagufasha iki uyu munsi? (By'igeragezo)`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
            ]);
        }
      }, 2500);

    } else {
      toast({ variant: "destructive", title: t(`${doctor.nameKn} is offline.`, `${doctor.nameKn} ntari ku murongo.`) });
    }
  };

  const handleEndCall = () => {
    // Conceptual: ws.send(JSON.stringify({ type: 'WEBRTC_CALL_END', payload: { callSessionId: `call-${selectedDoctor?.appointmentId}` } }));
    // Conceptual: ws.send(JSON.stringify({ type: 'LEAVE_CHAT_ROOM', payload: { roomId: `chat-${selectedDoctor?.appointmentId}` } }));
    setIsCallActive(false);
    setHasCameraPermission(null); 
    setIsVideoOff(true);
    setChatMessages(prev => [...prev, {id: 'sys_call_ended', sender: 'system', text: t('Call ended.', 'Ikiganiro kirangiye.'), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]);
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    toast({ title: t("Call Ended (Simulation)", "Ikiganiro Kirangiye (Igerageza)") });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !selectedDoctor || !isCallActive) return;
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      senderName: t("You", "Wowe"),
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    // Conceptual: ws.send(JSON.stringify({ type: 'SEND_CHAT_MESSAGE', payload: { roomId: `chat-${selectedDoctor.appointmentId}`, content: currentMessage } }));
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Simulate doctor's reply
    setTimeout(() => {
      if (isCallActive && selectedDoctor) {
        setChatMessages(prev => [...prev, {
          id: `doc_resp${Date.now()}`,
          sender: 'doctor',
          senderName: selectedDoctor.nameKn,
          text: t("Okay, I understand. Please elaborate. (Simulated reply)", "Yego, ndabyumva. Nyamuneka sobanura birambuye. (Igisubizo cy'igerageza)"),
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }
    }, 1500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = isMuted);
    }
    // Conceptual: ws.send(JSON.stringify({ type: 'USER_MEDIA_STATE_CHANGE', payload: { audioMuted: !isMuted } }));
    toast({description: t(isMuted ? "Microphone Unmuted (Sim.)" : "Microphone Muted (Sim.)", isMuted ? "Mikoro Yafunguwe (Iger.)" : "Mikoro Yacecekeshejwe (Iger.)")});
  };

  const toggleVideo = async () => {
    if (callMode === 'audio') {
        toast({title: t("Currently in Audio Only mode.", "Ubu uri mu buryo bw'amajwi gusa.")});
        return;
    }
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);

    if (!newVideoState) { // Trying to turn video ON
        if (hasCameraPermission === false) {
             toast({ variant: 'destructive', title: t('Camera Access Denied', 'Kwinjira muri Kamera Byanze'), description: t('Cannot turn on video. Please enable camera permissions.', 'Ntushobora gufungura videwo. Nyamuneka fungura uburenganzira bwa kamera.')});
             setIsVideoOff(true); return;
        }
        if (!videoRef.current?.srcObject || hasCameraPermission === null) {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Audio might be needed for tracks
                setHasCameraPermission(true);
                if (videoRef.current) videoRef.current.srcObject = stream;
             } catch (error) {
                setHasCameraPermission(false); setIsVideoOff(true);
                toast({ variant: 'destructive', title: t('Camera Access Failed', 'Kwinjira muri Kamera Byananiranye')}); return;
             }
        } else if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = true);
        }
    } else { // Trying to turn video OFF
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = false); // Disable, don't stop yet
        }
    }
    // Conceptual: ws.send(JSON.stringify({ type: 'USER_MEDIA_STATE_CHANGE', payload: { videoOff: newVideoState } }));
    toast({description: t(newVideoState ? "Video Off (Sim.)" : "Video On (Sim.)", newVideoState ? "Videwo Yafunzwe (Iger.)" : "Videwo Yafunguwe (Iger.)")});
  };

  const handleScreenShare = () => {
    // Conceptual: Implement WebRTC screen sharing. This is complex.
    // navigator.mediaDevices.getDisplayMedia(...)
    // Add new track to PeerConnection
    // Send signal 'SCREEN_SHARE_STARTED'
    toast({ title: t("Screen Share (Simulation)", "Gusangiza Ecran (Igerageza)"), description: t("This feature would allow screen sharing. (Not implemented)", "Iki gice cyakwemerera gusangiza ecran. (Ntibirakorwa)"), });
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Online Consultation...", "Gutegura Ubujyanama kuri Interineti...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <PageHeader title={t("Online Doctor Consultation", "Ubujyanama bwa Muganga kuri Interineti")} breadcrumbs={[{label: t("Dashboard", "Imbonerahamwe"), href: "/"}, {label: t("Online Consultation", "Ubujyanama kuri Interineti")}]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-headline flex items-center text-xl mb-2 sm:mb-0">
                  {callMode === 'video' ? <Video className="mr-2 h-6 w-6 text-primary" /> : <Ear className="mr-2 h-6 w-6 text-primary" /> }
                  {isCallActive && selectedDoctor ? t(`In ${callMode} call with ${selectedDoctor.nameKn}`, `Mu kiganiro cya ${callMode === 'video' ? 'videwo' : 'amajwi'} na ${selectedDoctor.nameKn}`) : t(`Ready for ${callMode} consultation?`, `Witeguye ubujyanama bwa ${callMode === 'video' ? 'videwo' : 'amajwi'}?`)}
                </CardTitle>
                {!isCallActive && (
                    <div className="flex space-x-2">
                        <Button variant={callMode === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('video')} className="transition-transform hover:scale-105">{t("Video Call", "Ikiganiro cya Videwo")}</Button>
                        <Button variant={callMode === 'audio' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('audio')} className="transition-transform hover:scale-105">{t("Audio Only", "Amajwi Gusa")}</Button>
                    </div>
                )}
              </div>
            </CardHeader>
            <CardContent className={`aspect-[16/9] bg-black flex items-center justify-center relative ${isCallActive ? 'border-2 border-primary' : 'border-2 border-muted'}`}>
              {isCallActive && selectedDoctor ? (
                <>
                  {/* Mock Doctor's Video Feed or Audio Indicator */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {callMode === 'video' ? (
                       <Image 
                          src="https://placehold.co/800x450.png" 
                          alt={t("Doctor's Video Feed (Mock)", "Videwo ya Muganga (Agateganyo)")} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint={selectedDoctor.avatarHint}
                          className="opacity-70" 
                        />
                    ) : (
                        <Ear className="h-32 w-32 text-primary opacity-50" />
                    )}
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-black/40">
                        <Avatar className="h-24 w-24 mb-2 border-2 border-primary/50">
                            <AvatarImage src={`https://placehold.co/100x100.png`} alt={selectedDoctor.nameKn} data-ai-hint={selectedDoctor.avatarHint} />
                            <AvatarFallback>{selectedDoctor.nameKn.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-medium">{selectedDoctor.nameKn}</p>
                        <p className="text-sm opacity-70">{selectedDoctor.specialtyKn}</p>
                        {callMode === 'audio' && <p className="text-xs opacity-60 mt-1">{t("(Audio Only Mode)", "(Uburyo bw'Amajwi Gusa)")}</p>}
                      </div>
                  </div>

                  {callMode === 'video' && (
                    <div className="absolute top-4 right-4 p-1 bg-black/70 rounded-lg w-1/4 max-w-[200px] aspect-[16/9] shadow-lg border border-primary/50">
                        <video ref={videoRef} className={`w-full h-full rounded-md object-cover ${isVideoOff || hasCameraPermission === false ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                        {(isVideoOff || hasCameraPermission === false) && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-md">
                                {hasCameraPermission === false ? <AlertDescription className="text-xs text-center p-1 text-white">{t("Camera Denied","Kamera Yanze")}</AlertDescription> : <VideoOff className="h-10 w-10 text-white" /> }
                            </div>
                        )}
                        <p className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">{t("You", "Wowe")}</p>
                    </div>
                  )}
                  {hasCameraPermission === false && callMode === 'video' && !isVideoOff && (
                     <Alert variant="destructive" className="absolute bottom-4 left-4 max-w-sm z-20">
                        <VideoOff className="h-5 w-5" />
                        <AlertTitle>{t("Camera Access Denied", "Kwinjira muri Kamera Byanze")}</AlertTitle>
                        <AlertDescription>
                            {t("Please enable camera permissions in your browser to use video.", "Nyamuneka fungura uburenganzira bwa kamera muri mushakisha yawe kugirango ukoreshe videwo.")}
                        </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  {callMode === 'video' ? <Video className="h-24 w-24 mx-auto mb-4 text-primary" /> : <Ear className="h-24 w-24 mx-auto mb-4 text-primary" />}
                  <p className="text-xl mb-2">{t(`Your ${callMode} call will appear here.`, `Ikiganiro cyawe cya ${callMode === 'video' ? 'videwo' : 'amajwi'} kizagaragara hano.`)}</p>
                  <p>{t("Select an available doctor to start your consultation.", "Hitamo muganga uhari kugirango utangire ubujyanama.")}</p>
                </div>
              )}
            </CardContent>
            {isCallActive && (
                <CardFooter className="p-4 bg-card border-t flex justify-center space-x-2 sm:space-x-3">
                    <Button variant={isMuted ? "destructive" : "secondary"} onClick={toggleMute} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t(isMuted ? "Unmute" : "Mute", isMuted ? "Fungura Amajwi" : "Cecekesha Amajwi")}>
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button variant="destructive" onClick={handleEndCall} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t("End Call", "Soza Ikiganiro")}>
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                    {callMode === 'video' && (
                        <Button variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t(isVideoOff ? "Start Video" : "Stop Video", isVideoOff ? "Tangira Videwo" : "Hagarika Videwo")}>
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleScreenShare} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t("Share Screen (Sim.)", "Sangiza Ecran (Iger.)")}>
                      <ScreenShare className="h-5 w-5" />
                    </Button>
                </CardFooter>
            )}
          </Card>
          
          {isCallActive && selectedDoctor && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center text-lg">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary"/> {t(`Chat with ${selectedDoctor.nameKn}`, `Ibiganiro na ${selectedDoctor.nameKn}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full pr-4 border rounded-md p-2 bg-muted/30">
                  <div className="space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={cn("flex", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-[70%] p-3 rounded-lg shadow-md", 
                                           msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 
                                           (msg.sender === 'doctor' ? 'bg-card' : 'bg-transparent text-xs text-muted-foreground text-center w-full')
                                           )}>
                          {msg.sender !== 'system' && msg.senderName && <p className={cn("text-xs font-medium mb-0.5", msg.sender === 'user' ? 'text-primary-foreground/80 text-right' : 'text-foreground/80')}>{msg.senderName}</p>}
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          {msg.sender !== 'system' && <p className={cn("text-xs mt-1", msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70')}>{msg.timestamp}</p>}
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
                    placeholder={t("Type your message...", "Andika ubutumwa bwawe...")} 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-grow"
                    aria-label={t("Chat message input", "Ahandikirwa ubutumwa bw'ibiganiro")}
                  />
                  <Button type="submit" size="icon" className="transition-transform hover:scale-110 active:scale-95" aria-label={t("Send message", "Ohereza ubutumwa")} disabled={!currentMessage.trim()}>
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
              <CardTitle className="font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" /> {t("Available Doctors", "Abaganga Bahari")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {doctors.length === 0 && !isLoadingPage && <p className="text-muted-foreground">{t("No doctors currently available for consultation.", "Nta baganga bahari ubu.")}</p>}
              {isLoadingPage && <Loader2 className="animate-spin text-primary mx-auto my-4 h-8 w-8" />}
              {doctors.map(doc => (
                <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${selectedDoctor?.id === doc.id && isCallActive ? 'bg-primary/10 border-primary shadow-md scale-105' : 'hover:shadow-md hover:scale-[1.02] hover:border-primary/50'}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
                      <AvatarImage src={`https://placehold.co/60x60.png`} alt={doc.nameKn} data-ai-hint={doc.avatarHint} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{doc.nameKn.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doc.nameKn}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialtyKn}</p>
                      <span className={`text-xs font-semibold ${doc.available ? 'text-green-500' : 'text-red-500'}`}>
                        {doc.available ? t('Online', 'Ari ku murongo') : t('Offline', 'Ntari ku murongo')}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartCall(doc)} 
                    disabled={!doc.available || (isCallActive && selectedDoctor?.id !== doc.id) || (isCallActive && selectedDoctor?.id === doc.id) }
                    className="transition-transform hover:scale-105 active:scale-95"
                    aria-label={t(`Start call with ${doc.nameKn}`, `Tangira ikiganiro na ${doc.nameKn}`)}
                  >
                    {isCallActive && selectedDoctor?.id === doc.id ? <PhoneOff className="h-4 w-4 mr-1"/> : <Phone className="h-4 w-4 mr-1"/> }
                    {isCallActive && selectedDoctor?.id === doc.id ? t('In Call', 'Mu Kiganiro') : (doc.available ? t('Start Call', 'Tangira Ikiganiro') : t('Offline', 'Ntari ku Murongo'))}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/> {t("Consultation Tips", "Inama z'Ubujyanama")}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>{t("Ensure you have a stable internet connection.", "Menya neza ko ufite interineti ihamye.")}</li>
                    <li>{t("Find a quiet, well-lit space for your call.", "Shaka ahantu hatuje, hari urumuri ruhagije ku kiganiro cyawe.")}</li>
                    <li>{t("Have your medical history or relevant documents ready.", "Tegura amateka yawe y'ubuvuzi cyangwa inyandiko z'ingenzi.")}</li>
                    <li>{t("Prepare a list of questions or concerns beforehand.", "Tegura urutonde rw'ibibazo cyangwa ibikuhangayikishije mbere y'igihe.")}</li>
                </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

