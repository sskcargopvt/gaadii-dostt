# Gadi Dost - API Keys & Configuration

## 📋 Application API Keys

This document contains all the API keys and configuration details for the Gadi Dost application.

---

## 🔐 Supabase Configuration

**Service:** Backend Database & Authentication  
**Provider:** Supabase

### Configuration Details:
```
Supabase URL: https://tstboympleybwbdwicik.supabase.co
Supabase Anon/Public Key: sb_publishable_vq6bfHaokjK8BXfaubINXA_8xGwEwhH
```

### File Location:
- `services/supabaseClient.ts`

### Usage:
- User authentication (sign up, sign in, sign out)
- Database operations (vehicles, drivers, emergency requests)
- Real-time subscriptions
- File storage

---

## 🗺️ Google Maps API

**Service:** Maps & Location Services  
**Provider:** Google Cloud Platform

### Configuration Details:
```
Google Maps API Key: AIzaSyAQEwpbGFpBnHs5qpgrL_2Pxd_LHk_Lagw
Libraries: places
```

### File Location:
- `index.html` (line 73)

### Usage:
- Map display in GPS tracking section
- Location search and autocomplete
- Geofencing visualization
- Vehicle location tracking

---

## 📦 External Services

### 1. **Bilty Book Integration**
```
URL: https://www.biltybook.online
Type: External redirect (no API key required)
```

### 2. **Tailwind CSS CDN**
```
URL: https://cdn.tailwindcss.com
Plugins: forms, typography, aspect-ratio, line-clamp, container-queries
```

### 3. **Google Fonts**
```
Fonts Used:
- Inter (weights: 100-900)
- Poppins (weights: 100-900)
```

---

## 🔒 Security Notes

### Important Security Recommendations:

1. **Supabase Key:**
   - The current key (`sb_publishable_vq6bfHaokjK8BXfaubINXA_8xGwEwhH`) is a public/anon key
   - Safe to use in frontend applications
   - Row Level Security (RLS) should be enabled in Supabase for data protection
   - Never expose the service_role key in frontend code

2. **Google Maps API Key:**
   - Current key: `AIzaSyAQEwpbGFpBnHs5qpgrL_2Pxd_LHk_Lagw`
   - Recommended: Add domain restrictions in Google Cloud Console
   - Recommended: Enable billing alerts to monitor usage
   - Recommended: Restrict to specific APIs (Maps JavaScript API, Places API)

3. **Environment Variables (Recommended):**
   - For production, move API keys to environment variables
   - Use `.env` file for local development
   - Use platform environment variables for deployment (Vercel, Netlify, etc.)

---

## 🚀 Environment Setup (Recommended)

### Create `.env` file:
```env
VITE_SUPABASE_URL=https://tstboympleybwbdwicik.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_vq6bfHaokjK8BXfaubINXA_8xGwEwhH
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAQEwpbGFpBnHs5qpgrL_2Pxd_LHk_Lagw
```

### Update `services/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Update `index.html`:
```html
<script>
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
</script>
<script 
  src=`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`>
</script>
```

---

## 📊 API Usage & Limits

### Supabase Free Tier:
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB
- Monthly Active Users: Unlimited

### Google Maps API:
- Free tier: $200 credit per month
- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests

---

## 🔄 Rotating API Keys

If you need to rotate/regenerate API keys:

### Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project: `tstboympleybwbdwicik`
3. Settings → API
4. Generate new anon key (if needed)
5. Update `services/supabaseClient.ts`

### Google Maps:
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Create new API key or regenerate existing
4. Update `index.html`

---

## 📞 Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Google Maps Docs:** https://developers.google.com/maps/documentation
- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html

---

**Last Updated:** 2026-02-07  
**Application:** Gadi Dost - India's #1 Smart Fleet Management & Logistics App
