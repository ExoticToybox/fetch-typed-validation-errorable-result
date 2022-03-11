import { beforeAll, afterEach, afterAll } from 'vitest';

import { server } from '@/setup-tests/msw/server.untestable';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
