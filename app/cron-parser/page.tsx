'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { Timer, Copy, Clock } from 'lucide-react';

interface CronExpression {
  expression: string;
  explanation: string;
  nextRuns: string[];
}

// Common cron patterns
const commonPatterns = [
  { name: 'Every minute', expression: '* * * * *' },
  { name: 'Every hour at minute 0', expression: '0 * * * *' },
  { name: 'Every day at midnight', expression: '0 0 * * *' },
  { name: 'Every day at noon', expression: '0 12 * * *' },
  { name: 'Every Monday at 9 AM', expression: '0 9 * * 1' },
  { name: 'Every weekday at 5 PM', expression: '0 17 * * 1-5' },
  { name: 'Every month on the 1st', expression: '0 0 1 * *' },
  { name: 'Every 15 minutes', expression: '*/15 * * * *' },
  { name: 'Every 2 hours', expression: '0 */2 * * *' },
  { name: 'Every Sunday at midnight', expression: '0 0 * * 0' },
];

// Function to validate cron expression
const validateCronExpression = (expression: string): boolean => {
  // Split the expression into parts
  const parts = expression.split(' ');
  if (parts.length !== 5) return false;

  // Day of week mapping
  const dayOfWeekMap: { [key: string]: number } = {
    'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
    'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
  };

  // Helper function to validate a single field
  const validateField = (field: string, min: number, max: number, isDayOfWeek: boolean = false): boolean => {
    if (field === '*') return true;
    
    // Handle ranges (e.g., 1-5 or MON-FRI)
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      let startNum: number, endNum: number;

      if (isDayOfWeek) {
        startNum = dayOfWeekMap[start.toUpperCase()] ?? parseInt(start);
        endNum = dayOfWeekMap[end.toUpperCase()] ?? parseInt(end);
      } else {
        startNum = parseInt(start);
        endNum = parseInt(end);
      }

      return !isNaN(startNum) && !isNaN(endNum) && 
             startNum >= min && endNum <= max && 
             startNum <= endNum;
    }
    
    // Handle intervals (e.g., */5)
    if (field.includes('/')) {
      const [value, interval] = field.split('/');
      if (value !== '*' && !validateField(value, min, max, isDayOfWeek)) return false;
      const intervalNum = parseInt(interval);
      return !isNaN(intervalNum) && intervalNum > 0;
    }
    
    // Handle lists (e.g., 1,2,3 or MON,WED,FRI)
    if (field.includes(',')) {
      return field.split(',').every(num => {
        if (isDayOfWeek) {
          const value = dayOfWeekMap[num.toUpperCase()] ?? parseInt(num);
          return !isNaN(value) && value >= min && value <= max;
        }
        const value = parseInt(num);
        return !isNaN(value) && value >= min && value <= max;
      });
    }
    
    // Handle single values
    if (isDayOfWeek) {
      const value = dayOfWeekMap[field.toUpperCase()] ?? parseInt(field);
      return !isNaN(value) && value >= min && value <= max;
    }
    const value = parseInt(field);
    return !isNaN(value) && value >= min && value <= max;
  };

  // Validate each field with its specific range
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  return (
    validateField(minute, 0, 59) &&
    validateField(hour, 0, 23) &&
    validateField(dayOfMonth, 1, 31) &&
    validateField(month, 1, 12) &&
    validateField(dayOfWeek, 0, 6, true)
  );
};

