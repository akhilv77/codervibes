import Dexie, { Table } from 'dexie';

export interface ScorecardHistory {
    id?: number;
    gameId: string;
    playerScores: Record<string, number>;
    timestamp: number;
}

export interface MoneyTrackerHistory {
    id?: number;
    type: 'expense' | 'settlement';
    amount: number;
    description: string;
    participants: string[];
    timestamp: number;
}

export interface CurrencyHistory {
    id?: number;
    from: string;
    to: string;
    amount: number;
    result: number;
    timestamp: number;
}

export interface IPHistory {
    id?: number;
    ip: string;
    timestamp: number;
}

export interface RegexHistory {
    id?: number;
    pattern: string;
    text: string;
    flags: string;
    timestamp: number;
}

export interface JSONHistory {
    id?: number;
    type: 'format' | 'minify';
    from: string;
    to: string;
    timestamp: number;
}

export interface JWTHistory {
    id?: number;
    token: string;
    timestamp: number;
}

export interface URLHistory {
    id?: number;
    type: 'encode' | 'decode';
    from: string;
    to: string;
    timestamp: number;
}

export interface HTMLHistory {
    id?: number;
    type: 'encode' | 'decode';
    from: string;
    to: string;
    timestamp: number;
}

export interface QRHistory {
    id?: number;
    type: 'generate' | 'scan';
    content: string;
    timestamp: number;
}

export interface ColorHistory {
    id?: number;
    from: string;
    to: string;
    timestamp: number;
}

export interface TextHistory {
    id?: number;
    type: 'binary' | 'hex' | 'ascii';
    from: string;
    to: string;
    timestamp: number;
}

export interface YAMLHistory {
    id?: number;
    type: 'yaml-to-json' | 'json-to-yaml';
    from: string;
    to: string;
    timestamp: number;
}

export interface CSVHistory {
    id?: number;
    type: 'csv-to-json' | 'json-to-csv';
    from: string;
    to: string;
    timestamp: number;
}

export interface XMLHistory {
    id?: number;
    type: 'format' | 'minify';
    from: string;
    to: string;
    timestamp: number;
}

export interface MarkdownHistory {
    id?: number;
    from: string;
    to: string;
    timestamp: number;
}

class CoderVibesDatabase extends Dexie {
    scorecardHistory!: Table<ScorecardHistory>;
    moneyTrackerHistory!: Table<MoneyTrackerHistory>;
    currencyHistory!: Table<CurrencyHistory>;
    ipHistory!: Table<IPHistory>;
    regexHistory!: Table<RegexHistory>;
    jsonHistory!: Table<JSONHistory>;
    jwtHistory!: Table<JWTHistory>;
    urlHistory!: Table<URLHistory>;
    htmlHistory!: Table<HTMLHistory>;
    qrHistory!: Table<QRHistory>;
    colorHistory!: Table<ColorHistory>;
    textHistory!: Table<TextHistory>;
    yamlHistory!: Table<YAMLHistory>;
    csvHistory!: Table<CSVHistory>;
    xmlHistory!: Table<XMLHistory>;
    markdownHistory!: Table<MarkdownHistory>;

    constructor() {
        super('CoderVibesDatabase');
        this.version(1).stores({
            scorecardHistory: '++id, gameId, timestamp',
            moneyTrackerHistory: '++id, type, timestamp',
            currencyHistory: '++id, from, to, timestamp',
            ipHistory: '++id, ip, timestamp',
            regexHistory: '++id, pattern, timestamp',
            jsonHistory: '++id, type, timestamp',
            jwtHistory: '++id, token, timestamp',
            urlHistory: '++id, type, timestamp',
            htmlHistory: '++id, type, timestamp',
            qrHistory: '++id, type, timestamp',
            colorHistory: '++id, from, to, timestamp',
            textHistory: '++id, type, timestamp',
            yamlHistory: '++id, type, timestamp',
            csvHistory: '++id, type, timestamp',
            xmlHistory: '++id, type, timestamp',
            markdownHistory: '++id, timestamp',
        });
    }
}

export const db = new CoderVibesDatabase(); 