/**
 * Simple HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''

  return html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handler attributes (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: protocol in href/src attributes
    .replace(/(?:href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    // Remove data: protocol in src (except data:image for inline images)
    .replace(/src\s*=\s*(?:"data:(?!image)[^"]*"|'data:(?!image)[^']*')/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object/embed tags
    .replace(/<(?:object|embed)\b[^>]*\/?>/gi, '')
    // Remove style attributes that could contain expressions
    .replace(/style\s*=\s*(?:"[^"]*expression\s*\([^"]*"|'[^']*expression\s*\([^']*')/gi, '')
}