// Function to get human-readable explanation
const getCronExplanation = (expression: string): string => {
  const parts = expression.split(' ');
  if (parts.length !== 5) return 'Invalid cron expression';

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Helper function to get time in 12-hour format
  const getTimeString = (hour: string): string => {
    const h = parseInt(hour);
    if (h === 0) return '12:00 AM';
    if (h === 12) return '12:00 PM';
    if (h > 12) return `${h - 12}:00 PM`;
    return `${h}:00 AM`;
  };

  // Helper function to get day name
  const getDayName = (day: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap: { [key: string]: number } = {
      'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
      'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
    };
    
    // If it's a string day name, convert it to number
    const dayNum = dayMap[day.toUpperCase()] ?? parseInt(day);
    return days[dayNum];
  };

  // Helper function to get month name
  const getMonthName = (month: string): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNum = parseInt(month);
    return months[monthNum - 1];
  };

  let explanation = '';

  // Handle special cases first
  if (expression === '0 0 * * *') {
    return 'Daily at 12:00 AM';
  }
  if (expression === '0 12 * * *') {
    return 'Daily at 12:00 PM';
  }
  if (expression === '* * * * *') {
    return 'Every minute';
  }
  if (expression === '0 * * * *') {
    return 'Every hour';
  }

  // Handle time ranges with intervals
  if (minute.includes('/') && hour.includes('-')) {
    const [, interval] = minute.split('/');
    const [startHour, endHour] = hour.split('-');
    explanation = `Every ${interval} minutes from ${getTimeString(startHour)} to ${getTimeString(endHour)}`;
  }
  // Handle intervals
  else if (minute.includes('/')) {
    const [, interval] = minute.split('/');
    if (hour === '*') {
      explanation = `Every ${interval} minutes`;
    } else {
      explanation = `Every ${interval} minutes at ${getTimeString(hour)}`;
    }
  }
  // Handle time ranges
  else if (hour.includes('-')) {
    const [startHour, endHour] = hour.split('-');
    if (minute === '0') {
      explanation = `Every hour from ${getTimeString(startHour)} to ${getTimeString(endHour)}`;
    } else {
      explanation = `At ${minute} minutes past every hour from ${getTimeString(startHour)} to ${getTimeString(endHour)}`;
    }
  }
  // Handle specific times
  else {
    if (minute === '0') {
      explanation = `Daily at ${getTimeString(hour)}`;
    } else {
      explanation = `At ${minute} minutes past ${getTimeString(hour)}`;
    }
  }

  // Add day of week
  if (dayOfWeek !== '*') {
    if (dayOfWeek.includes('-')) {
      const [start, end] = dayOfWeek.split('-');
      explanation = explanation.replace('Daily', `Every ${getDayName(start)} through ${getDayName(end)}`);
    } else if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map(d => getDayName(d));
      explanation = explanation.replace('Daily', `Every ${days.join(', ')}`);
    } else {
      explanation = explanation.replace('Daily', `Every ${getDayName(dayOfWeek)}`);
    }
  }

  // Add day of month
  if (dayOfMonth !== '*') {
    if (dayOfMonth.includes('/')) {
      const [, interval] = dayOfMonth.split('/');
      explanation += `, every ${interval} days of the month`;
    } else {
      explanation += ` on day ${dayOfMonth} of the month`;
    }
  }

  // Add month
  if (month !== '*') {
    if (month.includes('/')) {
      const [, interval] = month.split('/');
      explanation += `, every ${interval} months`;
    } else {
      explanation += ` in ${getMonthName(month)}`;
    }
  }

  return explanation;
};

