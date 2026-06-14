export const PHBanner = () => (
  <section className="bg-accent px-5 py-14 text-bg sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
      <div>
        <h2 className="font-syne text-3xl font-bold">We are live on Product Hunt! 🚀</h2>
        <p className="mt-2 font-syne text-sm text-bg/70">
          LabelLens is now live. Check out our page and support us with an upvote.
        </p>
      </div>
      <div>
        <a href="https://www.producthunt.com/products/labellens" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=labellens&theme=light" 
            alt="LabelLens - Product Hunt" 
            style={{ width: '250px', height: '54px' }} 
            width="250" 
            height="54" 
          />
        </a>
      </div>
    </div>
  </section>
)
