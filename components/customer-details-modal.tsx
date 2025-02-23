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

export function CustomerDetailsModal({
  customer,
  open,
  onOpenChange,
  conversationHistory = []
}: CustomerDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Detailed information about {customer.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="grid gap-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{customer.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SSN</p>
                    <p>{customer.ssn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p>{customer.language}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Owed</p>
                    <p className="text-lg font-medium">${customer.totalOwed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type of Debt</p>
                    <p>{customer.typeOfDebt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="capitalize">{customer.debtStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Debt Age</p>
                    <p>{customer.debtAge} days</p>
                  </div>
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