import type {z} from 'zod';

export type ParseArgumentList = <T extends z.ZodTypeAny>(
  schema: T,
) => z.infer<T>;
