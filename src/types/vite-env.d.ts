/// <reference types="vite/client" />

// Allow JSON imports for Lottie animations
declare module "*.json" {
  const value: any;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_DEFAULT_EXAM_ID: string
  readonly VITE_TELEGRAM_BOT_USERNAME: string
  readonly VITE_YANDEX_METRIKA_ID: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}