/** Ambient Vite env for Delivery host binding (static member access). */
interface ImportMetaEnv {
  readonly VITE_AI_DELIVERY_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
