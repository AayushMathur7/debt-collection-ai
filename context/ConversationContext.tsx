'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useConversation, Role } from '@11labs/react';

export interface TranscriptEntry {
  speaker: 'Agent' | 'Customer';
  text: string;
  timestamp: Date;
}

interface ConversationContextType {
  transcript: TranscriptEntry[];
  isConnecting: boolean;
  error: string | null;
  connectionStatus: string;
  isCallActive: boolean;
  conversationId: string | null;
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
      setIsCallActive(true);
      // Add initial transcript entry
      addTranscriptEntry({
        speaker: 'Agent',
        text: 'Call connected. Agent is ready.',
        timestamp: new Date()
      });
    },
    onDisconnect: () => {
      setIsCallActive(false);
      addTranscriptEntry({
        speaker: 'Agent',
        text: 'Call ended.',
        timestamp: new Date()
      });
    },
    onMessage: (props: { message: string; source: Role }) => {
      // Handle incoming message from the agent
      addTranscriptEntry({
        speaker: props.source === 'ai' ? 'Agent' : 'Customer',
        text: props.message,
        timestamp: new Date()
      });
    },
    onError: (message: string) => {
      setError(message || 'An error occurred during the call');
      addTranscriptEntry({
        speaker: 'Agent',
        text: `Error: ${message}`,
        timestamp: new Date()
      });
    },
  });

  const startCall = useCallback(async () => {
    try {
      await conversation.startSession({
        agentId: "RWMYfB6iooxJLltlgX22", // Your agent ID
      });
      setConversationId(Date.now().toString()); // Generate a unique ID for now
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start call');
    }
  }, [conversation]);

  const endCall = useCallback(async () => {
    try {
      console.log('ending call');
      await conversation.endSession();
      setConversationId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to end call');
    }
  }, [conversation]);

  const addTranscriptEntry = useCallback((entry: TranscriptEntry) => {
    setTranscript(prev => [...prev, entry]);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        transcript,
        isConnecting: conversation.status === 'connecting',
        error,
        connectionStatus: conversation.status,
        isCallActive,
        conversationId,
        startCall,
        endCall,
        addTranscriptEntry,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
} 