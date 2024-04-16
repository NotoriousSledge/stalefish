import type {Result} from '@/lib';
import {ThreadCache} from '@/thread_cache';

export type CacheConfig = {
  staleTime: number;
  maxAge: number;
  inMemoryTime: number;
};

export class QueryClient {
  constructor(private readonly config: CacheConfig) {}
  #cache = new ThreadCache();

  readonly use = <T>(
    generator: () => Promise<T>,
    partition_key: string,
    sort_keys: Array<string> | string,
    config?: Partial<CacheConfig>,
  ): Promise<Result<T>> => {
    return this.#cache.run(
      generator,
      partition_key,
      sort_keys,
      config?.inMemoryTime ?? this.config.inMemoryTime,
    );
  };

  readonly has = (partition_key: string, sort_keys: Array<string>): boolean => {
    return this.#cache.has(partition_key, sort_keys);
  };
}
