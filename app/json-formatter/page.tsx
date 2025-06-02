'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { JSONFormatterPageShell } from "@/components/layout/json-formatter-page-shell";
import { useJSONFormatterStore } from '@/lib/json-formatter-store';
import { useServiceUsage } from '@/lib/hooks/use-service-usage';
import { toast } from 'sonner';
import { FileJson, Copy, Check, Clock, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface JSONNode {
  key: string;
  value: any;
  type: string;
  path: string;
  children?: JSONNode[];
}

export default function JSONFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [parsedNodes, setParsedNodes] = useState<JSONNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { trackUsage } = useServiceUsage();
  const { history, addToHistory, clearHistory, loadHistory } = useJSONFormatterStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const parseJSONToNodes = (obj: any, path: string = ''): JSONNode[] => {
    if (obj === null) return [{ key: path.split('.').pop() || '', value: null, type: 'null', path }];
    if (typeof obj !== 'object') return [{ key: path.split('.').pop() || '', value: obj, type: typeof obj, path }];

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const node: JSONNode = {
        key,
        value,
        type: Array.isArray(value) ? 'array' : typeof value,
        path: currentPath,
      };

      if (value !== null && typeof value === 'object') {
        node.children = parseJSONToNodes(value, currentPath);
      }

      return node;
    });
  };

  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setParsedNodes(parseJSONToNodes(parsed));
      addToHistory(input);
      trackUsage('json-formatter', 'format');
      toast.success('JSON formatted successfully');
    } catch (error) {
      setOutput('');
      setIsValid(false);
      toast.error('Invalid JSON format');
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      addToHistory(input);
      trackUsage('json-formatter', 'minify');
      toast.success('JSON minified successfully');
    } catch (error) {
      setOutput('');
      setIsValid(false);
      toast.error('Invalid JSON format');
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(input);
      setIsValid(true);
      addToHistory(input);
      trackUsage('json-formatter', 'validate');
      toast.success('JSON is valid');
    } catch (error) {
      setIsValid(false);
      toast.error('Invalid JSON format');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleHistoryClick = (json: string) => {
    setInput(json);
    setOutput('');
    setIsValid(null);
  };

  const toggleNode = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const copyNodeValue = (node: JSONNode) => {
    const value = typeof node.value === 'object' ? JSON.stringify(node.value) : String(node.value);
    navigator.clipboard.writeText(value);
    toast.success('Value copied to clipboard');
  };

  const copyNodePath = (node: JSONNode) => {
    navigator.clipboard.writeText(node.path);
    toast.success('Path copied to clipboard');
  };

  const renderJSONNode = (node: JSONNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    return (
      <div key={node.path} className="font-mono text-sm">
        <div className="flex items-center gap-1 py-1 hover:bg-accent/50 rounded px-2">
          <div style={{ marginLeft: `${indent}px` }} className="flex items-center gap-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.path)}
                className="p-1 hover:bg-accent rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <span className="text-blue-500">{node.key}</span>
            <span className="text-gray-500">:</span>
            {!hasChildren && (
              <span className={`${node.type === 'string' ? 'text-green-500' :
                  node.type === 'number' ? 'text-orange-500' :
                    node.type === 'boolean' ? 'text-purple-500' :
                      'text-gray-500'
                }`}>
                {typeof node.value === 'string' ? `"${node.value}"` : String(node.value)}
              </span>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyNodeValue(node)}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyNodePath(node)}
              className="h-6 px-2"
            >
              <FileJson className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderJSONNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <JSONFormatterPageShell>
      <div className="container px-4 py-6 sm:py-8">
        <div className="grid gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">JSON Formatter & Parser</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Format, parse, and explore your JSON data with ease. Copy any field value or path with a single click.
            </p>
          </div>

          <Tabs defaultValue="formatter" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatter">Formatter</TabsTrigger>
              <TabsTrigger value="parser">Parser</TabsTrigger>
            </TabsList>

            <TabsContent value="formatter">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card className="w-full">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                          <FileJson className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          JSON Input
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Enter your JSON data to format, minify, or validate</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs w-fit">Real-time Processing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <Textarea
                      placeholder="Paste your JSON here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm"
                    />
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button onClick={handleFormatJSON} className="w-full h-9 sm:h-10">
                        Format JSON
                      </Button>
                      <Button onClick={minifyJSON} variant="outline" className="w-full h-9 sm:h-10">
                        Minify JSON
                      </Button>
                      <Button onClick={validateJSON} variant="outline" className="w-full h-9 sm:h-10">
                        Validate JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                          <FileJson className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Output
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {isValid === null ? 'Your formatted JSON will appear here' :
                            isValid ? 'Valid JSON' : 'Invalid JSON format'}
                        </CardDescription>
                      </div>
                      {output && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="h-8 w-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                      <Textarea
                        value={output}
                        readOnly
                        className="min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm bg-muted/50"
                      />
                      {isValid !== null && (
                        <div className="absolute top-2 right-2">
                          <Badge variant={isValid ? "default" : "destructive"}>
                            {isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parser">
              <Card className="w-full">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <FileJson className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        JSON Parser
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Explore and copy any field value or path from your JSON
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4">
                    <Textarea
                      placeholder="Paste your JSON here to parse..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[100px] font-mono text-xs sm:text-sm"
                    />
                    <Button onClick={handleFormatJSON} className="w-full">
                      Parse JSON
                    </Button>
                    {parsedNodes.length > 0 && (
                      <ScrollArea className="h-[400px] rounded-md border p-4">
                        {parsedNodes.map(node => renderJSONNode(node))}
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="w-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Recent JSON
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your recently processed JSON entries</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Last 10 entries</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    No recent JSON entries
                  </p>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => handleHistoryClick(item.json)}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-mono truncate">
                            {item.json.length > 100 ? `${item.json.slice(0, 100)}...` : item.json}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </JSONFormatterPageShell>
  );
} 