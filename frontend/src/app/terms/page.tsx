import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | MessageSender',
  description: 'Terms of Service for using MessageSender.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  const effectiveDate = '2026-04-26';

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
        </div>

        <div className="space-y-8 text-sm leading-6 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1) Agreement</h2>
            <p>
              By accessing or using MessageSender (“Service”), you agree to these Terms. If you are
              using the Service on behalf of an organization, you represent you have authority to
              bind that organization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2) Eligibility and accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate information and keep your account secure.</li>
              <li>You are responsible for activity that occurs under your account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3) Acceptable use</h2>
            <p>
              You agree not to use the Service to engage in illegal, harmful, deceptive, or abusive
              conduct. You must comply with all applicable laws and regulations and with Meta/Facebook
              platform policies, including the Messenger Platform policies.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>No spam or unsolicited bulk messaging outside permitted use cases.</li>
              <li>No content that violates intellectual property, privacy, or other rights.</li>
              <li>No malware, scraping, or attempts to disrupt the Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4) Facebook/Meta integration</h2>
            <p>
              When you connect a Facebook account or Page, you authorize the Service to access Meta
              APIs on your behalf to provide the requested features (for example: listing Pages,
              subscribing webhooks, sending messages). Your use of Meta products is governed by Meta’s
              own terms and policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5) Privacy</h2>
            <p>
              Our collection and use of information is described in our{' '}
              <Link className="text-primary underline underline-offset-4" href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6) Availability and changes</h2>
            <p>
              We may modify, suspend, or discontinue parts of the Service, and we may update these
              Terms from time to time. If changes are material, we will provide a reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7) Disclaimer</h2>
            <p>
              The Service is provided “as is” and “as available”. To the maximum extent permitted by
              law, we disclaim warranties of any kind, including merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8) Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, MessageSender will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for loss of profits, data,
              goodwill, or other intangible losses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9) Contact</h2>
            <p>
              For questions about these Terms, contact us via{' '}
              <Link className="text-primary underline underline-offset-4" href="/contact">
                the contact page
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          <p>
            This document is provided for general informational purposes and should be reviewed by
            legal counsel for your specific business and jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}

