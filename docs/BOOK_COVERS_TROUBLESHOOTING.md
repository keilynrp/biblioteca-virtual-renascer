# Book Covers Troubleshooting Guide

## 📋 Problem Summary

Book covers are not displaying in the library page despite all configuration being correct.

## 🔍 Root Cause Analysis

### Investigation Results

| Component | Status | Details |
|-----------|--------|---------|
| **Backend API** | ✅ Working | Returns absolute URLs correctly |
| **Image Files** | ✅ Exist | Images are accessible at `/media/books/covers/` |
| **Serializers** | ✅ Updated | Using `SerializerMethodField()` with `request.build_absolute_uri()` |
| **Next.js Config** | ✅ Updated | `remotePatterns` configured for `localhost:8000` |
| **Book Card Component** | ✅ Correct | Using Next.js `<Image>` component properly |
| **API Client** | ✅ Working | Axios configured correctly with baseURL |
| **Service Restart** | ❌ **ISSUE** | Services need restart to apply configuration changes |

### API Response (Verified Working)

```json
{
  "id": 49,
  "title": "Also sprach Zarathustra",
  "cover_image": "http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg",
  "author": {...},
  "category": {...}
}
```

### Direct Image Access (Verified Working)

```bash
curl -I http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg

HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 4096
```

## 🎯 Root Cause

**The problem is that Next.js hasn't loaded the updated `next.config.ts` configuration.**

When `next.config.ts` is modified, the Next.js dev server must be restarted to apply changes. The configuration change was made but the frontend container was not restarted.

### Timeline of Changes

1. ✅ Updated `backend/apps/content/serializers.py` (lines 18-30)
2. ✅ Updated `frontend/next.config.ts` (lines 4-18)
3. ✅ Updated `frontend/src/components/book-card.tsx`
4. ✅ Updated `frontend/src/app/(dashboard)/library/page.tsx` (pagination fix)
5. ❌ **Missing:** Restart frontend container

## ✅ Solution

### Quick Fix

**Windows:**
```bash
# Run the fix script
fix-book-covers.bat
```

**Linux/macOS:**
```bash
# Restart both containers
docker compose restart backend frontend

# Wait 15 seconds
sleep 15

# Hard refresh browser
# Press Ctrl + Shift + R
```

### Manual Fix

If the script doesn't work, follow these steps:

```bash
# 1. Stop containers
docker compose down

# 2. Start containers
docker compose up -d

# 3. Wait for services to be ready
# Backend: ~10 seconds
# Frontend: ~15 seconds

# 4. Clear browser cache
# Chrome/Edge: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
# Firefox: Ctrl + F5 (Windows/Linux) or Cmd + Shift + R (Mac)

# 5. Navigate to library
# http://localhost:3000/library
```

## 🔧 Configuration Details

### Backend Serializer (serializers.py)

```python
class BookListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None
```

**Why:** Converts `/media/books/covers/image.jpg` → `http://localhost:8000/media/books/covers/image.jpg`

### Next.js Configuration (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
    ],
  },
};
```

**Why:** Allows Next.js Image component to fetch images from external domains.

### Book Card Component (book-card.tsx)

```tsx
{book.cover_image ? (
  <Image
    src={book.cover_image}
    alt={book.title}
    fill
    style={{ objectFit: "cover" }}
    className="group-hover:scale-110 transition-transform duration-300"
  />
) : (
  <div className="flex items-center justify-center h-full">
    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
  </div>
)}
```

**Why:** Uses Next.js optimized Image component with remote URL from API.

### Library Page Pagination (library/page.tsx)

```typescript
const params: any = {
  page_size: 1000  // Request all books
}
```

**Why:** Ensures all 49 books are fetched instead of just the first 20.

## 🐛 Debugging Steps

If book covers still don't appear after restarting:

### 1. Check Browser Console

```bash
# Open Developer Tools (F12)
# Go to Console tab
# Look for errors like:
# - "Image is not configured under images in next.config.js"
# - "Failed to load resource"
# - CORS errors
```

### 2. Check Network Tab

```bash
# Open Developer Tools (F12)
# Go to Network tab
# Filter by "Img" or "Media"
# Look for:
# - Are image requests being made?
# - What's the response code? (should be 200)
# - What's the actual URL being requested?
```

### 3. Test Image URL Directly

```bash
# Copy an image URL from the API response
# Paste it directly in browser address bar
# Should display the image

# Example:
http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg
```

### 4. Verify API Response

```bash
# Open browser console
# Run:
fetch('http://localhost:8000/api/content/books/?page_size=1')
  .then(r => r.json())
  .then(d => console.log(d.results[0].cover_image))

# Should print:
"http://localhost:8000/media/books/covers/filename.jpg"
```

### 5. Check Docker Logs

```bash
# Backend logs
docker compose logs backend | tail -50

# Frontend logs
docker compose logs frontend | tail -50

# Look for errors related to:
# - Image serving
# - CORS
# - Media file access
```

## 📊 Expected Behavior

### Before Fix

- **Books visible:** 20 (due to pagination)
- **Book covers:** Missing (placeholder icon shown)
- **API URL:** Relative paths like `/media/books/covers/image.jpg`

### After Fix

- **Books visible:** 49 (all books)
- **Book covers:** ✅ Displayed correctly
- **API URL:** Absolute paths like `http://localhost:8000/media/books/covers/image.jpg`
- **Grid layout:** 6 columns on XL screens

## 🔄 Prevention

To avoid this issue in the future:

1. **Always restart services after configuration changes:**
   ```bash
   # When modifying:
   # - next.config.ts
   # - backend settings.py
   # - serializers.py
   # - Django models

   docker compose restart backend frontend
   ```

2. **Clear browser cache after updates:**
   ```bash
   # Hard refresh
   Ctrl + Shift + R  (Windows/Linux)
   Cmd + Shift + R   (Mac)
   ```

3. **Use the diagnostic script:**
   ```bash
   # Check configuration
   bash check-ssl.sh

   # Fix common issues
   bash fix-book-covers.bat
   ```

## 📝 Checklist

Use this checklist to verify book covers are working:

- [ ] Backend API returns absolute URLs (`http://localhost:8000/media/...`)
- [ ] Images accessible directly in browser
- [ ] `next.config.ts` has `remotePatterns` for `localhost:8000`
- [ ] `serializers.py` uses `SerializerMethodField()` with `build_absolute_uri()`
- [ ] Backend container restarted after serializer changes
- [ ] Frontend container restarted after next.config.ts changes
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] All 49 books visible in library (not just 20)
- [ ] Book cover images displaying correctly
- [ ] Grid shows 6 columns on large screens

## 🆘 Still Not Working?

If covers still don't show after following all steps:

### Check Image Optimization

Next.js may be having trouble optimizing images. Try disabling optimization temporarily:

```typescript
// frontend/next.config.ts
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,  // Disable optimization for debugging
    remotePatterns: [...]
  }
}
```

Then restart frontend:
```bash
docker compose restart frontend
```

### Check Django Media Settings

Verify Django is serving media files correctly:

```python
# backend/config/settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# backend/config/urls.py
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Check File Permissions

```bash
# Verify media directory is accessible
docker compose exec backend ls -la media/books/covers/

# Should show image files with read permissions
```

## 📚 Related Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Django Media Files](https://docs.djangoproject.com/en/stable/howto/static-files/)
- [Docker Compose Restart](https://docs.docker.com/compose/reference/restart/)

---

**Last Updated:** 2025-12-28
**Issue:** Book covers not displaying
**Status:** ✅ Solution provided
**Next Action:** Run `fix-book-covers.bat` or restart containers manually
