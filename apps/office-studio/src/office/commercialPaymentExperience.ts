/**
 * PT-CJ-04 — Payment Experience (proforma + SPD QR).
 * Local generation for Commercial Journey — no bank verification · no BA · no SMTP.
 */

import {
  bytesToBase64,
  createQrModules,
} from '@embed-engine/document-runtime';
import fontkit from '@pdf-lib/fontkit';
import {
  PDFDocument,
  rgb,
  type PDFFont,
} from 'pdf-lib';

import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
  type CommercialPilotProgramId,
  type CommercialPilotProgramPackage,
} from './commercialPilotProgramCatalog';
import { getCommercialJourneySelectedProgramId } from './commercialJourneySelection';
import {
  buildCommercialOrderPartnerDetails,
  type CommercialOrderPartnerDetails,
} from './commercialOrderPartnerDetails';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export const COMMERCIAL_PAYMENT_ACCOUNT = Object.freeze({
  accountNumber: '3452548011/3030',
  iban: 'CZ3530300000003452548011',
  bankName: 'Air Bank',
});

export type CommercialProforma = {
  readonly number: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly ico: string;
  readonly dic: string;
  readonly address: string;
  readonly packageName: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly variableSymbol: string;
  readonly accountNumber: string;
  readonly iban: string;
  readonly bankName: string;
  readonly message: string;
  readonly qrPayload: string;
};

export function resolveCommercialJourneyProgram(
  activeCase: PilotWorkspaceCase,
  selectedId: CommercialPilotProgramId | null = getCommercialJourneySelectedProgramId(),
): CommercialPilotProgramPackage | null {
  const id =
    selectedId ?? resolveCommercialPilotProgramId(activeCase.packageName);
  if (id === null) return null;
  return COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === id) ?? null;
}

export function buildCommercialProforma(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly program: CommercialPilotProgramPackage;
  readonly details: CommercialOrderPartnerDetails;
  readonly issuedAt: string;
}): CommercialProforma {
  const issuedAt = input.issuedAt;
  const billingNumber =
    input.activeCase.billingNumber;

  if (
    billingNumber === null ||
    !/^\d{5}$/.test(billingNumber)
  ) {
    throw new Error(
      'Project billing number is not allocated. Generate the first Magic Link for this Project first.',
    );
  }

  const variableSymbol =
    billingNumber;

  const number =
    billingNumber;
  const message =
    `CONIS ${input.program.name} · ${input.activeCase.partnerName}`.slice(
      0,
      60,
    );
  const qrPayload = buildSpdQrPayload({
    iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
    amountCzk: input.program.priceCzk,
    variableSymbol,
    message,
  });

  return {
    number,
    partnerName: input.activeCase.partnerName,
    companyName: input.details.companyName,
    ico: input.details.ico,
    dic: input.details.dic,
    address: input.details.address,
    packageName: input.program.name,
    amountCzk: input.program.priceCzk,
    currency: 'CZK',
    issuedAt,
    dueDate: dueDateFromIssuedAt(issuedAt),
    variableSymbol,
    accountNumber: COMMERCIAL_PAYMENT_ACCOUNT.accountNumber,
    iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
    bankName: COMMERCIAL_PAYMENT_ACCOUNT.bankName,
    message,
    qrPayload,
  };
}

export function buildCommercialProformaForCase(
  activeCase: PilotWorkspaceCase,
): CommercialProforma | null {
  const program = resolveCommercialJourneyProgram(activeCase);
  if (program === null) return null;
  const details = buildCommercialOrderPartnerDetails(activeCase);
  const issuedAt =
    activeCase.commercialProgramSelectedAt;

  if (issuedAt === null) {
    throw new Error(
      'Commercial program selection is not persisted for this Project.',
    );
  }

  return buildCommercialProforma({
    activeCase,
    program,
    details,
    issuedAt,
  });
}

