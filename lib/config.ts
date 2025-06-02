import { Trophy, Wallet, type LucideIcon, DollarSign, BadgeDollarSignIcon, Globe, Calculator, LineChart, Code, FileJson, Key, Link } from "lucide-react";

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
    icon: BadgeDollarSignIcon,
    features: [
      "Real-time currency conversion",
      "Daily rate updates",
      "Support for 170+ currencies"
    ]
  },
  {
    id: "ip-tracker",
    name: "IP Tracker",
    description: "Track and analyze IP addresses with details",
    href: "/ip-tracker",
    icon: Globe,
    features: [
      "IP geolocation",
      "Network information",
      "Interactive map view",
      "Browser & device details"
    ]
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions in real-time",
    href: "/regex-tester",
    icon: Code,
    features: [
      "Real-time pattern testing",
      "Multiple regex flags",
      "Capture group support",
      "Copy matches to clipboard"
    ]
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Beautify, minify, and validate JSON with ease",
    href: "/json-formatter",
    icon: FileJson,
    features: [
      "JSON beautification",
      "Minification",
      "Validation",
      "History tracking"
    ]
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens',
    href: '/jwt-decoder',
    icon: Key,
    features: [
      'Pretty JSON View',
      'Signature Verification',
      'Token Expiry Check',
      'Algorithm Warnings'
    ]
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder & Decoder',
    description: 'Encode and decode URLs with ease',
    href: '/url-encoder',
    icon: Link,
    features: [
      'URL encoding',
      'URL decoding',
      'Copy to clipboard',
      'History tracking'
    ]
  }
]; 