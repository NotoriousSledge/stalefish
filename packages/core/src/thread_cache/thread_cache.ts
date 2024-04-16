import type {PartionedMap, Result} from '@/lib';
import {ResultFactory, format_sort_key} from '@/lib';

export class ThreadCache {
  #state: PartionedMap<Promise<any>> = new Map();

  readonly run = async <T>(
    generator: () => Promise<T>,
    partition_key: string,
    sort_keys: Array<string> | string,
    ttl?: number,
  ): Promise<Result<T>> => {
    const sort_key = format_sort_key(sort_keys);
    const cached = this.#state.get(partition_key)?.get(sort_key);
    if (cached) {
      return ResultFactory.fromPromise(cached);
    }

    const promise = generator();
    if (this.#state.has(partition_key)) {
      this.#state.get(partition_key)!.set(sort_key, promise);
    } else {
      this.#state.set(partition_key, new Map([[sort_key, promise]]));
    }

    if (typeof ttl === 'number') {
      setTimeout(() => this.#state.get(partition_key)?.delete(sort_key), ttl);
    }

    return ResultFactory.fromPromise(promise).then(
      ResultFactory.mapErr((e) => {
        this.#state.get(partition_key)?.delete(sort_key);
        return e;
      }),
    );
  };

  readonly has = (
    partition_key: string,
    sort_keys: Array<string> | string,
  ): boolean => {
    return Boolean(
      this.#state.get(partition_key)?.has(format_sort_key(sort_keys)),
    );
  };

  readonly reset = (
    partition_key: string,
    sort_keys: Array<string> | string,
  ): void => {
    this.#state.get(partition_key)?.delete(format_sort_key(sort_keys));
  };
}
