import {
  useQuery,
  QueryFunction,
  QueryKey,
  UseQueryResult,
  UseQueryOptions,
} from 'react-query';

type WithDefinedData<T extends { data: unknown }> = T & {
  data: NonNullable<T['data']>;
};

/** @package */
export type UseSuspensableQueryResult<T> = WithDefinedData<
  UseQueryResult<T, unknown>
>;

/** @package */
export const useSuspensableQuery = <T>(
  queryKey: QueryKey,
  queryFunction: QueryFunction<T, QueryKey>,
  options?: Omit<
    UseQueryOptions<T, unknown, T, QueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspensableQueryResult<T> =>
  useQuery(queryKey, queryFunction, {
    ...options,
    suspense: true,
  }) as UseSuspensableQueryResult<T>;
