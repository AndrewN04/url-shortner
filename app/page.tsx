import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-zinc-100 mb-4">
            a04.dev link shortener
          </h1>
          <p className="text-zinc-400 leading-relaxed mb-6">
            This service redirects short links. If you expected a redirect, check
            the full URL.
          </p>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Want to self-host one yourself? Visit the project{" "}
            <a
              href="https://github.com/AndrewN04/url-shortner"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              repo
            </a>
            .
          </p>
          <a
            href="https://a04.dev"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to a04.dev
          </a>
        </div>
      </div>
      <footer className="mt-8 pt-6 border-t border-zinc-800 text-center pb-8">
        <Link
          href="/privacy"
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          Privacy Policy
        </Link>
      </footer>
    </main>
  );
}
