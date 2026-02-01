import { render, screen } from '@testing-library/react'
import { StatsCard } from '@/components/stats-card'
import { BookOpen } from 'lucide-react'

describe('StatsCard', () => {
  it('should render title and value correctly', () => {
    render(
      <StatsCard
        title="Total Books"
        value="100"
        change={10}
        trend="up"
        icon={BookOpen}
        description="in the library"
      />
    )

    expect(screen.getByText('Total Books')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('in the library')).toBeInTheDocument()
  })

  it('should render with up trend', () => {
    const { container } = render(
      <StatsCard
        title="Users"
        value="50"
        change={5}
        trend="up"
        icon={BookOpen}
        description="active users"
      />
    )

    expect(container.querySelector('[class*="text-emerald"]')).toBeInTheDocument()
  })

  it('should render with down trend', () => {
    const { container } = render(
      <StatsCard
        title="Users"
        value="50"
        change={-5}
        trend="down"
        icon={BookOpen}
        description="active users"
      />
    )

    expect(container.querySelector('[class*="text-red"]')).toBeInTheDocument()
  })

  it('should render icon component', () => {
    const { container } = render(
      <StatsCard
        title="Books"
        value="100"
        change={0}
        trend="up"
        icon={BookOpen}
        description="total"
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
