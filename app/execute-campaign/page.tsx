'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StrategyModal } from '@/components/strategy-modal';
import { CustomerDetailsModal } from '@/components/customer-details-modal';
import type { Customer } from '@/context/CustomersContext';
import { Info, Phone, PhoneOff, Eye } from 'lucide-react';
import { CallTranscriptModal } from '@/components/call-transcript-modal';
import { generateObject, generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import { useConversationContext } from '@/context/ConversationContext';

// Mock segments and their filtering logic
const segments = [
  { id: 'high-value', name: 'High Value (>$10,000)' },
  { id: 'medium-value', name: 'Medium Value ($5,000-$10,000)' },
  { id: 'low-value', name: 'Low Value (<$5,000)' },
];

// Mock customer data
const mockCustomers: Customer[] = [
  {
    name: "John Smith",
    age: 35,
    ssn: "XXX-XX-1234", 
    totalOwed: 15000,
    debtStatus: "overdue",
    state: "CA",
    city: "Los Angeles",
    zipcode: "90001",
    typeOfDebt: "Credit Card",
    debtAge: 90,
    language: "English"
  },
  {
    name: "Maria Garcia",
    age: 42,
    ssn: "XXX-XX-5678",
    totalOwed: 7500,
    debtStatus: "defaulted", 
    state: "TX",
    city: "Houston",
    zipcode: "77001",
    typeOfDebt: "Personal Loan",
    debtAge: 120,
    language: "Spanish"
  },
  {
    name: "David Johnson",
    age: 28,
    ssn: "XXX-XX-9012",
    totalOwed: 3000,
    debtStatus: "overdue",
    state: "NY", 
    city: "Brooklyn",
    zipcode: "11201",
    typeOfDebt: "Medical",
    debtAge: 60,
    language: "English"
  },
  {
    name: "Sarah Williams",
    age: 45,
    ssn: "XXX-XX-3456",
    totalOwed: 12500,
    debtStatus: "overdue",
    state: "FL",
    city: "Miami",
    zipcode: "33101",
    typeOfDebt: "Auto Loan",
    debtAge: 150,
    language: "English"
  },
  {
    name: "Michael Chen",
    age: 31,
    ssn: "XXX-XX-7890",
    totalOwed: 8900,
    debtStatus: "defaulted",
    state: "WA",
    city: "Seattle",
    zipcode: "98101",
    typeOfDebt: "Student Loan",
    debtAge: 180,
    language: "English"
  },
  {
    name: "Ana Rodriguez",
    age: 39,
    ssn: "XXX-XX-2345",
    totalOwed: 4500,
    debtStatus: "overdue",
    state: "AZ",
    city: "Phoenix",
    zipcode: "85001",
    typeOfDebt: "Credit Card",
    debtAge: 75,
    language: "Spanish"
  },
  {
    name: "Robert Kim",
    age: 52,
    ssn: "XXX-XX-6789",
    totalOwed: 17800,
    debtStatus: "defaulted",
    state: "IL",
    city: "Chicago",
    zipcode: "60601",
    typeOfDebt: "Business Loan",
    debtAge: 210,
    language: "Korean"
  },
  {
    name: "Emily Brown",
    age: 29,
    ssn: "XXX-XX-0123",
    totalOwed: 6200,
    debtStatus: "overdue",
    state: "MA",
    city: "Boston",
    zipcode: "02108",
    typeOfDebt: "Personal Loan",
    debtAge: 45,
    language: "English"
  }
];

type CallState = 'idle' | 'in-progress' | 'completed' | 'failed';

interface ConversationSummary {
  date: Date;
  summary: string;
  outcome: 'successful' | 'unsuccessful' | 'pending';
}

interface CustomerCallState {
  state: CallState;
  startTime?: Date;
  duration?: number;
  summary?: ConversationSummary;
}

export default function ExecuteCampaignPage() {
  const [selectedSegment, setSelectedSegment] = useState<string>('high-value');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [callTranscriptModalOpen, setCallTranscriptModalOpen] = useState(false);
  const [activeCallCustomer, setActiveCallCustomer] = useState<Customer | null>(null);
  const [callStates, setCallStates] = useState<Record<string, CustomerCallState>>({});
  const { conversationHistory, startPolling, stopPolling } = useConversationContext();

  // Filter customers based on selected segment
  const filteredCustomers = selectedSegment
    ? mockCustomers.filter(customer => {
        switch (selectedSegment) {
          case 'high-value':
            return customer.totalOwed > 10000;
          case 'medium-value':
            return customer.totalOwed >= 5000 && customer.totalOwed <= 10000;
          case 'low-value':
            return customer.totalOwed < 5000;
          default:
            return true;
        }
      })
    : [];

  const handleExecute = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStrategyModalOpen(true);
  };

  const handleViewDetails = (customer: Customer) => {
    setDetailsCustomer(customer);
    setDetailsModalOpen(true);
  };

  const handleCallStateChange = async (customer: Customer, state: CallState, transcript?: string) => {
    console.log('handleCallStateChange', state);

    if (state === 'in-progress') {
      startPolling(
        new Date(), 
        customer.ssn,
        (ssn) => handleCallStateChange(customer, 'completed')
      );
    } else if (state === 'completed' || state === 'failed') {
      stopPolling();
    }

    setCallStates(prev => ({
      ...prev,
      [customer.ssn]: {
        state,
        startTime: state === 'in-progress' ? new Date() : prev[customer.ssn]?.startTime,
        duration: state === 'completed' && prev[customer.ssn]?.startTime 
          ? Math.round((new Date().getTime() - prev[customer.ssn].startTime!.getTime()) / 1000)
          : undefined
      }
    }));
  };

  const handleViewCallTranscript = (customer: Customer) => {
    // Only set active customer if the call is in progress or completed
    const callState = callStates[customer.ssn]?.state || 'idle';
    if (callState === 'in-progress' || callState === 'completed') {
      setActiveCallCustomer(customer);
      setCallTranscriptModalOpen(true);
    }
  };

  // Add new handler for modal close
  const handleTranscriptModalClose = (open: boolean, transcript?: string) => {  // Add transcript parameter
    setCallTranscriptModalOpen(open);
    if (!open && activeCallCustomer) {
      handleCallStateChange(activeCallCustomer, 'completed', transcript);  // Pass the transcript
      setCallStates(prev => ({
        ...prev,
        [activeCallCustomer.ssn]: { state: 'completed' }
      }));
      setActiveCallCustomer(null);
    }
  };

  const getCallStateButton = (customer: Customer) => {
    const callState = callStates[customer.ssn] || { state: 'idle' };

    switch (callState.state) {
      case 'in-progress':
        return (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewCallTranscript(customer)}
            className="w-[140px] flex items-center justify-center gap-2"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Call in Progress
          </Button>
        );
      case 'completed':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="w-[140px] border-green-500 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            <Phone className="mr-2 h-4 w-4" />
            Completed
          </Button>
        );
      case 'failed':
        return (
          <Button
            size="sm"
            variant="outline"
            className="w-[140px] text-red-600"
            disabled
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            Call Failed
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => handleExecute(customer)}
            className="w-[140px]"
          >
            Execute Collection
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Execute Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Select a segment and execute collection campaigns for specific customers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="max-w-xs">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger>
              <SelectValue placeholder="Select a segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSegment && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Debt Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.ssn}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>${customer.totalOwed.toLocaleString()}</TableCell>
                    <TableCell>{customer.typeOfDebt}</TableCell>
                    <TableCell>
                      <span className="capitalize">{customer.debtStatus}</span>
                    </TableCell>
                    <TableCell>{customer.city}, {customer.state}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(customer)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        {getCallStateButton(customer)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <StrategyModal
          customer={selectedCustomer}
          open={strategyModalOpen}
          onOpenChange={(open) => {
            setStrategyModalOpen(open);
            if (!open) setSelectedCustomer(null);
          }}
          onCallStart={() => handleCallStateChange(selectedCustomer, 'in-progress')}
        />
      )}

      {detailsCustomer && (
        <CustomerDetailsModal
          customer={detailsCustomer}
          open={detailsModalOpen}
          onOpenChange={(open) => {
            setDetailsModalOpen(open);
            if (!open) setDetailsCustomer(null);
          }}
          conversationHistory={conversationHistory[detailsCustomer.ssn] || []}
        />
      )}

      {activeCallCustomer && callStates[activeCallCustomer.ssn]?.startTime && (
        <CallTranscriptModal
        customer={activeCallCustomer}
        open={callTranscriptModalOpen}
        onOpenChange={(open, transcript) => handleTranscriptModalClose(open, transcript)}  // Modify to pass transcript
        onEndCall={(transcript) => handleCallStateChange(activeCallCustomer!, 'completed', transcript)}
        startTime={callStates[activeCallCustomer?.ssn]?.startTime!}
      />
      )}
    </div>
  );
} 