'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/context/CustomersContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerDetailsModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock conversation history - in real app, this would come from a database
const mockConversationHistory = [
  {
    id: 1,
    date: '2024-02-20',
    status: 'Completed',
    summary: 'Customer agreed to pay $500 monthly. First payment scheduled for March 1st.',
    notes: 'Showed willingness to cooperate. Mentioned recent job change.',
  },
  {
    id: 2,
    date: '2024-01-15',
    status: 'Unsuccessful',
    summary: 'No answer after 3 attempts.',
    notes: 'Left voicemail with callback number.',
  },
];

export function CustomerDetailsModal({ customer, open, onOpenChange }: CustomerDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Detailed information about {customer.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="p-6 pt-0">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Name</p>
                    <p>{customer.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Age</p>
                    <p>{customer.age}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Location</p>
                    <p>{customer.city}, {customer.state} {customer.zipcode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Language</p>
                    <p>{customer.language}</p>
                  </div>
                </div>
              </div>

              {/* Debt Information */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Debt Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Total Owed</p>
                    <p className="font-medium">${customer.totalOwed.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Type</p>
                    <p>{customer.typeOfDebt}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Status</p>
                    <p className="capitalize">{customer.debtStatus}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Debt Age</p>
                    <p>{customer.debtAge} days</p>
                  </div>
                </div>
              </div>

              {/* Conversation History */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Conversation History</h3>
                <div className="space-y-4">
                  {mockConversationHistory.map((conv) => (
                    <div key={conv.id} className="border rounded-md p-3 text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-muted-foreground">{conv.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          conv.status === 'Completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{conv.summary}</p>
                      <p className="text-muted-foreground text-xs">{conv.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 