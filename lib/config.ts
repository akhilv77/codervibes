import { Trophy, Wallet, type LucideIcon, DollarSign, BadgeDollarSignIcon, Globe, Calculator, LineChart, Code, FileJson, Key, Link, QrCode, Palette, Binary, FileCode, Table, FileText, Type, Eye } from "lucide-react";

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
  },
  {
    id: 'html-encoder',
    name: 'HTML Entity Encoder & Decoder',
    description: 'Encode and decode HTML entities with ease',
    href: '/html-encoder',
    icon: Code,
    features: [
      'HTML entity encoding',
      'HTML entity decoding',
      'Copy to clipboard',
      'History tracking'
    ]
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator & Reader',
    description: 'Generate QR codes and scan them from images or camera',
    href: '/qr-code',
    icon: QrCode,
    features: [
      'QR code generation',
      'Image upload scanning',
      'Camera scanning',
      'History tracking'
    ]
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert colors between HEX, RGB, and HSL formats',
    href: '/color-converter',
    icon: Palette,
    features: [
      'HEX to RGB/HSL conversion',
      'RGB to HEX/HSL conversion',
      'HSL to HEX/RGB conversion',
      'Color preview',
      'History tracking'
    ]
  },
  {
    id: 'text-converter',
    name: 'Text Converter',
    description: 'Convert text to Binary, Hexadecimal, and ASCII formats',
    href: '/text-converter',
    icon: Binary,
    features: [
      'Text to Binary conversion',
      'Text to Hexadecimal conversion',
      'Text to ASCII conversion',
      'Copy to clipboard',
      'History tracking'
    ]
  },
  {
    id: 'yaml-converter',
    name: 'YAML ⇄ JSON Converter',
    description: 'Convert between YAML and JSON formats with ease',
    href: '/yaml-converter',
    icon: FileCode,
    features: [
      'YAML to JSON conversion',
      'JSON to YAML conversion',
      'Copy to clipboard',
      'History tracking'
    ]
  },
  {
    id: 'csv-converter',
    name: 'CSV ⇄ JSON Converter',
    description: 'Convert between CSV and JSON formats with ease',
    href: '/csv-converter',
    icon: Table,
    features: [
      'CSV to JSON conversion',
      'JSON to CSV conversion',
      'Copy to clipboard',
      'History tracking'
    ]
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter & Viewer',
    description: 'Format, validate, and minify XML with ease',
    href: '/xml-formatter',
    icon: FileCode,
    features: [
      'XML formatting',
      'XML validation',
      'XML minification',
      'Copy to clipboard',
      'History tracking',
    ],
  },
  {
    id: 'markdown-previewer',
    name: 'Markdown Previewer',
    description: 'Preview and test your markdown in real-time with syntax highlighting',
    href: '/markdown-previewer',
    icon: FileText,
    features: [
      'Live markdown preview',
      'Syntax highlighting',
      'GitHub Flavored Markdown support',
      'Copy to clipboard',
      'Preview history',
    ],
  },
]; 