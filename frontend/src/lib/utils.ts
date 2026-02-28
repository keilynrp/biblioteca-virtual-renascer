
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAvatarUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;

    // Si es relativa, añadir la base del backend (sin /api)
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
