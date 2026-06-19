const downloadForm = document.querySelector("#download-form");
const proposalForm = document.querySelector("#proposal-form");

function trackEvent(name, detail = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...detail });
}

if (downloadForm) {
  downloadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#download-email")?.value || "";
    const status = document.querySelector("#download-status");
    const button = downloadForm.querySelector("button[type='submit']");
    const pdfUrl = "downloads/india-palace-corporate-catering-checklist.pdf";

    if (status) status.textContent = "Preparing your checklist...";
    if (button) button.disabled = true;

    trackEvent("checklist_download", {
      lead_email_domain: email.includes("@") ? email.split("@").pop() : ""
    });

    try {
      const response = await fetch(downloadForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "business_catering_checklist",
          page: window.location.pathname
        })
      });

      if (!response.ok) throw new Error("Lead endpoint unavailable");

      const result = await response.json();
      window.location.href = result.pdfUrl || pdfUrl;
    } catch (error) {
      if (status) {
        status.textContent = "We could not submit that email. Please try again or email chefkulbir@indiapalacecatering.com.";
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}

if (proposalForm) {
  proposalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(proposalForm);
    const dietary = formData.getAll("dietary").join(", ") || "Not specified";
    const subject = encodeURIComponent("Office catering proposal request");
    const body = encodeURIComponent(
      [
        "New office catering proposal request",
        "",
        `Name: ${formData.get("name") || ""}`,
        `Work email: ${formData.get("email") || ""}`,
        `Company: ${formData.get("company") || ""}`,
        `Phone: ${formData.get("phone") || ""}`,
        `Estimated headcount: ${formData.get("headcount") || ""}`,
        `Event type: ${formData.get("event_type") || ""}`,
        `Dietary needs: ${dietary}`,
        "",
        "Details:",
        formData.get("details") || ""
      ].join("\n")
    );

    trackEvent("proposal_request_start", {
      headcount: formData.get("headcount") || "",
      event_type: formData.get("event_type") || ""
    });

    window.location.href = `mailto:chefkulbir@indiapalacecatering.com?subject=${subject}&body=${body}`;
  });
}
