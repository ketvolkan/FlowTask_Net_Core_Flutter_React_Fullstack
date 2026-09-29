import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../components/common/Input'

describe('Input Component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Project Name" placeholder="Enter name" />)
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('handles user typing and triggers onChange', () => {
    const handleChange = vi.fn()
    render(<Input placeholder="Type here" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Type here')
    fireEvent.change(input, { target: { value: 'New text' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
})
