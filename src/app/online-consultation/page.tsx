
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
}

// This data would come from the backend in a real app.
const mockDoctorsData: MockDoctor[] = [
  { id: "doc1", name: "Dr. Emily Carter", nameKn: "Dr. Emily Carter", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional" },
  { id: "doc2", name: "Dr. Ben Adams", nameKn: "Dr. Ben Adams", specialty: "Pediatrician", specialtyKn: "Umuganga w'Abana", available: false, avatarHint: "physician headshot friendly" },
  { id: "doc3", name: "Dr. Olivia Chen", nameKn: "Dr. Olivia Chen", specialty: "Cardiologist", specialtyKn: "Umuganga w'Umutima", available: true, avatarHint: "medical professional serious" },
  { id: "doc4", name: "Dr. Ntwari Jean", nameKn: "Dr. Ntwari Jean", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional" },
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
  // For this prototype, we assume if the user reaches here, they are conceptually "authenticated".
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(true); 
  const [selectedDoctor, setSelectedDoctor] = React.useState<MockDoctor | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null = unknown, true = granted, false = denied
  const [callMode, setCallMode] = useState<CallMode>('video');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial page load

  useEffect(() => {
    setIsClient(true);
    // No longer relying on localStorage for language
    // Auth check is primarily handled by AppLayout redirecting if necessary
    setIsLoadingPage(false);
  }, []);

  // Request camera and microphone permissions when a video call starts
  useEffect(() => {
    if (isCallActive && callMode === 'video' && !isVideoOff) {
      const getMediaPermissions = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasCameraPermission(false);
          setIsVideoOff(true); // Force video off if permission denied
          toast({
            variant: 'destructive',
            title: t('Media Access Denied', 'Kwinjira mu Byuma Byanze'),
            description: t('Please enable camera and microphone permissions in your browser settings for video consultation.', 'Nyamuneka fungura uburenganzira bwa kamera na mikoro muri igenamiterere rya mushakisha yawe kugirango ubone ubujyanama bwa videwo.'),
          });
        }
      };
      getMediaPermissions();
    } else if (videoRef.current && videoRef.current.srcObject && (isVideoOff || callMode === 'audio' || !isCallActive)) {
      // Stop tracks if video is turned off, mode changes to audio, or call ends
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      // Do not reset hasCameraPermission here, as it reflects the permission status, not current usage
    }
  }, [isCallActive, callMode, isVideoOff, toast]);


  const handleStartCall = (doctor: MockDoctor) => {
    if (!isAuthenticated) { // This check is secondary to AppLayout's
        toast({ variant: "destructive", title: t("Please log in first.", "Nyamuneka Injira Mbere.")});
        router.push('/welcome');
        return;
    }
    if (doctor.available) {
      setSelectedDoctor(doctor);
      setIsCallActive(true);
      setIsVideoOff(callMode === 'audio'); // Start with video off if audio mode selected
      setChatMessages([
        { id: 'sys1', sender: 'system', text: t(`Connecting to ${doctor.nameKn}...`, `Guhuza na ${doctor.nameKn}...`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
        // Simulating doctor's greeting after a slight delay
        { id: 'msg1', sender: 'doctor', senderName: doctor.nameKn, text: t(`Hello! I'm ${doctor.nameKn}. How can I help you today? (This is a simulation)`, `Muraho! Nitwa ${doctor.nameKn}. Nagufasha iki uyu munsi? (Ibi ni igerageza)`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ]);
      toast({ title: t(`Starting ${callMode} call with ${doctor.nameKn}`, `Gutangira ikiganiro cya ${callMode === 'video' ? 'videwo' : 'amajwi'} na ${doctor.nameKn}`), description: t("This is a simulation. No real call will be established.", "Ibi ni igeragezwa. Nta kiganiro nyakuri kizaba.") });
      
      if (callMode === 'video') {
        // Trigger permission request for video by attempting to turn it on
        setIsVideoOff(false); 
      }

    } else {
      toast({ variant: "destructive", title: t(`${doctor.nameKn} is offline.`, `${doctor.nameKn} ntari ku murongo.`) });
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    // Reset camera/mic permission state conceptually for next call UI
    setHasCameraPermission(null); 
    setIsVideoOff(true);
    // selectedDoctor will be reset by the UI logic for selecting a doctor
    // setChatMessages([]); // Keep chat for review, or clear if preferred
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    toast({ title: t("Call Ended (Simulation)", "Ikiganiro Kirangiye (Igerageza)") });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !selectedDoctor) return;
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      senderName: t("You", "Wowe"),
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Simulate doctor's reply (conceptual backend interaction)
    setTimeout(() => {
      if (isCallActive && selectedDoctor) { // Check if call is still active
        setChatMessages(prev => [...prev, {
          id: `doc_resp${Date.now()}`,
          sender: 'doctor',
          senderName: selectedDoctor.nameKn,
          text: t("Okay, I understand. Please elaborate on that. (Simulated reply)", "Yego, ndabyumva. Nyamuneka sobanura birambuye. (Igisubizo cy'igerageza)"),
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }
    }, 1500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Conceptual: Mute/unmute local audio stream track
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = isMuted); // isMuted state will be new state after click
    }
    toast({description: t(isMuted ? "Microphone Unmuted (Simulation)" : "Microphone Muted (Simulation)", isMuted ? "Mikoro Yafunguwe (Igerageza)" : "Mikoro Yacecekeshejwe (Igerageza)")});
  };

  const toggleVideo = async () => {
    if (callMode === 'audio') {
        toast({title: t("Currently in Audio Only mode.", "Ubu uri mu buryo bw'amajwi gusa.")});
        return;
    }
    const newVideoState = !isVideoOff; // This is the target state for video
    setIsVideoOff(newVideoState);

    if (!newVideoState) { // Trying to turn video ON
        if (hasCameraPermission === false) {
             toast({ variant: 'destructive', title: t('Camera Access Denied', 'Kwinjira muri Kamera Byanze'), description: t('Cannot turn on video. Please enable camera permissions.', 'Ntushobora gufungura videwo. Nyamuneka fungura uburenganzira bwa kamera.')});
             setIsVideoOff(true); // Keep it off
             return;
        }
        // Attempt to get stream if not already available or permission unknown
        if (!videoRef.current?.srcObject || hasCameraPermission === null) {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
             } catch (error) {
                setHasCameraPermission(false);
                setIsVideoOff(true); // Failed, so video remains off
                toast({ variant: 'destructive', title: t('Camera Access Failed', 'Kwinjira muri Kamera Byananiranye')});
                return;
             }
        } else if (videoRef.current?.srcObject) { // Stream exists, just enable tracks
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = true);
        }
    } else { // Trying to turn video OFF
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = false);
        }
    }
    toast({description: t(newVideoState ? "Video Off (Simulation)" : "Video On (Simulation)", newVideoState ? "Videwo Yafunzwe (Igerageza)" : "Videwo Yafunguwe (Igerageza)")});
  };


  const handleScreenShare = () => {
    toast({
      title: t("Screen Share (Simulation)", "Gusangiza Ecran (Igerageza)"),
      description: t("This feature would allow screen sharing. (Not implemented)", "Iki gice cyakwemerera gusangiza ecran. (Ntibirakorwa)"),
    });
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
                          data-ai-hint="doctor professional remote"
                          className="opacity-70" // Simulate doctor's feed
                        />
                    ) : (
                        <Ear className="h-32 w-32 text-primary opacity-50" />
                    )}
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-black/40">
                        <UserCheck className="h-16 w-16 mb-2 opacity-80" />
                        <p className="text-lg font-medium">{selectedDoctor.nameKn}</p>
                        <p className="text-sm opacity-70">{selectedDoctor.specialtyKn}</p>
                        {callMode === 'audio' && <p className="text-xs opacity-60 mt-1">{t("(Audio Only Mode)", "(Uburyo bw'Amajwi Gusa)")}</p>}
                      </div>
                  </div>

                  {/* User's Video Preview (only in video mode) */}
                  {callMode === 'video' && (
                    <div className="absolute top-4 right-4 p-1 bg-black/70 rounded-lg w-1/4 max-w-[200px] aspect-[16/9] shadow-lg border border-primary/50">
                        <video ref={videoRef} className={`w-full h-full rounded-md object-cover ${isVideoOff || !hasCameraPermission ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                        {(isVideoOff || !hasCameraPermission) && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-md">
                                {hasCameraPermission === false ? <AlertDescription className="text-xs text-center p-1">{t("Camera Denied","Kamera Yanze")}</AlertDescription> : <VideoOff className="h-10 w-10 text-white" /> }
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
                    <Button variant="secondary" onClick={handleScreenShare} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t("Share Screen (Simulation)", "Sangiza Ecran (Igerageza)")}>
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
                          <p className="text-sm">{msg.text}</p>
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
                  <Button type="submit" size="icon" className="transition-transform hover:scale-110 active:scale-95" aria-label={t("Send message", "Ohereza ubutumwa")}>
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
            <CardContent className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto"> {/* Added scroll for long list */}
              {mockDoctorsData.map(doc => (
                <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${selectedDoctor?.id === doc.id && isCallActive ? 'bg-primary/10 border-primary shadow-md scale-105' : 'hover:shadow-md hover:scale-[1.02] hover:border-primary/50'}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
                      <AvatarImage src={`https://placehold.co/60x60.png`} data-ai-hint={doc.avatarHint} />
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

