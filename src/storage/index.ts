import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { IStorageAdapter } from './IStorageAdapter';

// Swap this export to change the persistence layer (e.g. IndexedDB, cloud)
export const storageAdapter: IStorageAdapter = new LocalStorageAdapter();

export type { IStorageAdapter };
