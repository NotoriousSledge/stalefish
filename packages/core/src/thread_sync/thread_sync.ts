import type {PartionedMap} from '@/lib';

export class ThreadSync {
  #state: PartionedMap<Promise<any>> = new Map();

  readonly run = <T>(
    generator: () => Promise<T>,
    partition_key: string,
    sort_keys: Array<string>,
    ttl?: number,
  ): Promise<T> => {
    const sort_key = this.#format_sort_key(sort_keys);
    const cached = this.#state.get(partition_key)?.get(sort_key);
    if (cached) {
      return cached as Promise<T>;
    }

    const promise = generator();
    if (this.#state.has(partition_key)) {
      this.#state.get(partition_key)!.set(sort_key, promise);
    } else {
      this.#state.set(partition_key, new Map([[sort_key, promise]]));
    }

    if (typeof ttl === 'number') {
      setTimeout(() => this.#state.get(partition_key)!.delete(sort_key), ttl);
    }

    return promise;
  };

  readonly has = (partition_key: string, sort_keys: Array<string>): boolean => {
    return Boolean(
      this.#state.get(partition_key)?.has(this.#format_sort_key(sort_keys)),
    );
  };

  readonly reset = (partition_key: string, sort_keys: Array<string>): void => {
    this.#state.get(partition_key)?.delete(this.#format_sort_key(sort_keys));
  };

  readonly #format_sort_key = (sort_keys: Array<string>) =>
    sort_keys.sort().join('#');
}
