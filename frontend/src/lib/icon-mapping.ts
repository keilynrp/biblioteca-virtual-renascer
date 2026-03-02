import {
    LayoutDashboard,
    Library,
    Newspaper,
    BookUp,
    Bell,
    Heart,
    BookMarked,
    Shield,
    FileEdit,
    Users,
    FolderOpen,
    CreditCard,
    Receipt,
    Building2,
    BellDot,
    Map,
    LayoutTemplate,
    Settings2,
    User,
    BookOpen,
    FileText,
    ClipboardList,
} from "lucide-react"

export const ICON_MAP: Record<string, any> = {
    "/home": LayoutDashboard,
    "/library": Library,
    "/blog": Newspaper,
    "/gestion-de-noticias": Newspaper,
    "/my-loans": BookUp,
    "/notifications": Bell,
    "/favorites": Heart,
    "/reading-history": BookMarked,
    "/admin": Shield,
    "/admin/books": FileEdit,
    "/admin/authors": Users,
    "/admin/categories": FolderOpen,
    "/admin/invoices": FileText,
    "/plans": CreditCard,
    "/billing": Receipt,
    "/institutions": Building2,
    "/admin/notifications": BellDot,
    "/admin/navigation": Map,
    "/admin/page-builder": LayoutTemplate,
    "/admin/forms": ClipboardList,
    "/admin/site-settings": Settings2,
    "/users": Users,
    "/profile": User,
}

export function getIconForUrl(url: string) {
    // Exact match
    if (ICON_MAP[url]) return ICON_MAP[url]

    // Prefix match for admin sections
    if (url.startsWith('/admin/books')) return FileEdit
    if (url.startsWith('/admin/authors')) return Users
    if (url.startsWith('/admin/categories')) return FolderOpen
    if (url.startsWith('/admin/invoices')) return FileText
    if (url.startsWith('/admin/forms')) return ClipboardList
    if (url.startsWith('/admin')) return Shield

    return BookOpen
}
