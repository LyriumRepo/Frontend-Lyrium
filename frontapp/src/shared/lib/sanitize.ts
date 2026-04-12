export function sanitizeHtml(html: string): string {
    if (!html) return '';

    const allowedTags = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span',
        'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption'
    ];
    
    const allowedAttrs: Record<string, string[]> = {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan'],
    };

    let result = html;

    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    result = result.replace(/on\w+="[^"]*"/gi, '');
    result = result.replace(/javascript:/gi, '');

    return result;
}

export function sanitizeUrl(url: string): string {
    if (!url) return '#';
    
    const trimmed = url.trim().toLowerCase();
    
    if (
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('vbscript:') ||
        trimmed.startsWith('data:')
    ) {
        return '#';
    }
    
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('#')
    ) {
        return url;
    }
    
    return '#';
}

export function sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

export function sanitizeEmail(email: string): string {
    if (!email) return '';
    
    const sanitized = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        return '';
    }
    
    return sanitized;
}

export function sanitizeUsername(username: string): string {
    if (!username) return '';
    
    return username
        .trim()
        .replace(/[<>\"\'&]/g, '')
        .slice(0, 50);
}
