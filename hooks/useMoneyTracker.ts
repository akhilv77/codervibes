import { useState, useEffect, useCallback } from 'react';
import type { AppState, Member, Group, Expense, Settlement } from '@/types/money-tracker';
import { db } from '@/lib/db/indexed-db';
import { v4 as uuidv4 } from 'uuid';

export function useMoneyTracker() {
  const [state, setState] = useState<AppState>({
    members: [],
    groups: [],
    expenses: [],
    settlements: [],
    version: '1.0.0'
  });

  // Load initial state from IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        await db.init();
        const [members, groups, expenses, settlements] = await Promise.all([
          db.getAll<Member>('members'),
          db.getAll<Group>('groups'),
          db.getAll<Expense>('expenses'),
          db.getAll<Settlement>('settlements')
        ]);

        setState({
          members: members || [],
          groups: groups || [],
          expenses: expenses || [],
          settlements: settlements || [],
          version: '1.0.0'
        });
      } catch (err) {
        console.error('Error loading state from IndexedDB:', err);
      }
    };

    loadState();
  }, []);

  // Member operations
  const addMember = useCallback(async (member: Omit<Member, 'id'>) => {
    const id = uuidv4();
    const newMember = { ...member, id };
    try {
      await db.set('members', id, newMember);
      setState(prev => ({
        ...prev,
        members: [...prev.members, newMember]
      }));
      return id;
    } catch (err) {
      console.error('Error adding member:', err);
      return null;
    }
  }, []);

  const updateMember = useCallback(async (id: string, updates: Partial<Member>) => {
    try {
      const member = await db.get<Member>('members', id);
      if (member) {
        const updatedMember = { ...member, ...updates };
        await db.set('members', id, updatedMember);
        setState(prev => ({
          ...prev,
          members: prev.members.map(m => m.id === id ? updatedMember : m)
        }));
      }
    } catch (err) {
      console.error('Error updating member:', err);
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      await db.delete('members', id);
      setState(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  }, []);

  // Group operations
  const addGroup = useCallback(async (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const newGroup: Group = {
      ...group,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await db.set('groups', id, newGroup);
      setState(prev => ({
        ...prev,
        groups: [...prev.groups, newGroup]
      }));
      return id;
    } catch (err) {
      console.error('Error adding group:', err);
      return null;
    }
  }, []);

  const updateGroup = useCallback(async (id: string, updates: Partial<Group>) => {
    try {
      const group = await db.get<Group>('groups', id);
      if (group) {
        const updatedGroup = {
          ...group,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await db.set('groups', id, updatedGroup);
        setState(prev => ({
          ...prev,
          groups: prev.groups.map(g => g.id === id ? updatedGroup : g)
        }));
      }
    } catch (err) {
      console.error('Error updating group:', err);
    }
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    try {
      await db.delete('groups', id);
      setState(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g.id !== id),
        expenses: prev.expenses.filter(e => e.groupId !== id),
        settlements: prev.settlements.filter(s => s.groupId !== id)
      }));
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  }, []);

  // Expense operations
  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const newExpense: Expense = {
      ...expense,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await db.set('expenses', id, newExpense);
      setState(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense]
      }));
      return id;
    } catch (err) {
      console.error('Error adding expense:', err);
      return null;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    try {
      const expense = await db.get<Expense>('expenses', id);
      if (expense) {
        const updatedExpense = {
          ...expense,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await db.set('expenses', id, updatedExpense);
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.map(e => e.id === id ? updatedExpense : e)
        }));
      }
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await db.delete('expenses', id);
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  }, []);

  // Settlement operations
  const addSettlement = useCallback(async (settlement: Omit<Settlement, 'id' | 'createdAt'>) => {
    const id = uuidv4();
    const newSettlement: Settlement = {
      ...settlement,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await db.set('settlements', id, newSettlement);
      setState(prev => ({
        ...prev,
        settlements: [...prev.settlements, newSettlement]
      }));
      return id;
    } catch (err) {
      console.error('Error adding settlement:', err);
      return null;
    }
  }, []);

  const deleteSettlement = useCallback(async (id: string) => {
    try {
      await db.delete('settlements', id);
      setState(prev => ({
        ...prev,
        settlements: prev.settlements.filter(s => s.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting settlement:', err);
    }
  }, []);

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