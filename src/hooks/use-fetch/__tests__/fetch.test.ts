import fetchMockJest from 'fetch-mock-jest';

import { Converter } from '@/types/converter';
import { Post, PostResponse } from '@/types/post';

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
      const result: ResolvedType<Post, never> = await fetchPost();
      expect(result).toBeDefined();
      if (hasValidationError(result)) {
        fail();
      }
      expect(result.value.id).toEqual(2);
      expect(result.value.userId).toEqual(1);
      expect(result.value.title).toEqual('qui est esse');
      expect(result.value.body).toEqual(
        'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
      );
    });

    it('returns status 400', () => {
      fetchMockJest.get(url, {
        status: 400,
      });
      return expect(fetchPost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500,
      });
      return expect(fetchPost()).rejects.toEqual('Internal Server Error');
    });
  });

  describe('fetch all posts', () => {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    const fetchPosts = () => fetchTyped<Post[]>(url, { method: 'GET' });

    it('returns 100 posts with status 200', async () => {
      const result: ResolvedType<Post[], never> = await fetchPosts();
      expect(result).toBeDefined();
      if (hasValidationError(result)) {
        fail();
      }
      expect(result.value.length).toEqual(100);
      result.value.forEach((post: Post, index: number) => {
        expect(post.id).toEqual(index + 1);
        expect(post.userId).toEqual(Math.trunc(index / 10) + 1);
      });
    });

    it('returns status 400', () => {
      fetchMockJest.get(url, {
        status: 400,
      });
      return expect(fetchPosts()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500,
      });
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
      fetchMockJest.delete(url, {
        status: 400,
      });
      return expect(deletePost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      fetchMockJest.delete(url, {
        status: 500,
      });
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
      const result: ResolvedType<Post, PostResponse> = await createPost();
      expect(result).toBeDefined();
      if (hasValidationError(result)) {
        fail();
      }
      expect(result.value.id).toEqual(101);
      expect(result.value.userId).toEqual(1);
      expect(result.value.title).toEqual('test title');
      expect(result.value.body).toEqual('test body');
    });

    it('returns validation error messages with resolvable status 400', async () => {
      fetchMockJest.post(url, {
        status: 400,
        body: {
          userId: 'validation error userId',
          title: 'validation error title',
          body: 'validation error body',
        },
      });
      const result: ResolvedType<Post, PostResponse> = await createPost([400]);
      expect(result).toBeDefined();
      if (isSucceeded(result)) {
        fail();
      }
      expect(result.error.id).not.toBeDefined();
      expect(result.error.userId).toEqual('validation error userId');
      expect(result.error.title).toEqual('validation error title');
      expect(result.error.body).toEqual('validation error body');
    });

    it('returns status 400 without resolvable status', () => {
      fetchMockJest.post(url, {
        status: 400,
      });
      return expect(createPost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      fetchMockJest.post(url, {
        status: 500,
      });
      return expect(createPost()).rejects.toEqual('Internal Server Error');
    });
  });
});

describe('fetchTyped<T, D, E>', () => {
  describe('update post with converter', () => {
    const postConverter: Converter<PostResponse, Post> = {
      convert: (postResponse: PostResponse) => ({
        id: Number(postResponse.id),
        userId: Number(postResponse.userId),
        title: postResponse.title,
        body: postResponse.body,
      }),
    };
    const url = 'https://jsonplaceholder.typicode.com/posts/2';
    const updatePost = (resolvableResponseStatus: number[] = []) =>
      fetchTyped<Post, PostResponse, PostResponse>(
        url,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: 'test title',
            body: 'test body',
            userId: 3,
          }),
        },
        postConverter,
        resolvableResponseStatus,
      );

    it('returns updated post with status 200', async () => {
      const result: ResolvedType<Post, PostResponse> = await updatePost();
      expect(result).toBeDefined();
      if (hasValidationError(result)) {
        fail();
      }
      expect(result.value.id).toEqual(2);
      expect(result.value.userId).toEqual(3);
      expect(result.value.title).toEqual('test title');
      expect(result.value.body).toEqual('test body');
    });

    it('returns validation error messages with resolvable status 400', async () => {
      fetchMockJest.put(url, {
        status: 400,
        body: {
          userId: 'validation error userId',
          title: 'validation error title',
          body: 'validation error body',
        },
      });
      const result: ResolvedType<Post, PostResponse> = await updatePost([400]);
      expect(result).toBeDefined();
      if (isSucceeded(result)) {
        fail();
      }
      expect(result.error.id).not.toBeDefined();
      expect(result.error.userId).toEqual('validation error userId');
      expect(result.error.title).toEqual('validation error title');
      expect(result.error.body).toEqual('validation error body');
    });

    it('returns status 400 without resolvable status', () => {
      fetchMockJest.put(url, {
        status: 400,
      });
      return expect(updatePost()).rejects.toEqual('Bad Request');
    });

    it('returns status 500', async () => {
      fetchMockJest.put(url, {
        status: 500,
      });
      return expect(updatePost()).rejects.toEqual('Internal Server Error');
    });
  });
});
