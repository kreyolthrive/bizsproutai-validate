import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-[family:var(--font-display)] text-3xl font-semibold text-slate-900">
        Privacy Policy (BizSproutAI)
      </h1>
      <p className="mt-2 text-sm text-slate-600">Effective Date: January 2026</p>

      <div className="mt-8 space-y-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1) Who We Are</h2>
          <p className="mt-2">
            BizSproutAI is operated as a DBA of Kreyol Thrive Biz. This Privacy Policy explains how we collect, use,
            share, and protect information when you use our websites and services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2) Information We Collect</h2>
          <p className="mt-2 font-medium text-slate-900">A) Information you provide</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Name, email, and contact details.</li>
            <li>Business ideas, survey responses, and messages you submit.</li>
            <li>Any content you upload or input into the Service.</li>
          </ul>
          <p className="mt-3 font-medium text-slate-900">B) Automatically collected information</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Device and browser info.</li>
            <li>IP address (often used for security and abuse prevention).</li>
            <li>Usage analytics (pages viewed, clicks, feature usage).</li>
            <li>Cookies or similar technologies (see &ldquo;Cookies&rdquo;).</li>
          </ul>
          <p className="mt-3 font-medium text-slate-900">C) Account and authentication data</p>
          <p className="mt-2">
            If you sign in via Supabase Auth or similar, we process identifiers needed to authenticate you and protect
            your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3) How We Use Your Information</h2>
          <p className="mt-2">We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and operate the Service (generate reports, send emails, run validations).</li>
            <li>Improve features and user experience.</li>
            <li>Communicate with you (support, reports you request, product updates).</li>
            <li>Secure the platform and prevent abuse/fraud.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4) What We Do NOT Do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>We do not sell your personal information.</li>
            <li>We do not publish your business ideas.</li>
            <li>We do not share your private inputs with other users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5) Sharing Your Information</h2>
          <p className="mt-2">We may share information with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Service providers (e.g., hosting, analytics, email delivery, databases) strictly to operate the Service.
            </li>
            <li>Legal/Compliance if required by law or to protect rights, safety, and security.</li>
            <li>
              Business transfers if Kreyol Thrive Biz undergoes a merger, acquisition, or asset sale (we&rsquo;ll provide
              notice where legally required).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6) Data Retention</h2>
          <p className="mt-2">
            We keep information only as long as necessary to provide the Service, meet legal requirements, resolve
            disputes, and enforce agreements. You may request deletion (see &ldquo;Your Rights&rdquo;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7) Security</h2>
          <p className="mt-2">
            We use administrative, technical, and organizational safeguards to protect your data. No system is 100%
            secure; you use the Service at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">8) Cookies and Analytics</h2>
          <p className="mt-2">
            We may use cookies and analytics tools to understand traffic and improve the Service. You can adjust
            cookie settings in your browser. Some functionality may not work without cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">9) Your Choices and Rights</h2>
          <p className="mt-2">Depending on your location, you may have rights to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access, correct, or delete personal information.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Request a copy of your data.</li>
          </ul>
          <p className="mt-2">
            To make a request, contact <a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">10) Children&rsquo;s Privacy</h2>
          <p className="mt-2">
            The Service is not intended for children under 13. If you believe a child has provided personal data,
            contact us for removal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">11) International Users</h2>
          <p className="mt-2">
            If you access the Service from outside the United States, you understand that your information may be
            processed in the U.S. or other locations where our providers operate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">12) Changes to This Policy</h2>
          <p className="mt-2">
            We may update this policy. Continued use after changes means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">13) Contact</h2>
          <p className="mt-2">
            Email: <a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>
          </p>
          <p className="mt-1">Operator: Kreyol Thrive Biz (DBA BizSproutAI)</p>
        </section>
      </div>
    </main>
  );
}
