/**
 * CONIS Lead Capture — Google Apps Script (CAP-WEB-01 + CAP-CORE-01)
 *
 * Accepts:
 * 1) Universal Lead Service envelope from @embed-engine/lead
 *    { channel, sheetColumns, email, payload, source, leadId }
 * 2) Legacy CAP-WEB-01 quiz payload (answersByTitle, contact flat fields)
 *
 * Script properties:
 *   SPREADSHEET_ID
 *   NOTIFICATION_EMAIL  (default kontakt@conis.cz)
 *   SHEET_NAME           (default Leads)
 */

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
      return jsonResponse_({ ok: false, error: "Empty body" });
    }
    var payload = JSON.parse(raw);
    var result = processIncoming_(payload);
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: String(err && err.message ? err.message : err),
    });
  }
}

function processIncoming_(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Neplatný payload.");
  }

  // CAP-CORE-01 envelope from Lead Service adapters
  // Detect via sheetColumns / channel — not `email` (legacy uses string email).
  if (body.sheetColumns || body.channel) {
    return processUniversal_(body);
  }

  // Legacy CAP-WEB-01 flat quiz payload
  return processLegacyQuiz_(body);
}

function processUniversal_(body) {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  var notificationEmail =
    props.getProperty("NOTIFICATION_EMAIL") || "kontakt@conis.cz";
  var sheetName = props.getProperty("SHEET_NAME") || "Leads";

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID není nastaveno ve Script properties.");
  }

  var leadId =
    String(body.leadId || "") ||
    (body.payload && body.payload.leadId) ||
    Utilities.getUuid();

  var sheetColumns = body.sheetColumns || {};
  if (!sheetColumns["Lead ID"]) {
    sheetColumns["Lead ID"] = leadId;
  }

  if (Object.keys(sheetColumns).length > 0) {
    appendDynamicRow_(spreadsheetId, sheetName, sheetColumns);
  }

  var mail = body.mail || body.emailMessage;
  if (mail && mail.body) {
    MailApp.sendEmail({
      to: notificationEmail,
      subject: String(mail.subject || "Nový lead"),
      body: String(mail.body),
    });
  } else if (body.payload) {
    MailApp.sendEmail({
      to: notificationEmail,
      subject: "Nový lead — " + leadId,
      body: JSON.stringify(body.payload, null, 2),
    });
  }

  return { ok: true, leadId: String(leadId) };
}

function appendDynamicRow_(spreadsheetId, sheetName, columns) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var headers;
  if (sheet.getLastRow() === 0) {
    headers = Object.keys(columns);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    var width = Math.max(sheet.getLastColumn(), 1);
    headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
    // Extend header row with any new labels
    var changed = false;
    Object.keys(columns).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        changed = true;
      }
    });
    if (changed) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  var row = headers.map(function (header) {
    return columns[header] != null ? String(columns[header]) : "";
  });
  sheet.appendRow(row);
}

/** Legacy CAP-WEB-01 quiz-shaped payload (kept for backward compatibility). */
function processLegacyQuiz_(payload) {
  var QUESTION_TITLES = [
    "Kolik domů ročně prodáváte?",
    "Máte vlastní obchodní tým?",
    "Kolik lidí měsíčně navštíví váš web?",
    "Co je pro vás důležitější?",
    "Jste připraveni začít pilotem?",
  ];

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

  var columns = {
    "Lead ID": leadId,
    "Datum a čas": timestamp,
    Source: "CONIS_WEB",
    Jméno: name,
    Firma: company,
    "E-mail": email,
    Telefon: phone,
  };

  QUESTION_TITLES.forEach(function (title) {
    columns[title] = String(answersByTitle[title] || "");
  });

  columns["Skóre"] = String(payload.score || "");
  columns.Segment = String(payload.segment || payload.status || "");
  columns.Doporučení = String(payload.recommendation || "");
  columns.URL = String(payload.url || "");
  columns.Referrer = String(payload.referrer || "");
  columns["UTM Source"] = String(payload.utmSource || "");
  columns["UTM Medium"] = String(payload.utmMedium || "");
  columns["UTM Campaign"] = String(payload.utmCampaign || "");
  columns["Session ID"] = String(payload.sessionId || "");
  columns["JSON Payload"] = JSON.stringify(payload);

  appendDynamicRow_(spreadsheetId, sheetName, columns);

  var answerLines = QUESTION_TITLES.map(function (title) {
    return title + ": " + (answersByTitle[title] || "—");
  });

  MailApp.sendEmail({
    to: notificationEmail,
    subject: "Nová kvalifikace CONIS — " + company,
    body: [
      "Nová kvalifikace CONIS",
      "",
      "Lead ID: " + leadId,
      "Datum: " + timestamp,
      "",
      "Kontakt",
      "Jméno: " + name,
      "Firma: " + company,
      "E-mail: " + email,
      "Telefon: " + (phone || "—"),
      "",
      "Vyhodnocení",
      "Skóre: " + (payload.score || "—"),
      "Segment: " + (payload.segment || payload.status || "—"),
      "Doporučení: " + (payload.recommendation || "—"),
      "",
      "Odpovědi z kvízu",
      answerLines.join("\n"),
    ].join("\n"),
  });

  return { ok: true, leadId: leadId };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
