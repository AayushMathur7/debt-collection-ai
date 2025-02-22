'use client';

import React, { createContext, useState, useContext } from 'react';

export interface Customer {
  name: string;
  age: number;
  ssn: string;
  totalOwed: number;
  debtStatus: string;
  state: string;
  city: string;
  zipcode: string;
  typeOfDebt: string;
  debtAge: number;
  language: string;
}

type CustomersContextType = {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
};

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  return (
    <CustomersContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomers must be used within a CustomersProvider');
  return ctx;
} 