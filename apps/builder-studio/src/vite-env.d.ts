/// <reference types="vite/client" />

declare const __BUILDER_STUDIO_VERSION__: string;

declare const __EMBED_RUNTIME_BUILD__:
  | {
      readonly commit: string;
      readonly builtAt: string;
      readonly runtimeSource: string;
      readonly marker: string;
    }
  | undefined;

declare module '*.css?inline' {
  const css: string;
  export default css;
}
