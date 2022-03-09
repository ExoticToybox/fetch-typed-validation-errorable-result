import { QueryKey } from 'react-query'
import fetchMockJest from 'fetch-mock-jest'

import { useGet } from '..'
import { hasValidationError } from '../fetch'
import { Post, PostResponse, PostConverter, PostArrayConverter } from './post'
import { useRenderHook } from './use-render-hook'

// TODO: https://stackoverflow.com/questions/57514206/how-do-i-ensure-that-all-jest-tests-have-at-least-one-expect
// also above
afterEach(() => {
  fetchMockJest.restore()
})

describe('useGet<T>', () => {
  describe('fetch post with id 2 without converter', () => {
    const url: string = 'https://jsonplaceholder.typicode.com/posts/2'
    const useFetchPost = (queryKey: QueryKey) =>
      useGet<Post>(`without-converter-single-${queryKey}`, url, {
        useQueryOptions: { retry: false }
      })

    it('returns a post with status 200', async () => {
      const { result, waitFor } = useRenderHook(() => useFetchPost('200'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.current.isSuccess, { timeout: false })
      expect(result.current.status).toEqual('success')
      expect(result.current.data).toBeDefined()
      if (hasValidationError(result.current.data)) {
        fail()
      }
      expect(result.current.data.value.id).toEqual(2)
      expect(result.current.data.value.userId).toEqual(1)
      expect(result.current.data.value.title).toEqual('qui est esse')
      expect(result.current.data.value.body).toEqual(
        'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
      )
    })
    it('returns status 400', async () => {
      fetchMockJest.get(url, {
        status: 400
      })
      const { result, waitFor } = useRenderHook(() => useFetchPost('400'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Bad Request')
    })
    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500
      })
      const { result, waitFor } = useRenderHook(() => useFetchPost('500'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Internal Server Error')
    })
  })
  describe('fetch posts as Post[]', () => {
    const url: string = 'https://jsonplaceholder.typicode.com/posts'
    const useFetchPosts = (queryKey: QueryKey) =>
      useGet<Post[]>(`without-converter-multiple-${queryKey}`, url, {
        useQueryOptions: { retry: false }
      })

    it('returns posts with status 200', async () => {
      const { result, waitFor } = useRenderHook(() => useFetchPosts('200'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.current.isSuccess, { timeout: false })
      expect(result.current.status).toEqual('success')
      expect(result.current.data).toBeDefined()
      if (hasValidationError(result.current.data)) {
        fail()
      }
      expect(result.current.data.value.length).toEqual(100)
      result.current.data.value.forEach((post: Post, index: number) => {
        expect(post.id).toEqual(index + 1)
        expect(post.userId).toEqual(Math.trunc(index / 10) + 1)
      })
    })
    it('returns status 400', async () => {
      fetchMockJest.get(url, {
        status: 400
      })
      const { result, waitFor } = useRenderHook(() => useFetchPosts('400'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Bad Request')
    })
    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500
      })
      const { result, waitFor } = useRenderHook(() => useFetchPosts('500'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Internal Server Error')
    })
  })
})
describe('useGet<T, D>', () => {
  describe('fetch post with id 2 with converter', () => {
    const url: string = 'https://jsonplaceholder.typicode.com/posts/2'
    const useFetchPost = (queryKey: QueryKey) =>
      useGet<Post, PostResponse>(`with-converter-single-${queryKey}`, url, {
        converter: PostConverter,
        useQueryOptions: { retry: false }
      })

    it('returns posts with status 200', async () => {
      const { result, waitFor } = useRenderHook(() => useFetchPost('200'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.current.isSuccess, { timeout: false })
      expect(result.current.status).toEqual('success')
      expect(result.current.data).toBeDefined()
      if (hasValidationError(result.current.data)) {
        fail()
      }
      expect(result.current.data.value.id).toEqual(2)
      expect(result.current.data.value.userId).toEqual(1)
      expect(result.current.data.value.title).toEqual('qui est esse')
      expect(result.current.data.value.body).toEqual(
        'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
      )
    })
    it('returns status 400', async () => {
      fetchMockJest.get(url, {
        status: 400
      })
      const { result, waitFor } = useRenderHook(() => useFetchPost('400'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Bad Request')
    })
    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500
      })
      const { result, waitFor } = useRenderHook(() => useFetchPost('500'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Internal Server Error')
    })
  })
  describe('fetch posts as Post[]', () => {
    const url: string = 'https://jsonplaceholder.typicode.com/posts'
    const useFetchPosts = (queryKey: QueryKey) =>
      useGet<Post[], PostResponse[]>(
        `with-converter-multiple-${queryKey}`,
        url,
        {
          converter: PostArrayConverter,
          useQueryOptions: { retry: false }
        }
      )

    it('returns posts with status 200', async () => {
      const { result, waitFor } = useRenderHook(() => useFetchPosts('200'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.current.isSuccess, { timeout: false })
      expect(result.current.status).toEqual('success')
      expect(result.current.data).toBeDefined()
      if (hasValidationError(result.current.data)) {
        fail()
      }
      expect(result.current.data.value.length).toEqual(100)
      result.current.data.value.forEach((post: Post, index: number) => {
        expect(post.id).toEqual(index + 1)
        expect(post.userId).toEqual(Math.trunc(index / 10) + 1)
      })
    })
    it('returns status 400', async () => {
      fetchMockJest.get(url, {
        status: 400
      })
      const { result, waitFor } = useRenderHook(() => useFetchPosts('400'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Bad Request')
    })
    it('returns status 500', async () => {
      fetchMockJest.get(url, {
        status: 500
      })
      const { result, waitFor } = useRenderHook(() => useFetchPosts('500'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Internal Server Error')
    })
  })
})
