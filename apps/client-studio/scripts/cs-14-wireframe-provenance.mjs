import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs');
const ASSETS =
  '/Users/radimventus/.cursor/projects/Users-radimventus-embed-engine/assets';
const FULL = path.join(DOCS, 'client-studio-wireframe-full.png');
const CROP1600 = path.join(DOCS, 'client-studio-wireframe-1600.png');
const PAGE2 = path.join(
  ASSETS,
  'CLIENT_STUDIO_WIREFRAME_2-40212c84-da7c-4022-bcc2-61457b4fc1a2.png',
);

const sha256 = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const b64Full = fs.readFileSync(FULL).toString('base64');
const b64Crop = fs.readFileSync(CROP1600).toString('base64');
const b64Page2 = fs.readFileSync(PAGE2).toString('base64');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const analyze = await page.evaluate(
  async ({ b64Full, b64Crop, b64Page2 }) => {
    const load = (b64) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `data:image/jpeg;base64,${b64}`;
      });

    const full = await load(b64Full);
    const crop = await load(b64Crop);
    const page2 = await load(b64Page2);

    const mk = (img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return { ctx, w: c.width, h: c.height };
    };

    const F = mk(full);
    const C = mk(crop);
    const P2 = mk(page2);

    const px = (ctx, x, y) => ctx.getImageData(x, y, 1, 1).data;
    const isDark = (r, g, b) => r < 75 && g < 95 && b > 85;
    const isWarm = (r, g, b) => r > 198 && g > 178 && b > 115;

    const findCanvasBounds = (ctx, w, h) => {
      let left = 0;
      for (let x = 0; x < w; x++) {
        let lightN = 0;
        for (let y = 50; y < 150; y++) {
          const p = px(ctx, x, y);
          if (!isDark(p[0], p[1], p[2])) lightN++;
        }
        if (lightN > 80) {
          left = x;
          break;
        }
      }
      let right = w - 1;
      for (let x = w - 1; x >= 0; x--) {
        let lightN = 0;
        for (let y = 50; y < 150; y++) {
          const p = px(ctx, x, y);
          if (!isDark(p[0], p[1], p[2])) lightN++;
        }
        if (lightN > 80) {
          right = x;
          break;
        }
      }
      return {
        left,
        right,
        canvasW: right - left + 1,
        leftMargin: left,
        rightMargin: w - 1 - right,
      };
    };

    const findWarmBands = (ctx, x0, x1, h) => {
      const cx = x0 + Math.floor((x1 - x0) / 2);
      const bands = [];
      let mode = null;
      let start = 0;
      for (let y = 0; y < h; y++) {
        const p = px(ctx, cx, y);
        const m = isWarm(p[0], p[1], p[2]) ? 'warm' : 'other';
        if (m !== mode) {
          if (mode === 'warm') bands.push({ y0: start, y1: y - 1, h: y - start });
          mode = m;
          start = y;
        }
      }
      if (mode === 'warm') bands.push({ y0: start, y1: h - 1, h: h - start });
      return bands.filter((b) => b.h >= 8);
    };

    const measureCTA = (ctx, left, right) => {
      let minX = right;
      let maxX = left;
      for (let y = 217; y <= 241; y++) {
        for (let x = left; x < right; x++) {
          const p = px(ctx, x, y);
          if (isWarm(p[0], p[1], p[2])) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
          }
        }
      }
      const btnW = maxX >= minX ? maxX - minX + 1 : 0;
      const btnH = 25;
      return { btnH, btnW, aspect: btnW > 0 ? +(btnW / btnH).toFixed(2) : null };
    };

    const marginsFull = findCanvasBounds(F.ctx, F.w, F.h);
    const marginsCrop = findCanvasBounds(C.ctx, C.w, C.h);
    const marginsPage2 = findCanvasBounds(P2.ctx, P2.w, P2.h);

    const warmBandsFull = findWarmBands(
      F.ctx,
      marginsFull.left,
      marginsFull.right,
      F.h,
    );
    const cta = measureCTA(F.ctx, marginsFull.left, marginsFull.right);

    const sx1432 = 1432 / marginsFull.canvasW;
    const sy2048 = 2048 / F.h;
    const sy3530 = 3530 / F.h;
    const scaleCropW = C.w / marginsFull.canvasW;
    const scaleCropH = C.h / F.h;

    const scaleTests = [
      {
        label: 'wireframe canvas width → Desktop Canvas 1432px',
        sx: sx1432,
        sy: sx1432,
        target: '1432×2736 (uniform width scale)',
      },
      {
        label: 'wireframe canvas width → 1432, file height → 2048 logical',
        sx: sx1432,
        sy: sy2048,
        target: '1432×2048 (CS-12 assumption)',
      },
      {
        label: 'wireframe canvas width → 1432, file height → 3530 render',
        sx: sx1432,
        sy: sy3530,
        target: '1432×3530 (match live render height)',
      },
      {
        label: 'retina 2× file pixels',
        sx: 2,
        sy: 2,
        target: '1072×2048',
      },
    ].map((t) => ({
      ...t,
      anisotropy: Math.abs(t.sx - t.sy),
      uniform: Math.abs(t.sx - t.sy) < 0.001,
    }));

    return {
      dimensions: {
        full: [F.w, F.h],
        crop1600: [C.w, C.h],
        page2: [P2.w, P2.h],
      },
      margins: {
        full: marginsFull,
        crop1600: marginsCrop,
        page2: marginsPage2,
      },
      aspectRatios: {
        fullFile: +(F.w / F.h).toFixed(4),
        cropFile: +(C.w / C.h).toFixed(4),
        page2File: +(P2.w / P2.h).toFixed(4),
        fullCanvas: +(marginsFull.canvasW / F.h).toFixed(4),
        cropCanvas: +(marginsCrop.canvasW / C.h).toFixed(4),
      },
      warmBandsFull: warmBandsFull.slice(0, 10),
      ctaButton: cta,
      scaleTests,
      crossFileScales: {
        cropCanvasW_to_fullCanvasW: scaleCropW,
        cropHeight_to_fullHeight: scaleCropH,
        uniformScalePossible: Math.abs(scaleCropW - scaleCropH) < 0.02,
        note: 'If crop were a uniform-scale derivative of full, width and height ratios would match',
      },
      desktopCanvasMapping: {
        wireframeCanvasPxW: marginsFull.canvasW,
        wireframeFilePxH: F.h,
        uniformScaleTo1432: sx1432,
        scaledHeightIfUniform: Math.round(F.h * sx1432),
        renderCanvasHeight: 3530,
        heightGapIfUniformWidthScale: 3530 - Math.round(F.h * sx1432),
        retina2xCanvasWidth: marginsFull.canvasW * 2,
        retina2xMatches1432: marginsFull.canvasW * 2 === 1432,
      },
    };
  },
  { b64Full, b64Crop, b64Page2 },
);

