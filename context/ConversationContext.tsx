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
  startPolling: (startTime: Date, customerSSN: string, onComplete?: (ssn: string) => void) => void;
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

  const startPolling = useCallback((startTime: Date, customerSSN: string, onComplete?: (ssn: string) => void) => {
    if (isPolling) return;

    currentCustomerSSN.current = customerSSN;
    
    const callStartTimeUnix = Math.floor(startTime.getTime() / 1000);
    setIsPolling(true);

    const pollForConversations = async () => {
      console.log('polling for conversations');
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ? `?agent_id=${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}&page_size=5` : ''}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: response.statusText }));
          console.error('Error polling conversations:', errorData);
          setError(`Failed to poll conversations: ${errorData.detail || response.statusText}`);
          stopPolling(); // Stop polling on auth error
          return;
        }

        const data = await response.json();
        console.log('data', data);
        
        // Check if conversations array exists
        if (!data.conversations) {
          console.error('No conversations found in response:', data);
          return;
        }

        console.log("callStartTimeUnix", callStartTimeUnix);
        const newConversation = data.conversations.find((conv: any) => 
          conv.start_time_unix_secs > callStartTimeUnix
        );

      console.log("newConversation", newConversation);
        if (newConversation) {
          const detailsResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${newConversation.conversation_id}`,
            {
              headers: {
                'Accept': 'application/json',
                'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''
              }
            }
          );
          const conversationData = await detailsResponse.json();
          console.log('Found conversation:', conversationData);
          
          // Add detailed debugging to see what's in the response
          console.log('Conversation status:', conversationData.status);
          console.log('Termination reason:', conversationData.metadata?.termination_reason);
          
          // Enhanced detection of completed conversations
          const isConversationCompleted = 
            // Check for conversation status
            conversationData.status === "done" || 
            conversationData.status === "completed" || 
            conversationData.status === "failed" ||
            // Check for termination metadata
            conversationData.metadata?.termination_reason === "Client disconnected" ||
            (conversationData.metadata?.termination_reason && 
             conversationData.metadata.termination_reason.includes("disconnect")) ||
            // Check if call duration exists and has passed
            (conversationData.metadata?.call_duration_secs && 
             conversationData.metadata.call_duration_secs > 0) ||
            // Check messages for hang up text
            (conversationData.transcript && 
             conversationData.transcript.some((turn: any) => 
               turn.message?.includes("[HANGS UP]"))
            );
          
          console.log('Is conversation completed?', isConversationCompleted);

          if (isConversationCompleted) {
            console.log('Conversation is completed, stopping polling');
            stopPolling();

            // Get summary and outcome
            console.log("processing conversation data");
            const summary = await processConversationData(conversationData);
            console.log("summary", summary);
            if (summary && currentCustomerSSN.current) {
              console.log("setting conversation history");
              console.log("currentCustomerSSN.current", currentCustomerSSN.current);  

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
              onComplete?.(ssn);
            }
          } else {
            console.log('Conversation is still in progress, continuing to poll');
          }
        }
      } catch (error) {
        console.error('Error polling conversations:', error);
      }
    };

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(pollForConversations, 5000);
    console.log('Polling every 5 seconds');

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