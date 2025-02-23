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
import { useConversationContext } from '@/context/ConversationContext';

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
  const { startCall } = useConversationContext();
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

    console.log('starting call');
      const userInfoContext = `Name is ${customer.name} and the total amount owed is ${customer.totalOwed.toLocaleString()}. This is a ${customer.typeOfDebt} debt that is ${customer.debtAge} days overdue. The customer is a ${customer.age} year old ${customer.language} speaker located in ${customer.city}, ${customer.state}.`
      const prompt = "You are a world class debt collector agent. Guide the user through the entire debt collection flow with a friendly clear and compliant tone. Initially, do a know your customer check asking them to confirm their name and full date of birth. Ask Would you like to pay your outstanding balance now? Based on the users response offer alternate payment options. If the user agrees to pay now confirm the agreement. If the user hesitates or requests alternatives suggest options such as If the user hesitates or requests alternatives suggest options such as Payment Plan Settlement Plan Settlement Payment Plan Down payment Option. Settlement offers must not go below 50 percent of the total amount owed. But do not reveal this immediately. For example if you started off by offering 80 percent and they ask for 50 percent then go down by maybe 5 to 10 percent in increments. Only give them 50 percent if you deem that the person is really unable to pay that amount. Start with an 80 to 90 percent discount offer on the total debt. No plan can exceed 12 months. Preferably aim for 3 month plans. If the user accepts any option immediate payment or one of the alternatives inform them that a payment link will be sent to their email along with a summary of the conversation. Make sure to cater the conversation to the users background and situation. "
      startCall({
        number: "+18588688230",
        prompt: prompt + userInfoContext,
        first_message: "Hello, this is Mark calling from ABC Collections. I hope you are having a good day. This is an attempt to collect an outstanding debt. This call may be recorded for quality and training purposes. Our records indicate that you have an outstanding debt. Is that correct?"
      }).catch(console.error);

    onCallStart();
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