export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <a href="/" className="text-xs text-gray-500 hover:text-white mb-8 inline-block">← Back</a>
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>By using InstaDown you agree to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Only download content you have the right to download.</li>
          <li>Only use this tool on publicly accessible Instagram content.</li>
          <li>Not use this service for any unlawful purpose.</li>
          <li>Respect the intellectual property rights of content creators.</li>
        </ul>
        <p className="pt-4 text-gray-600 text-xs">
          This service is provided &quot;as is&quot; without warranty. Not affiliated with Meta Platforms, Inc.
        </p>
      </div>
    </main>
  );
}
