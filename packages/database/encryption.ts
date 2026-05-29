import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getKey() {
    const key = process.env.ENCRYPTION_KEY || 'default_secret_key_must_be_changed';
    return crypto.createHash('sha256').update(key).digest('base64').substring(0, 32);
}

export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getKey()), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getKey()), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption failed', e);
        return '';
    }
}
