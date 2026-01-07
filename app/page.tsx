export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-4">
          a04.dev link shortener
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-6">
          This service redirects short links. If you expected a redirect, check
          the full URL.
        </p>
        <a
          href="https://a04.dev"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to a04.dev
        </a>
      </div>
    </main>
  );
}
