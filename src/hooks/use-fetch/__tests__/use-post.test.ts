import { QueryKey } from 'react-query'
import fetchMockJest from 'fetch-mock-jest'

import { useGet, usePost } from '..'
import { Converter, ArrayConverterFactory } from '../converter'
import { hasValidationError, isSucceeded } from '../fetch'
import { Post, PostResponse } from './post'
import { useRenderHook } from './use-render-hook'

// TODO: https://stackoverflow.com/questions/57514206/how-do-i-ensure-that-all-jest-tests-have-at-least-one-expect
// also above
afterEach(() => {
  fetchMockJest.restore()
})

describe('usePost<T>', () => {
  describe('create post with id 2 and fetch created without converter', () => {
    const url: string = 'https://jsonplaceholder.typicode.com/posts'
    const useCreatePost = (
      queryKey: QueryKey,
      resolvableResponseStatus: number[] = []
    ) =>
      usePost<Post>(`create-without-converter-${queryKey}`, url, {
        fetchOptions: {
          body: JSON.stringify({
            title: 'test title',
            body: 'test body',
            userId: 1
          })
        },
        useQueryOptions: { retry: false },
        resolvableResponseStatus
      })

    it('returns a post with status 201', async () => {
      const { result, waitFor } = useRenderHook(() => useCreatePost('201'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.current.isSuccess, { timeout: false })
      expect(result.current.status).toEqual('success')
      expect(result.current.data).toBeDefined()
      if (hasValidationError(result.current.data)) {
        fail()
      }
      expect(result.current.data.value.id).toEqual(101)
      expect(result.current.data.value.userId).toEqual(1)
      expect(result.current.data.value.title).toEqual('test title')
      expect(result.current.data.value.body).toEqual('test body')
    })
    it('returns status 400', async () => {
      fetchMockJest.post(url, {
        status: 400
      })
      const { result, waitFor } = useRenderHook(() =>
        useCreatePost('unresolvable-400')
      )
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Bad Request')
    })
    it('returns status 500', async () => {
      fetchMockJest.post(url, {
        status: 500
      })
      const { result, waitFor } = useRenderHook(() => useCreatePost('500'))
      expect(result.current).not.toBeDefined()
      await waitFor(() => result.error !== undefined)
      expect(result.error).toEqual('Internal Server Error')
    })
  })
})
// describe('usePost<T, E>', () => {
//   const postConverter: Converter<PostResponse, Post> = {
//     convert: (postResponse: PostResponse) => ({
//       id: Number(postResponse.id),
//       userId: Number(postResponse.userId),
//       title: postResponse.title,
//       body: postResponse.body
//     })
//   }
//   describe('fetch post with id 2 with converter', () => {
//     const url: string = 'https://jsonplaceholder.typicode.com/posts'
//     const useCreatePost = (
//       queryKey: QueryKey,
//       resolvableResponseStatus: number[] = []
//     ) =>
//       usePost<Post, PostResponse>(`create-without-converter-${queryKey}`, url, {
//         fetchOptions: {
//           body: JSON.stringify({
//             title: 'test title',
//             body: 'test body',
//             userId: 1
//           })
//         },
//         useQueryOptions: { retry: false },
//         resolvableResponseStatus
//       })

//     it('returns posts with status 200', async () => {
//       const { result, waitFor } = useRenderHook(() => useFetchPost('200'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.current.isSuccess, { timeout: false })
//       expect(result.current.status).toEqual('success')
//       expect(result.current.data).toBeDefined()
//       if (hasValidationError(result.current.data)) {
//         fail()
//       }
//       expect(result.current.data.value.id).toEqual(2)
//       expect(result.current.data.value.userId).toEqual(1)
//       expect(result.current.data.value.title).toEqual('qui est esse')
//       expect(result.current.data.value.body).toEqual(
//         'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
//       )
//     })
//     it('returns status 400', async () => {
//       fetchMockJest.get(url, {
//         status: 400
//       })
//       const { result, waitFor } = useRenderHook(() => useFetchPost('400'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.error !== undefined)
//       expect(result.error).toEqual('Bad Request')
//     })
//     it('returns status 500', async () => {
//       fetchMockJest.get(url, {
//         status: 500
//       })
//       const { result, waitFor } = useRenderHook(() => useFetchPost('500'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.error !== undefined)
//       expect(result.error).toEqual('Internal Server Error')
//     })
//   })
//   describe('fetch posts as Post[]', () => {
//     const url: string = 'https://jsonplaceholder.typicode.com/posts'
//     const useFetchPosts = (queryKey: QueryKey) =>
//       useGet<Post[], PostResponse[]>(
//         `with-converter-multiple-${queryKey}`,
//         url,
//         {
//           converter: arrayConverterFactory(postConverter),
//           useQueryOptions: { retry: false }
//         }
//       )

//     it('returns posts with status 200', async () => {
//       const { result, waitFor } = useRenderHook(() => useFetchPosts('200'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.current.isSuccess, { timeout: false })
//       expect(result.current.status).toEqual('success')
//       expect(result.current.data).toBeDefined()
//       if (hasValidationError(result.current.data)) {
//         fail()
//       }
//       expect(result.current.data.value.length).toEqual(100)
//       result.current.data.value.forEach((post: Post, index: number) => {
//         expect(post.id).toEqual(index + 1)
//         expect(post.userId).toEqual(Math.trunc(index / 10) + 1)
//       })
//     })
//     it('returns validation error messages with resolvable status 400', async () => {
//       fetchMockJest.post(url, {
//         status: 400,
//         body: {
//           userId: 'validation error userId',
//           title: 'validation error title',
//           body: 'validation error body'
//         }
//       })
//       const { result, waitFor } = useRenderHook(() =>
//         useCreatePost('resolvable-400', [400])
//       )
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.current.isSuccess, { timeout: false })
//       expect(result.current.status).toEqual('success')
//       expect(result.current.data).toBeDefined()
//       if (isSucceeded(result.current.data)) {
//         fail()
//       }
//       expect(result.current.data.error.userId).toEqual(
//         'validation error userId'
//       )
//       expect(result.current.data.value.title).toEqual('validation error title')
//       expect(result.current.data.value.body).toEqual('validation error body')
//     })
//     it('returns status 400', async () => {
//       fetchMockJest.get(url, {
//         status: 400
//       })
//       const { result, waitFor } = useRenderHook(() => useFetchPosts('400'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.error !== undefined)
//       expect(result.error).toEqual('Bad Request')
//     })
//     it('returns status 500', async () => {
//       fetchMockJest.get(url, {
//         status: 500
//       })
//       const { result, waitFor } = useRenderHook(() => useFetchPosts('500'))
//       expect(result.current).not.toBeDefined()
//       await waitFor(() => result.error !== undefined)
//       expect(result.error).toEqual('Internal Server Error')
//     })
//   })
// })
