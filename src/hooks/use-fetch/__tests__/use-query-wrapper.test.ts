import { QueryKey } from 'react-query';
import { describe, it, expect } from 'vitest';

import { useRenderHook } from '@/setup-tests/hooks/use-render-hook';
import { Post } from '@/types/post';

import {
  useSuspensableQuery,
  UseSuspensableQueryResult,
} from '../use-query-wrapper';

const useTestingQuery: <T>(
  queryKey: QueryKey,
  input: RequestInfo,
) => UseSuspensableQueryResult<T> = (queryKey, input) =>
  useSuspensableQuery(queryKey, () =>
    fetch(input, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json()),
  );

describe('useSuspensableQuery', () => {
  describe('fetch post as unknown with id 2', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/2';
    it('returns a post with status 200', async () => {
      const { result, waitFor } = useRenderHook(() =>
        useTestingQuery<unknown>('fetch-post-as-unknown', url),
      );
      expect(result.current).not.toBeDefined();
      await waitFor(() => result.current.isSuccess, { timeout: false });
      expect(result.current.status).toEqual('success');
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual({
        id: 2,
        userId: 1,
        title: 'qui est esse',
        body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
      });
    });
  });
  describe('fetch post as Post with id 2', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/2';
    it('returns a post with status 200', async () => {
      const { result, waitFor } = useRenderHook(() =>
        useTestingQuery<Post>('fetch-post-as-post', url),
      );
      expect(result.current).not.toBeDefined();
      await waitFor(() => result.current.isSuccess, { timeout: false });
      expect(result.current.status).toEqual('success');
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual({
        id: 2,
        userId: 1,
        title: 'qui est esse',
        body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
      });
    });
  });
  describe('fetch posts as Post[]', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    it('returns posts with status 200', async () => {
      const { result, waitFor } = useRenderHook(() =>
        useTestingQuery<Post[]>('fetch-posts', url),
      );
      expect(result.current).not.toBeDefined();
      await waitFor(() => result.current.isSuccess, { timeout: false });
      expect(result.current.status).toEqual('success');
      expect(result.current.data).toBeDefined();
      expect(result.current.data.length).toEqual(100);
      result.current.data.forEach((post: Post, index: number) => {
        expect(post.id).toEqual(index + 1);
        expect(post.userId).toEqual(Math.trunc(index / 10) + 1);
      });
    });
  });
  describe('suspense mode', () => {
    it('status==="loading" can not be waited', async () => {
      const { result, waitFor } = useRenderHook(() =>
        useSuspensableQuery<unknown>(
          'not-resolve-until-timeout',
          () =>
            new Promise((resolve) => {
              setTimeout(resolve, 110);
            }),
        ),
      );
      expect(result.current).not.toBeDefined();
      return expect(
        waitFor(() => result.current.isSuccess, { timeout: 100 }),
      ).rejects.toThrowError('Timed out in waitFor after 100ms.');
    });
    it('rethrows if it could not resolve finally', async () => {
      const { result, waitFor } = useRenderHook(() =>
        useSuspensableQuery<unknown>(
          'reject',
          () => Promise.reject(new Error('always')),
          { suspense: true, retry: false }, // disallow retry not to resolve at once
        ),
      );

      await waitFor(() => result.error !== undefined);
      expect(result.error).toEqual(new Error('always'));
      return expect(() => result.current).toThrowError('always');
    });
  });
});
