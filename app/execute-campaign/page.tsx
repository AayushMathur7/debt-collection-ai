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
import type { Customer } from '@/context/CustomersContext';
import { Info, Phone, PhoneOff } from 'lucide-react';

// Mock customer data
const mockCustomers: Customer[] = [
  {
    name: "John Smith",
    age: 35,
    ssn: "XXX-XX-1111",
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
    ssn: "XXX-XX-2222",
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
    ssn: "XXX-XX-3333",
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
    name: "Sarah Chen",
    age: 31,
    ssn: "XXX-XX-4444",
    totalOwed: 25000,
    debtStatus: "defaulted",
    state: "WA",
    city: "Seattle",
    zipcode: "98101",
    typeOfDebt: "Student Loan",
    debtAge: 180,
    language: "Mandarin"
  },
  {
    name: "Michael Rodriguez",
    age: 45,
    ssn: "XXX-XX-5555",
    totalOwed: 12000,
    debtStatus: "overdue",
    state: "FL",
    city: "Miami",
    zipcode: "33101",
    typeOfDebt: "Business Loan",
    debtAge: 45,
    language: "Spanish"
  },
  {
    name: "Emily Patel",
    age: 29,
    ssn: "XXX-XX-6666",
    totalOwed: 8500,
    debtStatus: "defaulted",
    state: "IL",
    city: "Chicago",
    zipcode: "60601",
    typeOfDebt: "Credit Card",
    debtAge: 150,
    language: "English"
  },
  {
    name: "James Wilson",
    age: 52,
    ssn: "XXX-XX-7777",
    totalOwed: 45000,
    debtStatus: "overdue",
    state: "AZ",
    city: "Phoenix",
    zipcode: "85001",
    typeOfDebt: "Mortgage",
    debtAge: 210,
    language: "English"
  },
  {
    name: "Sofia Martinez",
    age: 38,
    ssn: "XXX-XX-8888",
    totalOwed: 5500,
    debtStatus: "defaulted",
    state: "CA",
    city: "San Diego",
    zipcode: "92101",
    typeOfDebt: "Personal Loan",
    debtAge: 75,
    language: "Spanish"
  },
  {
    name: "Robert Kim",
    age: 33,
    ssn: "XXX-XX-9999",
    totalOwed: 18000,
    debtStatus: "overdue",
    state: "MA",
    city: "Boston",
    zipcode: "02108",
    typeOfDebt: "Student Loan",
    debtAge: 120,
    language: "Korean"
  },
  {
    name: "Lisa Anderson",
    age: 47,
    ssn: "XXX-XX-1010",
    totalOwed: 9500,
    debtStatus: "defaulted",
    state: "GA",
    city: "Atlanta",
    zipcode: "30301",
    typeOfDebt: "Medical",
    debtAge: 90,
    language: "English"
  },
  {
    name: "Ahmed Hassan",
    age: 36,
    ssn: "XXX-XX-2020",
    totalOwed: 22000,
    debtStatus: "overdue",
    state: "MI",
    city: "Detroit",
    zipcode: "48201",
    typeOfDebt: "Business Loan",
    debtAge: 150,
    language: "Arabic"
  },
  {
    name: "Jennifer Wong",
    age: 41,
    ssn: "XXX-XX-3030",
    totalOwed: 13500,
    debtStatus: "defaulted",
    state: "NV",
    city: "Las Vegas",
    zipcode: "89101",
    typeOfDebt: "Credit Card",
    debtAge: 180,
    language: "Cantonese"
  },
  {
    name: "Thomas Brown",
    age: 55,
    ssn: "XXX-XX-4040",
    totalOwed: 65000,
    debtStatus: "overdue",
    state: "OR",
    city: "Portland",
    zipcode: "97201",
    typeOfDebt: "Mortgage",
    debtAge: 240,
    language: "English"
  },
  {
    name: "Anna Kowalski",
    age: 34,
    ssn: "XXX-XX-5050",
    totalOwed: 6800,
    debtStatus: "defaulted",
    state: "PA",
    city: "Philadelphia",
    zipcode: "19101",
    typeOfDebt: "Personal Loan",
    debtAge: 60,
    language: "Polish"
  }
];

type CallState = 'idle' | 'in-progress' | 'completed' | 'failed';

interface CustomerCallState {
  state: CallState;
  startTime?: Date;
  duration?: number;
}

export default function ExecuteCampaignPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [callStates, setCallStates] = useState<Record<string, CustomerCallState>>({});

  const handleExecute = (customer: Customer) => {
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
      [customer.ssn]: {
        state,
        startTime: state === 'in-progress' ? new Date() : prev[customer.ssn]?.startTime,
        duration: state === 'completed' && prev[customer.ssn]?.startTime 
          ? Math.round((new Date().getTime() - prev[customer.ssn].startTime!.getTime()) / 1000)
          : undefined
      }
    }));
  };

  const getCallStateButton = (customer: Customer) => {
    const callState = callStates[customer.ssn] || { state: 'idle' };

    switch (callState.state) {
      case 'in-progress':
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleCallStateChange(customer, 'completed')}
            className="w-[140px] animate-pulse"
          >
            <Phone className="mr-2 h-4 w-4" />
            In Call ({Math.round((new Date().getTime() - (callState.startTime?.getTime() || 0)) / 1000)}s)
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
          Execute collection campaigns for customers.
        </p>
      </div>

      <div className="space-y-4">
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
              {mockCustomers.map((customer) => (
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