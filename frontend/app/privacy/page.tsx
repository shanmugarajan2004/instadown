export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <a href="/" className="text-xs text-gray-500 hover:text-white mb-8 inline-block">← Back</a>
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">Data We Collect</h2>
          <p>We do not store any personal data and do not set cookies. The Instagram URLs you submit are used solely to fetch video metadata and are not logged persistently.</p>
        </section>
        <section>
          <h2 className="text-white font-semibold mb-2">Video Content</h2>
          <p>Videos are streamed directly from Instagram&apos;s CDN to your device. We do not store, cache, or re-host any video content.</p>
        </section>
        <section>
          <h2 className="text-white font-semibold mb-2">Third Parties</h2>
          <p>We do not share data with third parties and do not serve advertisements.</p>
        </section>
        <section>
          <h2 className="text-white font-semibold mb-2">Contact</h2>
          <p>Questions? Email <a href="mailto:privacy@instadown.app" className="text-purple-400 hover:underline">privacy@instadown.app</a></p>
        </section>
      </div>
    </main>
  );
}
