const downloadForm = document.querySelector("#download-form");
const proposalForm = document.querySelector("#proposal-form");
const navToggle = document.querySelector("#nav-toggle");
const navLinks = document.querySelector("#nav-links");

function trackEvent(name, detail = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...detail });
}

function setNavOpen(isOpen) {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navLinks.setAttribute("data-open", String(isOpen));
}

if (navToggle && navLinks) {
  setNavOpen(false);

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!isOpen);
  });

  navLinks.querySelectorAll("[data-nav-close]").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("click", (event) => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;
    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });
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

const galleryScroll = document.querySelector(".gallery-scroll");
const galleryPrev = document.querySelector(".gallery-nav-prev");
const galleryNext = document.querySelector(".gallery-nav-next");

if (galleryScroll && galleryPrev && galleryNext) {
  const scrollByAmount = () => {
    const item = galleryScroll.querySelector(".gallery-item");
    const itemWidth = item ? item.getBoundingClientRect().width : 340;
    return (itemWidth + 16) * 2; // advance roughly two cards per click
  };

  const updateGalleryNavState = () => {
    const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
    galleryPrev.disabled = galleryScroll.scrollLeft <= 2;
    galleryNext.disabled = galleryScroll.scrollLeft >= maxScroll - 2;
  };

  galleryPrev.addEventListener("click", () => {
    galleryScroll.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
  });

  galleryNext.addEventListener("click", () => {
    galleryScroll.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
  });

  galleryScroll.addEventListener("scroll", updateGalleryNavState, { passive: true });
  window.addEventListener("resize", updateGalleryNavState);
  updateGalleryNavState();
}

const tastingModal = document.querySelector("#tasting-modal");
const tastingTriggers = document.querySelectorAll("[data-tasting-trigger]");
const tastingClose = document.querySelector("#tasting-modal-close");
const tastingForm = document.querySelector("#tasting-form");
const tastingFormView = document.querySelector("#tasting-modal-form-view");
const tastingConfirmView = document.querySelector("#tasting-modal-confirm-view");
const tastingDone = document.querySelector("#tasting-modal-done");

if (tastingModal && tastingTriggers.length) {
  const openTastingModal = (event) => {
    event.preventDefault();
    tastingFormView.hidden = false;
    tastingConfirmView.hidden = true;
    tastingModal.hidden = false;
    document.body.style.overflow = "hidden";
    const firstField = document.querySelector("#tasting-name");
    if (firstField) firstField.focus();
  };

  const closeTastingModal = () => {
    tastingModal.hidden = true;
    document.body.style.overflow = "";
  };

  tastingTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openTastingModal);
  });

  tastingClose.addEventListener("click", closeTastingModal);
  tastingDone.addEventListener("click", closeTastingModal);

  tastingModal.addEventListener("click", (event) => {
    if (event.target === tastingModal) closeTastingModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !tastingModal.hidden) closeTastingModal();
  });

  if (tastingForm) {
    tastingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(tastingForm);
      const name = formData.get("name") || "";
      const company = formData.get("company") || "";
      const email = formData.get("email") || "";

      trackEvent("free_tasting_request", { name, company });

      const subject = encodeURIComponent("Free tasting request");
      const body = encodeURIComponent(
        [
          "New free tasting request",
          "",
          `Name: ${name}`,
          `Company: ${company}`,
          `Work email: ${email}`
        ].join("\n")
      );
      const mailLink = document.createElement("a");
      mailLink.href = `mailto:chefkulbir@indiapalacecatering.com?subject=${subject}&body=${body}`;
      mailLink.click();

      tastingFormView.hidden = true;
      tastingConfirmView.hidden = false;
    });
  }
}
