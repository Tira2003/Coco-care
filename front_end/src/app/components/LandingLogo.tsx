import { Link } from 'react-router'
import palm from '@/imports/logo/palm.svg'
import coco from '@/imports/logo/coco.svg'
import care from '@/imports/logo/care.svg'

const BRAND_GREEN_FILTER =
  'brightness(0) saturate(100%) invert(21%) sepia(48%) saturate(1200%) hue-rotate(70deg) brightness(95%) contrast(90%)'

const WHITE_FILTER = 'brightness(0) invert(1)'

type LandingLogoProps = {
  light: boolean
  to?: string
  className?: string
  variant?: 'nav' | 'footer'
  allWhite?: boolean
}

const SIZE = {
  nav: {
    root: 'h-10',
    palm: 'h-10 w-10',
    coco: 'h-10 w-[4.25rem]',
    care: 'h-10 w-[3.75rem]',
  },
  footer: {
    root: 'h-9',
    palm: 'h-9 w-9',
    coco: 'h-9 w-[3.75rem]',
    care: 'h-9 w-[3.25rem]',
  },
} as const

export function LandingLogo({
  light,
  to = '/',
  className = '',
  variant = 'nav',
  allWhite = false,
}: LandingLogoProps) {
  const sizes = SIZE[variant]
  const transition = 'transition-[filter] duration-300 ease-in-out'

  const palmStyle = { filter: light || allWhite ? WHITE_FILTER : BRAND_GREEN_FILTER }
  const cocoStyle = {
    filter: allWhite ? WHITE_FILTER : light ? undefined : BRAND_GREEN_FILTER,
  }
  const careStyle = { filter: allWhite ? WHITE_FILTER : undefined }

  const content = (
    <div className={`flex items-center gap-1 ${sizes.root} shrink-0 ${className}`}>
      <img
        src={palm}
        alt=""
        aria-hidden
        className={`${sizes.palm} object-contain object-left shrink-0 ${transition}`}
        style={palmStyle}
      />
      <img
        src={coco}
        alt=""
        aria-hidden
        className={`${sizes.coco} object-contain shrink-0 ${transition}`}
        style={cocoStyle}
      />
      <img
        src={care}
        alt=""
        aria-hidden
        className={`${sizes.care} object-contain shrink-0 ${transition}`}
        style={careStyle}
      />
      <span className="sr-only">Coco Care</span>
    </div>
  )

  return (
    <Link to={to} className="hover:opacity-90 transition-opacity shrink-0 py-1">
      {content}
    </Link>
  )
}
