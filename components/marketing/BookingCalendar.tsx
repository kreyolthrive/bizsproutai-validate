"use client";

type BookingCalendarProps = {
  /** Cal.com username/event slug, e.g. "bizsproutai/30-min-founder-clarity-session" */
  calLink?: string;
  title?: string;
};

/**
 * Embeds a Cal.com scheduling page via a direct iframe.
 * Set NEXT_PUBLIC_CAL_LINK in your environment to activate.
 */
export function BookingCalendar({
  calLink,
  title = "Book your free Founder Clarity Session",
}: BookingCalendarProps) {
  const resolvedLink =
    calLink ?? process.env.NEXT_PUBLIC_CAL_LINK ?? "";

  if (!resolvedLink) {
    return null;
  }

  const embedUrl = `https://cal.com/${resolvedLink}?embed=true&layout=month_view&hideEventTypeDetails=false`;

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <h3 className="mb-6 text-center font-[family:var(--font-serif)] text-2xl text-[var(--landing-green-deep)]">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border border-[rgba(26,58,42,0.1)] bg-white shadow-sm">
        <iframe
          src={embedUrl}
          width="100%"
          height="700"
          frameBorder="0"
          title="Book a Founder Clarity Session"
          allow="payment"
        />
      </div>
    </div>
  );
}
