/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BCV_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
