import {to_error} from './errors';

export type Result<TValue, TError extends Error = Error> =
  | {isOk: true; value: TValue; isErr: false}
  | {isOk: false; isErr: true; error: TError};

export class ResultFactory {
  static readonly ok = <T>(value: T): Result<T> => ({
    value,
    isOk: true,
    isErr: false,
  });

  static readonly err = <TError extends Error, TUnknown>(
    error: TError | TUnknown,
  ): Result<never, typeof error extends Error ? TError : Error> => ({
    error: to_error(error) as any,
    isOk: false,
    isErr: true,
  });

  static readonly fromPromise = async <T>(
    promise: Promise<T>,
  ): Promise<Result<T>> => {
    return promise.then(ResultFactory.ok).catch(ResultFactory.err);
  };

  static mapErr<T, TErr extends Error = Error>(
    cb: (e: Error) => TErr,
  ): (r: Result<T>) => Result<T, TErr | Error>;
  static mapErr<T, TErr extends Error = Error>(
    cb: (e: Error) => TErr,
    r: Result<T>,
  ): Result<T, TErr | Error>;
  static mapErr<T, TErr extends Error = Error>(
    cb: (e: Error) => TErr,
    r?: Result<T>,
  ): Result<T, TErr | Error> | ((r2: Result<T>) => Result<T, TErr | Error>) {
    if (r) {
      if (r.isOk) {
        return r;
      }

      try {
        return this.err(cb(r.error));
      } catch (e) {
        return this.err(e);
      }
    }

    return (r2: Result<T>) => this.mapErr(cb, r2);
  }

  static map<T, TNew, TErr extends Error = Error>(
    cb: (value: T) => TNew,
  ): (r: Result<T, TErr>) => Result<TNew, TErr>;
  static map<T, TNew, TErr extends Error = Error>(
    cb: (value: T) => TNew,
    r: Result<T>,
  ): Result<TNew, TErr | Error>;
  static map<T, TNew, TErr extends Error = Error>(
    cb: (value: T) => TNew,
    r?: Result<T>,
  ):
    | Result<TNew, TErr | Error>
    | ((r2: Result<T, TErr>) => Result<TNew, TErr | Error>) {
    if (r) {
      if (r.isErr) {
        return r;
      }

      try {
        return this.ok(cb(r.value));
      } catch (e) {
        return this.err(e);
      }
    }

    return (r2: Result<T>) => this.map(cb, r2);
  }

  static readonly unwrap = <T, TError extends Error = Error>(
    r: Result<T, TError>,
  ) => {
    if (r.isErr) {
      throw r.error;
    }

    return r.value;
  };
}
