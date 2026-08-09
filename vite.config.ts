// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

const contactApiDevPlugin: Plugin = {
  name: "contact-api-dev-plugin",
  configureServer(server) {
    server.middlewares.use("/api/contact", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Method not allowed" }));
      }

      let bodyStr = "";
      req.on("data", (chunk) => {
        bodyStr += chunk;
      });

      req.on("end", async () => {
        try {
          const body = JSON.parse(bodyStr || "{}");
          const resendApiKey = process.env.VITE_RESEND_API_KEY || "";

          const name = body.full_name || body.fullName || "User";
          const email = body.email || "No email";
          const phone = body.phone || "No phone";
          const subject = body.subject || "General Inquiry";
          const message = body.message || "";

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <h2 style="color: #7c3aed; margin-bottom: 20px; border-bottom: 2px solid #f3e8ff; padding-bottom: 10px;">
                📩 New Contact Message — AI School
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Full Name:</td>
                  <td style="padding: 8px 0; color: #111;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0; color: #111;"><a href="mailto:${email}" style="color: #7c3aed;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                  <td style="padding: 8px 0; color: #111;"><a href="tel:${phone}" style="color: #111;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td>
                  <td style="padding: 8px 0; color: #111;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td>
                  <td style="padding: 8px 0; color: #666;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
                <p style="font-weight: bold; margin-top: 0; color: #333;">Message:</p>
                <p style="color: #333; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
              </div>
              <p style="margin-top: 25px; font-size: 12px; color: #9ca3af; text-align: center;">
                This email was sent from the AI School Contact Form.
              </p>
            </div>
          `;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "AI School <onboarding@resend.dev>",
              to: ["saifulalamcse@gmail.com"],
              reply_to: email,
              subject: `[Contact Inquiry] ${subject} - from ${name}`,
              html: emailHtml,
            }),
          });

          const result = (await response.json()) as { id?: string; message?: string };
          res.setHeader("Content-Type", "application/json");

          if (!response.ok) {
            res.statusCode = response.status;
            return res.end(JSON.stringify({ error: result.message || "Failed to send email" }));
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, id: result.id }));
        } catch (err: unknown) {
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 500;
          const errMsg = err instanceof Error ? err.message : "Internal server error";
          return res.end(JSON.stringify({ error: errMsg }));
        }
      });
    });
  },
};

export default defineConfig({
  vite: {
    plugins: [contactApiDevPlugin],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
