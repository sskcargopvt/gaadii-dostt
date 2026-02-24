/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_MARKETPLACE_EXTERNAL_API_BASE: string
    readonly VITE_MARKETPLACE_EXTERNAL_SECRET_KEY: string
    readonly VITE_EXTERNAL_GPS_WEBHOOK_SECRET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
