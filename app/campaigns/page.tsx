'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useCallTimer } from '@/lib/hooks/useCallTimer';
import { useCustomers, type Customer } from '@/context/CustomersContext';
import { Info, Phone, PhoneOff } from 'lucide-react';

type CallState = 'idle' | 'in-progress' | 'completed' | 'failed';

interface CustomerCallState {
  state: CallState;
  startTime?: Date;
  duration?: number;
}

function CallStateButton({ customer, callState, onStateChange }: {
  customer: Customer;
  callState: CustomerCallState;
  onStateChange: (state: CallState) => void;
}) {
  const duration = useCallTimer(callState.state === 'in-progress' ? callState.startTime : undefined);

  switch (callState.state) {
    case 'in-progress':
      return (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onStateChange('completed')}
          className="w-[140px] animate-pulse"
        >
          <Phone className="mr-2 h-4 w-4" />
          In Call ({duration}s)
        </Button>
      );
    case 'completed':
      return (
        <Button
          size="sm"
          variant="outline"
          className="w-[140px] text-green-600"
          disabled
        >
          <Phone className="mr-2 h-4 w-4" />
          Call Complete ({callState.duration}s)
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
          onClick={() => onStateChange('in-progress')}
          className="w-[140px]"
        >
          Start Collection
        </Button>
      );
  }
}

export default function CampaignsPage() {
  const { customers } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [callStates, setCallStates] = useState<Record<string, CustomerCallState>>({});

  const handleStartCollection = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStrategyModalOpen(true);
  };

  const handleViewDetails = (customer: Customer) => {
    setDetailsCustomer(customer);
    setDetailsModalOpen(true);
  };

  const handleCallStateChange = (customer: Customer, state: CallState) => {
    setCallStates(prev => ({
      ...prev,
      [customer.id]: {
        state,
        startTime: state === 'in-progress' ? new Date() : prev[customer.id]?.startTime,
        duration: state === 'completed' && prev[customer.id]?.startTime 
          ? Math.round((new Date().getTime() - prev[customer.id].startTime!.getTime()) / 1000)
          : undefined
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          View and manage collection campaigns.
        </p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Debt Type</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Debt Age</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>${customer.amount.toLocaleString()}</TableCell>
                <TableCell>{customer.debtType}</TableCell>
                <TableCell>{customer.age}</TableCell>
                <TableCell>{customer.debtAge} days</TableCell>
                <TableCell>{customer.city}, {customer.state}</TableCell>
                <TableCell>{customer.language}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <CallStateButton
                      customer={customer}
                      callState={callStates[customer.id] || { state: 'idle' }}
                      onStateChange={(state) => handleCallStateChange(customer, state)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No debtors available. Please add debtors in the Segmentation page first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
        />
      )}
    </div>
  );
} 