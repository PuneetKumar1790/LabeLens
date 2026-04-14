const logoUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LabelLens%20Logo%20with%20Nutrition%20Focus-NyWgTBYA4itCeMYEq4Q2kbQOM2zvQu.png'

export const Logo = ({ className = 'h-10 w-10' }) => (
  <img
    src={logoUrl}
    alt="LabelLens"
    className={`${className} object-contain`}
    width="40"
    height="40"
  />
)
