export type Persistor<T> = {
  get: (partitionKey: string, sortKey: string) => T | Promise<T>;
  set: (value: T, partitionKey: string, sortKey: string) => T | Promise<T>;
  delete: (partitionKey: string, sortKey: string) => void | Promise<void>;
  has: (partitionKey: string, sortKey: string) => boolean | Promise<boolean>;
};

export type PersistorItem<T> = {
  createdAt: number;
  value: T;
};
