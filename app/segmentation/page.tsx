'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useCustomers, type Customer } from '@/context/CustomersContext';

// Mock data
const mockCsvData = `name,amount,lastContact,paymentHistory,age,debtAge,debtType,state,city,language
John Smith,15000,2024-01-15,Made partial payment of $500 in December,35,90,Credit Card,CA,Los Angeles,English
Maria Garcia,7500,2024-02-01,No payments in last 3 months,42,120,Personal Loan,TX,Houston,Spanish
David Johnson,3000,2024-01-20,Regular payments until November,28,60,Medical,NY,Brooklyn,English
Sarah Williams,25000,2023-12-15,Multiple missed payments,45,180,Business Loan,FL,Miami,English
Michael Chen,12000,2024-02-10,Promised payment by month end,33,45,Student Loan,WA,Seattle,Mandarin
Emily Brown,5500,2024-01-05,Payment plan defaulted,29,150,Credit Card,IL,Chicago,English
James Wilson,18000,2023-11-20,No contact established,51,210,Mortgage,AZ,Phoenix,English
Ana Rodriguez,9000,2024-02-05,Disputed charges,37,75,Personal Loan,CA,San Diego,Spanish
Robert Taylor,4500,2024-01-25,Made arrangement last week,44,30,Medical,TX,Austin,English
Lisa Anderson,30000,2023-12-01,Filed for bankruptcy,39,240,Business Loan,GA,Atlanta,English`;

export default function SegmentationPage() {
  const { customers, setCustomers } = useCustomers();

  const parseDebtorData = (csvText: string) => {
    try {
      const rows = csvText.split('\n');
      const headers = rows[0].split(',');
      
      const parsedDebtors: Customer[] = rows.slice(1).map((row, index) => {
        const values = row.split(',');
        return {
          id: index.toString(),
          name: values[headers.indexOf('name')] || '',
          amount: parseFloat(values[headers.indexOf('amount')]) || 0,
          lastContact: values[headers.indexOf('lastContact')] || '',
          paymentHistory: values[headers.indexOf('paymentHistory')] || '',
          age: parseInt(values[headers.indexOf('age')]) || 0,
          debtAge: parseInt(values[headers.indexOf('debtAge')]) || 0,
          debtType: values[headers.indexOf('debtType')] || '',
          state: values[headers.indexOf('state')] || '',
          city: values[headers.indexOf('city')] || '',
          language: values[headers.indexOf('language')] || '',
        };
      });

      setCustomers(parsedDebtors);
      toast.success('Data loaded successfully');
    } catch (error) {
      toast.error('Failed to parse data');
      console.error('Error parsing data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      parseDebtorData(text);
    } catch (error) {
      toast.error('Failed to read CSV file');
      console.error('Error reading CSV:', error);
    }
  };

  const loadMockData = () => {
    parseDebtorData(mockCsvData);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debtor Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload or load sample debtor data to view and manage debtors.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={loadMockData}>
            Load Sample Data
          </Button>
          <Button asChild variant="outline">
            <label>
              Upload CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <ScrollArea className="h-[600px]">
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
                <TableHead>Last Contact</TableHead>
                <TableHead>Payment History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((debtor: Customer) => (
                <TableRow key={debtor.id}>
                  <TableCell className="font-medium">{debtor.name}</TableCell>
                  <TableCell>${debtor.amount.toLocaleString()}</TableCell>
                  <TableCell>{debtor.debtType}</TableCell>
                  <TableCell>{debtor.age}</TableCell>
                  <TableCell>{debtor.debtAge} days</TableCell>
                  <TableCell>{debtor.city}, {debtor.state}</TableCell>
                  <TableCell>{debtor.language}</TableCell>
                  <TableCell>{debtor.lastContact}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={debtor.paymentHistory}>
                    {debtor.paymentHistory}
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No debtors available. Upload a CSV file or load sample data to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
} 