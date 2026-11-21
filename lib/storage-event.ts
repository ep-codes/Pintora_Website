// Fired on window whenever lib/local-store writes. Kept free of React imports so the
// theme script (which runs in the root layout's <head>) can listen for it too.
export const STORAGE_CHANGE_EVENT = "pintora-storage-change";