// Function to get next run times
const getNextRunTimes = (expression: string, count: number = 5): string[] => {
  const nextRuns: string[] = [];
  const now = new Date();
  let currentDate = new Date(now);
  const MAX_ITERATIONS = 1000;
  let iterations = 0;

  // Parse the cron expression
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.split(' ');

  // Helper function to check if a value matches a cron field
  const matchesCronField = (value: number, field: string): boolean => {
    if (field === '*') return true;
    if (field.includes('/')) {
      const [, interval] = field.split('/');
      return value % parseInt(interval) === 0;
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }
    return value === parseInt(field);
  };

  // Helper function to get next valid minute
  const getNextMinute = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() + 1);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  // Helper function to get next valid hour
  const getNextHour = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(date.getHours() + 1);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  // Helper function to get next valid day
  const getNextDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  // Helper function to get next valid month
  const getNextMonth = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    newDate.setDate(1);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  // Helper function to get next valid day of week
  const getNextDayOfWeek = (date: Date, targetDay: number): Date => {
    const newDate = new Date(date);
    const currentDay = newDate.getDay();
    const daysUntilNext = (targetDay - currentDay + 7) % 7;
    newDate.setDate(newDate.getDate() + (daysUntilNext || 7));
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  // Find next valid run times
  while (nextRuns.length < count && iterations < MAX_ITERATIONS) {
    iterations++;
    
    const currentMinute = currentDate.getMinutes();
    const currentHour = currentDate.getHours();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDayOfWeek = currentDate.getDay();

    // Check if current time matches all cron fields
    const matchesMinute = matchesCronField(currentMinute, minute);
    const matchesHour = matchesCronField(currentHour, hour);
    const matchesDayOfMonth = matchesCronField(currentDay, dayOfMonth);
    const matchesMonth = matchesCronField(currentMonth, month);
    const matchesDayOfWeek = matchesCronField(currentDayOfWeek, dayOfWeek);

    if (matchesMinute && matchesHour && matchesDayOfMonth && matchesMonth && matchesDayOfWeek) {
      // Only add future times
      if (currentDate > now) {
        nextRuns.push(currentDate.toLocaleString());
      }
    }

    // Move to next time based on the most specific field
    if (minute !== '*') {
      if (minute.includes('/')) {
        const [, interval] = minute.split('/');
        currentDate.setMinutes(currentDate.getMinutes() + parseInt(interval));
      } else {
        currentDate = getNextMinute(currentDate);
      }
    } else if (hour !== '*') {
      if (hour.includes('/')) {
        const [, interval] = hour.split('/');
        currentDate.setHours(currentDate.getHours() + parseInt(interval));
      } else {
        currentDate = getNextHour(currentDate);
      }
    } else if (dayOfWeek !== '*') {
      if (dayOfWeek.includes('-')) {
        currentDate = getNextDay(currentDate);
      } else if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(Number);
        const nextDay = days.find(d => d > currentDayOfWeek) || days[0];
        currentDate = getNextDayOfWeek(currentDate, nextDay);
      } else {
        const targetDay = parseInt(dayOfWeek);
        currentDate = getNextDayOfWeek(currentDate, targetDay);
      }
    } else if (dayOfMonth !== '*') {
      if (dayOfMonth.includes('/')) {
        const [, interval] = dayOfMonth.split('/');
        currentDate.setDate(currentDate.getDate() + parseInt(interval));
      } else {
        currentDate = getNextDay(currentDate);
      }
    } else if (month !== '*') {
      if (month.includes('/')) {
        const [, interval] = month.split('/');
        currentDate.setMonth(currentDate.getMonth() + parseInt(interval));
      } else {
        currentDate = getNextMonth(currentDate);
      }
    } else {
      currentDate = getNextMinute(currentDate);
    }

    // Ensure we're always moving forward
    if (currentDate <= now) {
      currentDate = new Date(now.getTime() + 60000); // Move forward by 1 minute
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn('Maximum iterations reached while calculating next run times');
  }

  return nextRuns;
};

