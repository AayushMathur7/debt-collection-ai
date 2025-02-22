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
import { useEffect, useState } from 'react';

interface CallTranscriptModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEndCall: () => void;
  startTime: Date;
}

// Mock transcript data - in a real app, this would be streamed/updated in real-time
const mockTranscript = [
  {
    speaker: "Agent",
    timestamp: new Date(),
    text: "Hello, this is AI Collection Assistant calling from ABC Collections. I hope you are having a good day."
  },
  {
    speaker: "Customer",
    timestamp: new Date(),
    text: "Yes, hello."
  },
  {
    speaker: "Agent",
    timestamp: new Date(),
    text: "This is an attempt to collect a debt, and any information obtained will be used for that purpose. This communication is from a debt collector."
  },
  {
    speaker: "Agent",
    timestamp: new Date(),
    text: "I'm calling regarding your outstanding balance. Are you available to discuss this matter?"
  }
];

export function CallTranscriptModal({ 
  customer, 
  open, 
  onOpenChange,
  onEndCall,
  startTime 
}: CallTranscriptModalProps) {
  const { settings } = useAgentSettings();
  const [duration, setDuration] = useState(0);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[800px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Live Call Transcript</DialogTitle>
          <DialogDescription>
            Call with {customer.name} - Duration: {duration}s
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-12rem)]">
          <div className="p-6 space-y-6">
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
              {mockTranscript.map((entry, index) => (
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
              onClick={onEndCall}
            >
              End Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 