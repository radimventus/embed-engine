import {
  createPlatformApiServer,
  platformApiHost,
  platformApiPort,
} from './index';

const port = platformApiPort();
const host = platformApiHost();

createPlatformApiServer().listen(port, host, () => {
  console.info(`Platform API listening on ${host}:${port}`);
});
