import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../components/common/Modal'

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('renders modal title and children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Create Sprint">
        <div>Sprint Form Body</div>
      </Modal>
    )
    expect(screen.getByText('Create Sprint')).toBeInTheDocument()
    expect(screen.getByText('Sprint Form Body')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Close Me">
        <div>Body</div>
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