await browser.close();

const report = {
  sprint: 'CS-14',
  title: 'Wireframe Provenance Audit',
  capturedAt: new Date().toISOString(),
  scope:
    'Validate wireframe PNG as geometric reference artifact. No render comparison.',
  files: {
    full: {
      path: FULL,
      sha256: sha256(FULL),
      bytes: fs.statSync(FULL).size,
      format: 'JPEG/JFIF baseline 8-bit (misnamed .png)',
      pixels: `${analyze.dimensions.full[0]}×${analyze.dimensions.full[1]}`,
      dpi: '72×72 metadata only',
    },
    crop1600: {
      path: CROP1600,
      sha256: sha256(CROP1600),
      bytes: fs.statSync(CROP1600).size,
      format: 'JPEG/JFIF baseline 8-bit (misnamed .png)',
      pixels: `${analyze.dimensions.crop1600[0]}×${analyze.dimensions.crop1600[1]}`,
    },
    page2: {
      path: PAGE2,
      sha256: sha256(PAGE2),
      pixels: `${analyze.dimensions.page2[0]}×${analyze.dimensions.page2[1]}`,
    },
  },
  provenance: {
    authoritative: {
      sourceTool: 'Google Drawings (Google Obrázek) — manually drawn',
      designScale: '1:1 metric — horizontal and vertical proportions match intended page geometry',
      exportChain: 'Google Drawings → PDF → PNG at 1600 px width (uniform resize only, aspect ratio preserved)',
      transformsExcluded: 'No non-uniform stretch, no separate X/Y scaling, no local section deformation',
      referenceViewportPx: 1600,
      declaredIn: 'CS-14 addendum B (2026-07-15)',
    },
    repositoryDelivery: {
      sourceType: 'PNG files delivered via chat upload to repo docs/',
      creationChain: [
        'Google Drawings → PDF → PNG @ 1600 px uniform width',
        'User attached images in Cursor chat (Jul 14, 2026)',
        'Saved to .cursor/projects/.../assets/',
        'Copied to docs/client-studio-wireframe-*.png',
      ],
      identityProof: {
        fullMatchesAsset:
          'docs/client-studio-wireframe-full.png is byte-identical to assets/client-studio-wireaframe-f292aca5-*.png',
        cropMatchesWireframe1:
          'docs/client-studio-wireframe-1600.png is byte-identical to assets/CLIENT_STUDIO_WIREFRAME_1-53b9562e-*.png',
        page2IsSeparateExport: 'CLIENT_STUDIO_WIREFRAME_2 is 1024×1021 — page 2',
      },
      gitHistory: 'Wireframe files untracked in git at time of audit',
    },
  },
  automatedFileInspection: {
    misnamedExtension: 'All reference files use .png extension but contain JPEG data',
    lossyCompression:
      'JPEG baseline encoding — pixels have undergone lossy quantization; grid is not lossless',
    cropResizeResampling: {
      fullVsCrop:
        '557×1024 full-page export vs 1024×1022 page-1 crop — different aspect ratios, incompatible pixel grids',
      cropToFullWidthScale: analyze.crossFileScales.cropCanvasW_to_fullCanvasW,
      cropToFullHeightScale: analyze.crossFileScales.cropHeight_to_fullHeight,
      uniformScaleBetweenFiles: analyze.crossFileScales.uniformScalePossible,
      verdict:
        'Crop is NOT a uniform-scale resample of full wireframe — width scale ~1.91× vs height scale ~1.00×',
    },
    logical2048Claim: {
      filePixelHeight: analyze.dimensions.full[1],
      claimedLogicalHeight: 2048,
      derivation: 'Assumes exactly 2× vertical scale (1024→2048) with no file metadata proof',
      verified: false,
    },
    sideMargins: {
      full: analyze.margins.full,
      crop1600: analyze.margins.crop1600,
      note: 'Full export includes asymmetric viewport chrome (left margin 21px, right 0px)',
    },
  },
  geometricAnalysis: analyze,
  uniformScaleVerdict: {
    note: 'Automated inspection only — superseded by addendum B for reference authority',
    question: 'Can entire wireframe map to Desktop Canvas 1432px with one uniform scale factor?',
    answer: false,
    details: analyze.scaleTests,
    bestUniformWidthScale: analyze.desktopCanvasMapping.uniformScaleTo1432,
    scaledHeightAtUniformWidth: analyze.desktopCanvasMapping.scaledHeightIfUniform,
    anisotropyIfUsing2048LogicalHeight: analyze.scaleTests.find((t) =>
      t.label.includes('2048'),
    ).anisotropy,
    retina2xWidthMismatch:
      '536×2 = 1072 ≠ 1432 — clean 2× retina mapping to implemented canvas width fails by 360px',
    scaleDivergencePoint:
      'Divergence begins at reference selection: full (557×1024) and crop (1024×1022) cannot share one scale factor. Mapping to Desktop Canvas 1432px requires sx≈2.672; mapping to 2048 logical height requires sy=2.0 — anisotropy Δ≈0.672 before any render comparison.',
  },
  internalIsotropy: {
    question: 'Is vertical pixel scale equal to horizontal scale within wireframe-full?',
    withinFilePixels: 'File pixel grid is rectilinear (1 file px = 1 file px in X and Y)',
    designElementCheck: {
      note: 'Sub-pixel element measurement unreliable on JPEG; isotropy assessed via cross-file scale ratios and Desktop Canvas mapping',
    },
    mappingToDesktopCanvas:
      'Mapping wireframe canvas (536px) to implementation (1432px) and wireframe height (1024px) to any single target height (2048 or 3530) requires different scale factors — vertical and horizontal mapping to product coordinates are NOT interchangeable with one factor',
    verdict: 'Wireframe file is internally rectilinear but NOT linearly mappable to Desktop Canvas with uniform scale when height target ≠ width-derived scale',
  },
  addendumB: {
    date: '2026-07-15',
    title: 'Reference wireframe — authoritative provenance',
    declaredBy: 'Product owner',
    workflow: [
      'Wireframe manually drawn in Google Drawings (Google Obrázek)',
      'Full composition at 1:1 metric scale — horizontal and vertical proportions match intended page geometry',
      'Exported to PDF from Google Drawings',
      'PDF converted to PNG at 1600 px width via uniform resize only (aspect ratio preserved)',
      'No non-uniform stretch, no separate X/Y axis scaling, no local section deformation',
    ],
    explicitlyNot: [
      'Screenshot of web render',
      'Arbitrarily cropped PNG',
      'Non-uniformly scaled export',
    ],
    referenceFiles: {
      page1: 'docs/client-studio-wireframe-1600.png',
      fullPage: 'docs/client-studio-wireframe-full.png',
      page2: 'CLIENT_STUDIO_WIREFRAME_2 (assets)',
    },
    referenceViewportPx: 1600,
    authorityModel: {
      designAuthority: 'Wireframe PNG',
      notDesignAuthority: [
        'Current DOM dimensions (offsetHeight, computedHeight)',
        'Tailwind tokens as implemented',
        'CS-13 internal consistency audit alone',
      ],
      domAuditScope:
        'Proves React renders consistently — does not prove correct geometry vs design',
    },
    agentRule:
      'Do not question reference PNG or its scale unless direct proof of reference error exists',
  },
  conclusion: {
    isValidMetricReference: true,
    supersedesAutomatedAudit:
      'CS-14 addendum B (2026-07-15) — product owner documented provenance overrides automated file-inspection findings',
    summary:
      'Reference wireframe is a geometrically valid design authority. Deviations between render and wireframe are implementation defects until proven otherwise.',
    designAuthority: 'Wireframe PNG',
    implementationInvestigationRule:
      'If render ≠ wireframe, root cause is React/Tailwind/layout — not the reference artifact',
  },
  invalidates: {
    'CS-11': {
      status: 'REFERENCE RESTORED',
      note: 'Wireframe valid per addendum B. Partial-crop limitation remains methodological.',
      reports: ['docs/cs-11-pixel-report.json', 'docs/cs-11-overlay*.png'],
    },
    'CS-12': {
      status: 'REFERENCE RESTORED',
      note: 'Wireframe valid per addendum B. Re-validate alignment against 1600 px uniform-scale provenance.',
      reports: [
        'docs/cs-12-pixel-report.json',
        'docs/cs-12-overlay-full.png',
        'docs/cs-12-render-1600.png',
      ],
    },
    'CS-13': {
      status: 'SUPPLEMENTARY ONLY',
      reason:
        'Live DOM audit — internal consistency only, not design correctness vs wireframe',
      reports: ['docs/cs-13-react-geometry.json'],
    },
    CS14automatedConclusion: {
      status: 'SUPERSEDED',
      reason: 'Automated isValidMetricReference:false superseded by addendum B',
    },
  },
};

fs.writeFileSync(
  path.join(DOCS, 'cs-14-wireframe-provenance.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
