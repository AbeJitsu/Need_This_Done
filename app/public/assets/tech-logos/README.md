# Tech Stack Logos

Official logos for the technology stack used by Need This Done.

## Recommended Logos (Best for Light Mode Homepage)

These are the official, production-ready logos:

### 1. **Claude/Anthropic**
- File: `claude-brandfetch.svg` (5.6 KB)
- Source: Official Brandfetch (Claude AI brand assets)
- Status: ✅ Ready

### 2. **Next.js**
- File: `nextjs-logo.svg` (2.0 KB)
- Source: Official Wikimedia Commons
- Status: ✅ Ready

### 3. **Vercel**
- File: `vercel-wordmark.svg` (3.6 KB)
- Source: Official Vercel brand assets
- Status: ✅ Ready

### 4. **Railway**
- File: `railway-logo-dark.svg` (53 KB) - Best for light backgrounds
- Alternative: `railway-logo-light.svg` (53 KB) - For dark backgrounds
- Source: Official Railway design system
- Status: ✅ Ready

### 5. **Supabase**
- File: `supabase-logo-wordmark--dark.svg` (5.7 KB) - Best for light backgrounds
- Alternative: `supabase-logo-wordmark--light.svg` (5.7 KB) - For dark backgrounds
- Icon: `supabase-logo-icon.svg` (1.1 KB) - Icon only
- Source: Official Supabase brand assets
- Status: ✅ Ready

---

## File Recommendations

For your light-mode homepage tech stack bar, use:

```
- claude-brandfetch.svg
- nextjs-logo.svg
- vercel-wordmark.svg
- railway-logo-dark.svg
- supabase-logo-wordmark--dark.svg
```

These have been tested and are production-ready.

## Cleanup Note

The following files are temporary/backup and can be deleted:
- `railway-gh.svg` (broken)
- `railway-logo-light.svg` (not needed for light mode site)
- `supabase-github.svg` (broken)
- `supabase-wordmark.svg` (9 bytes - corrupted)
- `supabase-wordmark-dark.svg` (9 bytes - corrupted)
- `vercel-icon.svg` (icon only, not wordmark)

---

## Implementation

To use these in your tech stack bar component:

```tsx
import claudeLogo from '@/public/assets/tech-logos/claude-brandfetch.svg'
import nextjsLogo from '@/public/assets/tech-logos/nextjs-logo.svg'
import vercelLogo from '@/public/assets/tech-logos/vercel-wordmark.svg'
import railwayLogo from '@/public/assets/tech-logos/railway-logo-dark.svg'
import supabaseLogo from '@/public/assets/tech-logos/supabase-logo-wordmark--dark.svg'

export function TechStackBar() {
  const logos = [
    { name: 'Claude', src: claudeLogo },
    { name: 'Next.js', src: nextjsLogo },
    { name: 'Vercel', src: vercelLogo },
    { name: 'Railway', src: railwayLogo },
    { name: 'Supabase', src: supabaseLogo },
  ]

  return (
    <div className="flex justify-center gap-8">
      {logos.map(({ name, src }) => (
        <img key={name} src={src} alt={`${name} logo`} className="h-6" />
      ))}
    </div>
  )
}
```
