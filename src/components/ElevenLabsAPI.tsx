
import React, { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { toast } from "sonner";
import config from "../config";

interface ElevenLabsAPIProps {
  isActive: boolean;
  agentId: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function ElevenLabsAPI({
  isActive,
  agentId,
  onConnected,
  onDisconnected,
  onSpeakingChange,
}: ElevenLabsAPIProps) {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem("elevenlabs_api_key"));
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);

  const {
    status,
    isSpeaking,
    startSession,
    endSession,
    setVolume
  } = useConversation({
    onConnect: () => {
      console.log("ElevenLabs API connected");
      onConnected?.();
      toast.success("Voice coach connected!");
    },
    onDisconnect: () => {
      console.log("ElevenLabs API disconnected");
      onDisconnected?.();
      toast.info("Voice coach disconnected");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast.error(`Error: ${error.toString() || "Failed to connect to voice coach"}`);
    }
  });

  useEffect(() => {
    onSpeakingChange?.(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  const setupApiKey = async () => {
    if (!config.elevenLabsApiKey) {
      console.error("Missing ElevenLabs API key in config.");
      return false;
    }
  
    setApiKey(config.elevenLabsApiKey);
    return true;
  };
  
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast.error("Microphone access is required for the voice session");
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleSession = async () => {
      if (isActive) {
        const hasApiKey = await setupApiKey();
        if (!hasApiKey || !isMounted) return;

        if (!hasRequestedMicPermission) {
          const hasMicPermission = await requestMicrophonePermission();
          setHasRequestedMicPermission(true);
          if (!hasMicPermission || !isMounted) return;
        }

        try {
          await startSession({ agentId });
          setVolume({ volume: 1.0 });
        } catch (error) {
          console.error("Failed to start ElevenLabs session:", error);
          toast.error("Failed to connect to voice coach");
        }
      } else {
        try {
          await endSession();
        } catch (error) {
          console.error("Failed to end ElevenLabs session:", error);
        }
      }
    };

    handleSession();

    return () => {
      isMounted = false;
      if (status === "connected") {
        endSession();
      }
    };
  }, [isActive, agentId]);

  return null;
}
