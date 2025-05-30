import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';
import type { Group, Member, Expense, Settlement, Currency, GroupType, SplitMode } from '@/types/money-tracker';

interface MoneyTrackerState {
  groups: Group[];
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  isLoading: boolean;
  error: string | null;
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => Promise<void>;
  updateSettlement: (id: string, settlement: Partial<Settlement>) => Promise<void>;
  deleteSettlement: (id: string) => Promise<void>;
  getGroupBalance: (groupId: string) => { [key: string]: { owes: number; owed: number; net: number } } | null;
}

const initialState = {
  groups: [] as Group[],
  members: [] as Member[],
  expenses: [] as Expense[],
  settlements: [] as Settlement[],
  isLoading: true,
  error: null as string | null,
};

const useMoneyTracker = create<MoneyTrackerState>((set, get) => ({
  ...initialState,

  addGroup: async (group) => {
    try {
      const newGroup: Group = {
        ...group,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const state = get();
      const currentGroups = Array.isArray(state.groups) ? state.groups : [];
      const updatedGroups = [...currentGroups, newGroup];
      
      await db.set('moneyTracker', 'groups', updatedGroups);
      set({ groups: updatedGroups });
    } catch (error) {
      console.error('Error adding group:', error);
      set({ error: 'Failed to add group' });
    }
  },

  updateGroup: async (id, group) => {
    try {
      const state = get();
      const currentGroups = Array.isArray(state.groups) ? state.groups : [];
      const updatedGroups = currentGroups.map((g) =>
        g.id === id
          ? { ...g, ...group, updatedAt: new Date().toISOString() }
          : g
      );
      
      await db.set('moneyTracker', 'groups', updatedGroups);
      set({ groups: updatedGroups });
    } catch (error) {
      console.error('Error updating group:', error);
      set({ error: 'Failed to update group' });
    }
  },

  deleteGroup: async (id) => {
    try {
      const state = get();
      const currentGroups = Array.isArray(state.groups) ? state.groups : [];
      const updatedGroups = currentGroups.filter((g) => g.id !== id);
      
      await db.set('moneyTracker', 'groups', updatedGroups);
      set({ groups: updatedGroups });
    } catch (error) {
      console.error('Error deleting group:', error);
      set({ error: 'Failed to delete group' });
    }
  },

  addMember: async (member) => {
    try {
      const newMember: Member = {
        ...member,
        id: crypto.randomUUID(),
      };

      const state = get();
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      const updatedMembers = [...currentMembers, newMember];
      
      await db.set('moneyTracker', 'members', updatedMembers);
      set({ members: updatedMembers });
    } catch (error) {
      console.error('Error adding member:', error);
      set({ error: 'Failed to add member' });
    }
  },

  updateMember: async (id, member) => {
    try {
      const state = get();
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      const updatedMembers = currentMembers.map((m) =>
        m.id === id
          ? { ...m, ...member }
          : m
      );
      
      await db.set('moneyTracker', 'members', updatedMembers);
      set({ members: updatedMembers });
    } catch (error) {
      console.error('Error updating member:', error);
      set({ error: 'Failed to update member' });
    }
  },

  deleteMember: async (id) => {
    try {
      const state = get();
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      const updatedMembers = currentMembers.filter((m) => m.id !== id);
      
      await db.set('moneyTracker', 'members', updatedMembers);
      set({ members: updatedMembers });
    } catch (error) {
      console.error('Error deleting member:', error);
      set({ error: 'Failed to delete member' });
    }
  },

  addExpense: async (expense) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const state = get();
      const currentExpenses = Array.isArray(state.expenses) ? state.expenses : [];
      const updatedExpenses = [...currentExpenses, newExpense];
      
      await db.set('moneyTracker', 'expenses', updatedExpenses);
      set({ expenses: updatedExpenses });
    } catch (error) {
      console.error('Error adding expense:', error);
      set({ error: 'Failed to add expense' });
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const state = get();
      const currentExpenses = Array.isArray(state.expenses) ? state.expenses : [];
      const updatedExpenses = currentExpenses.map((e) =>
        e.id === id
          ? { ...e, ...expense, updatedAt: new Date().toISOString() }
          : e
      );
      
      await db.set('moneyTracker', 'expenses', updatedExpenses);
      set({ expenses: updatedExpenses });
    } catch (error) {
      console.error('Error updating expense:', error);
      set({ error: 'Failed to update expense' });
    }
  },

  deleteExpense: async (id) => {
    try {
      const state = get();
      const currentExpenses = Array.isArray(state.expenses) ? state.expenses : [];
      const updatedExpenses = currentExpenses.filter((e) => e.id !== id);
      
      await db.set('moneyTracker', 'expenses', updatedExpenses);
      set({ expenses: updatedExpenses });
    } catch (error) {
      console.error('Error deleting expense:', error);
      set({ error: 'Failed to delete expense' });
    }
  },

  addSettlement: async (settlement) => {
    try {
      const newSettlement: Settlement = {
        ...settlement,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      const state = get();
      const currentSettlements = Array.isArray(state.settlements) ? state.settlements : [];
      const updatedSettlements = [...currentSettlements, newSettlement];
      
      await db.set('moneyTracker', 'settlements', updatedSettlements);
      set({ settlements: updatedSettlements });
    } catch (error) {
      console.error('Error adding settlement:', error);
      set({ error: 'Failed to add settlement' });
    }
  },

  updateSettlement: async (id, settlement) => {
    try {
      const state = get();
      const currentSettlements = Array.isArray(state.settlements) ? state.settlements : [];
      const updatedSettlements = currentSettlements.map((s) =>
        s.id === id
          ? { ...s, ...settlement }
          : s
      );
      
      await db.set('moneyTracker', 'settlements', updatedSettlements);
      set({ settlements: updatedSettlements });
    } catch (error) {
      console.error('Error updating settlement:', error);
      set({ error: 'Failed to update settlement' });
    }
  },

  deleteSettlement: async (id) => {
    try {
      const state = get();
      const currentSettlements = Array.isArray(state.settlements) ? state.settlements : [];
      const updatedSettlements = currentSettlements.filter((s) => s.id !== id);
      
      await db.set('moneyTracker', 'settlements', updatedSettlements);
      set({ settlements: updatedSettlements });
    } catch (error) {
      console.error('Error deleting settlement:', error);
      set({ error: 'Failed to delete settlement' });
    }
  },

  getGroupBalance: (groupId: string) => {
    const state = get();
    const currentExpenses = Array.isArray(state.expenses) ? state.expenses : [];
    const currentSettlements = Array.isArray(state.settlements) ? state.settlements : [];
    const currentGroups = Array.isArray(state.groups) ? state.groups : [];
    
    const groupExpenses = currentExpenses.filter(expense => expense.groupId === groupId);
    const groupSettlements = currentSettlements.filter(settlement => settlement.groupId === groupId);
    const group = currentGroups.find(g => g.id === groupId);
    
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
  },
}));

// Load initial state from IndexedDB
if (typeof window !== 'undefined') {
  const loadState = async () => {
    try {
      const [groups, members, expenses, settlements] = await Promise.all([
        db.get<Group[]>('moneyTracker', 'groups') || [],
        db.get<Member[]>('moneyTracker', 'members') || [],
        db.get<Expense[]>('moneyTracker', 'expenses') || [],
        db.get<Settlement[]>('moneyTracker', 'settlements') || [],
      ]);

      useMoneyTracker.setState({
        groups: Array.isArray(groups) ? groups : [],
        members: Array.isArray(members) ? members : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        settlements: Array.isArray(settlements) ? settlements : [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading state from IndexedDB:', error);
      useMoneyTracker.setState({
        ...initialState,
        isLoading: false,
        error: 'Failed to load data from storage',
      });
    }
  };

  loadState();
}

export { useMoneyTracker }; 