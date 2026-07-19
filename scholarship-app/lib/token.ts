/**
 * Edge-compatible JWT helpers using Web Crypto API (Subtle Crypto)
 * This avoids Node.js crypto imports, making it fully compatible with Next.js Edge Middleware.
 */

// Helper to base64url encode a string
function base64urlEncode(str: string): string {
    return btoa(str)
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Helper to base64url decode a string
function base64urlDecode(base64url: string): string {
    let base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return atob(base64);
}

/**
 * Sign a payload with HMAC SHA-256
 */
export async function signToken(payload: any, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    
    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const data = base64urlEncode(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
    }));

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${header}.${data}`)
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = btoa(String.fromCharCode(...signatureArray))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${header}.${data}.${signature}`;
}

/**
 * Verify a token and return the payload if valid, or null if invalid
 */
export async function verifyToken(token: string, secret: string): Promise<any> {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, data, signature] = parts;
    const encoder = new TextEncoder();

    try {
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Decode signature to Uint8Array
        const sigStr = base64urlDecode(signature);
        const sigBytes = new Uint8Array(sigStr.split('').map(c => c.charCodeAt(0)));

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            sigBytes,
            encoder.encode(`${header}.${data}`)
        );

        if (!isValid) return null;

        // Parse and check expiration
        const payload = JSON.parse(base64urlDecode(data));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            console.warn('Token has expired');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return null;
    }
}
