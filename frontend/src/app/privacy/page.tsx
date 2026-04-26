import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | MessageSender',
  description:
    'Privacy Policy for MessageSender — a Facebook Page messaging platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const effectiveDate = '2026-04-26';

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
        </div>

        <div className="space-y-8 text-sm leading-6 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1) Overview</h2>
            <p>
              MessageSender (“we”, “us”, “our”) provides tools to help businesses manage customer
              conversations and campaigns for Facebook Pages using Meta’s Messenger Platform.
              This Privacy Policy explains what data we collect, how we use it, and the choices you
              have.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2) Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Account data</span>: email, name, and login/session
                information for MessageSender users.
              </li>
              <li>
                <span className="font-medium">Workspace and configuration data</span>: settings you
                provide such as tags, templates, segments, and campaign configuration.
              </li>
              <li>
                <span className="font-medium">Facebook connection data</span>: when you connect a
                Facebook account and Page(s), we store the identifiers and encrypted access tokens
                required to call Meta APIs on your behalf.
              </li>
              <li>
                <span className="font-medium">Messaging data</span>: messages, postbacks, and related
                webhook events received from Meta for connected Pages, and messages you send using
                the platform.
              </li>
              <li>
                <span className="font-medium">Technical data</span>: IP address, user agent, and
                diagnostic logs used for security and troubleshooting.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3) How we use information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide and operate the service (authentication, workspaces, messaging features).</li>
              <li>Connect to Meta APIs and subscribe Pages to webhooks, as authorized by you.</li>
              <li>Secure the platform, prevent abuse, and enforce rate limits.</li>
              <li>Monitor performance and fix bugs.</li>
              <li>Comply with applicable law and platform policies.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4) Sharing</h2>
            <p>
              We do not sell personal data. We may share data with service providers that help us run
              the platform (for example: hosting and databases) and with Meta Platforms, Inc. when
              you connect a Facebook account/Page and we call Meta APIs or receive webhook events.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5) Data security</h2>
            <p>
              We use administrative, technical, and physical safeguards designed to protect data.
              Facebook access tokens are stored in encrypted form. No method of transmission or
              storage is completely secure; we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6) Retention</h2>
            <p>
              We retain information for as long as needed to provide the service, meet legal
              obligations, resolve disputes, and enforce agreements. You can request deletion as
              described below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7) Your choices</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Disconnect a Page</span>: you can disconnect your
                Facebook Page(s) from within the app.
              </li>
              <li>
                <span className="font-medium">Delete data</span>: see{' '}
                <Link className="text-primary underline underline-offset-4" href="/data-deletion">
                  Data Deletion Instructions
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8) Contact</h2>
            <p>
              Questions about this policy can be sent via{' '}
              <Link className="text-primary underline underline-offset-4" href="/contact">
                our contact page
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

