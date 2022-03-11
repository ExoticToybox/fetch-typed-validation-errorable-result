import {
  Renderer,
  renderHook,
  RenderHookOptions,
  RenderHookResult,
  WrapperComponent,
} from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();
const wrapper: WrapperComponent<unknown> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
export const useRenderHook = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps>,
): RenderHookResult<TProps, TResult, Renderer<TProps>> =>
  renderHook<TProps, TResult>(callback, { ...options, wrapper });
