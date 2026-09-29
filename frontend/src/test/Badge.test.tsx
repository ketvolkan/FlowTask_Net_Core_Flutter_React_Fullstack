import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../components/common/Badge'

describe('Badge Component', () => {
  it('renders badge with children text', () => {
    render(<Badge variant="primary">High Priority</Badge>)
    expect(screen.getByText('High Priority')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { container } = render(<Badge variant="danger">Critical</Badge>)
    const span = container.querySelector('span')
    expect(span).toHaveClass('bg-rose-50')
  })
})
