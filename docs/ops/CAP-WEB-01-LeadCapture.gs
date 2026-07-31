/**
 * CONIS Quiz Lead Capture — Google Apps Script (CAP-WEB-01)
 *
 * Deploy:
 * 1. Create a Google Sheet; copy its Spreadsheet ID.
 * 2. Extensions → Apps Script → paste this file.
 * 3. Project Settings → Script properties:
 *      SPREADSHEET_ID   = <sheet id>
 *      NOTIFICATION_EMAIL = kontakt@conis.cz
 *      SHEET_NAME       = Leads   (optional, default Leads)
 * 4. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the Web App URL into conis-web meta `conis-lead-endpoint`
 *    (and docs/index.html for production Pages).
 *
 * Frontend POSTs JSON as text/plain (avoids CORS preflight).
 * This script appends one sheet row and sends a notification email.
 */

var QUESTION_TITLES = [
  "Kolik domů ročně prodáváte?",
  "Máte vlastní obchodní tým?",
  "Kolik lidí měsíčně navštíví váš web?",
  "Co je pro vás důležitější?",
  "Jste připraveni začít pilotem?",
];

var FIXED_HEADERS = [
  "Lead ID",
  "Datum a čas",
  "Jméno",
  "Firma",
  "E-mail",
  "Telefon",
].concat(QUESTION_TITLES).concat([
  "Skóre",
  "Segment",
  "Doporučení",
  "URL",
  "Referrer",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "Session ID",
  "JSON Payload",
]);

function doGet() {
  return jsonResponse_({ ok: true, service: "conis-lead-capture" });
}

function doPost(e) {
  try {
    var raw =
      e && e.postData && typeof e.postData.contents === "string"
        ? e.postData.contents
        : "";
    if (!raw) {
      return jsonResponse_({ ok: false, error: "Empty body" }, 400);
    }

    var payload = JSON.parse(raw);
    var result = processLead_(payload);
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_(
      { ok: false, error: String(err && err.message ? err.message : err) },
      500,
    );
  }
}

function processLead_(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Neplatný payload.");
  }

  var name = String(payload.name || "").trim();
  var company = String(payload.company || "").trim();
  var email = String(payload.email || "").trim();
  var phone = String(payload.phone || "").trim();

  if (!name || !company || !email) {
    throw new Error("Vyplňte jméno, firmu a e-mail.");
  }

  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  var notificationEmail =
    props.getProperty("NOTIFICATION_EMAIL") || "kontakt@conis.cz";
  var sheetName = props.getProperty("SHEET_NAME") || "Leads";

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID není nastaveno ve Script properties.");
  }

  var answersByTitle =
    payload.answersByTitle && typeof payload.answersByTitle === "object"
      ? payload.answersByTitle
      : {};

  var leadId = String(payload.leadId || Utilities.getUuid());
  var timestamp = String(payload.timestamp || new Date().toISOString());
  var score = String(payload.score || "");
  var segment = String(payload.segment || payload.status || "");
  var recommendation = String(payload.recommendation || "");
  var pageUrl = String(payload.url || "");
  var referrer = String(payload.referrer || "");
  var utmSource = String(payload.utmSource || "");
  var utmMedium = String(payload.utmMedium || "");
  var utmCampaign = String(payload.utmCampaign || "");
  var sessionId = String(payload.sessionId || "");

  var row = [
    leadId,
    timestamp,
    name,
    company,
    email,
    phone,
  ];

  for (var i = 0; i < QUESTION_TITLES.length; i++) {
    var title = QUESTION_TITLES[i];
    row.push(String(answersByTitle[title] || ""));
  }

  row.push(
    score,
    segment,
    recommendation,
    pageUrl,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    sessionId,
    JSON.stringify(payload),
  );

  var sheet = ensureSheet_(spreadsheetId, sheetName);
  sheet.appendRow(row);

  sendNotificationEmail_(notificationEmail, {
    leadId: leadId,
    timestamp: timestamp,
    name: name,
    company: company,
    email: email,
    phone: phone,
    score: score,
    segment: segment,
    recommendation: recommendation,
    answersByTitle: answersByTitle,
    pageUrl: pageUrl,
    sessionId: sessionId,
  });

  return { ok: true, leadId: leadId };
}

function ensureSheet_(spreadsheetId, sheetName) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(FIXED_HEADERS);
    sheet.setFrozenRows(1);
  } else {
    var existing = sheet.getRange(1, 1, 1, FIXED_HEADERS.length).getValues()[0];
    var mismatch = false;
    for (var i = 0; i < FIXED_HEADERS.length; i++) {
      if (String(existing[i] || "") !== FIXED_HEADERS[i]) {
        mismatch = true;
        break;
      }
    }
    if (mismatch) {
      sheet.getRange(1, 1, 1, FIXED_HEADERS.length).setValues([FIXED_HEADERS]);
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function sendNotificationEmail_(to, data) {
  var answerLines = [];
  for (var i = 0; i < QUESTION_TITLES.length; i++) {
    var title = QUESTION_TITLES[i];
    answerLines.push(title + ": " + (data.answersByTitle[title] || "—"));
  }

  var body = [
    "Nová kvalifikace CONIS",
    "",
    "Lead ID: " + data.leadId,
    "Datum: " + data.timestamp,
    "",
    "Kontakt",
    "Jméno: " + data.name,
    "Firma: " + data.company,
    "E-mail: " + data.email,
    "Telefon: " + (data.phone || "—"),
    "",
    "Vyhodnocení",
    "Skóre: " + (data.score || "—"),
    "Segment: " + (data.segment || "—"),
    "Doporučení: " + (data.recommendation || "—"),
    "",
    "Odpovědi z kvízu",
    answerLines.join("\n"),
    "",
    "URL: " + (data.pageUrl || "—"),
    "Session ID: " + (data.sessionId || "—"),
  ].join("\n");

  MailApp.sendEmail({
    to: to,
    subject: "Nová kvalifikace CONIS — " + data.company,
    body: body,
  });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
