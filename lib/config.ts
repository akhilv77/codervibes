import { Trophy, Wallet, type LucideIcon } from "lucide-react";

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
    description: "Track scores and manage games for your players",
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
    description: "Split expenses and track balances with friends and family",
    href: "/money-tracker",
    icon: Wallet,
    features: [
      "Group expense tracking",
      "Member management",
      "Balance calculation",
    ]
  }
]; 