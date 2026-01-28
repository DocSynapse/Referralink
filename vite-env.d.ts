/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_QWEN_API_KEY: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_DEEPSEEK_BASE_URL?: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_QWEN_BASE_URL: string;
  readonly VITE_AI_MODEL_NAME: string;
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_AUTH_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
