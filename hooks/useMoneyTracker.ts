import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '@/lib/storage';
import type { AppState, Member, Group, Expense, Settlement } from '@/types/money-tracker';

export function useMoneyTracker() {
  const [state, setState] = useState<AppState>(() => StorageManager.getInstance().getState());

  // Update local state when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setState(StorageManager.getInstance().getState());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const storage = StorageManager.getInstance();

  // Member operations
  const addMember = useCallback((member: Omit<Member, 'id'>) => {
    const id = storage.addMember(member);
    setState(storage.getState());
    return id;
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    const newState = {
      ...state,
      members: state.members.map(member =>
        member.id === id ? { ...member, ...updates } : member
      ),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  const deleteMember = useCallback((id: string) => {
    const newState = {
      ...state,
      members: state.members.filter(member => member.id !== id),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  // Group operations
  const addGroup = useCallback((group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = storage.addGroup(group);
    setState(storage.getState());
    return id;
  }, []);

  const updateGroup = useCallback((id: string, updates: Partial<Group>) => {
    const newState = {
      ...state,
      groups: state.groups.map(group =>
        group.id === id ? { ...group, ...updates, updatedAt: new Date().toISOString() } : group
      ),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  const deleteGroup = useCallback((id: string) => {
    const newState = {
      ...state,
      groups: state.groups.filter(group => group.id !== id),
      expenses: state.expenses.filter(expense => expense.groupId !== id),
      settlements: state.settlements.filter(settlement => settlement.groupId !== id),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  // Expense operations
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = storage.addExpense(expense);
    setState(storage.getState());
    return id;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    const newState = {
      ...state,
      expenses: state.expenses.map(expense =>
        expense.id === id ? { ...expense, ...updates, updatedAt: new Date().toISOString() } : expense
      ),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  const deleteExpense = useCallback((id: string) => {
    const newState = {
      ...state,
      expenses: state.expenses.filter(expense => expense.id !== id),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  // Settlement operations
  const addSettlement = useCallback((settlement: Omit<Settlement, 'id' | 'createdAt'>) => {
    const id = storage.addSettlement(settlement);
    setState(storage.getState());
    return id;
  }, []);

  const deleteSettlement = useCallback((id: string) => {
    const newState = {
      ...state,
      settlements: state.settlements.filter(settlement => settlement.id !== id),
    };
    storage.updateState(newState);
    setState(newState);
  }, [state]);

  // Utility functions
  const getGroupBalance = useCallback((groupId: string) => {
    const groupExpenses = state.expenses.filter(expense => expense.groupId === groupId);
    const groupSettlements = state.settlements.filter(settlement => settlement.groupId === groupId);
    const group = state.groups.find(g => g.id === groupId);
    
    if (!group) return null;

    const memberBalances: { [key: string]: { owes: number; owed: number; net: number } } = {};

    // Initialize balances
    group.members.forEach(memberId => {
      memberBalances[memberId] = { owes: 0, owed: 0, net: 0 };
    });

    // Calculate expenses
    groupExpenses.forEach(expense => {
      // For each expense:
      // 1. The people who paid get credited with the full amount they paid
      expense.paidBy.forEach(memberId => {
        const amountPaid = expense.amount / expense.paidBy.length;
        memberBalances[memberId].owed += amountPaid;
      });

      // 2. The people who owe get debited with their share
      Object.entries(expense.splitDetails).forEach(([memberId, amount]) => {
        memberBalances[memberId].owes += amount;
      });
    });

    // Calculate settlements
    groupSettlements.forEach(settlement => {
      // When someone settles:
      // 1. The person who paid (fromMemberId) has their "owes" reduced
      memberBalances[settlement.fromMemberId].owes -= settlement.amount;
      // 2. The person who received (toMemberId) has their "owed" reduced
      memberBalances[settlement.toMemberId].owed -= settlement.amount;
    });

    // Calculate net amounts
    Object.keys(memberBalances).forEach(memberId => {
      memberBalances[memberId].net = memberBalances[memberId].owed - memberBalances[memberId].owes;
    });

    return memberBalances;
  }, [state]);

  return {
    state,
    addMember,
    updateMember,
    deleteMember,
    addGroup,
    updateGroup,
    deleteGroup,
    addExpense,
    updateExpense,
    deleteExpense,
    addSettlement,
    deleteSettlement,
    getGroupBalance,
  };
} 