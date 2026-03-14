import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-[family:var(--font-display)] text-3xl font-semibold text-slate-900">
        Terms of Service (BizSproutAI)
      </h1>
      <p className="mt-2 text-sm text-slate-600">Effective Date: January 2026</p>

      <div className="mt-8 space-y-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1) Who We Are</h2>
          <p className="mt-2">
            BizSproutAI (&ldquo;BizSproutAI,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) is a brand operated as a DBA
            (Doing Business As) of Kreyol Thrive Biz (&ldquo;Company&rdquo;). These Terms govern your access to and use of our
            websites, apps, and related services (the &ldquo;Service&rdquo;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2) Agreement to Terms</h2>
          <p className="mt-2">
            By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3) What the Service Does</h2>
          <p className="mt-2">
            BizSproutAI provides tools to help users validate business ideas and generate materials such as reports,
            recommendations, and business content (&ldquo;Outputs&rdquo;). Outputs are generated using algorithms and may include
            third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4) No Professional Advice</h2>
          <p className="mt-2">
            BizSproutAI does not provide legal, tax, financial, investment, medical, or other professional advice.
            Outputs are informational and should be verified independently. You are solely responsible for decisions
            you make based on the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5) Eligibility</h2>
          <p className="mt-2">
            You must be at least 13 years old to use the Service. If you are under the age of majority where you
            live, you must have a parent/guardian&rsquo;s permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6) Accounts and Security</h2>
          <p className="mt-2">
            If you create an account, you are responsible for keeping your login credentials secure and for all
            activity under your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7) User Content and Ownership</h2>
          <p className="mt-2">
            You may submit text and other information (&ldquo;User Content&rdquo;), such as business ideas and survey responses.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>You own your User Content.</li>
            <li>
              You grant us a limited license to use User Content only to operate, maintain, and improve the Service
              (including generating Outputs and troubleshooting).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">8) Outputs and Intellectual Property</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>You may use Outputs for your personal or business purposes.</li>
            <li>We do not guarantee Outputs are accurate, unique, or non-infringing.</li>
            <li>You are responsible for checking Outputs before publishing or using them commercially.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">9) Prohibited Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Break the law or violate others&rsquo; rights.</li>
            <li>Attempt to access systems you aren&rsquo;t authorized to use.</li>
            <li>Upload malware or abuse infrastructure.</li>
            <li>Scrape, reverse engineer, or exploit the Service.</li>
            <li>Use the Service to generate illegal content or to harass, defraud, or harm others.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">10) Payment (If Applicable)</h2>
          <p className="mt-2">
            If the Service includes paid plans, pricing and billing terms will be displayed at checkout. Fees are
            generally non-refundable unless required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">11) Termination</h2>
          <p className="mt-2">
            We may suspend or terminate access if you violate these Terms, if required by law, or to protect the
            Service. You may stop using the Service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">12) Disclaimers</h2>
          <p className="mt-2">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo; WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">13) Limitation of Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, BizSproutAI and Kreyol Thrive Biz will not be liable for
            indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data,
            or goodwill.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">14) Changes to the Service or Terms</h2>
          <p className="mt-2">
            We may update the Service and these Terms. Continued use after changes means you accept the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">15) Contact</h2>
          <p className="mt-2">
            Questions? Contact us at <a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
