import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
    // Match all pathnames except for
    // - … if they start with /_next, /api or /_vercel
    // - … contain a dot (e.g., favicon.ico)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)',]
};
