# India Palace Office Catering Site

Static, Cloudflare-friendly conversion page for IndiaPalaceCatering.com.

## Files

- `index.html` - production landing page with SEO, AI SEO, structured data, office-catering copy, lead magnet, and proposal form
- `styles.css` - responsive design system
- `script.js` - checklist lead submission, tracking hook, and static proposal email fallback
- `functions/api/checklist-lead.js` - Cloudflare Pages Function for checklist lead capture
- `assets/` - generated realistic catering images and checklist preview images
- `downloads/india-palace-corporate-catering-checklist.pdf` - lead magnet PDF
- `robots.txt`, `sitemap.xml`, `llms.txt` - search and AI-discovery support

## Deployment Notes

Upload the folder contents to the deployed site root or merge them into the current GitHub repository that Cloudflare deploys.

Before launch:

1. Configure checklist lead delivery in Cloudflare Pages.
2. Replace the static `mailto:` proposal flow with the existing website form handler, CRM endpoint, or a Cloudflare Pages Function.
3. Confirm any public claims such as years in business, service area, and phone number.
4. If this page is deployed at `/office-catering/`, update canonical URLs, Open Graph URLs, `sitemap.xml`, and image paths.

## Checklist Lead Capture

The checklist form posts to `/api/checklist-lead`.

By default, the function is set up to notify `chefkulbir@indiapalacecatering.com`, but Cloudflare needs an email or webhook delivery method configured.

Recommended Cloudflare environment variables:

- `LEAD_NOTIFY_EMAIL` - inbox that receives checklist leads, for example `chefkulbir@indiapalacecatering.com`
- `RESEND_API_KEY` - Resend API key for email delivery
- `LEAD_FROM_EMAIL` - verified sender, for example `India Palace Catering <leads@indiapalacecatering.com>`
- `LEAD_WEBHOOK_URL` - optional CRM/Zapier/Make webhook URL

If `RESEND_API_KEY` is configured, each checklist request is emailed to `LEAD_NOTIFY_EMAIL`. If `LEAD_WEBHOOK_URL` is configured, the same lead is also posted as JSON for CRM handling.
