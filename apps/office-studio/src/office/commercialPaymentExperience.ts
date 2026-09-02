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
  readonly issuedAt?: string;
}): CommercialProforma {
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const variableSymbol = variableSymbolFromCaseId(input.activeCase.id);
  const number = `PF-2026-${variableSymbol.slice(-8).padStart(8, '0')}`;
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
  return buildCommercialProforma({ activeCase, program, details });
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
  const fontBytes =
    await loadCommercialProformaFonts();

  const pdf =
    await PDFDocument.create();

  pdf.registerFontkit(fontkit);

  const regular =
    await pdf.embedFont(
      fontBytes.regular,
    );

  const semibold =
    await pdf.embedFont(
      fontBytes.semibold,
    );

  pdf.setTitle(
    `CONIS — Výzva k úhradě ${proforma.number}`,
  );

  pdf.setAuthor(
    'Radim Věntus / CONIS',
  );

  pdf.setSubject(
    'Výzva k úhradě / proforma faktura',
  );

  pdf.setCreator('CONIS');

  const page =
    pdf.addPage([595,842]);

  const navy=rgb(
    23/255,
    50/255,
    77/255,
  );

  const gold=rgb(
    199/255,
    154/255,
    43/255,
  );

  const muted=rgb(
    100/255,
    116/255,
    139/255,
  );

  const line=rgb(
    226/255,
    232/255,
    240/255,
  );

  const card=rgb(
    248/255,
    250/255,
    252/255,
  );

  const goldSubtle=rgb(
    252/255,
    248/255,
    238/255,
  );

  const white=rgb(1,1,1);
  const black=rgb(0,0,0);

  page.drawRectangle({
    x:0,
    y:0,
    width:595,
    height:842,
    color:white,
  });

  const text=(
    value:string,
    x:number,
    y:number,
    size:number,
    font:PDFFont=regular,
    color=navy,
  ):void => {
    page.drawText(
      value,
      {
        x,
        y,
        size,
        font,
        color,
      },
    );
  };

  const fitted=(
    value:string,
    x:number,
    y:number,
    size:number,
    maxWidth:number,
    font:PDFFont=regular,
    color=navy,
  ):void => {
    text(
      value,
      x,
      y,
      fitPdfText(
        font,
        value,
        size,
        maxWidth,
      ),
      font,
      color,
    );
  };

  const rule=(
    y:number,
    thickness=0.7,
  ):void => {
    page.drawLine({
      start:{x:42,y},
      end:{x:553,y},
      thickness,
      color:line,
    });
  };

  // HEADER — according to approved invoice design
  text(
    'CONIS',
    42,
    790,
    26,
    semibold,
  );

  text(
    'SMART WEB CONVERSION LAYER',
    42,
    774,
    6.5,
    semibold,
    muted,
  );

  page.drawRectangle({
    x:390,
    y:785,
    width:163,
    height:24,
    color:goldSubtle,
    borderColor:gold,
    borderWidth:0.7,
  });

  text(
    'VÝZVA K ÚHRADĚ',
    406,
    793,
    9,
    semibold,
    navy,
  );

  fitted(
    `proforma faktura č. ${proforma.number}`,
    390,
    768,
    8,
    163,
    semibold,
    muted,
  );

  page.drawLine({
    start:{x:42,y:748},
    end:{x:553,y:748},
    thickness:1.4,
    color:navy,
  });

  // INTRO
  text(
    'Pilotní nasazení platformy CONIS',
    42,
    712,
    20,
    semibold,
    navy,
  );

  text(
    'Děkujeme za projevenou důvěru. Úhradou zahajujeme pilotní spolupráci.',
    42,
    691,
    8.5,
    regular,
    muted,
  );

  // PARTY CARDS
  page.drawRectangle({
    x:42,
    y:552,
    width:247,
    height:116,
    color:card,
    borderColor:line,
    borderWidth:0.7,
  });

  page.drawRectangle({
    x:306,
    y:552,
    width:247,
    height:116,
    color:card,
    borderColor:line,
    borderWidth:0.7,
  });

  text(
    'DODAVATEL',
    56,
    646,
    7,
    semibold,
    gold,
  );

  text(
    'Radim Věntus',
    56,
    625,
    10.5,
    semibold,
  );

  text(
    'Poštovní 115',
    56,
    606,
    8,
  );

  text(
    '747 19 Bohuslavice',
    56,
    592,
    8,
  );

  text(
    'Česká republika',
    56,
    578,
    8,
  );

  text(
    'IČO: 62288474 · Neplátce DPH',
    56,
    560,
    7.5,
    regular,
    muted,
  );

  text(
    'PARTNER',
    320,
    646,
    7,
    semibold,
    gold,
  );

  fitted(
    proforma.companyName,
    320,
    625,
    10.5,
    219,
    semibold,
  );

  fitted(
    proforma.address.length > 0
      ? proforma.address
      : 'Adresa neuvedena',
    320,
    604,
    8,
    219,
  );

  text(
    `IČO: ${proforma.ico || 'neuvedeno'}`,
    320,
    580,
    7.5,
    regular,
    muted,
  );

  if (proforma.dic.length > 0) {
    text(
      `DIČ: ${proforma.dic}`,
      320,
      564,
      7.5,
      regular,
      muted,
    );
  }

  // SUBJECT / PRICE HERO
  text(
    'PŘEDMĚT PLNĚNÍ A CENA',
    42,
    522,
    7,
    semibold,
    navy,
  );

  page.drawRectangle({
    x:42,
    y:442,
    width:511,
    height:64,
    color:white,
    borderColor:line,
    borderWidth:0.7,
  });

  page.drawRectangle({
    x:42,
    y:442,
    width:5,
    height:64,
    color:gold,
  });

  fitted(
    `Pilotní nasazení platformy CONIS — ${proforma.packageName}`,
    61,
    479,
    10.5,
    280,
    semibold,
  );

  text(
    'První 3 měsíce provozu jsou v ceně Pilotu.',
    61,
    458,
    7.5,
    regular,
    muted,
  );

  text(
    'CELKEM K ÚHRADĚ',
    410,
    485,
    6.5,
    semibold,
    muted,
  );

  const amount=
    pdfPrice(
      proforma.amountCzk,
    );

  const amountSize=19;

  const amountWidth=
    semibold.widthOfTextAtSize(
      amount,
      amountSize,
    );

  text(
    amount,
    535-amountWidth,
    458,
    amountSize,
    semibold,
    gold,
  );

  // PAYMENT GRID
  text(
    'PLATEBNÍ ÚDAJE',
    42,
    412,
    7,
    semibold,
    navy,
  );

  page.drawRectangle({
    x:42,
    y:272,
    width:329,
    height:124,
    color:white,
    borderColor:line,
    borderWidth:0.7,
  });

  const payLabelX=58;
  const payValueX=177;

  const paymentRows:[
    string,
    string
  ][]=[
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
      amount,
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
  ];

  let rowY=376;

  for (
    const [label,value]
    of paymentRows
  ) {
    text(
      label,
      payLabelX,
      rowY,
      7.5,
      regular,
      muted,
    );

    fitted(
      value,
      payValueX,
      rowY,
      8,
      176,
      semibold,
      navy,
    );

    rowY-=18;
  }

  // REAL SPD QR
  page.drawRectangle({
    x:388,
    y:272,
    width:165,
    height:124,
    color:white,
    borderColor:line,
    borderWidth:0.7,
  });

  const qr=
    createQrModules(
      proforma.qrPayload,
    );

  const qrSize=92;
  const qrX=424;
  const qrY=292;
  const moduleSize=
    qrSize/qr.size;

  for (
    let row=0;
    row<qr.size;
    row+=1
  ) {
    for (
      let column=0;
      column<qr.size;
      column+=1
    ) {
      const index=
        row*qr.size+
        column;

      if (!Boolean(
        qr.data[index]
      )) {
        continue;
      }

      page.drawRectangle({
        x:
          qrX+
          column*moduleSize,
        y:
          qrY+
          (
            qr.size-
            row-
            1
          )*moduleSize,
        width:
          moduleSize+0.03,
        height:
          moduleSize+0.03,
        color:black,
      });
    }
  }

  text(
    'QR PLATBA',
    443,
    280,
    6.5,
    semibold,
    navy,
  );

  // NEXT STEP — design authority, adapted
  page.drawRectangle({
    x:42,
    y:174,
    width:511,
    height:76,
    color:goldSubtle,
    borderColor:gold,
    borderWidth:0.5,
  });

  text(
    'DALŠÍ POSTUP',
    58,
    229,
    7,
    semibold,
    navy,
  );

  text(
    '✓ Uhraďte proforma fakturu převodem nebo QR platbou.',
    58,
    208,
    8,
    regular,
    navy,
  );

  text(
    '✓ Po ověření platby vám pošleme instrukce k podkladům.',
    58,
    191,
    8,
    regular,
    navy,
  );

  // LEGAL
  text(
    'Tato výzva k úhradě (proforma faktura) není daňovým dokladem.',
    42,
    142,
    7,
    regular,
    muted,
  );

  rule(105);

  // FOOTER
  text(
    'CONIS',
    42,
    78,
    7.5,
    semibold,
    navy,
  );

  text(
    'inteligentní vrstva pro web, která zvyšuje konverzi.',
    79,
    78,
    6.5,
    regular,
    muted,
  );

  const footerNumber=
    proforma.number;

  const footerWidth=
    regular.widthOfTextAtSize(
      footerNumber,
      6.5,
    );

  text(
    footerNumber,
    553-footerWidth,
    78,
    6.5,
    regular,
    muted,
  );

  const bytes=
    await pdf.save();

  return new Uint8Array(
    bytes,
  );
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

function variableSymbolFromCaseId(caseId: string): string {
  const digits = caseId.replace(/\D/g, '');

  if (digits.length >= 6) {
    return digits.slice(-10);
  }

  let hash = 0x811c9dc5;

  for (let index = 0; index < caseId.length; index += 1) {
    hash ^= caseId.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return String(hash);
}

function dueDateFromIssuedAt(issuedAt: string, days = 14): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
