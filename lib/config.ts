import { Trophy, Wallet, type LucideIcon, DollarSign } from "lucide-react";

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  features: string[];
}

export const apps: AppConfig[] = [
  {
    id: "scorecard",
    name: "Scorecard",
    description: "Track scores and manage games for your players ",
    href: "/scorecard",
    icon: Trophy,
    features: [
      "Player management",
      "Game history",
      "Score tracking"
    ]
  },
  {
    id: "money-tracker",
    name: "Money Tracker",
    description: "Split expenses and track balances with Others",
    href: "/money-tracker",
    icon: Wallet,
    features: [
      "Group expense tracking",
      "Member management",
      "Balance calculation",
    ]
  },
  {
    id: "currency-tracker",
    name: "Currency Tracker",
    description: "Track and convert currencies with daily updates",
    href: "/currency-tracker",
    icon: DollarSign,
    features: [
      "Real-time currency conversion",
      "Daily rate updates",
      "Support for 170+ currencies"
    ]
  },
]; 