export function buildSpdQrPayload(input: {
  readonly iban: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly message: string;
}): string {
  const amount = input.amountCzk.toFixed(2);
  const msg = input.message.replace(/[\r\n*]/g, ' ').slice(0, 60);
  return [
    'SPD*1.0',
    `ACC:${input.iban}`,
    `AM:${amount}`,
    'CC:CZK',
    `X-VS:${input.variableSymbol}`,
    `MSG:${msg}`,
  ].join('*');
}

const INTER_REGULAR_URL = new URL(
  './assets/fonts/inter/Inter-Regular.ttf',
  import.meta.url,
);

const INTER_SEMIBOLD_URL = new URL(
  './assets/fonts/inter/Inter-SemiBold.ttf',
  import.meta.url,
);

type CommercialProformaFonts = {
  readonly regular: Uint8Array;
  readonly semibold: Uint8Array;
};

let commercialProformaFontsPromise:
  | Promise<CommercialProformaFonts>
  | null = null;

async function loadCommercialProformaFont(
  url: URL,
): Promise<Uint8Array> {
  if (url.protocol === 'file:') {
    const moduleName = 'node:fs/promises';
    const fs = await import(
      /* @vite-ignore */ moduleName
    );

    const bytes =
      await fs.readFile(url);

    return new Uint8Array(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `PDF font HTTP ${response.status}`,
    );
  }

  return new Uint8Array(
    await response.arrayBuffer(),
  );
}

function loadCommercialProformaFonts():
  Promise<CommercialProformaFonts> {
  if (
    commercialProformaFontsPromise === null
  ) {
    commercialProformaFontsPromise =
      Promise.all([
        loadCommercialProformaFont(
          INTER_REGULAR_URL,
        ),
        loadCommercialProformaFont(
          INTER_SEMIBOLD_URL,
        ),
      ]).then(
        ([regular,semibold]) => ({
          regular,
          semibold,
        }),
      );
  }

  return commercialProformaFontsPromise;
}

function fitPdfText(
  font: PDFFont,
  value: string,
  preferred: number,
  maxWidth: number,
  minimum = 7,
): number {
  let size=preferred;

  while (
    size > minimum &&
    font.widthOfTextAtSize(
      value,
      size,
    ) > maxWidth
  ) {
    size -= 0.25;
  }

  return size;
}

function pdfPrice(
  amountCzk: number,
): string {
  return formatCommercialPilotPriceCzk(
    amountCzk,
  ).replace(
    /[\u00a0\u202f]/g,
    ' ',
  );
}

