import { Converter } from '@/types/converter';

type ValidationError<E> = {
  status: 'VALIDATION_ERROR';
  error: E;
};
type Success<T> = {
  status: 'SUCCESS';
  value: T;
};

/**
 * @package
 * T: Succeeded response result type
 * E: Validation error result type
 */
// prettier-ignore
export type ResolvedType<T, E> = Success<T> | ValidationError<E>

/** @package */
export const isSucceeded = <T>(
  result: ResolvedType<T, unknown>,
): result is Success<T> => result.status === 'SUCCESS';
/** @package */
export const hasValidationError = <E>(
  result: ResolvedType<unknown, E>,
): result is ValidationError<E> => result.status === 'VALIDATION_ERROR';

// eslint-disable-next-line @typescript-eslint/promise-function-async
const wrap = <T, E>(
  task: Promise<Response>,
  resolvableResponseStatus: number[],
): Promise<ResolvedType<T, E>> =>
  new Promise((resolve, reject) => {
    task
      .then((response: Response) => {
        if (response.ok || resolvableResponseStatus.includes(response.status)) {
          response
            .json()
            .then((json: unknown) => {
              if (response.ok) {
                resolve({
                  status: 'SUCCESS',
                  value: json as T,
                });
              } else {
                resolve({
                  status: 'VALIDATION_ERROR',
                  error: json as E,
                });
              }
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          reject(response.statusText);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

/**
 * @package
 * Get等バリデーションエラーが発生しないAPIをコールする。
 *
 * @typeParam T Succeeded response result type
 * @param input {@link RequestInfo}
 * @param initOptions {@link RequestInit}
 * @param converter never specified
 * @param resolvableResponseStatus never specified
 */
export function fetchTyped<T>(
  input: RequestInfo,
  initOptions: RequestInit,
  converter?: never,
  resolvableResponseStatus?: never,
): Promise<ResolvedType<T, never>>;
/**
 * @package
 * バリデーションエラーが発生する可能性のあるAPIをコールする。
 *
 * @typeParam T Succeeded response result type
 * @typeParam E Validation error result type
 * @param input {@link RequestInfo}
 * @param initOptions {@link RequestInit}
 * @param converter never specified
 * @param resolvableResponseStatus specific response status code allows resolve
 */
export function fetchTyped<T, E>(
  input: RequestInfo,
  initOptions: RequestInit,
  converter?: never,
  resolvableResponseStatus?: number[],
): Promise<ResolvedType<T, E>>;
/**
 * @package
 * バリデーションエラーが発生する可能性のあるAPIをコールし、
 * 成功した場合はデコードした結果を返却する。
 *
 * @typeParam T Converted response result type
 * @typeParam D Convertable response result type
 * @typeParam E Validation error result type
 * @param input {@link RequestInfo}
 * @param initOptions {@link RequestInit}
 * @param converter decode function converts D to T
 * @param resolvableResponseStatus specific response status code allows resolve
 */
export function fetchTyped<T, D, E>(
  input: RequestInfo,
  initOptions: RequestInit,
  converter: Converter<D, T>,
  resolvableResponseStatus?: number[],
): Promise<ResolvedType<T, E>>;
/** @package */
// eslint-disable-next-line @typescript-eslint/promise-function-async
export function fetchTyped<T, D, E>(
  input: RequestInfo,
  initOptions: RequestInit,
  converter?: Converter<D, T>,
  resolvableResponseStatus: number[] = [],
): Promise<ResolvedType<T, E>> {
  const init: RequestInit = {
    ...initOptions,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...initOptions.headers,
    },
  };
  return wrap<T | D, E>(fetch(input, init), resolvableResponseStatus).then(
    (response: ResolvedType<T | D, E>) => {
      switch (response.status) {
        case 'SUCCESS':
          // converterを引数に設定した場合はD型を指定されているので、戻り値の型はD型で確定する
          if (converter) {
            return {
              ...response,
              value: converter.convert(response.value as D),
            };
          }
          // converterを引数に設定しない場合はD型を指定されていないので、戻り値の型はT型で確定する
          return response as Success<T>;
        case 'VALIDATION_ERROR':
          return response;
        default: {
          // Assist TypeScript type guard via impossible assignment
          const never: never = response;
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Could not regard ${never} as ResolvedType`);
        }
      }
    },
  );
}
