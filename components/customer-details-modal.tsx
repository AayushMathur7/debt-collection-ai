'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/context/CustomersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BadgeCheck, Calendar, DollarSign, MapPin, User, Phone } from 'lucide-react';
import { Source_Serif_4 } from 'next/font/google';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'], // Regular and Semi-bold
});

// Define the debt thresholds
const MEDIUM_DEBT_THRESHOLD = 4000;
const HIGH_DEBT_THRESHOLD = 10000;

// Define Debt Status colors (adjust as needed)
const debtStatusColors: { [key: string]: string } = {
  'Active': 'bg-blue-100 text-blue-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Closed': 'bg-gray-100 text-gray-700',
  'Default': 'bg-red-100 text-red-700',
  // Add other statuses as necessary
};

interface ConversationSummary {
  date: Date;
  summary: string;
  outcome: 'successful' | 'unsuccessful' | 'pending';
}

interface CustomerDetailsModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationHistory?: ConversationSummary[];
}

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="grid grid-cols-[auto,1fr] items-center gap-x-2 gap-y-1">
    <Icon className="h-4 w-4 text-muted-foreground mt-1" />
    <p className="text-sm font-medium text-muted-foreground col-start-2">{label}</p>
    <p className="text-base col-start-2">{value}</p>
  </div>
);

// Helper to get priority details based on amount
function getPriorityDetails(amount: number) {
  if (amount > HIGH_DEBT_THRESHOLD) {
    return {
      level: 'High',
      badgeColor: 'bg-red-100 text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      amountColor: 'text-red-900',
      iconColor: 'text-red-600', // Color for the card icon
    };
  } else if (amount > MEDIUM_DEBT_THRESHOLD) {
    return {
      level: 'Medium',
      badgeColor: 'bg-amber-100 text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-800',
      amountColor: 'text-amber-900',
      iconColor: 'text-amber-600',
    };
  } else {
    return {
      level: 'Standard',
      badgeColor: 'bg-green-100 text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      amountColor: 'text-green-900',
      iconColor: 'text-green-600',
    };
  }
}

export function CustomerDetailsModal({
  customer,
  open,
  onOpenChange,
  conversationHistory = []
}: CustomerDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className={`text-2xl font-semibold ${sourceSerif4.className}`}>Customer Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-2">
          <div className="grid gap-4 p-6 pt-4">
            {/* Customer Header Card */}
            <Card className="overflow-hidden border border-neutral-200 shadow-sm">
              <CardHeader className="p-4 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-background mt-1">
                    <AvatarFallback className="text-lg">{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className={`text-2xl font-semibold ${sourceSerif4.className}`}>{customer.name}</CardTitle>
                    <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                      <span>Age: {customer.age}</span>
                      <span>Language: {customer.language}</span>
                      <span>SSN: ***-**-{customer.ssn.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {/* Removed content section as info is now in header */}
            </Card>

            {/* Combined Debt Overview Card */}
            {(() => {
              const priority = getPriorityDetails(customer.totalOwed);
              const statusColor = debtStatusColors[customer.debtStatus] || 'bg-gray-100 text-gray-700'; // Default color
              return (
                <Card className={`border ${priority.bgColor} shadow-sm`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center text-xl ${sourceSerif4.className} font-semibold ${priority.textColor}`}>
                      <DollarSign className={`mr-2 h-5 w-5 ${priority.iconColor}`} />
                      Debt Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-2">
                    {/* Total Amount Owed */}
                    <div className={`flex justify-between items-center p-3 rounded-md border ${priority.bgColor} border-opacity-50`}>
                      <div>
                        <span className={`text-base font-medium ${priority.textColor}`}>Total Amount Owed</span>
                        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${priority.badgeColor}`}>
                          {priority.level} Priority
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${priority.amountColor}`}>${customer.totalOwed.toLocaleString()}</span>
                    </div>
                    {/* Other Debt Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-1">
                       <InfoItem icon={Calendar} label="Debt Age" value={`${customer.debtAge} days`} />
                       <InfoItem icon={DollarSign} label="Type" value={customer.typeOfDebt} />
                       <div> {/* Custom layout for Status Badge */} 
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                            {customer.debtStatus}
                          </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Location Card */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center text-xl ${sourceSerif4.className} font-semibold`}>
                  <MapPin className="mr-2 h-5 w-5" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <InfoItem icon={MapPin} label="City" value={customer.city} />
                <InfoItem icon={MapPin} label="State" value={customer.state} />
                <InfoItem icon={MapPin} label="ZIP Code" value={customer.zipcode} />
              </CardContent>
            </Card>

            {/* Conversation History Card */}
            {conversationHistory.length > 0 && (
              <Card className="border border-neutral-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center justify-between text-xl ${sourceSerif4.className} font-semibold`}>
                    <div className="flex items-center">
                        <Phone className="mr-2 h-5 w-5" />
                        Conversation History
                    </div>
                    <span className="text-sm font-normal px-2 py-1 rounded bg-muted text-muted-foreground">
                        {conversationHistory.length} entries
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-2">
                  {conversationHistory.map((conversation, index) => (
                    <div key={index} className="space-y-1 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {conversation.date.toLocaleDateString()} at {conversation.date.toLocaleTimeString()}
                        </p>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          conversation.outcome === 'successful'
                            ? 'bg-green-100 text-green-700'
                            : conversation.outcome === 'unsuccessful'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {conversation.outcome.charAt(0).toUpperCase() + conversation.outcome.slice(1)}
                        </span>
                      </div>
                      <p className={`text-sm text-muted-foreground ${sourceSerif4.className}`}>{conversation.summary}</p>
                      {conversation.outcome == 'successful' && (
                        <p className="text-sm text-muted-foreground font-bold">
                          Payment Portal Link: <a href={`https://debtpayway.lovable.app`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://debtpayway.lovable.app</a>
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}