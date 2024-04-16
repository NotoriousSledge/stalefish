export const format_sort_key = (sort_keys: Array<string> | string) =>
  typeof sort_keys === 'string' ? sort_keys : sort_keys.sort().join('#');
