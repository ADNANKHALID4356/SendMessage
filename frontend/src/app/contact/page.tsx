import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | MessageSender',
  description: 'How to contact MessageSender support.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the options below for support, privacy questions, or data deletion requests.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-6 text-foreground/90">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Support</h2>
            <p className="mt-2 text-muted-foreground">
              For account issues, troubleshooting, or billing questions, contact us at:
            </p>
            <p className="mt-3">
              <a className="text-primary underline underline-offset-4" href="mailto:support@messagesender.com">
                support@messagesender.com
              </a>
            </p>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Privacy &amp; data deletion</h2>
            <p className="mt-2 text-muted-foreground">
              If you would like to request deletion of data, please include the email address used
              to sign in and the Facebook Page name (if applicable).
            </p>
            <p className="mt-3">
              See also:{' '}
              <Link className="text-primary underline underline-offset-4" href="/data-deletion">
                Data Deletion Instructions
              </Link>
              .
            </p>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Policies</h2>
            <p className="mt-2 text-muted-foreground">
              Review our policies here:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>
                <Link className="text-primary underline underline-offset-4" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="text-primary underline underline-offset-4" href="/terms">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

