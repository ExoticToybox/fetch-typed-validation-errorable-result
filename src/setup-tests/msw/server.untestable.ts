import { setupServer } from 'msw/node';

import { postHandlers } from '@/setup-tests/msw/post-handler.untestable';

export const server = setupServer(...postHandlers);
