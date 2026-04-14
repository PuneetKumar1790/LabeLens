export const PHBanner = () => (
  <section className="bg-accent px-5 py-14 text-bg sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-syne text-3xl font-bold">We're live on Product Hunt 🚀</h2>
        <p className="mt-2 font-syne text-sm text-bg/70">
          Support LabelLens and help us reach more people
        </p>
      </div>
      <a
        href="https://www.producthunt.com/posts/labellens"
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit rounded-sm border border-bg px-5 py-3 font-syne text-sm font-bold text-bg"
      >
        Upvote on Product Hunt ↗
      </a>
    </div>
  </section>
)
