/// <reference types="vite/client" />

declare const __CLIENT_STUDIO_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_ENABLE_LEGACY_COMMAND_RUNTIME?: string;
  readonly VITE_BASE?: string;
  readonly VITE_RUNTIME_EVIDENCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