export async function renderCommercialProformaPdf(
  proforma: CommercialProforma,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontBytes =
    await loadCommercialProformaFonts();

  const regular =
    await pdf.embedFont(
      fontBytes.regular,
    );

  const semibold =
    await pdf.embedFont(
      fontBytes.semibold,
    );

  const page = pdf.addPage([
    595.28,
    841.89,
  ]);

  const { width } = page.getSize();

  const navy = rgb(
    0x00 / 255,
    0x19 / 255,
    0x30 / 255,
  );

  const gold = rgb(
    0xc8 / 255,
    0xa1 / 255,
    0x65 / 255,
  );

  const goldStrong = rgb(
    0xb8 / 255,
    0x92 / 255,
    0x2d / 255,
  );

  const warm = rgb(
    0xf7 / 255,
    0xf6 / 255,
    0xf4 / 255,
  );

  const soft = rgb(
    0xfa / 255,
    0xfa / 255,
    0xfa / 255,
  );

  const line = rgb(
    0xe3 / 255,
    0xe3 / 255,
    0xe3 / 255,
  );

  const muted = rgb(
    0x69 / 255,
    0x76 / 255,
    0x86 / 255,
  );

  const green = rgb(
    0x18 / 255,
    0x9b / 255,
    0x58 / 255,
  );

  const white = rgb(1, 1, 1);

  const left = 45;
  const right = width - 45;
  const contentWidth = right - left;

  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    options: {
      font?: typeof regular;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) => {
    page.drawText(value, {
      x,
      y,
      size,
      font: options.font ?? regular,
      color: options.color ?? navy,
    });
  };

  const rightText = (
    value: string,
    rightX: number,
    y: number,
    size: number,
    options: {
      font?: typeof regular;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) => {
    const font =
      options.font ?? regular;

    text(
      value,
      rightX -
        font.widthOfTextAtSize(
          value,
          size,
        ),
      y,
      size,
      {
        font,
        color: options.color,
      },
    );
  };

  const box = (
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number,
    options: {
      fill?: ReturnType<typeof rgb>;
      border?: ReturnType<typeof rgb>;
      borderWidth?: number;
      radius?: number;
    } = {},
  ) => {
    const fill =
      options.fill ?? white;
    const border =
      options.border ?? line;
    const borderWidth =
      options.borderWidth ?? 0.7;
    const radius =
      Math.min(
        options.radius ?? 5.5,
        boxWidth / 2,
        boxHeight / 2,
      );

    const roundedFill = (
      shapeX: number,
      shapeY: number,
      shapeWidth: number,
      shapeHeight: number,
      shapeRadius: number,
      color: ReturnType<typeof rgb>,
    ) => {
      if (
        shapeWidth <= 0 ||
        shapeHeight <= 0
      ) {
        return;
      }

      const safeRadius =
        Math.max(
          0,
          Math.min(
            shapeRadius,
            shapeWidth / 2,
            shapeHeight / 2,
          ),
        );

      if (safeRadius === 0) {
        page.drawRectangle({
          x: shapeX,
          y: shapeY,
          width: shapeWidth,
          height: shapeHeight,
          color,
        });
        return;
      }

      page.drawRectangle({
        x: shapeX + safeRadius,
        y: shapeY,
        width:
          shapeWidth -
          safeRadius * 2,
        height: shapeHeight,
        color,
      });

      page.drawRectangle({
        x: shapeX,
        y: shapeY + safeRadius,
        width: shapeWidth,
        height:
          shapeHeight -
          safeRadius * 2,
        color,
      });

      const corners = [
        [
          shapeX + safeRadius,
          shapeY + safeRadius,
        ],
        [
          shapeX +
            shapeWidth -
            safeRadius,
          shapeY + safeRadius,
        ],
        [
          shapeX + safeRadius,
          shapeY +
            shapeHeight -
            safeRadius,
        ],
        [
          shapeX +
            shapeWidth -
            safeRadius,
          shapeY +
            shapeHeight -
            safeRadius,
        ],
      ] as const;

      corners.forEach(
        ([centerX, centerY]) => {
          page.drawCircle({
            x: centerX,
            y: centerY,
            size: safeRadius,
            color,
          });
        },
      );
    };

    roundedFill(
      x,
      y,
      boxWidth,
      boxHeight,
      radius,
      border,
    );

    const inset =
      Math.max(
        0,
        borderWidth,
      );

    roundedFill(
      x + inset,
      y + inset,
      boxWidth - inset * 2,
      boxHeight - inset * 2,
      Math.max(
        0,
        radius - inset,
      ),
      fill,
    );
  };

  /*
   * HEADER — larger and denser like approved design.
   */
  const conisLogoSize = 27;

  const logoCon = 'CON';
  const logoI = 'I';
  const logoS = 'S';

  text(
    logoCon,
    left,
    786,
    conisLogoSize,
    { font: semibold },
  );

  const logoConWidth =
    semibold.widthOfTextAtSize(
      logoCon,
      conisLogoSize,
    );

  text(
    logoI,
    left + logoConWidth,
    786,
    conisLogoSize,
    {
      font: semibold,
      color: gold,
    },
  );

  const logoIWidth =
    semibold.widthOfTextAtSize(
      logoI,
      conisLogoSize,
    );

  text(
    logoS,
    left +
      logoConWidth +
      logoIWidth,
    786,
    conisLogoSize,
    { font: semibold },
  );

  box(
    right - 121,
    782,
    121,
    25,
    {
      fill: warm,
      border: gold,
      borderWidth: 0.8,
      radius: 3.5,
    },
  );

  text(
    'VÝZVA K ÚHRADĚ',
    right - 106,
    791,
    8.3,
    {
      font: semibold,
    },
  );

  rightText(
    `proforma faktura č. ${proforma.number}`,
    right,
    768,
    7.6,
    {
      font: semibold,
      color: muted,
    },
  );

  page.drawLine({
    start: {
      x: left,
      y: 750,
    },
    end: {
      x: right,
      y: 750,
    },
    thickness: 1.5,
    color: navy,
  });

  /*
   * HERO
   */
  text(
    'Pilotní nasazení platformy CONIS',
    left,
    718,
    22.5,
    {
      font: semibold,
    },
  );

  text(
    'Děkujeme za projevenou důvěru. Úhradou zahajujeme pilotní spolupráci.',
    left,
    700,
    8.7,
    {
      color: muted,
    },
  );

  /*
   * COMPANY CARDS
   */
  const cardY = 563;
  const cardH = 113;
  const gap = 15;
  const cardW =
    (contentWidth - gap) / 2;

  box(
    left,
    cardY,
    cardW,
    cardH,
    {
      fill: soft,
      border: line,
    },
  );

  box(
    left + cardW + gap,
    cardY,
    cardW,
    cardH,
    {
      fill: soft,
      border: line,
    },
  );

  text(
    'DODAVATEL',
    left + 15,
    cardY + 91,
    7.2,
    {
      font: semibold,
      color: goldStrong,
    },
  );

  text(
    'Radim Věntus',
    left + 15,
    cardY + 70,
    10.6,
    {
      font: semibold,
    },
  );

  text(
    'Stratilova 2',
    left + 15,
    cardY + 52,
    8.2,
  );

  text(
    '747 19 Bohuslavice',
    left + 15,
    cardY + 40,
    8.2,
  );

  text(
    'Česká republika',
    left + 15,
    cardY + 28,
    8.2,
  );

  text(
    'IČO: 62288474',
    left + 119,
    cardY + 52,
    7.4,
    {
      color: muted,
    },
  );

  text(
    'Neplátce DPH',
    left + 119,
    cardY + 27,
    7.4,
    {
      color: muted,
    },
  );

  const partnerX =
    left + cardW + gap + 15;

  text(
    'PARTNER',
    partnerX,
    cardY + 91,
    7.2,
    {
      font: semibold,
      color: goldStrong,
    },
  );

  const partnerCompanyNameSize =
    fitPdfText(
      semibold,
      proforma.companyName,
      10.6,
      cardW - 30,
    );

  text(
    proforma.companyName,
    partnerX,
    cardY + 70,
    partnerCompanyNameSize,
    {
      font: semibold,
    },
  );

  if (proforma.address) {
    text(
      proforma.address,
      partnerX,
      cardY + 50,
      8.2,
    );
  }

  if (
    proforma.ico ||
    proforma.dic
  ) {
    page.drawLine({
      start: {
        x: partnerX,
        y: cardY + 17,
      },
      end: {
        x:
          left +
          cardW * 2 +
          gap -
          15,
        y: cardY + 17,
      },
      thickness: 0.45,
      color: line,
    });
  }

  if (proforma.ico) {
    text(
      `IČO: ${proforma.ico}`,
      partnerX,
      cardY + 5,
      7.5,
      {
        color: muted,
      },
    );
  }

  if (proforma.dic) {
    text(
      `DIČ: ${proforma.dic}`,
      partnerX + 90,
      cardY + 5,
      7.5,
      {
        color: muted,
      },
    );
  }

  /*
   * PRICE HERO
   */
  text(
    'PŘEDMĚT PLNĚNÍ A CENA',
    left,
    550,
    7.5,
    {
      font: semibold,
    },
  );

  box(
    left,
    470,
    contentWidth,
    65,
    {
      fill: white,
      border: line,
    },
  );

  page.drawRectangle({
    x: left,
    y: 470,
    width: 5,
    height: 65,
    color: goldStrong,
  });

  text(
    `Pilotní nasazení platformy CONIS — ${proforma.packageName}`,
    left + 21,
    506,
    10.8,
    {
      font: semibold,
    },
  );

  text(
    'První 3 měsíce provozu jsou v ceně Pilotu.',
    left + 21,
    486,
    8.2,
    {
      color: muted,
    },
  );

  rightText(
    'CELKEM K ÚHRADĚ',
    right - 18,
    512,
    6.9,
    {
      font: semibold,
      color: muted,
    },
  );

  rightText(
    pdfPrice(proforma.amountCzk),
    right - 18,
    481,
    27,
    {
      font: semibold,
      color: goldStrong,
    },
  );

  /*
   * PAYMENT
   */
  text(
    'PLATEBNÍ ÚDAJE',
    left,
    443,
    7.5,
    {
      font: semibold,
    },
  );

  const paymentY = 316;
  const paymentH = 111;
  const qrW = 158;
  const payGap = 14;
  const tableW =
    contentWidth - qrW - payGap;

  box(
    left,
    paymentY,
    tableW,
    paymentH,
    {
      fill: white,
      border: line,
    },
  );

  box(
    left + tableW + payGap,
    paymentY,
    qrW,
    paymentH,
    {
      fill: white,
      border: line,
    },
  );

  const labelX = left + 15;
  const valueRight =
    left + tableW - 15;

  const rows = [
    [
      'Bankovní účet:',
      proforma.accountNumber,
    ],
    [
      'IBAN:',
      proforma.iban,
    ],
    [
      'Variabilní symbol:',
      proforma.variableSymbol,
    ],
    [
      'Částka k úhradě:',
      formatCommercialPilotPriceCzk(
        proforma.amountCzk,
      ),
    ],
    [
      'Splatnost:',
      formatCommercialDateCs(
        proforma.dueDate,
      ),
    ],
    [
      'Způsob úhrady:',
      'Převodem / QR platba',
    ],
  ] as const;

  rows.forEach(
    ([label, value], index) => {
      const y =
        paymentY +
        paymentH -
        18 -
        index * 16;

      text(
        label,
        labelX,
        y,
        7.7,
        {
          color: muted,
        },
      );

      rightText(
        value,
        valueRight,
        y,
        8,
        {
          font: semibold,
        },
      );
    },
  );

  /*
   * ACTUAL SPD QR — larger and navy.
   */
  const qr = createQrModules(
    proforma.qrPayload,
  );

  const qrSize = 79;
  const moduleSize =
    qrSize / qr.size;

  const qrX =
    left +
    tableW +
    payGap +
    (qrW - qrSize) / 2;

  const qrY =
    paymentY + 20;

  page.drawRectangle({
    x: qrX - 5,
    y: qrY - 5,
    width: qrSize + 10,
    height: qrSize + 10,
    color: white,
  });

  for (
    let row = 0;
    row < qr.size;
    row += 1
  ) {
    for (
      let column = 0;
      column < qr.size;
      column += 1
    ) {
      if (
        qr.data[
          row * qr.size + column
        ]
      ) {
        page.drawRectangle({
          x:
            qrX +
            column * moduleSize,
          y:
            qrY +
            (
              qr.size -
              row -
              1
            ) *
              moduleSize,
          width:
            moduleSize + 0.04,
          height:
            moduleSize + 0.04,
          color: navy,
        });
      }
    }
  }

  const qrLabel = 'QR PLATBA';
  const qrLabelWidth =
    semibold.widthOfTextAtSize(
      qrLabel,
      6.7,
    );

  text(
    qrLabel,
    left +
      tableW +
      payGap +
      (qrW - qrLabelWidth) / 2,
    paymentY + 7,
    6.7,
    {
      font: semibold,
    },
  );

  /*
   * NEXT STEP — proposal-like two-column composition,
   * but only truthful current process.
   */
  box(
    left,
    202,
    contentWidth,
    94,
    {
      fill: warm,
      border: gold,
      borderWidth: 0.8,
    },
  );

  text(
    'Další postup',
    left + 17,
    273,
    9.4,
    {
      font: semibold,
    },
  );

  const step = (
    x: number,
    y: number,
    value: string,
    bold = false,
  ) => {
    text(
      '✓',
      x,
      y,
      9.5,
      {
        font: semibold,
        color: green,
      },
    );

    text(
      value,
      x + 15,
      y,
      7.8,
      {
        font:
          bold
            ? semibold
            : regular,
      },
    );
  };

  step(
    left + 17,
    244,
    'Uhraďte proforma fakturu',
    true,
  );

  text(
    'Převodem nebo QR platbou.',
    left + 32,
    226,
    7.4,
    {
      color: muted,
    },
  );

  step(
    left + 274,
    244,
    'Po ověření platby',
    true,
  );

  text(
    'Pošleme vám instrukce k podkladům.',
    left + 289,
    226,
    7.4,
    {
      color: muted,
    },
  );

  /*
   * LEGAL + FOOTER
   */
  text(
    'Tato výzva k úhradě (proforma faktura) není daňovým dokladem.',
    left,
    169,
    6.8,
    {
      color: muted,
    },
  );

  page.drawLine({
    start: {
      x: left,
      y: 136,
    },
    end: {
      x: right,
      y: 136,
    },
    thickness: 0.6,
    color: line,
  });

  text(
    'CONIS',
    left,
    113,
    7.6,
    {
      font: semibold,
    },
  );

  text(
    '• inteligentní vrstva pro web, která zvyšuje konverzi.',
    left + 38,
    113,
    6.5,
    {
      color: muted,
    },
  );

  rightText(
    proforma.number,
    right,
    113,
    6.5,
    {
      color: muted,
    },
  );

  return pdf.save();
}

export async function commercialProformaPdfObjectUrl(
  proforma: CommercialProforma,
): Promise<string> {
  const bytes=
    await renderCommercialProformaPdf(
      proforma,
    );

  const copy=
    new Uint8Array(
      bytes.byteLength,
    );

  copy.set(bytes);

  const blob=
    new Blob(
      [copy],
      {
        type:'application/pdf',
      },
    );

  return URL.createObjectURL(
    blob,
  );
}

export async function commercialProformaPdfDataUrl(
  proforma: CommercialProforma,
): Promise<string> {
  const bytes=
    await renderCommercialProformaPdf(
      proforma,
    );

  return (
    'data:application/pdf;base64,'+
    bytesToBase64(bytes)
  );
}

export function downloadCommercialProformaPdf(
  proforma: CommercialProforma,
): void {
  void commercialProformaPdfObjectUrl(
    proforma,
  )
    .then((href) => {
      const anchor=
        document.createElement(
          'a',
        );

      anchor.href=href;
      anchor.download=
        `${proforma.number}.pdf`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();
      anchor.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            href,
          );
        },
        5_000,
      );
    })
    .catch(
      (error:unknown) => {
        console.error(
          'CONIS proforma download failed',
          error,
        );
      },
    );
}

export function openCommercialProformaPdf(
  proforma: CommercialProforma,
): void {
  // Open first, while still in the click event,
  // otherwise popup blockers can reject async PDF generation.
  const popup=
    window.open(
      'about:blank',
      '_blank',
    );

  if (popup !== null) {
    popup.opener=null;
    popup.document.title=
      'Připravuji PDF…';
  }

  void commercialProformaPdfObjectUrl(
    proforma,
  )
    .then((href) => {
      if (popup !== null) {
        popup.location.replace(
          href,
        );
        return;
      }

      window.open(
        href,
        '_blank',
        'noopener,noreferrer',
      );
    })
    .catch(
      (error:unknown) => {
        if (popup !== null) {
          popup.close();
        }

        console.error(
          'CONIS proforma open failed',
          error,
        );
      },
    );
}

export function formatCommercialDateCs(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}


function dueDateFromIssuedAt(issuedAt: string, days = 3): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
