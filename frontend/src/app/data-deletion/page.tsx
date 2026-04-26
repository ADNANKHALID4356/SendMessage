import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | MessageSender',
  description:
    'How to request deletion of data associated with MessageSender and connected Facebook Pages.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Data Deletion Instructions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If you would like to delete data associated with MessageSender, follow the steps below.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-6 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Option A — Disconnect within MessageSender</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Sign in to MessageSender.</li>
              <li>Open <span className="font-medium">Settings → Integrations</span>.</li>
              <li>Disconnect the connected Facebook Page(s) and/or account.</li>
              <li>
                If you also want your MessageSender account removed, submit a deletion request using{' '}
                <Link className="text-primary underline underline-offset-4" href="/contact">
                  the contact page
                </Link>
                .
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Option B — Remove MessageSender from Facebook</h2>
            <p>
              You can revoke MessageSender’s access from your Facebook account at any time. After
              revocation, the Service can no longer call Meta APIs on your behalf.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log into Facebook.</li>
              <li>
                Go to <span className="font-medium">Settings &amp; privacy → Settings</span>.
              </li>
              <li>
                Open <span className="font-medium">Business integrations</span> (or “Apps and websites” depending on your account).
              </li>
              <li>Find <span className="font-medium">MessageSender</span> and remove it.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">What happens after you request deletion</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We will verify the request and may ask for additional information to prevent fraud.
              </li>
              <li>
                We will delete or anonymize data we no longer need, except where retention is required
                by law or for legitimate business purposes (for example: security logs).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Privacy policy</h2>
            <p>
              For details about what we collect and how we use it, see our{' '}
              <Link className="text-primary underline underline-offset-4" href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

