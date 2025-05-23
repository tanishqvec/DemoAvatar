
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WaveAnimation } from "@/components/WaveAnimation";
import { Timer } from "@/components/Timer";
import { Square, Mic, Volume2, Play, Pause } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ElevenLabsAPI } from "@/components/ElevenLabsAPI";
import config from "@/config";
import { toast } from 'sonner';

const SessionPage = () => {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionDuration] = useState(20 * 60); // 20 minutes
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [visualizationComplexity, setVisualizationComplexity] = useState("medium");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isSessionActive]);
  
  const handleStartSession = () => {
    if (!config.elevenLabsApiKey) {
      toast.error("Please add your ElevenLabs API key in the config file");
      return;
    }
    setIsSessionActive(true);
    toast.info("Starting session...");
  };
  
  const handleStopSession = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      toast.info("Session paused");
    } else {
      setIsSessionActive(true);
      toast.info("Session resumed");
    }
  };
  
  const handleEndSession = () => {
    if (!showConfirmEnd) {
      setShowConfirmEnd(true);
      return;
    }
    
    endSession();
  };
  
  const handleCancelEnd = () => {
    setShowConfirmEnd(false);
  };
  
  const endSession = () => {
    setIsSessionActive(false);
    setElapsedTime(0);
    setShowConfirmEnd(false);
    navigate('/');
  };
  
  const handleTimerComplete = () => {
    endSession();
  };
  
  const toggleVisualization = () => {
    const complexities = ["simple", "medium", "complex"];
    const currentIndex = complexities.indexOf(visualizationComplexity);
    const nextIndex = (currentIndex + 1) % complexities.length;
    setVisualizationComplexity(complexities[nextIndex]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApiConnected = () => {
    setIsApiConnected(true);
  };

  const handleApiDisconnected = () => {
    setIsApiConnected(false);
  };

  const handleSpeakingChange = (isSpeaking: boolean) => {
    setIsAiSpeaking(isSpeaking);
  };

  // Simulate user speaking for demo purposes
  useEffect(() => {
    if (isSessionActive && !isAiSpeaking) {
      // This would be replaced with actual user speech detection
      const timer = setInterval(() => {
        // Randomly toggle user speaking state when AI isn't speaking
        if (Math.random() > 0.7) {
          setIsUserSpeaking(prev => !prev);
        }
      }, 2000);
      
      return () => clearInterval(timer);
    } else {
      setIsUserSpeaking(false);
    }
  }, [isSessionActive, isAiSpeaking]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <ElevenLabsAPI 
        isActive={isSessionActive}
        agentId={config.elevenLabsAgentId}
        onConnected={handleApiConnected}
        onDisconnected={handleApiDisconnected}
        onSpeakingChange={handleSpeakingChange}
      />
      <div className="w-full max-w-2xl">
        <Card className="bg-black border-none overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 border-b border-surface">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">PodCoach Session</h2>
                  <p className="text-sm text-white/60">
                    Guest • Public Speaking
                  </p>
                </div>
                <Timer 
                  duration={sessionDuration - elapsedTime} 
                  isRunning={isSessionActive} 
                  onComplete={handleTimerComplete} 
                />
              </div>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {!isSessionActive && elapsedTime === 0 ? (
                <div className="text-center py-8">
                  <h1 className="text-3xl font-bold text-primary mb-6">Ready to begin?</h1>
                  <p className="text-white/80 mb-8 max-w-md mx-auto">
                    Click the button below to start your coaching session. 
                    Your session will last up to 20 minutes.
                  </p>
                  <Button size="lg" onClick={handleStartSession} className="h-14 px-8">
                    <Play className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                </div>
              ) : (
                <div className="w-full py-8 flex flex-col items-center">
                  <div className="relative mb-8 w-full max-w-xs">
                    <div className="absolute -inset-8 bg-primary/5 rounded-full blur-xl" />
                    <div className="relative">
                      <WaveAnimation 
                        size="lg" 
                        isActive={isSessionActive}
                        isSpeaking={isAiSpeaking || isUserSpeaking}
                        speakerType={isAiSpeaking ? "ai" : isUserSpeaking ? "user" : "idle"}
                        className="mb-4" 
                      />
                    </div>
                    
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                      <button
                        onClick={toggleVisualization}
                        className="text-white/60 hover:text-primary transition-colors p-1 rounded-full"
                        aria-label="Change visualization complexity"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/60 mb-2">
                    {isAiSpeaking ? "PodCoach is speaking..." : 
                     isUserSpeaking ? "You are speaking..." :
                     isSessionActive ? "PodCoach is listening..." : "Session paused"}
                  </p>
                  <p className="text-sm text-primary/80 mb-6">
                    Visualization: {visualizationComplexity}
                  </p>
                  
                  <div className="flex gap-4">
                    {showConfirmEnd ? (
                      <>
                        <Button variant="secondary" onClick={handleCancelEnd}>
                          Continue Session
                        </Button>
                        <Button variant="destructive" onClick={handleEndSession}>
                          End Session
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleStopSession}
                          className="text-white/80 border-white/20 hover:bg-white/10 hover:text-white"
                        >
                          {isSessionActive ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Session
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Resume Session
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleEndSession}
                          className="text-white/80 border-white/20 hover:bg-white/10 hover:text-white"
                        >
                          <Square className="mr-2 h-4 w-4" />
                          End Session
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-surface flex justify-between items-center">
              <div className="flex items-center">
                {isSessionActive ? (
                  <>
                    {isAiSpeaking ? (
                      <>
                        <Volume2 className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm text-white/60">PodCoach speaking</span>
                      </>
                    ) : isUserSpeaking ? (
                      <>
                        <Mic className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-sm text-white/60">You're speaking</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-white/60">Listening to you</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 text-white/40 mr-2" />
                    <span className="text-sm text-white/40">
                      {elapsedTime > 0 ? "Session paused" : "Waiting to start"}
                    </span>
                  </>
                )}
              </div>
              <span className="text-sm text-white/60">
                {elapsedTime > 0 || isSessionActive ? formatTime(elapsedTime) : "00:00"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionPage;
