import { Link } from 'react-router'
import logo from '@/imports/clogo.png'

type CocoCareLogoProps = {
  to?: string
  className?: string
  iconClassName?: string
}

export function CocoCareLogo({
  to,
  className = '',
  iconClassName = 'h-8 w-auto max-w-[140px] object-contain',
}: CocoCareLogoProps) {
  const content = (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="Coco Care"
        className={`${iconClassName} shrink-0`}
      />
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="hover:opacity-90 transition-opacity shrink-0">
        {content}
      </Link>
    )
  }

  return content
}
