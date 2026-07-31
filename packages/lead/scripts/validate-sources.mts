import { createLeadService, LEAD_SOURCES } from "../src/index.ts";

const endpoint =
  process.env.CONIS_LEAD_ENDPOINT?.trim() ||
  "https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec";

const service = createLeadService({ endpoint });

async function main() {
  const sources = [
    LEAD_SOURCES.CONIS_WEB,
    LEAD_SOURCES.CLIENT_STUDIO,
    LEAD_SOURCES.EMBED,
  ] as const;

  for (const source of sources) {
    const result = await service.submitLead({
      source,
      contact: {
        name: "CAP-CORE-01",
        email: "validation+core-01@conis.cz",
        company: source,
      },
      fields: [
        { id: "q1", label: "Kolik domů ročně prodáváte?", value: "15–30" },
        {
          id: "p",
          label: "Nejdůležitější priorita",
          value: "Energetická úspornost",
        },
        { id: "d", label: "Vybraná dispozice", value: "4+kk" },
      ],
      summary: {
        score: 2,
        segment: "B — review",
        recommendation: "Universal lead service check",
      },
      metadata: {
        url: "https://conis.cz/?cap=core-01",
        sessionId: `core-01-${source}`,
        utm: { source: "cap-core-01", medium: "validation", campaign: source },
      },
    });

    console.log(
      source,
      result.ok ? "PASS" : "FAIL",
      result.leadId,
      result.error || "",
    );
    if (!result.ok) {
      process.exitCode = 1;
    }
  }
}

void main();