// Function to get parsing details
const getParsingDetails = (expression: string) => {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.split(' ');
  
  const getMinuteDetails = (min: string) => {
    if (min === '*') return { value: '*', description: 'every minute' };
    if (min.includes('/')) {
      const [, interval] = min.split('/');
      return { value: min, description: `every ${interval} minutes` };
    }
    return { value: min, description: `${min}${getOrdinalSuffix(parseInt(min))} minute` };
  };

  const getHourDetails = (hr: string) => {
    if (hr === '*') return { value: '*', description: 'every hour' };
    if (hr.includes('/')) {
      const [, interval] = hr.split('/');
      return { value: hr, description: `every ${interval} hours` };
    }
    return { value: hr, description: `${hr}${getOrdinalSuffix(parseInt(hr))} hour` };
  };

  const getDayOfMonthDetails = (day: string) => {
    if (day === '*') return { value: '*', description: 'every day of month' };
    if (day.includes('/')) {
      const [, interval] = day.split('/');
      return { value: day, description: `every ${interval} days` };
    }
    return { value: day, description: `${day}${getOrdinalSuffix(parseInt(day))} day of month` };
  };

  const getMonthDetails = (mon: string) => {
    if (mon === '*') return { value: '*', description: 'every month' };
    if (mon.includes('/')) {
      const [, interval] = mon.split('/');
      return { value: mon, description: `every ${interval} months` };
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { value: mon, description: months[parseInt(mon) - 1] };
  };

  const getDayOfWeekDetails = (day: string) => {
    if (day === '*') return { value: '*', description: 'every day of week' };
    if (day.includes('/')) {
      const [, interval] = day.split('/');
      return { value: day, description: `every ${interval} days of week` };
    }
    if (day.includes('-')) {
      const [start, end] = day.split('-');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayMap: { [key: string]: number } = {
        'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
        'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
      };
      const startNum = dayMap[start.toUpperCase()] ?? parseInt(start);
      const endNum = dayMap[end.toUpperCase()] ?? parseInt(end);
      return { value: day, description: `${days[startNum]} through ${days[endNum]}` };
    }
    if (day.includes(',')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayMap: { [key: string]: number } = {
        'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
        'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
      };
      const dayNums = day.split(',').map(d => dayMap[d.toUpperCase()] ?? parseInt(d));
      return { value: day, description: dayNums.map(d => days[d]).join(', ') };
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap: { [key: string]: number } = {
      'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
      'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
    };
    const dayNum = dayMap[day.toUpperCase()] ?? parseInt(day);
    return { value: day, description: days[dayNum] };
  };

  const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return [
    { field: 'minute', ...getMinuteDetails(minute) },
    { field: 'hour', ...getHourDetails(hour) },
    { field: 'day of month', ...getDayOfMonthDetails(dayOfMonth) },
    { field: 'month', ...getMonthDetails(month) },
    { field: 'day of week', ...getDayOfWeekDetails(dayOfWeek) }
  ];
};

export default function CronParser() {
  const [expression, setExpression] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<CronExpression>('cronParser', 'lastState');
        if (savedState) {
          setExpression(savedState.expression || '');
          setExplanation(savedState.explanation || '');
          setNextRuns(savedState.nextRuns || []);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
    loadSavedState();
  }, []);

  const handleExpressionChange = (value: string) => {
    try {
      console.log('Handling expression change:', value);
      setExpression(value);
      
      // Only proceed with validation if we have a value
      if (!value.trim()) {
        setIsValid(true);
        setExplanation('');
        setNextRuns([]);
        return;
      }

      const valid = validateCronExpression(value);
      console.log('Validation result:', valid);
      setIsValid(valid);
      
      if (valid) {
        try {
          const explanation = getCronExplanation(value);
          console.log('Generated explanation:', explanation);
          setExplanation(explanation);

          const nextRuns = getNextRunTimes(value);
          console.log('Generated next runs:', nextRuns);
          setNextRuns(nextRuns);

          // Save state
          const state: CronExpression = {
            expression: value,
            explanation,
            nextRuns
          };
          
          // Ensure all values are serializable
          const serializedState = {
            expression: String(state.expression),
            explanation: String(state.explanation),
            nextRuns: state.nextRuns.map(String)
          };

          db.set('cronParser', 'lastState', serializedState).catch(error => {
            console.error('Error saving state:', error);
          });
        } catch (error) {
          console.error('Error processing valid expression:', error);
          setExplanation('Error processing expression');
          setNextRuns([]);
        }
      } else {
        setExplanation('');
        setNextRuns([]);
      }
    } catch (error) {
      console.error('Error in handleExpressionChange:', error);
      setIsValid(false);
      setExplanation('Error processing expression');
      setNextRuns([]);
    }
  };

  const handlePatternSelect = (pattern: string) => {
    try {
      console.log('Selecting pattern:', pattern);
      handleExpressionChange(pattern);
    } catch (error) {
      console.error('Error in handlePatternSelect:', error);
      toast.error('Error selecting pattern');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Cron Expression Parser
          </CardTitle>
          <CardDescription>Parse and validate cron expressions with human-readable explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cron Expression</label>
            <div className="flex gap-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Input
                type="text"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                placeholder="Enter cron expression (e.g., * * * * *)"
                className={`flex-1 ${!isValid ? 'border-red-500' : 'border-blue-300 focus:border-blue-400'}`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(expression);
                  toast.success('Expression copied to clipboard');
                }}
                className="border-blue-300 hover:bg-blue-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {!isValid && (
              <p className="text-sm text-red-500">Invalid cron expression format</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Common Patterns</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonPatterns.map((pattern) => (
                <Button
                  key={pattern.expression}
                  variant="outline"
                  className="justify-start"
                  onClick={() => handlePatternSelect(pattern.expression)}
                >
                  <span className="font-mono mr-2">{pattern.expression}</span>
                  <span className="text-sm opacity-70">{pattern.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {isValid && expression && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{explanation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parsing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getParsingDetails(expression).map((detail, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-2 rounded-lg bg-gray-50 items-center">
                        <span className="text-sm font-medium flex items-center justify-start">{detail.field}</span>
                        <span className="text-sm font-mono flex items-center justify-start">{detail.value}</span>
                        <span className="text-sm opacity-70 flex items-center justify-start">{detail.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {nextRuns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-4 w-4" />
                      Next Run Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {nextRuns.map((time, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                          >
                            <span className="text-sm font-medium">Run {index + 1}</span>
                            <span className="text-sm opacity-70">{time}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 