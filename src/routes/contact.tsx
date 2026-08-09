import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Mail, MessageSquare, Send, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { submitContactMessage, ADMIN_CONTACT_EMAIL } from "@/lib/contact-api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — AI School" },
      {
        name: "description",
        content:
          "Have a question, partnership inquiry, or just want to say hello? Contact the AI School team.",
      },
      { property: "og:title", content: "Contact Us — AI School" },
      {
        property: "og:description",
        content: "Get in touch with AI School for courses, support and partnerships.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    // 1. Full Name Validation
    if (!trimmedName) {
      return toast.error("Please enter your full name.");
    }
    if (trimmedName.length < 3) {
      return toast.error("Full name must be at least 3 characters.");
    }
    // Name must contain alphabetic letters (English or Bengali) and not be just numbers
    if (!/[a-zA-Z\u0980-\u09FF]/.test(trimmedName) || /^[\d\s\W]+$/.test(trimmedName)) {
      return toast.error("Full name must contain letters, not only numbers.");
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return toast.error("Please enter a valid email address.");
    }

    // 3. Phone Number Validation
    if (!trimmedPhone) {
      return toast.error("Please enter your phone number.");
    }
    const digitsOnly = trimmedPhone.replace(/[^\d]/g, "");
    if (/[a-zA-Z\u0980-\u09FF]/.test(trimmedPhone)) {
      return toast.error("Phone number cannot contain letters. Please enter digits only.");
    }
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return toast.error("Please enter a valid phone number (e.g. 01XXXXXXXXX).");
    }

    // 4. Message Validation
    if (!trimmedMessage) {
      return toast.error("Please write your message.");
    }
    if (trimmedMessage.length < 10) {
      return toast.error("Message must be at least 10 characters.");
    }
    const textWithoutSymbols = trimmedMessage.replace(/[\s\W]+/g, "");
    if (/^\d+$/.test(textWithoutSymbols)) {
      return toast.error("Message cannot be just numbers. Please write your inquiry.");
    }

    setLoading(true);
    const result = await submitContactMessage({
      fullName: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      subject: subject.trim() || undefined,
      message: trimmedMessage,
    });
    setLoading(false);

    if (result.success) {
      toast.success(result.message || "Message sent successfully!");
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(result.error || "Failed to send message.");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-white selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Header */}
      <Header />

      {/* Subtle Starry/Space Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 size-[450px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />

      <main className="pt-32 pb-24 relative z-10">
        <section className="mx-auto max-w-6xl px-5">
          {/* Top Heading */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight">
              Contact Us
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg mx-auto">
              Have a question, partnership inquiry, or just want to say hello?
              <br />
              We'd love to hear from you.
            </p>
          </div>

          {/* Grid Layout: Left Info Cards & Right Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3 Contact Info Cards */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Our Office */}
              <div className="p-6 rounded-2xl bg-[#0f111a]/80 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-all flex items-start gap-4 shadow-lg">
                <div className="size-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <MapPin className="size-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-white">Our Office</h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    House 432, Avenue 05, Road 06,
                    <br />
                    Mirpur DOHS, Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              {/* Card 2: Email Us */}
              <div className="p-6 rounded-2xl bg-[#0f111a]/80 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-all flex items-start gap-4 shadow-lg">
                <div className="size-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-white">Email Us</h3>
                  <a
                    href={`mailto:${ADMIN_CONTACT_EMAIL}`}
                    className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 font-medium transition block break-all"
                  >
                    {ADMIN_CONTACT_EMAIL}
                  </a>
                  <p className="text-xs text-neutral-500">
                    We typically respond within 2-3 business days.
                  </p>
                </div>
              </div>

              {/* Card 3: Need Help? */}
              <div className="p-6 rounded-2xl bg-[#0f111a]/80 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-all flex items-start gap-4 shadow-lg">
                <div className="size-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <MessageSquare className="size-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-white">Need Help?</h3>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    For course-related support or technical issues:
                  </p>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition pt-1"
                  >
                    Visit Support Page →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Send us a message form */}
            <div className="lg:col-span-7">
              <div className="p-7 sm:p-9 rounded-3xl bg-[#0e1019]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 space-y-1">
                  <h2 className="font-display font-bold text-2xl text-white">Send us a message</h2>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    Fill out the form below and we'll get back to you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Full Name <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Email <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Phone <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="What is this about?"
                        className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Message <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
