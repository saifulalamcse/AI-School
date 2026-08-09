import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/contact") {
        try {
          const body = (await request.json()) as {
            full_name?: string;
            fullName?: string;
            email?: string;
            phone?: string;
            subject?: string;
            message?: string;
          };
          const resendApiKey =
            (env as { VITE_RESEND_API_KEY?: string })?.VITE_RESEND_API_KEY ||
            process.env.VITE_RESEND_API_KEY ||
            "";

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

          const res = await fetch("https://api.resend.com/emails", {
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

          const resData = (await res.json()) as { id?: string; message?: string };
          if (!res.ok) {
            return new Response(
              JSON.stringify({ error: resData.message || "Failed to send email" }),
              {
                status: res.status,
                headers: { "content-type": "application/json" },
              },
            );
          }
          return new Response(JSON.stringify({ success: true, id: resData.id }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Failed to process request";
          return new Response(JSON.stringify({ error: errMsg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
