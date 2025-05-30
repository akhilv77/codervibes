import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getGravatarUrl(email: string, size: number = 200): string {
  const hash = email.trim().toLowerCase();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}

export function getDiceBearUrl(seed: string, size: number = 200): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=${size}`;
}

export function getUIAvatarUrl(name: string, size: number = 200): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}`;
}
