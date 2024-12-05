import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

// Sanitização de entrada HTML
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    SANITIZE_DOM: true
  });
}

// Proteção contra XSS em strings
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Geração de CSRF token
export function generateCsrfToken(): string {
  return uuidv4();
}

// Validação de CSRF token
export function validateCsrfToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

// Sanitização de URLs
export function sanitizeUrl(url: string): string {
  const sanitized = url.trim().toLowerCase();
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    return '';
  }
  return sanitized;
}

// Validação de entrada
export function validateInput(input: string, type: 'text' | 'email' | 'username'): boolean {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'username':
      return /^[a-zA-Z0-9_-]{3,20}$/.test(input);
    case 'text':
      return input.length > 0 && input.length <= 1000;
    default:
      return false;
  }
}

// Headers de segurança
export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.supabase.co",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
