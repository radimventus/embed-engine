import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { createServer as createHttpsServer } from "node:https";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { after, describe, it } from "node:test";
import { chromium, type Page } from "playwright";
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
const DSE_VPD_HOUSE_ID =
  "draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk";
const DSE_PROJECT_ID = "project-domy-s-energii";
const VPD_AUTHORED_IDENTITY = {
  houseId: DSE_VPD_HOUSE_ID,
  name: "Váš první dům",
  canonicalProjectId: DSE_PROJECT_ID,
  packageRoot: "apps/client-studio/public/house-packages/patrovy-5kk",
  dataMode: "LIVE_EMPTY",
  status: "draft",
} as const;
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL9WQAAAABJRU5ErkJggg==",
  "base64",
);

type DeliveryState = {
  readonly requestedHouseId: string | null;
  readonly resolvedHouseId: string;
  readonly projectId: string;
  readonly packageRoot: string;
  readonly permittedHouses: readonly { readonly houseId: string; readonly name: string }[];
  readonly normalizedPresentationAssets: {
    readonly houseId: string;
    readonly gallery: readonly {
      readonly order: number;
      readonly roomId: string;
      readonly src: string;
    }[];
    readonly floors: readonly {
      readonly floorId: string;
      readonly rasterSrc: string;
      readonly geometry: {
        readonly schema: string;
        readonly viewBox: { readonly width: number; readonly height: number };
        readonly rooms: readonly { readonly roomId: string }[];
      } | null;
    }[];
  };
  readonly activeHouseId: string;
  readonly activeRoomId: string | null;
};

async function closeServer(
  server: { close: (callback: (error?: Error) => void) => void },
): Promise<void> {
  await new Promise<void>((resolveClose, reject) => {
    server.close((error) => (error === undefined ? resolveClose() : reject(error)));
  });
}

