import { readFileSync } from 'node:fs';
import fontkit from '@pdf-lib/fontkit';

import { createQrModules } from './pdfPipeline';
import {
  PDFDocument,
  rgb,
  type PDFFont,
} from 'pdf-lib';


export type CanonicalCommercialProforma = {
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

function formatCommercialPilotPriceCzk(
  amountCzk: number,
): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amountCzk);
}

const REALIVIDEO_LOGO_URL = new URL(
  './assets/realivideo/realivideo-logo.jpg',
  import.meta.url,
);

const INTER_REGULAR_URL = new URL(
  './assets/fonts/inter/Inter-Regular.ttf',
  import.meta.url,
);

const INTER_SEMIBOLD_URL = new URL(
  './assets/fonts/inter/Inter-SemiBold.ttf',
  import.meta.url,
);

const INTER_BLACK_URL = new URL(
  './assets/fonts/inter/Inter-Black.woff',
  import.meta.url,
);

type CommercialProformaFonts = {
  readonly regular: Uint8Array;
  readonly semibold: Uint8Array;
  readonly black: Uint8Array;
};

let commercialProformaFontsPromise:
  | Promise<CommercialProformaFonts>
  | null = null;

async function loadCommercialProformaFont(
  url: URL,
): Promise<Uint8Array> {
  if (url.protocol === 'file:') {
    return new Uint8Array(
      readFileSync(url),
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Font load failed: ${response.status}`,
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
        loadCommercialProformaFont(
          INTER_BLACK_URL,
        ),
      ]).then(
        ([regular,semibold,black]) => ({
          regular,
          semibold,
          black,
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

function formatCommercialDateCs(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'cs-CZ',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Prague',
    },
  ).format(date);
}

export async function renderCanonicalCommercialProformaPdf(
  proforma: CanonicalCommercialProforma,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontBytes =
    await loadCommercialProformaFonts();

  const realivideoLogoBytes =
    new Uint8Array(
      readFileSync(
        REALIVIDEO_LOGO_URL,
      ),
    );

  const realivideoLogo =
    await pdf.embedJpg(
      realivideoLogoBytes,
    );

  const regular =
    await pdf.embedFont(
      fontBytes.regular,
    );

  const semibold =
    await pdf.embedFont(
      fontBytes.semibold,
    );

  const black =
    await pdf.embedFont(
      fontBytes.black,
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
    0xff / 255,
    0xc4 / 255,
    0x00 / 255,
  );

  const goldStrong = rgb(
    0xff / 255,
    0xc4 / 255,
    0x00 / 255,
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
  /*
   * REALIVIDEO logo.
   * Preserve canonical header geometry while fitting the
   * supplied horizontal logo inside the former CONIS mark area.
   */
  const realivideoLogoMaxWidth = 122;
  const realivideoLogoMaxHeight = 31;

  const realivideoLogoScale =
    Math.min(
      realivideoLogoMaxWidth /
        realivideoLogo.width,
      realivideoLogoMaxHeight /
        realivideoLogo.height,
    );

  const realivideoLogoWidth =
    realivideoLogo.width *
    realivideoLogoScale;

  const realivideoLogoHeight =
    realivideoLogo.height *
    realivideoLogoScale;

  page.drawImage(
    realivideoLogo,
    {
      x: left,
      y:
        784 +
        (
          realivideoLogoMaxHeight -
          realivideoLogoHeight
        ) / 2,
      width: realivideoLogoWidth,
      height: realivideoLogoHeight,
    },
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
    'Balíček služeb Realivideo',
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
      font: black,
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
    '746 01 Opava',
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
      font: black,
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
    `Balíček služeb Realivideo – ${proforma.packageName}`,
    left + 21,
    506,
    10.8,
    {
      font: semibold,
    },
  );

  text(
    'Rozsah viz balíčky služeb na webu Realivideo.cz',
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

  /*
   * Amount:
   * numeric value stays Inter Black 900.
   * Currency suffix uses the canonical Unicode-safe Inter
   * so the Czech "č" survives every PDF viewer/download.
   */
  const totalAmount =
    pdfPrice(proforma.amountCzk);

  const totalNumber =
    totalAmount.replace(
      /\s*Kč$/,
      '',
    );

  const totalCurrency = ' Kč';

  const totalCurrencyWidth =
    semibold.widthOfTextAtSize(
      totalCurrency,
      27,
    );

  const totalNumberWidth =
    black.widthOfTextAtSize(
      totalNumber,
      27,
    );

  const totalRight =
    right - 18;

  text(
    totalNumber,
    totalRight -
      totalCurrencyWidth -
      totalNumberWidth,
    481,
    27,
    {
      font: black,
      color: goldStrong,
    },
  );

  text(
    totalCurrency,
    totalRight -
      totalCurrencyWidth,
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
  /*
   * Payment QR.
   *
   * Canonical CONIS renderer:
   * render QR modules directly into the PDF.
   *
   * This deliberately avoids raster PNG embedding because
   * the previously working CONIS payment QR used the module
   * authority from Document Runtime.
   */
  const qr =
    createQrModules(
      proforma.qrPayload,
    );

  const qrSize = 92;

  const moduleSize =
    qrSize / qr.size;

  const qrX =
    left +
    tableW +
    payGap +
    (qrW - qrSize) / 2;

  const qrY =
    paymentY + 10;

  /*
   * Explicit white field around the code.
   * The enclosing QR card provides substantially more than
   * four modules of visual quiet area.
   */
  page.drawRectangle({
    x: qrX - 6,
    y: qrY - 6,
    width: qrSize + 12,
    height: qrSize + 12,
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
      const index =
        row * qr.size +
        column;

      if (
        !Boolean(
          qr.data[index]
        )
      ) {
        continue;
      }

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

        width: moduleSize,
        height: moduleSize,
        color: navy,
      });
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
