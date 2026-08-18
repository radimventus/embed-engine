import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { createServer as createHttpsServer } from "node:https";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { after, describe, it } from "node:test";
import { chromium } from "playwright";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import {
  FileHousePackageRepository,
  FilePartnerSessionRepository,
  FilePlatformInviteRepository,
  createPlatformApiServer,
} from "@embed-engine/platform-api";

import {
  createSsotResolveAliases,
  repoRoot,
} from "../../vite.ssot-aliases";

const execFileAsync = promisify(execFile);
const DSE_BUNGALOV_4KK_HOUSE_ID =
  "reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk";
const DSE_PROJECT_ID = "project-domy-s-energii";
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL9WQAAAABJRU5ErkJggg==",
  "base64",
);

type DeliveryState = {
  readonly requestedHouseId: string | null;
  readonly resolvedHouseId: string;
  readonly projectId: string;
  readonly activeHouseId: string;
};

async function closeServer(
  server: { close: (callback: (error?: Error) => void) => void },
): Promise<void> {
  await new Promise<void>((resolveClose, reject) => {
    server.close((error) => (error === undefined ? resolveClose() : reject(error)));
  });
}

async function createCertificate(directory: string): Promise<{
  readonly key: Buffer;
  readonly cert: Buffer;
}> {
  const keyPath = join(directory, "localhost-key.pem");
  const certPath = join(directory, "localhost.pem");
  await execFileAsync("openssl", [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-subj",
    "/CN=127.0.0.1",
    "-addext",
    "subjectAltName=IP:127.0.0.1",
    "-days",
    "1",
  ]);
  return { key: await readFile(keyPath), cert: await readFile(certPath) };
}

