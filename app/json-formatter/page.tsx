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
import { FileJson, Copy, Check, Clock, Trash2 } from 'lucide-react';

export default function JSONFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const { trackUsage } = useServiceUsage();
  const { history, addToHistory, clearHistory, loadHistory } = useJSONFormatterStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
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

  return (
    <JSONFormatterPageShell>
      <div className="container px-4 py-6 sm:py-8">
        <div className="grid gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">JSON Formatter & Validator</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Format, minify, and validate your JSON data with ease. This tool helps you clean up and verify your JSON structure.
            </p>
          </div>

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
                  <Button onClick={formatJSON} className="w-full h-9 sm:h-10">
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