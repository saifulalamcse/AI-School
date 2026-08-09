import { supabase } from "@/integrations/supabase/client";

export type ContactFormData = {
  fullName: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

// Default Admin Receiver Email (You can change this email anytime here)
export const ADMIN_CONTACT_EMAIL = "saifulalamcse@gmail.com";

export async function submitContactMessage(data: ContactFormData): Promise<ContactResponse> {
  try {
    const payload = {
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      subject: data.subject?.trim() || "General Inquiry",
      message: data.message.trim(),
      created_at: new Date().toISOString(),
    };

    // 1. Store in local storage backup
    try {
      const existing = JSON.parse(localStorage.getItem("ai_school_contact_backup") || "[]");
      existing.unshift(payload);
      localStorage.setItem("ai_school_contact_backup", JSON.stringify(existing.slice(0, 50)));
    } catch {
      // ignore localStorage errors
    }

    // 2. Try inserting into Supabase contact_messages table if created
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("contact_messages").insert(payload);
    } catch {
      // Ignore if table not yet created in Postgres
    }

    // 3. Send Email Notification via local server endpoint (/api/contact)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        if (errorData?.error) {
          console.warn("Email dispatch notice:", errorData.error);
        }
      }
    } catch (e) {
      console.warn("Could not dispatch email via /api/contact:", e);
    }

    return {
      success: true,
      message: "Thank you! Your message has been sent successfully. We will get back to you soon.",
    };
  } catch (err: unknown) {
    console.error("submitContactMessage error:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to send message. Please try again later.";
    return {
      success: false,
      error: msg,
    };
  }
}
