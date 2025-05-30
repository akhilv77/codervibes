import { AppState } from '@/types/money-tracker';

const STORAGE_KEY = 'money-tracker-state';
const CURRENT_VERSION = '1.0.0';

const defaultState: AppState = {
  members: [],
  groups: [],
  expenses: [],
  settlements: [],
  version: CURRENT_VERSION,
};

export class StorageManager {
  private static instance: StorageManager;
  private state: AppState;

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private loadState(): AppState {
    if (typeof window === 'undefined') return defaultState;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultState;

      const parsed = JSON.parse(stored) as AppState;
      
      // Version check and migration logic can be added here
      if (parsed.version !== CURRENT_VERSION) {
        console.warn(`State version mismatch. Expected ${CURRENT_VERSION}, got ${parsed.version}`);
        // Add migration logic here when needed
      }

      return parsed;
    } catch (error) {
      console.error('Error loading state:', error);
      return defaultState;
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  public getState(): AppState {
    return this.state;
  }

  public updateState(partialState: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...partialState,
      version: CURRENT_VERSION,
    };
    this.saveState();
  }

  public resetState(): void {
    this.state = defaultState;
    this.saveState();
  }

  // Helper methods for common operations
  public addMember(member: Omit<AppState['members'][0], 'id'>): string {
    const id = crypto.randomUUID();
    const newMember = { ...member, id };
    this.state.members.push(newMember);
    this.saveState();
    return id;
  }

  public addGroup(group: Omit<AppState['groups'][0], 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newGroup = {
      ...group,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.state.groups.push(newGroup);
    this.saveState();
    return id;
  }

  public addExpense(expense: Omit<AppState['expenses'][0], 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newExpense = {
      ...expense,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.state.expenses.push(newExpense);
    this.saveState();
    return id;
  }

  public addSettlement(settlement: Omit<AppState['settlements'][0], 'id' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newSettlement = {
      ...settlement,
      id,
      createdAt: now,
    };
    this.state.settlements.push(newSettlement);
    this.saveState();
    return id;
  }
} 