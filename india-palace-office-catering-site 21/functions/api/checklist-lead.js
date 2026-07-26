const PDF_URL = "/downloads/india-palace-corporate-catering-checklist.pdf";
const DEFAULT_LEAD_EMAIL = "chefkulbir@indiapalacecatering.com";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost({ request, env }) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const source = String(payload.source || "business_catering_checklist");
  const page = String(payload.page || "");
  const createdAt = new Date().toISOString();

  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Valid email required" }, 400);
  }

  const lead = {
    email,
    source,
    page,
    createdAt
  };

  if (!env.RESEND_API_KEY && !env.LEAD_WEBHOOK_URL) {
    return jsonResponse({ error: "Lead delivery is not configured" }, 500);
  }

  if (env.LEAD_WEBHOOK_URL) {
    const webhookResponse = await fetch(env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead)
    });

    if (!webhookResponse.ok) {
      const message = await webhookResponse.text();
      return jsonResponse({ error: "Webhook delivery failed", detail: message }, 502);
    }
  }

  if (env.RESEND_API_KEY) {
    const to = env.LEAD_NOTIFY_EMAIL || DEFAULT_LEAD_EMAIL;
    const from = env.LEAD_FROM_EMAIL || "India Palace Catering <leads@indiapalacecatering.com>";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Checklist lead: ${email}`,
        text: [
          "New Business Catering Checklist lead",
          "",
          `Email: ${email}`,
          `Source: ${source}`,
          `Page: ${page}`,
          `Created: ${createdAt}`
        ].join("\n")
      })
    });

    if (!resendResponse.ok) {
      const message = await resendResponse.text();
      return jsonResponse({ error: "Email delivery failed", detail: message }, 502);
    }
  }

  return jsonResponse({
    ok: true,
    pdfUrl: PDF_URL,
    leadEmail: env.LEAD_NOTIFY_EMAIL || DEFAULT_LEAD_EMAIL,
    delivered: true
  });
}
