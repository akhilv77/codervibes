export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

export type GroupType = 'Trip' | 'Family' | 'Business' | 'Others' | string;

export type SplitMode = 'equal' | 'percentage' | 'manual';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  currency: Currency;
  members: string[]; // Array of member IDs
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string[]; // Array of member IDs
  splitBetween: string[]; // Array of member IDs
  splitMode: SplitMode;
  splitDetails: {
    [memberId: string]: number; // Amount each member owes
  };
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface GroupBalance {
  groupId: string;
  memberBalances: {
    [memberId: string]: {
      owes: number;
      owed: number;
      net: number;
    };
  };
}

export interface AppState {
  members: Member[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  version: string;
} 