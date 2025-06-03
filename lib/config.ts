import { Trophy, Wallet, type LucideIcon, DollarSign, BadgeDollarSignIcon, Globe, Calculator, LineChart, Code, FileJson, Key, Link, QrCode, Palette, Binary, FileCode, Table, FileText, Type, Eye, GitCompare, Lock, Hash, Scissors, Clock } from "lucide-react";

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  features: string[];
  tags: string[];
}

export const apps: AppConfig[] = [
  {
    id: "string-escaper",
    name: "String Escaper",
    description: "Escape strings for JavaScript, JSON, HTML, and SQL",
    href: "/string-escaper",
    icon: Code,
    features: [
      "Multiple formats",
      "Real-time escaping",
      "History tracking"
    ],
    tags: ["string", "escape", "development", "security", "format", "utility"]
  },
  {
    id: "html-preview",
    name: "HTML Preview",
    description: "Real-time HTML code preview and testing environment",
    href: "/html-preview",
    icon: Eye,
    features: [
      "Live HTML preview",
      "Copy to clipboard",
      "Preview history"
    ],
    tags: ["html", "web", "development", "preview", "testing", "frontend"]
  },
  {
    id: "scorecard",
    name: "Score Tracker",
    description: "Professional score tracking and game management system",
    href: "/scorecard",
    icon: Trophy,
    features: [
      "Player management",
      "Game history",
      "Score analytics"
    ],
    tags: ["sports", "gaming", "tracking", "analytics", "management", "scores"]
  },
  {
    id: "money-tracker",
    name: "Expense Manager",
    description: "Advanced expense tracking and balance management system",
    href: "/money-tracker",
    icon: Wallet,
    features: [
      "Group expense tracking",
      "Balance calculation",
      "Expense analytics"
    ],
    tags: ["finance", "expenses", "money", "tracking", "budget", "management"]
  },
  {
    id: "currency-tracker",
    name: "Currency Converter",
    description: "Real-time currency conversion and tracking platform",
    href: "/currency-tracker",
    icon: BadgeDollarSignIcon,
    features: [
      "Real-time conversion",
      "170+ currencies",
      "Historical rates"
    ],
    tags: ["currency", "finance", "conversion", "exchange", "rates", "money"]
  },
  {
    id: "ip-tracker",
    name: "IP Analyzer",
    description: "Comprehensive IP address analysis and tracking tool",
    href: "/ip-tracker",
    icon: Globe,
    features: [
      "IP geolocation",
      "Network analysis",
      "Interactive mapping"
    ],
    tags: ["network", "ip", "geolocation", "security", "analysis", "tracking"]
  },
  {
    id: "regex-tester",
    name: "Regex Validator",
    description: "Professional regular expression testing and debugging tool",
    href: "/regex-tester",
    icon: Code,
    features: [
      "Pattern testing",
      "Flag management",
      "Match extraction"
    ],
    tags: ["regex", "development", "testing", "pattern", "validation", "debug"]
  },
  {
    id: "json-formatter",
    name: "JSON Editor",
    description: "Advanced JSON formatting and validation platform",
    href: "/json-formatter",
    icon: FileJson,
    features: [
      "Format & minify",
      "Validation",
      "History tracking"
    ],
    tags: ["json", "development", "formatting", "validation", "data", "editor"]
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Inspector',
    description: 'Professional JWT token analysis and verification tool',
    href: '/jwt-decoder',
    icon: Key,
    features: [
      'Token decoding',
      'Signature verification',
      'Expiry analysis'
    ],
    tags: ["jwt", "security", "authentication", "token", "verification", "debug"]
  },
  {
    id: 'url-encoder',
    name: 'URL Processor',
    description: 'Advanced URL encoding and decoding utility',
    href: '/url-encoder',
    icon: Link,
    features: [
      'URL encoding',
      'URL decoding',
      'History tracking'
    ],
    tags: ["url", "encoding", "web", "development", "utility", "conversion"]
  },
  {
    id: 'html-encoder',
    name: 'HTML Processor',
    description: 'Professional HTML entity encoding and decoding tool',
    href: '/html-encoder',
    icon: Code,
    features: [
      'Entity encoding',
      'Entity decoding',
      'History tracking'
    ],
    tags: ["html", "encoding", "web", "development", "entities", "conversion"]
  },
  {
    id: 'qr-code',
    name: 'QR Code Studio',
    description: 'Comprehensive QR code generation and scanning platform',
    href: '/qr-code',
    icon: QrCode,
    features: [
      'Code generation',
      'Image scanning',
      'Camera scanning'
    ],
    tags: ["qr", "barcode", "scanning", "generation", "mobile", "utility"]
  },
  {
    id: 'color-converter',
    name: 'Color Studio',
    description: 'Professional color format conversion and management tool',
    href: '/color-converter',
    icon: Palette,
    features: [
      'Format conversion',
      'Color preview',
      'History tracking'
    ],
    tags: ["color", "design", "conversion", "hex", "rgb", "hsl"]
  },
  {
    id: 'text-converter',
    name: 'Text Transformer',
    description: 'Advanced text format conversion and encoding tool',
    href: '/text-converter',
    icon: Binary,
    features: [
      'Format conversion',
      'Encoding options',
      'History tracking'
    ],
    tags: ["text", "conversion", "encoding", "binary", "hex", "ascii"]
  },
  {
    id: 'yaml-converter',
    name: 'YAML Converter',
    description: 'Professional YAML and JSON format conversion tool',
    href: '/yaml-converter',
    icon: FileCode,
    features: [
      'Format conversion',
      'Validation',
      'History tracking'
    ],
    tags: ["yaml", "json", "conversion", "development", "data", "format"]
  },
  {
    id: 'csv-converter',
    name: 'CSV Converter',
    description: 'Advanced CSV and JSON format conversion platform',
    href: '/csv-converter',
    icon: Table,
    features: [
      'Format conversion',
      'Data validation',
      'History tracking'
    ],
    tags: ["csv", "json", "conversion", "data", "spreadsheet", "format"]
  },
  {
    id: 'xml-formatter',
    name: 'XML Editor',
    description: 'Professional XML formatting and validation tool',
    href: '/xml-formatter',
    icon: FileCode,
    features: [
      'Format & minify',
      'Validation',
      'History tracking'
    ],
    tags: ["xml", "formatting", "development", "validation", "data", "editor"]
  },
  {
    id: 'markdown-previewer',
    name: 'Markdown Editor',
    description: 'Advanced markdown editing and preview platform',
    href: '/markdown-previewer',
    icon: FileText,
    features: [
      'Live preview',
      'Syntax highlighting',
      'History tracking'
    ],
    tags: ["markdown", "writing", "preview", "documentation", "editor", "format"]
  },
  {
    id: "diff-checker",
    name: "Diff Analyzer",
    description: "Professional text and JSON difference analysis tool",
    href: "/diff-checker",
    icon: GitCompare,
    features: [
      "Side-by-side comparison",
      "Format support",
      "History tracking"
    ],
    tags: ["diff", "comparison", "text", "json", "analysis", "version"]
  },
  {
    id: "password-generator",
    name: "Password Studio",
    description: "Advanced password generation and management tool",
    href: "/password-generator",
    icon: Lock,
    features: [
      "Custom generation",
      "Strength analysis",
      "History tracking"
    ],
    tags: ["password", "security", "generator", "management", "crypto", "utility"]
  },
  {
    id: "uuid-generator",
    name: "UUID Studio",
    description: "Professional UUID generation and management platform",
    href: "/uuid-generator",
    icon: Hash,
    features: [
      "Multiple versions",
      "Custom generation",
      "History tracking"
    ],
    tags: ["uuid", "guid", "generator", "development", "identifier", "unique"]
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Advanced cryptographic hash generation platform",
    href: "/hash-generator",
    icon: Hash,
    features: [
      "Multiple algorithms",
      "Real-time generation",
      "History tracking"
    ],
    tags: ["hash", "crypto", "security", "generator", "md5", "sha"]
  },
  {
    id: "minifier",
    name: "Code Optimizer",
    description: "Professional code minification and beautification tool",
    href: "/minifier",
    icon: Scissors,
    features: [
      "Multi-format support",
      "Optimization",
      "History tracking"
    ],
    tags: ["minify", "optimization", "development", "code", "beautify", "format"]
  },
  {
    id: "lorem-ipsum",
    name: "Text Generator",
    description: "Professional placeholder text generation platform",
    href: "/lorem-ipsum",
    icon: Type,
    features: [
      "Custom generation",
      "Format control",
      "History tracking"
    ],
    tags: ["lorem", "text", "placeholder", "generator", "design", "content"]
  },
  {
    id: "case-converter",
    name: "Case Transformer",
    description: "Advanced text case conversion and formatting tool",
    href: "/case-converter",
    icon: Type,
    features: [
      "Multiple formats",
      "Real-time conversion",
      "History tracking"
    ],
    tags: ["case", "text", "conversion", "format", "utility", "transformation"]
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates",
    href: "/timestamp-converter",
    icon: Clock,
    features: [
      "Unix timestamp conversion",
      "Multiple date formats",
      "Time zone support",
      "Current time display"
    ],
    tags: ["timestamp", "date", "time", "conversion", "utility", "development"]
  },
]; 