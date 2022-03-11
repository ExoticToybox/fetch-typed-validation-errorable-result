import { ArrayConverterFactory, Converter } from '@/types/converter';

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type PostResponse = {
  id: string;
  userId: string;
  title: string;
  body: string;
};

export const PostConverter: Converter<PostResponse, Post> = {
  convert: (postResponse: PostResponse): Post => ({
    id: Number(postResponse.id),
    userId: Number(postResponse.userId),
    title: postResponse.title,
    body: postResponse.body,
  }),
};

export const PostArrayConverter: Converter<PostResponse[], Post[]> =
  ArrayConverterFactory.create(PostConverter);
