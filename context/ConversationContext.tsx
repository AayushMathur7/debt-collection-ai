'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { useConversation, Role } from '@11labs/react';
import { processConversationData } from '@/utils/conversationProcessor';
import { ConversationSummary } from '@/types/conversation';

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
  conversationHistory: Record<string, ConversationSummary[]>;  // Add this
  startCall: (payload: OutboundCallPayload) => Promise<void>;
  endCall: () => Promise<void>;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  startPolling: (startTime: Date, customerSSN: string) => void;
  stopPolling: () => void;
  isPolling: boolean;
}

interface OutboundCallPayload {
  number: string;
  prompt: string;
  first_message: string;
}

interface OutboundCallPayload {
  number: string;
  prompt: string;
  first_message: string;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const hasStartedCall = useRef(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Record<string, ConversationSummary[]>>({});
  const currentCustomerSSN = useRef<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
      setIsCallActive(true);
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

  const startCall = useCallback(async (payload: OutboundCallPayload) => {
    if (hasStartedCall.current) {
      console.log('Call already started');
      return;
    }

    try {
      hasStartedCall.current = true;
      console.log('starting call');
      const response = await fetch('/api/outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: payload.number,
          prompt: payload.prompt,
          first_message: payload.first_message
        }),
      });

      const data = await response.json();
      setConversationId(data.callSid);
    } catch (error) {
      hasStartedCall.current = false;
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start call');
      throw error; // Re-throw to allow handling in the component
    }
  }, []);

  const endCall = useCallback(async () => {
    try {
      console.log('ending call');
      await conversation.endSession();
      hasStartedCall.current = false;
      setConversationId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to end call');
      throw error; // Re-throw to allow handling in the component
    }
  }, [conversation]);

  const addTranscriptEntry = useCallback((entry: TranscriptEntry) => {
    setTranscript(prev => [...prev, entry]);
  }, []);

  const startPolling = useCallback((startTime: Date, customerSSN: string) => {
    if (isPolling) return;

    currentCustomerSSN.current = customerSSN;
    
    const callStartTimeUnix = Math.floor(startTime.getTime() / 1000);
    setIsPolling(true);

    const pollForConversations = async () => {
      console.log('polling for conversations');
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`,
          {
            method: 'GET',
            headers: { 'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '' }
          }
        );
        const data = await response.json();
        
        const newConversation = data.conversations?.find((conv: any) => 
          conv.start_time_unix_secs > callStartTimeUnix && 
          conv.status === 'completed'
        );

        if (newConversation) {
          const detailsResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${newConversation.conversation_id}`,
            {
              headers: { 'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '' }
            }
          );
          const conversationData = await detailsResponse.json();
          console.log('Found new completed conversation:', conversationData);
          stopPolling();

          // Get summary and outcome
          const summary = await processConversationData(conversationData);

          if (summary && currentCustomerSSN.current) {
            const ssn = currentCustomerSSN.current; // Store in local variable
            setConversationHistory(prev => ({
              ...prev,
              [ssn]: [
                ...(prev[ssn] || []),
                {
                  date: new Date(),
                  summary: summary.summary,
                  outcome: summary.outcome
                }
              ]
            }));
          }

          
        }
      } catch (error) {
        console.error('Error polling conversations:', error);
      }
    };

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(pollForConversations, 5000);

    // Set 5 minute timeout
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      console.log('Polling timeout reached');
    }, 5 * 60 * 1000);
  }, [isPolling]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    setIsPolling(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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
        conversationHistory,
        startPolling,
        stopPolling,
        isPolling,
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