async function assertRenderedFloorplanRaster(
  page: Page,
  expectedRasterSrc: string,
): Promise<void> {
  await page.waitForFunction(
    (src) =>
      document.querySelector("svg[data-floorplan-src] image")?.getAttribute("href") === src,
    expectedRasterSrc,
  );
  const response = await page.evaluate(async (src) => {
    const result = await fetch(src, { cache: "no-store" });
    return { ok: result.ok, contentType: result.headers.get("content-type") };
  }, expectedRasterSrc);
  assert.equal(response.ok, true);
  assert.match(response.contentType ?? "", /^image\//);
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
            authoredHouseIdentities: [VPD_AUTHORED_IDENTITY],
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
        const [vpdGalleryCsv, vpdRoomsCsv, vpdVideosCsv] = await Promise.all([
          readFile(
            resolve(repoRoot, "apps/client-studio/public/house-packages/patrovy-5kk/gallery.csv"),
            "utf8",
          ),
          readFile(
            resolve(repoRoot, "apps/client-studio/public/house-packages/patrovy-5kk/rooms.csv"),
            "utf8",
          ),
          readFile(
            resolve(repoRoot, "apps/client-studio/public/house-packages/patrovy-5kk/videos.csv"),
            "utf8",
          ),
        ]);
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
        const vpdContext = await context.request.post(`${apiOrigin}/public/auth/context`, {
          headers: { origin: hostOrigin },
          data: {
            action: "enter",
            partnerId: "p-dse",
            tenantId: "tenant-domy-s-energii",
            companyId: "company-domy-s-energii",
            workspaceId: "domy-s-energii-main",
            projectId: DSE_PROJECT_ID,
            activeHouseId: DSE_VPD_HOUSE_ID,
            authoredHouseIdentities: [VPD_AUTHORED_IDENTITY],
            activeStudio: "client",
            officeReturnHref: "https://conis.cz:4181/partners/p-dse",
          },
        });
        assert.equal(vpdContext.status(), 200, await vpdContext.text());
        const persistedVpd = await context.request.post(
          `${apiOrigin}/public/house-packages/${DSE_VPD_HOUSE_ID}/persist`,
          {
            headers: { origin: hostOrigin },
            data: {
              files: {
                galleryCsv: vpdGalleryCsv,
                roomsCsv: vpdRoomsCsv,
                videosCsv: vpdVideosCsv,
              },
            },
          },
        );
        assert.equal(persistedVpd.status(), 200, await persistedVpd.text());
        const uploadedVpdMedia = await context.request.post(
          `${apiOrigin}/public/house-packages/${DSE_VPD_HOUSE_ID}/media/gallery/01.png`,
          {
            headers: { origin: hostOrigin, "content-type": "image/png" },
            data: ONE_PIXEL_PNG,
          },
        );
        assert.equal(uploadedVpdMedia.status(), 201);
        const staleBungalovContext = await context.request.post(
          `${apiOrigin}/public/auth/context`,
          {
            headers: { origin: hostOrigin },
            data: {
              action: "enter",
              partnerId: "p-dse",
              tenantId: "tenant-domy-s-energii",
              companyId: "company-domy-s-energii",
              workspaceId: "domy-s-energii-main",
              projectId: DSE_PROJECT_ID,
              activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
              authoredHouseIdentities: [VPD_AUTHORED_IDENTITY],
              activeStudio: "client",
              officeReturnHref: "https://conis.cz:4181/partners/p-dse",
            },
          },
        );
        assert.equal(
          staleBungalovContext.status(),
          200,
          await staleBungalovContext.text(),
        );

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
            return state;
          },
        );
        assert.ok(deliveryState !== null);
        assert.equal(deliveryState.requestedHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
        assert.equal(deliveryState.resolvedHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
        assert.equal(deliveryState.activeHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
        assert.equal(deliveryState.projectId, DSE_PROJECT_ID);
        assert.equal(deliveryState.packageRoot, "/house-packages/bungalov-4kk");
        assert.deepEqual(
          deliveryState.permittedHouses.map((house) => house.houseId),
          [DSE_BUNGALOV_4KK_HOUSE_ID, DSE_VPD_HOUSE_ID],
        );
        assert.equal(
          deliveryState.normalizedPresentationAssets.gallery.map((item) => item.order).join(","),
          "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",
        );
        assert.equal(
          deliveryState.normalizedPresentationAssets.gallery[0]?.roomId,
          "exterior",
        );
        const bungalovFloor = deliveryState.normalizedPresentationAssets.floors[0];
        assert.ok(bungalovFloor !== undefined);
        assert.equal(bungalovFloor?.rasterSrc, "/house-packages/bungalov-4kk/media/plans/p1.webp");
        assert.equal(bungalovFloor?.geometry?.schema, "hp-003-floorplan-geometry");
        assert.equal(bungalovFloor?.geometry?.rooms.length, 10);
        await assertRenderedFloorplanRaster(page, bungalovFloor.rasterSrc);

        const bungalovKitchenZone = page.locator('[data-room="kitchen"]');
        await bungalovKitchenZone.scrollIntoViewIfNeeded();
        await bungalovKitchenZone.click();
        await page.waitForTimeout(250);
        assert.deepEqual(
          await page.evaluate(() => ({
            activeRoomId: (
              window.__embedIntegration?.getDeliveryState() as DeliveryState | null
            )?.activeRoomId,
            fill: document.querySelector('[data-room="kitchen"]')?.getAttribute("fill"),
          })),
          { activeRoomId: "kitchen", fill: "#f5b9007f" },
        );

        const vpdPage = await context.newPage();
        await vpdPage.goto(
          `${hostOrigin}/?objectId=${encodeURIComponent(DSE_VPD_HOUSE_ID)}`,
          { waitUntil: "domcontentloaded" },
        );
        await vpdPage.waitForFunction(
          (houseId) =>
            (window.__embedIntegration?.getDeliveryState() as DeliveryState | null)
              ?.resolvedHouseId === houseId,
          DSE_VPD_HOUSE_ID,
          { timeout: 10_000 },
        );
        const vpdState = await vpdPage.evaluate(
          () => window.__embedIntegration?.getDeliveryState() as DeliveryState | null,
        );
        assert.ok(vpdState !== null);
        assert.equal(vpdState.requestedHouseId, DSE_VPD_HOUSE_ID);
        assert.equal(vpdState.resolvedHouseId, DSE_VPD_HOUSE_ID);
        assert.equal(vpdState.activeHouseId, DSE_VPD_HOUSE_ID);
        assert.notEqual(vpdState.resolvedHouseId, DSE_BUNGALOV_4KK_HOUSE_ID);
        assert.equal(vpdState.packageRoot, "/house-packages/patrovy-5kk");
        assert.deepEqual(
          vpdState.permittedHouses.map((house) => house.houseId),
          [DSE_BUNGALOV_4KK_HOUSE_ID, DSE_VPD_HOUSE_ID],
        );
        assert.deepEqual(
          vpdState.normalizedPresentationAssets.gallery.map((item) => item.order),
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        );
        assert.match(
          vpdState.normalizedPresentationAssets.gallery[0]?.src ?? "",
          /^blob:/,
        );
        const vpdFloor = vpdState.normalizedPresentationAssets.floors[0];
        assert.ok(vpdFloor !== undefined);
        assert.equal(vpdFloor?.rasterSrc, "/house-packages/patrovy-5kk/media/plans/p1.png");
        assert.equal(vpdFloor?.geometry?.schema, "hp-003-floorplan-geometry");
        assert.equal(vpdFloor?.geometry?.rooms.length, 10);
        await assertRenderedFloorplanRaster(vpdPage, vpdFloor.rasterSrc);

        const vpdKitchenZone = vpdPage.locator('[data-room="kitchen"]');
        await vpdKitchenZone.scrollIntoViewIfNeeded();
        await vpdKitchenZone.click();
        await vpdPage.waitForFunction(
          () =>
            (window.__embedIntegration?.getDeliveryState() as DeliveryState | null)
              ?.activeRoomId === "kitchen",
        );

        await vpdPage.getByTestId("client-house-menu-toggle").click();
        await assert.equal(
          await vpdPage.getByTestId(`client-house-option-${DSE_BUNGALOV_4KK_HOUSE_ID}`).count(),
          1,
        );
        await assert.equal(
          await vpdPage.getByTestId(`client-house-option-${DSE_VPD_HOUSE_ID}`).count(),
          1,
        );
        await vpdPage.getByTestId(`client-house-option-${DSE_BUNGALOV_4KK_HOUSE_ID}`).click();
        await vpdPage.waitForFunction(
          (houseId) =>
            (window.__embedIntegration?.getDeliveryState() as DeliveryState | null)
              ?.resolvedHouseId === houseId,
          DSE_BUNGALOV_4KK_HOUSE_ID,
          { timeout: 10_000 },
        );
        await vpdPage.getByTestId("client-house-menu-toggle").click();
        await vpdPage.getByTestId(`client-house-option-${DSE_VPD_HOUSE_ID}`).click();
        await vpdPage.waitForFunction(
          (houseId) =>
            (window.__embedIntegration?.getDeliveryState() as DeliveryState | null)
              ?.resolvedHouseId === houseId,
          DSE_VPD_HOUSE_ID,
          { timeout: 10_000 },
        );
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
