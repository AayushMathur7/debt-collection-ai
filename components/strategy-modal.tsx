'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentSettings } from '@/context/AgentSettingsContext';
import { Customer } from '@/context/CustomersContext';
import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { Conversation } from './conversation';

interface StrategyModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCallStart: () => void;
}

export function StrategyModal({ customer, open, onOpenChange, onCallStart }: StrategyModalProps) {
  const { settings } = useAgentSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<string>('');

  const generateStrategy = async () => {
    setIsGenerating(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock strategy generation
      const mockStrategy = `
Collection Strategy for ${customer.name}:

1. Initial Approach:
   - Acknowledge the total debt amount: $${customer.totalOwed}
   - Note that this is a ${customer.typeOfDebt} debt
   - Consider the debt age of ${customer.debtAge} days

2. Communication Plan:
   - Primary language: ${customer.language}
   - Location: ${customer.city}, ${customer.state}
   - Use empathetic but firm tone

3. Payment Discussion:
   - Explore payment plan options
   - Discuss potential settlement offers
   - Document all agreements carefully

4. Compliance Notes:
   - Ensure all communications follow FDCPA guidelines
   - Document all interaction attempts
   - Maintain professional demeanor

5. Agent Script:
   "${settings.greeting}"
   "${settings.miniMiranda}"
   ${settings.disclaimers.map(d => `"${d}"`).join('\n   ')}
      `;
      
      setStrategy(mockStrategy);
    } catch (error) {
      toast.error('Failed to generate strategy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCall = () => {
    onCallStart();
    toast.success('Call initiated', {
      description: 'Starting collection call with prepared strategy...'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Collection Strategy</DialogTitle>
          <DialogDescription>
            Generate and review collection strategy for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-12rem)]">
          <div className="p-6 pt-2">
            {!strategy && !isGenerating && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Click generate to create a collection strategy based on customer data and agent settings.
                </p>
                <Button onClick={generateStrategy}>Generate Strategy</Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-8">
                <p className="text-muted-foreground animate-pulse">
                  Generating collection strategy...
                </p>
              </div>
            )}

            {strategy && !isGenerating && (
              <div className="whitespace-pre-wrap font-mono text-sm border rounded-md p-4 bg-muted">
                {strategy}
              </div>
            )}
          </div>
        </ScrollArea>

        <Conversation />
        
        <div className="p-4 border-t bg-muted/50">
          <DialogFooter className="sm:space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartCall} disabled={!strategy || isGenerating}>
              Start Call
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 