describe("Embed browser integration", () => {
  it(
    "mounts Embed against authenticated durable VPD state",
    { timeout: 180_000 },
    async () => {
      const directory = await mkdtemp(join(tmpdir(), "embed-browser-integration-"));
      const previousAllowedOrigins = process.env.PLATFORM_API_ALLOWED_ORIGINS;
      const certificate = await createCertificate(directory);
      const invites = new FilePlatformInviteRepository(join(directory, "invites.json"));
      const sessions = new FilePartnerSessionRepository(join(directory, "sessions.json"));
      const housePackages = new FileHousePackageRepository(join(directory, "house-packages"));
      const platformApi = createPlatformApiServer(
        invites,
        undefined,
        undefined,
        undefined,
        undefined,
        sessions,
        housePackages,
      );
      const requestListener = platformApi.listeners("request")[0];
      assert.ok(requestListener !== undefined);
      const apiServer = createHttpsServer(certificate, requestListener);
      const browser = await chromium.launch({ headless: true });
      let vite: Awaited<ReturnType<typeof createViteServer>> | null = null;

      try {
        apiServer.listen(0, "127.0.0.1");
        await once(apiServer, "listening");
        const apiAddress = apiServer.address();
        assert.ok(apiAddress !== null && typeof apiAddress !== "string");
        const apiOrigin = `https://127.0.0.1:${apiAddress.port}`;

        vite = await createViteServer({
          configFile: false,
          root: resolve(repoRoot, "packages/embed/browser-test-host"),
          publicDir: resolve(repoRoot, "apps/client-studio/public"),
          plugins: [react()],
          resolve: { alias: createSsotResolveAliases(), dedupe: ["react", "react-dom"] },
          define: {
            __CLIENT_STUDIO_VERSION__: JSON.stringify("browser-integration"),
            "process.env.NODE_ENV": JSON.stringify("test"),
            "import.meta.env.VITE_PLATFORM_API_ORIGIN": JSON.stringify(apiOrigin),
          },
          optimizeDeps: { include: ["react", "react-dom", "react-dom/client"] },
          server: {
            host: "127.0.0.1",
            port: 0,
            https: certificate,
            hmr: false,
            fs: { allow: [repoRoot] },
          },
        });
        await vite.listen();
        const viteAddress = vite.httpServer?.address();
        assert.ok(viteAddress !== null && viteAddress !== undefined && typeof viteAddress !== "string");
        const hostOrigin = `https://127.0.0.1:${viteAddress.port}`;
        process.env.PLATFORM_API_ALLOWED_ORIGINS = hostOrigin;

        const invite = await invites.create({
          email: "embed-browser@example.test",
          displayName: "Embed Browser",
          roles: ["conis-admin"],
          invitedByUserId: "browser-test",
          tenantId: "tenant-domy-s-energii",
          companyId: "company-domy-s-energii",
          workspaceId: "domy-s-energii-main",
          projectId: DSE_PROJECT_ID,
        });
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const activation = await context.request.post(
          `${apiOrigin}/public/auth/activate/${encodeURIComponent(invite.token)}`,
          {
            headers: { origin: hostOrigin },
            data: { ndaAccepted: true, password: "browser-password", rememberMe: true },
          },
        );
        assert.equal(activation.status(), 200);
        const restoredSession = await context.request.get(`${apiOrigin}/public/auth/me`, {
          headers: { origin: hostOrigin },
        });
        assert.equal(restoredSession.status(), 200, await restoredSession.text());

        const sessionContext = await context.request.post(`${apiOrigin}/public/auth/context`, {
          headers: { origin: hostOrigin },
          data: {
            action: "enter",
            partnerId: "p-dse",
            tenantId: "tenant-domy-s-energii",
            companyId: "company-domy-s-energii",
            workspaceId: "domy-s-energii-main",
            projectId: DSE_PROJECT_ID,
            activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
            activeStudio: "client",
            officeReturnHref: "https://conis.cz:4181/partners/p-dse",
          },
        });
        assert.equal(
          sessionContext.status(),
          200,
          await sessionContext.text(),
        );

        const galleryCsv = await readFile(
          resolve(repoRoot, "apps/client-studio/public/house-packages/bungalov-4kk/gallery.csv"),
          "utf8",
        );
        const persisted = await context.request.post(
          `${apiOrigin}/public/house-packages/${DSE_BUNGALOV_4KK_HOUSE_ID}/persist`,
          {
            headers: { origin: hostOrigin },
            data: { files: { galleryCsv } },
          },
        );
        assert.equal(persisted.status(), 200);
        const uploadedMedia = await context.request.post(
          `${apiOrigin}/public/house-packages/${DSE_BUNGALOV_4KK_HOUSE_ID}/media/gallery/01.webp`,
          {
            headers: { origin: hostOrigin, "content-type": "image/png" },
            data: ONE_PIXEL_PNG,
          },
        );
        assert.equal(uploadedMedia.status(), 201);

        const page = await context.newPage();
        const browserErrors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") browserErrors.push(message.text());
        });
        page.on("pageerror", (error) => browserErrors.push(error.message));
        await page.goto(hostOrigin, { waitUntil: "domcontentloaded" });
        try {
          await page.waitForFunction(
            (houseId) => {
              const state = window.__embedIntegration?.getDeliveryState() as
                | { readonly resolvedHouseId?: string }
                | null;
              return state?.resolvedHouseId === houseId;
            },
            DSE_BUNGALOV_4KK_HOUSE_ID,
            { timeout: 10_000 },
          );
        } catch {
          throw new Error(
            `Embed did not publish delivery state: ${browserErrors.join("\n")}`,
          );
        }
        const deliveryState = await page.evaluate(
          () => {
            const state = window.__embedIntegration?.getDeliveryState() as
              | DeliveryState
              | null;
            return state === null
              ? null
              : {
                  requestedHouseId: state.requestedHouseId,
                  resolvedHouseId: state.resolvedHouseId,
                  projectId: state.projectId,
                  activeHouseId: state.activeHouseId,
                };
          },
        );
        assert.deepEqual(deliveryState, {
          requestedHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
          resolvedHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
          projectId: DSE_PROJECT_ID,
          activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        });
      } finally {
        await browser.close();
        if (vite !== null) await vite.close();
        await closeServer(apiServer);
        if (previousAllowedOrigins === undefined) {
          delete process.env.PLATFORM_API_ALLOWED_ORIGINS;
        } else {
          process.env.PLATFORM_API_ALLOWED_ORIGINS = previousAllowedOrigins;
        }
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
});
