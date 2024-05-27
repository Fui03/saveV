import React, { createContext, useState, useContext } from 'react';

type Transaction = {
  id: string;
  name: string;
  amount: number;
};

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const addTransaction = (transaction: Transaction) => {
        setTransactions([...transactions, transaction]);
    };

    return (
        <TransactionContext.Provider value={{ transactions, addTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
