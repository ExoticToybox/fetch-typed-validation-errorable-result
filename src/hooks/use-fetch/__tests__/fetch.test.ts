import { rest } from 'msw';
import { describe, it, expect } from 'vitest';

import { server } from '@/setup-tests/msw/server.untestable';
import { Post, PostConverter, PostResponse } from '@/types/post';

import {
  fetchTyped,
  hasValidationError,
  isSucceeded,
  ResolvedType,
} from '../fetch';

describe('fetchTyped<T>', () => {
  describe('fetch post with id 2', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/2';
    const fetchPost = () => fetchTyped<Post>(url, { method: 'GET' });

    it('returns a post with status 200', async () => {
      expect.hasAssertions();
      const result: ResolvedType<Post, never> = await fetchPost();
      if (isSucceeded(result)) {
        expect(result.value.id).toEqual(2);
        expect(result.value.userId).toEqual(1);
        expect(result.value.title).toEqual('qui est esse');
        expect(result.value.body).toEqual(
          'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
        );
      }
    });

    it('returns status 400', () => {
      server.resetHandlers(
        rest.get(url, (_, res, ctx) => res(ctx.status(400))),
      );
      return expect(fetchPost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      server.resetHandlers(
        rest.get(url, (_, res, ctx) => res(ctx.status(500))),
      );
      return expect(fetchPost()).rejects.toEqual('Internal Server Error');
    });
  });

  describe('fetch all posts', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    const fetchPosts = () => fetchTyped<Post[]>(url, { method: 'GET' });

    it('returns 100 posts with status 200', async () => {
      expect.hasAssertions();
      const result: ResolvedType<Post[], never> = await fetchPosts();
      if (isSucceeded(result)) {
        expect(result.value.length).toEqual(100);
        result.value.forEach((post: Post, index: number) => {
          expect(post.id).toEqual(index + 1);
          expect(post.userId).toEqual(Math.trunc(index / 10) + 1);
        });
      }
    });

    it('returns status 400', () => {
      server.resetHandlers(
        rest.get(url, (_, res, ctx) => res(ctx.status(400))),
      );
      return expect(fetchPosts()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      server.resetHandlers(
        rest.get(url, (_, res, ctx) => res(ctx.status(500))),
      );
      return expect(fetchPosts()).rejects.toEqual('Internal Server Error');
    });
  });

  describe('fetch nothing, only detele', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/1';
    const deletePost = () => fetchTyped<never>(url, { method: 'DELETE' });

    it('returns status 204', async () =>
      expect(deletePost()).resolves.toEqual({
        status: 'SUCCESS',
        value: {},
      }));

    it('returns status 400', () => {
      server.resetHandlers(
        rest.delete(url, (_, res, ctx) => res(ctx.status(400))),
      );
      return expect(deletePost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      server.resetHandlers(
        rest.delete(url, (_, res, ctx) => res(ctx.status(500))),
      );
      return expect(deletePost()).rejects.toEqual('Internal Server Error');
    });
  });
});

describe('fetchTyped<T, E>', () => {
  describe('create post', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    const createPost = (resolvableResponseStatus: number[] = []) =>
      fetchTyped<Post, PostResponse>(
        url,
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'test title',
            body: 'test body',
            userId: 1,
          }),
        },
        undefined,
        resolvableResponseStatus,
      );

    it('returns created post with status 201', async () => {
      expect.hasAssertions();
      const result: ResolvedType<Post, PostResponse> = await createPost();
      if (isSucceeded(result)) {
        expect(result.value.id).toEqual(101);
        expect(result.value.userId).toEqual(1);
        expect(result.value.title).toEqual('test title');
        expect(result.value.body).toEqual('test body');
      }
    });

    it('returns validation error messages with resolvable status 400', async () => {
      expect.hasAssertions();
      server.resetHandlers(
        rest.post(url, (_, res, ctx) =>
          res(
            ctx.status(400),
            ctx.json({
              userId: 'validation error userId',
              title: 'validation error title',
              body: 'validation error body',
            }),
          ),
        ),
      );
      const result: ResolvedType<Post, PostResponse> = await createPost([400]);
      if (hasValidationError(result)) {
        expect(result.error.id).not.toBeDefined();
        expect(result.error.userId).toEqual('validation error userId');
        expect(result.error.title).toEqual('validation error title');
        expect(result.error.body).toEqual('validation error body');
      }
    });

    it('returns status 400 without resolvable status', () => {
      server.resetHandlers(
        rest.post(url, (_, res, ctx) => res(ctx.status(400))),
      );
      return expect(createPost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      server.resetHandlers(
        rest.post(url, (_, res, ctx) => res(ctx.status(500))),
      );
      return expect(createPost()).rejects.toEqual('Internal Server Error');
    });
  });
});

describe('fetchTyped<T, D, E>', () => {
  describe('update post with converter', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/2';
    const updatePost = (resolvableResponseStatus: number[] = []) =>
      fetchTyped<Post, PostResponse, PostResponse>(
        url,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: 'updated title',
            body: 'updated body',
            userId: 3,
          }),
        },
        PostConverter,
        resolvableResponseStatus,
      );

    it('returns updated post with status 200', async () => {
      expect.hasAssertions();
      const result: ResolvedType<Post, PostResponse> = await updatePost();
      if (isSucceeded(result)) {
        expect(result.value.id).toEqual(2);
        expect(result.value.userId).toEqual(3);
        expect(result.value.title).toEqual('updated title');
        expect(result.value.body).toEqual('updated body');
      }
    });

    it('returns validation error messages with resolvable status 400', async () => {
      expect.hasAssertions();
      server.resetHandlers(
        rest.put(url, (_, res, ctx) =>
          res(
            ctx.status(400),
            ctx.json({
              userId: 'validation error userId',
              title: 'validation error title',
              body: 'validation error body',
            }),
          ),
        ),
      );
      const result: ResolvedType<Post, PostResponse> = await updatePost([400]);
      if (hasValidationError(result)) {
        expect(result.error.id).not.toBeDefined();
        expect(result.error.userId).toEqual('validation error userId');
        expect(result.error.title).toEqual('validation error title');
        expect(result.error.body).toEqual('validation error body');
      }
    });

    it('returns status 400 without resolvable status', () => {
      server.resetHandlers(
        rest.put(url, (_, res, ctx) => res(ctx.status(400))),
      );
      return expect(updatePost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      server.resetHandlers(
        rest.put(url, (_, res, ctx) => res(ctx.status(500))),
      );
      return expect(updatePost()).rejects.toEqual('Internal Server Error');
    });
  });
});
