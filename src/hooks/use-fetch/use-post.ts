import { QueryKey, UseQueryOptions } from 'react-query'
import { Converter } from './converter'

import { fetchTyped, ResolvedType } from './fetch'
import {
  useSuspensableQuery,
  UseSuspensableQueryResult
} from './use-query-wrapper'

type UsePostOptions<T, D, E> = {
  converter?: Converter<D, T>
  fetchOptions?: Omit<RequestInit, 'method'>
  useQueryOptions?: Omit<
    UseQueryOptions<ResolvedType<T, E>, unknown, ResolvedType<T, E>, QueryKey>,
    'queryKey' | 'queryFn'
  >
  resolvableResponseStatus?: number[]
}
export function usePost<T>(
  queryKey: QueryKey,
  input: RequestInfo,
  // converter?: undefined,
  // initOptions?: Omit<RequestInit, 'method'>
  options?: UsePostOptions<T, unknown, unknown>
): UseSuspensableQueryResult<ResolvedType<T, never>>
export function usePost<T, E>(
  queryKey: QueryKey,
  input: RequestInfo,
  // converter?: undefined,
  // initOptions?: Omit<RequestInit, 'method'>
  options?: UsePostOptions<T, unknown, E>
): UseSuspensableQueryResult<ResolvedType<T, E>>
export function usePost<T, D>(
  queryKey: QueryKey,
  input: RequestInfo,
  // converter: Converter<D, T>,
  // initOptions?: Omit<RequestInit, 'method'>
  options?: Required<Pick<UsePostOptions<T, D, unknown>, 'converter'>> &
    UsePostOptions<T, D, unknown>
): UseSuspensableQueryResult<ResolvedType<T, never>>
export function usePost<T, D, E>(
  queryKey: QueryKey,
  input: RequestInfo,
  // converter: Converter<D, T>,
  // initOptions?: Omit<RequestInit, 'method'>
  options?: Required<Pick<UsePostOptions<T, D, E>, 'converter'>> &
    UsePostOptions<T, D, E>
): UseSuspensableQueryResult<ResolvedType<T, E>>
export function usePost<T, D, E>(
  queryKey: QueryKey,
  input: RequestInfo,
  // converter?: Converter<D, T>,
  // initOptions: Omit<RequestInit, 'method'> = {}
  options: UsePostOptions<T, D, E> = {}
): UseSuspensableQueryResult<ResolvedType<T, E>> {
  const initOptions: RequestInit = {
    ...options.fetchOptions,
    method: 'POST'
  }
  return useSuspensableQuery(
    queryKey,
    () =>
      options.converter
        ? fetchTyped<T, D, E>(input, initOptions, options.converter, options.resolvableResponseStatus)
        : fetchTyped<T, E>(input, initOptions, undefined, options.resolvableResponseStatus),
    options.useQueryOptions
  )
}
