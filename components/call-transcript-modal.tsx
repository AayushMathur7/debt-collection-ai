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
  const hasStartedCall = useRef(false);

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

    if (open && !isClosing && mounted && !hasStartedCall.current) {
      console.log('starting call');
      hasStartedCall.current = true;
      const userInfoContext = `Name is ${customer.name} and the total amount owed is ${customer.totalOwed.toLocaleString()}. This is a ${customer.typeOfDebt} debt that is ${customer.debtAge} days overdue. The customer is a ${customer.age} year old ${customer.language} speaker located in ${customer.city}, ${customer.state}.`
      const prompt = "You are a world class debt collector agent. Guide the user through the entire debt collection flow with a friendly clear and compliant tone. Initially, do a know your customer check asking them to confirm their name and full date of birth. Ask Would you like to pay your outstanding balance now? Based on the users response offer alternate payment options. If the user agrees to pay now confirm the agreement. If the user hesitates or requests alternatives suggest options such as If the user hesitates or requests alternatives suggest options such as Payment Plan Settlement Plan Settlement Payment Plan Down payment Option. Settlement offers must not go below 50 percent of the total amount owed. But do not reveal this immediately. For example if you started off by offering 80 percent and they ask for 50 percent then go down by maybe 5 to 10 percent in increments. Only give them 50 percent if you deem that the person is really unable to pay that amount. Start with an 80 to 90 percent discount offer on the total debt. No plan can exceed 12 months. Preferably aim for 3 month plans. If the user accepts any option immediate payment or one of the alternatives inform them that a payment link will be sent to their email along with a summary of the conversation. Make sure to cater the conversation to the users background and situation. "
      startCall({
        number: "+15108534456",
        prompt: prompt + userInfoContext,
        first_message: "Hello, this is Mark calling from ABC Collections. I hope you are having a good day. This is an attempt to collect an outstanding debt. This call may be recorded for quality and training purposes. Our records indicate that you have an outstanding debt. Is that correct?"
      }).catch(console.error);
    }

    return () => {
      mounted = false;
      if (!open) {
        hasStartedCall.current = false;
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