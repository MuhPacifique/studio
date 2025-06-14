
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

// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

interface MockDoctor {
  id: string;
  name: string;
  nameKn: string;
  specialty: string;
  specialtyKn: string;
  available: boolean;
  avatarHint: string;
}

const mockDoctorsData = (lang: 'en' | 'kn'): MockDoctor[] => [
  { id: "doc1", name: "Dr. Emily Carter", nameKn: "Dr. Emily Carter", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional" },
  { id: "doc2", name: "Dr. Ben Adams", nameKn: "Dr. Ben Adams", specialty: "Pediatrician", specialtyKn: "Umuganga w'Abana", available: false, avatarHint: "physician headshot friendly" },
  { id: "doc3", name: "Dr. Olivia Chen", nameKn: "Dr. Olivia Chen", specialty: "Cardiologist", specialtyKn: "Umuganga w'Umutima", available: true, avatarHint: "medical professional serious" },
  { id: "doc4", name: "Dr. Ntwari Jean", nameKn: "Dr. Ntwari Jean", specialty: "General Physician", specialtyKn: "Umuganga Rusange", available: true, avatarHint: "doctor portrait professional" },
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
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  const [isCallActive, setIsCallActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(true); 
  const [selectedDoctor, setSelectedDoctor] = React.useState<MockDoctor | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [callMode, setCallMode] = useState<CallMode>('video');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in for online consultations.", "Nyamuneka injira kugirango ubashe kubona ubujyanama kuri interineti."),
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast, currentLanguage]);

  useEffect(() => {
    if (isCallActive && isAuthenticated && callMode === 'video') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          setIsVideoOff(false); 
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsVideoOff(true);
          toast({
            variant: 'destructive',
            title: t('Camera Access Denied', 'Kwinjira muri Kamera Byanze'),
            description: t('Please enable camera permissions in your browser settings for video consultation.', 'Nyamuneka fungura uburenganzira bwa kamera muri igenamiterere rya mushakisha yawe kugirango ubone ubujyanama bwa videwo.'),
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
  }, [isCallActive, isAuthenticated, callMode, currentLanguage]); 

  const handleStartCall = (doctor: MockDoctor) => {
    if (!isAuthenticated) {
        toast({ variant: "destructive", title: t("Please log in first.", "Nyamuneka Injira Mbere.")});
        router.push('/welcome');
        return;
    }
    if (doctor.available) {
      setSelectedDoctor(doctor);
      setIsCallActive(true);
      setChatMessages([
        { id: 'msg1', sender: 'doctor', text: t(`Hello! I'm ${doctor.name}. How can I help you today?`, `Muraho! Nitwa ${doctor.nameKn}. Nagufasha iki uyu munsi?`), timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ]);
      toast({ title: t(`Starting ${callMode} call with ${doctor.name}`, `Gutangira ${callMode === 'video' ? 'videwo' : 'amajwi'} na ${doctor.nameKn}`) });
    } else {
      toast({ variant: "destructive", title: t(`${doctor.name} is offline.`, `${doctor.nameKn} ntari ku murongo.`) });
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
    toast({ title: t("Call Ended", "Ikiganiro Kirangiye") });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `doc_resp${Date.now()}`,
        sender: 'doctor',
        text: t("Okay, I understand. Please elaborate on that.", "Yego, ndabyumva. Nyamuneka sobanura birambuye."),
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => {
    if (callMode === 'audio') {
        toast({title: t("Currently in Audio Only mode.", "Ubu uri mu buryo bw'amajwi gusa.")});
        return;
    }
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !newVideoState); 
    }
    if (!newVideoState && !hasCameraPermission && isCallActive){ 
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
                 toast({ variant: 'destructive', title: t('Camera Access Denied', 'Kwinjira muri Kamera Byanze')});
            }
        };
        getCamera();
    }
  };

  const handleScreenShare = () => {
    toast({
      title: t("Screen Share (Mock)", "Gusangiza Ecran (Agateganyo)"),
      description: t("Screen sharing feature is not yet implemented.", "Igice cyo gusangiza ecran ntikirashyirwamo."),
    });
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Online Consultation...", "Gutegura Ubujyanama kuri Interineti...")}</p>
        </div>
      </AppLayout>
    );
  }

  const doctorsList = mockDoctorsData(currentLanguage);

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
                  {isCallActive && selectedDoctor ? t(`In ${callMode} call with ${selectedDoctor.name}`, `Mu kiganiro cya ${callMode === 'video' ? 'videwo' : 'amajwi'} na ${selectedDoctor.nameKn}`) : t(`Ready for ${callMode} consultation?`, `Witeguye ubujyanama bwa ${callMode === 'video' ? 'videwo' : 'amajwi'}?`)}
                </CardTitle>
                {!isCallActive && (
                    <div className="flex space-x-2">
                        <Button variant={callMode === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('video')}>{t("Video Call", "Ikiganiro cya Videwo")}</Button>
                        <Button variant={callMode === 'audio' ? 'default' : 'outline'} size="sm" onClick={() => setCallMode('audio')}>{t("Audio Only", "Amajwi Gusa")}</Button>
                    </div>
                )}
              </div>
              <CardDescription>
                {isCallActive ? t("You are currently in a virtual consultation.", "Ubu uri mu bujyanama bwo kuri interineti.") : t(`Connect with qualified doctors from home via ${callMode} call.`, `Vugana n'abaganga b'inzobere uri iwawe ukoresheje ${callMode === 'video' ? 'videwo' : 'amajwi'}.`)}
              </CardDescription>
            </CardHeader>
            <CardContent className={`aspect-[16/9] bg-black flex items-center justify-center relative ${isCallActive ? 'border-2 border-primary' : 'border-2 border-muted'}`}>
              {isCallActive ? (
                <>
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {callMode === 'video' ? (
                       <Image 
                          src="https://placehold.co/800x450.png" 
                          alt={t("Doctor's Video Feed (Mock)", "Videwo ya Muganga (Agateganyo)")} 
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
                        <p className="text-lg font-medium">{currentLanguage === 'kn' ? selectedDoctor?.nameKn : selectedDoctor?.name}</p>
                        <p className="text-sm opacity-70">{currentLanguage === 'kn' ? selectedDoctor?.specialtyKn : selectedDoctor?.specialty}</p>
                        {callMode === 'audio' && <p className="text-xs opacity-60 mt-1">{t("(Audio Only Mode)", "(Uburyo bw'Amajwi Gusa)")}</p>}
                      </div>
                  </div>

                  {callMode === 'video' && (
                    <div className="absolute top-4 right-4 p-1 bg-black/70 rounded-lg w-1/4 max-w-[200px] aspect-[16/9] shadow-lg border border-primary/50">
                        <video ref={videoRef} className={`w-full h-full rounded-md object-cover ${isVideoOff ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-md">
                                <VideoOff className="h-10 w-10 text-white" />
                            </div>
                        )}
                        <p className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">{t("You", "Wowe")}</p>
                    </div>
                  )}
                  {hasCameraPermission === false && isCallActive && callMode === 'video' && !isVideoOff && (
                     <Alert variant="destructive" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md z-20">
                        <VideoOff className="h-5 w-5" />
                        <AlertTitle>{t("Camera Access Denied", "Kwinjira muri Kamera Byanze")}</AlertTitle>
                        <AlertDescription>
                            {t("Please enable camera permissions to share your video.", "Nyamuneka fungura uburenganzira bwa kamera kugirango usangize videwo yawe.")}
                        </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  {callMode === 'video' ? <Video className="h-24 w-24 mx-auto mb-4 text-primary" /> : <Ear className="h-24 w-24 mx-auto mb-4 text-primary" />}
                  <p className="text-xl mb-2">{t(`Your ${callMode} call will appear here.`, `Ikiganiro cyawe cya ${callMode === 'video' ? 'videwo' : 'amajwi'} kizagaragara hano.`)}</p>
                  <p>{t("Select a doctor to start your consultation.", "Hitamo muganga kugirango utangire ubujyanama.")}</p>
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
                    <Button variant="secondary" onClick={handleScreenShare} className="rounded-full p-2 sm:p-3 transition-all hover:scale-110 active:scale-95" aria-label={t("Share Screen (Not Implemented)", "Sangiza Ecran (Ntibirakorwa)")}>
                      <ScreenShare className="h-5 w-5" />
                    </Button>
                </CardFooter>
            )}
          </Card>
          
          {isCallActive && selectedDoctor && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center text-lg">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary"/> {t(`Chat with ${selectedDoctor.name}`, `Ibiganiro na ${currentLanguage === 'kn' ? selectedDoctor.nameKn : selectedDoctor.name}`)}
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
                    placeholder={t("Type your message...", "Andika ubutumwa bwawe...")} 
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
              <CardTitle className="font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" /> {t("Available Doctors", "Abaganga Bahari")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {doctorsList.map(doc => (
                <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${selectedDoctor?.id === doc.id && isCallActive ? 'bg-primary/10 border-primary shadow-md scale-105' : 'hover:shadow-md hover:scale-[1.02] hover:border-primary/50'}`}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
                      <AvatarImage src={`https://placehold.co/60x60.png`} data-ai-hint={doc.avatarHint} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{ (currentLanguage === 'kn' ? doc.nameKn : doc.name).substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentLanguage === 'kn' ? doc.nameKn : doc.name}</p>
                      <p className="text-xs text-muted-foreground">{currentLanguage === 'kn' ? doc.specialtyKn : doc.specialty}</p>
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
