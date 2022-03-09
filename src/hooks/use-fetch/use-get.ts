import { QueryKey, UseQueryOptions } from 'react-query'
import { Converter } from './converter'

import { fetchTyped, ResolvedType } from './fetch'
import {
  useSuspensableQuery,
  UseSuspensableQueryResult
} from './use-query-wrapper'

type UseGetOptions<T, D> = {
  converter?: Converter<D, T>,
  fetchOptions?: Omit<RequestInit, 'method'>
  useQueryOptions?: Omit<UseQueryOptions<ResolvedType<T, never>, unknown, ResolvedType<T, never>, QueryKey>, 'queryKey' | 'queryFn'>
}

 export function useGet<T>(
  queryKey: QueryKey,
  input: RequestInfo,
  options?: UseGetOptions<T, unknown>
): UseSuspensableQueryResult<ResolvedType<T, never>>
export function useGet<T, D>(
  queryKey: QueryKey,
  input: RequestInfo,
  options?: Required<Pick<UseGetOptions<T, D>, 'converter'>> & UseGetOptions<T, D>
): UseSuspensableQueryResult<ResolvedType<T, never>>
export function useGet<T, D>(
  queryKey: QueryKey,
  input: RequestInfo,
  options: UseGetOptions<T, D> = {}
): UseSuspensableQueryResult<ResolvedType<T, never>> {
  const initOptionsForGet: RequestInit = { ...options.fetchOptions, method: 'GET' }
  return useSuspensableQuery(queryKey, () =>
  options.converter
      ? fetchTyped<T, D, never>(input, initOptionsForGet, options.converter)
      : fetchTyped<T, never>(input, initOptionsForGet),
      options.useQueryOptions
  )
}
