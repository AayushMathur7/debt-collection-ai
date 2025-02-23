import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/context/CustomersContext';
import { useAgentSettings } from '@/context/AgentSettingsContext';
import { useConversationContext } from '@/context/ConversationContext';
import { useEffect, useState, useRef } from 'react';
import { AlertCircle, Mic, Volume2 } from 'lucide-react';

interface CallTranscriptModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean, transcript?: string) => void;  // Change to single string
  onEndCall: (transcript?: string) => void;  // Change to single string
  startTime: Date;
}
  
export function CallTranscriptModal({ 
  customer, 
  open, 
  onOpenChange,
  onEndCall,
  startTime 
}: CallTranscriptModalProps) {
  const { settings } = useAgentSettings();
  const { 
    transcript, 
    isConnecting, 
    error, 
    connectionStatus,
    startCall,
    endCall 
  } = useConversationContext();
  const [duration, setDuration] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  // const hasStartedCall = useRef(false);

  // Shared function to handle call ending
  const endCallSafely = async () => {
    if (connectionStatus === 'connected' || connectionStatus === 'ready') {
      setIsClosing(true);
      try {
        await endCall();
        // Wait a bit to ensure the call is fully ended
        await new Promise(resolve => setTimeout(resolve, 1000));
        onEndCall();
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    return () => {
      mounted = false;
      if (!open) {
        endCallSafely();
      }
    };
  }, [open, isClosing]);

  const formatTranscript = () => {
    return transcript.map(entry => 
      `${entry.speaker}: ${entry.text}`
    ).join('\n');
  };

  const handleDialogChange = async (newOpen: boolean) => {
    if (!newOpen && !isClosing) {
      await endCallSafely();
      onOpenChange(false, formatTranscript());  // Pass formatted transcript
      setIsClosing(false);
    } else if (newOpen && !isClosing) {
      onOpenChange(true);
    }
  };

  const handleEndCall = async () => {
    if (!isClosing) {
      await endCallSafely();
      onOpenChange(false, formatTranscript());  // Pass formatted transcript
      setIsClosing(false);
    }
  };

  useEffect(() => {
    // Calculate initial duration
    setDuration(Math.round((new Date().getTime() - startTime.getTime()) / 1000));

    // Set up interval to update duration every second
    const intervalId = setInterval(() => {
      setDuration(Math.round((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    // Clean up interval on unmount or when modal closes
    return () => clearInterval(intervalId);
  }, [startTime, open]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [transcript]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'ready':
        return 'bg-green-500/10 text-green-500';
      case 'connecting':
        return 'bg-blue-500/10 text-blue-500';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-h-[90vh] max-w-[800px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Live Call Transcript</DialogTitle>
          <DialogDescription>
            Call with {customer.name} - Duration: {duration}s
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-12rem)]" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {/* Connection Status */}
            <div className={`p-4 rounded-lg flex items-center gap-2 ${getStatusColor()}`}>
              {isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <Volume2 className="h-4 w-4" />
                </>
              )}
              <p className="flex-1">
                Status: {connectionStatus}
                {connectionStatus === 'ready' && ' - Agent is listening'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            {/* Call Information */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${customer.totalOwed.toLocaleString()} - {customer.typeOfDebt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-2xl tabular-nums">{duration}s</p>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="space-y-4">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    entry.speaker === "Agent" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      entry.speaker === "Agent"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted mr-auto"
                    }`}
                  >
                    <div className={`flex justify-between items-center mb-1 ${
                      entry.speaker === "Agent" ? "flex-row-reverse" : "flex-row"
                    }`}>
                      <span className="text-xs font-medium">{entry.speaker}</span>
                      <span className="text-xs opacity-70">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Call started at {startTime.toLocaleTimeString()}
            </p>
            <Button
              variant="destructive"
              onClick={handleEndCall}
              disabled={isConnecting || connectionStatus === 'disconnected'}
            >
              End Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 