import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

interface UserData {
    stripeAccountId: string;
    email: string;
    createdAt: string;
}

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize file if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

export function saveUser(stripeAccountId: string, email: string) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    data[stripeAccountId] = {
        stripeAccountId,
        email,
        createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getUser(stripeAccountId: string): UserData | null {
    if (!fs.existsSync(DATA_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return data[stripeAccountId] || null;
}
