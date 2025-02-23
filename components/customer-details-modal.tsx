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
import { BadgeCheck, Calendar, DollarSign } from 'lucide-react';

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
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p>{value}</p>
    </div>
  </div>
);

export function CustomerDetailsModal({
  customer,
  open,
  onOpenChange,
  conversationHistory = []
}: CustomerDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Customer Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="grid gap-6 p-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border-4 border-background">
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-3xl font-bold text-primary-foreground">{customer.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={BadgeCheck} label="SSN" value={customer.ssn} />
                  <InfoItem icon={Calendar} label="Language" value={customer.language} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
                  Debt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Owed</span>
                  <span className="text-2xl font-bold">${customer.totalOwed.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Calendar} label="Debt Age" value={`${customer.debtAge} days`} />
                  <InfoItem icon={BadgeCheck} label="Status" value={customer.debtStatus} />
                  <InfoItem icon={DollarSign} label="Type" value={customer.typeOfDebt} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p>{customer.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">State</p>
                    <p>{customer.state}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ZIP Code</p>
                    <p>{customer.zipcode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {conversationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {conversationHistory.map((conversation, index) => (
                    <div key={index} className="space-y-2">
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
                      <p className="text-sm text-muted-foreground">{conversation.summary}</p>
                      {index < conversationHistory.length - 1 && <Separator className="my-2" />}
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