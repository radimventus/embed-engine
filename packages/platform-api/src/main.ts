import { createPlatformApiServer } from './index';

const port = Number.parseInt(process.env.PLATFORM_API_PORT ?? '4310', 10);
const host = '127.0.0.1';

createPlatformApiServer().listen(port, host, () => {
  console.info(`Platform API listening on http://${host}:${port}`);
});
