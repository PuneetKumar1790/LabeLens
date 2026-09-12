const logoUrl = '/assets/logo-icon.png'

export const Logo = ({ className = 'h-10 w-10' }) => (
  <img
    src={logoUrl}
    alt="LabelLens"
    className={`${className} object-contain`}
    width="40"
    height="40"
  />
)
