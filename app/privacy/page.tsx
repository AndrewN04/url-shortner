/**
 * Privacy Policy Page
 * Comprehensive privacy policy for the URL Shortener service
 */

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="max-w-3xl w-full text-zinc-300 leading-relaxed">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm">
            Last Updated: January 13, 2026
          </p>
        </div>

        <div className="space-y-8 text-zinc-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              1. Introduction
            </h2>
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-100 mb-2">
                Self-Hosted Application
              </p>
              <p className="text-blue-200">
                This application is designed for self-hosting. The demo instance at go.a04.dev is for demonstration only. When self-hosting, you control all data and are responsible for your privacy policy.
              </p>
            </div>
            <p>
              This Privacy Policy describes data collection and usage for self-hosted deployments. Customize this template for your deployment.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              2.1 API Keys
            </h3>
            <p>API keys authenticate requests to create shortened URLs. Your actual API key is never stored. Instead, we use HMAC-SHA256 (a secure hashing algorithm) with a server-side secret to create an irreversible hash. We store:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Key hash (a cryptographic fingerprint that cannot be reversed to recover the original key)</li>
              <li>Unique identifier, creation timestamp, optional note, and whether the key has been revoked</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              2.2 URLs
            </h3>
            <p>When creating a shortened URL, we store:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Original URL, 12-character code, creation timestamp, expiration timestamp (optional), creator key ID</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              2.3 Rate Limiting
            </h3>
            <p>To prevent abuse and ensure fair usage, we limit requests to 10 per minute per IP address or API key. We temporarily store:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>IP addresses (your device&apos;s network address) and request counts, stored only for 1-minute time windows</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              2.4 Browser Extension
            </h3>
            <p>The browser extension stores data locally on your device (never sent to our servers):</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>API key stored in browser sync storage (syncs across your devices if you&apos;re signed into your browser)</li>
              <li>Link history (up to 50 most recent shortened URLs) stored locally: includes the short URL, original URL, and expiration time</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              3. How We Use Information
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>URLs are stored to enable redirection: when someone visits a short code, they are redirected to the original URL</li>
              <li>API key hashes verify that requests to create links are authorized</li>
              <li>Rate limiting (10 requests/min per IP/key) prevents abuse and denial-of-service attacks</li>
              <li>SSRF protection (Server-Side Request Forgery prevention) blocks URLs that point to private networks or localhost, preventing security vulnerabilities</li>
            </ul>
            <p className="mt-4">
              <strong>We do not collect analytics, track who clicks on links, collect user information, or use cookies for tracking.</strong>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              4. Data Retention
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>URLs:</strong> Retained until expiration (default: 14 days if no expiration is set) or manual revocation. Expired links are automatically deleted from the database. Revoked links are marked as revoked but retained for audit purposes.</li>
              <li><strong>API Keys:</strong> Retained indefinitely until manually revoked by an administrator. Revoked keys are marked as revoked but retained in the database for audit and security purposes.</li>
              <li><strong>Rate Limits:</strong> Rate limit data is stored for 1-minute windows and automatically expires after each window ends. Old rate limit entries are automatically cleaned up.</li>
              <li><strong>Browser Extension:</strong> Link history is limited to 50 entries. Expired links are automatically removed from the history. All extension data remains on your device until you manually clear it through browser settings or uninstall the extension.</li>
            </ul>
          </section>

          {/* Self-Hosting */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              5. Self-Hosting
            </h2>
            <p className="mb-4">This application is designed for self-hosting. You control all data, API keys, and privacy practices.</p>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-200">
                <strong className="text-blue-100">Note:</strong> Customize this policy template for your deployment, including third-party services you use.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              5.1 API Key Management
            </h3>
            <p>Generate keys using admin scripts:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><code>npm run admin:create-key [note]</code> - Create key (shown once)</li>
              <li><code>npm run admin:list-keys</code> - List keys</li>
              <li><code>npm run admin:revoke-key &lt;key_id&gt;</code> - Revoke key</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              5.2 Environment Variables
            </h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>DATABASE_URL:</strong> PostgreSQL connection string (required)</li>
              <li><strong>API_KEY_PEPPER:</strong> Secret for hashing API keys (required)</li>
              <li><strong>MAX_TTL_SECONDS:</strong> Maximum link TTL in seconds (optional, default: 14 days)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              6. Data Sharing
            </h2>
            <p>We do not sell or share data with third parties. When self-hosting, you control which services process your data. This application operates independently and does not require external services.</p>
            <p className="mt-4">Information may be disclosed if required by law or valid legal requests.</p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              7. Security
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>HTTPS/TLS encryption ensures all data transmitted between your device and our servers is encrypted</li>
              <li>API keys are hashed using HMAC-SHA256 (a secure cryptographic hash function) and never stored in plaintext - even if the database is compromised, your API keys cannot be recovered</li>
              <li>Constant-time comparison when verifying API keys prevents timing attacks that could potentially reveal key information</li>
              <li>SSRF protection: URLs are validated by resolving DNS and blocking any that point to private IP addresses (like localhost or internal networks), preventing security vulnerabilities</li>
              <li>Rate limiting restricts requests to 10 per minute per IP address or API key, preventing abuse and denial-of-service attacks</li>
            </ul>
          </section>

          {/* Browser Extension */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              8. Browser Extension
            </h2>
            <p>Permissions:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>activeTab:</strong> Read current tab URL</li>
              <li><strong>storage:</strong> Store API key (sync) and history (local)</li>
              <li><strong>clipboardWrite:</strong> Copy shortened URLs</li>
              <li><strong>host_permissions:</strong> Communicate with API endpoint</li>
            </ul>
            <p className="mt-4">All data stored locally on your device. No tracking or telemetry. The extension can be configured for any self-hosted instance.</p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              9. Your Rights
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Access:</strong> You may request a copy of all data (URLs and API key metadata) associated with your API keys by contacting your deployment administrator</li>
              <li><strong>Deletion:</strong> API keys and links can be revoked at any time using admin scripts (<code>npm run admin:revoke-key</code> and <code>npm run admin:revoke-link</code>). Browser extension data can be cleared through your browser&apos;s settings or by uninstalling the extension</li>
              <li><strong>Correction:</strong> Since we only store URLs and hashed keys, there is no mechanism to &quot;correct&quot; data. You can revoke and recreate links if needed</li>
            </ul>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              10. GDPR and CCPA Compliance
            </h2>
            <p className="mb-4">As a self-hosted application, you are the data controller and responsible for compliance.</p>
            
            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              10.1 GDPR (EEA)
            </h3>
            <p>Users have the right to access, rectification, deletion, data portability, object to processing, and withdraw consent.</p>

            <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-6">
              10.2 CCPA (California)
            </h3>
            <p>Users have the right to know what personal information is collected, delete personal information, and opt-out of sale (we do not sell data).</p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              11. Children&apos;s Privacy
            </h2>
            <p>Not directed to individuals under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              12. Contact
            </h2>
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-blue-100 font-semibold mb-2">
                Self-Hosted Application Notice
              </p>
              <p className="text-blue-200 text-sm">
                Privacy inquiries should be directed to your deployment administrator. Each self-hosted instance is independently operated.
              </p>
            </div>
            <p>For questions about this policy template or the application:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>GitHub:</strong> <a href="https://github.com/AndrewN04/url-shortner" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">github.com/AndrewN04/url-shortner</a></li>
            </ul>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              13. Changes to This Policy
            </h2>
            <p>This policy may be updated. The &quot;Last Updated&quot; date indicates when changes were made. Continued use after changes constitutes acceptance.</p>
          </section>

          {/* Summary */}
          <section className="border-t-2 border-zinc-700 pt-8 mt-12">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              Summary
            </h2>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
              <ul className="space-y-2">
                <li>Minimal data collection: only URLs, hashed API keys, and temporary rate limit data</li>
                <li>No analytics, tracking, or cookies</li>
                <li>API keys hashed with HMAC-SHA256, never stored in plaintext</li>
                <li>Browser extension data stored locally on device</li>
                <li>Self-hosted: you control all data and infrastructure</li>
                <li>Data can be deleted at any time via admin scripts or browser settings</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
