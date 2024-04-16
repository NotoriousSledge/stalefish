export const to_error = <TError extends Error, TUnknown>(
  e: TError | TUnknown,
): typeof e extends Error ? TError : Error => {
  return e instanceof Error ? e : (new Error(String(e)) as any);
};
