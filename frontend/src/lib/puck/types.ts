export interface CtaLink {
  text: string
  url: string
}

export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundImage: string
  overlayOpacity: number
  primaryCta: CtaLink
  secondaryCta: CtaLink
}

export interface RichTextBlockProps {
  content: string
  alignment: 'left' | 'center' | 'right'
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
  backgroundColor: 'white' | 'gray' | 'primary'
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
  color: string
}

export interface FeaturesGridBlockProps {
  title: string
  subtitle: string
  columns: 2 | 3 | 4
  items: FeatureItem[]
}

export interface StatItem {
  value: string
  label: string
  description: string
}

export interface StatsBlockProps {
  items: StatItem[]
  backgroundColor: 'white' | 'gray' | 'primary'
}
