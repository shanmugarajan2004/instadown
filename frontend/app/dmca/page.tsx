export default function DMCAPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <a href="/" className="text-xs text-gray-500 hover:text-white mb-8 inline-block">← Back</a>
      <h1 className="text-3xl font-bold text-white mb-8">DMCA Policy</h1>
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          InstaDown does not host, store, or distribute any video content. All content is fetched
          directly from Instagram&apos;s public CDN on demand and streamed to the end user.
          We do not cache or retain any media files.
        </p>
        <p>
          If you believe your copyrighted content is being accessed through this tool, please
          direct your DMCA takedown notice to Meta Platforms, Inc. as they are the host.
        </p>
        <p>
          For other concerns:{' '}
          <a href="mailto:dmca@instadown.app" className="text-purple-400 hover:underline">
            dmca@instadown.app
          </a>
        </p>
      </div>
    </main>
  );
}
