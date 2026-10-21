// ============================================
// UTILITIES
// ============================================

import { randomBytes } from 'crypto';

/**
 * Generate a random UUID v4
 */
export function generateId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Calculate expiration date
 */
export function calculateExpiration(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Mask sensitive data
 */
export function maskString(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const middle = '*'.repeat(value.length - visibleChars * 2);
  return `${start}${middle}${end}`;
}

/**
 * Format currency to BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Validate CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleaned[9])) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleaned[10])) return false;

  return true;
}

/**
 * Validate CEP
 */
export function validateCEP(cep: string): boolean {
  return /^\d{8}$/.test(cep.replace(/\D/g, ''));
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
