import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled button' })
    expect(button).toBeDisabled()
  })

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
  })

  it('should apply size classes', () => {
    render(<Button size="lg">Large button</Button>)
    
    const button = screen.getByRole('button', { name: 'Large button' })
    expect(button).toHaveClass('h-10')
  })

  it('should render as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: 'Link button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom button</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom button' })
    expect(button).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    
    render(<Button ref={ref}>Button with ref</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should render with default props', () => {
    render(<Button>Default button</Button>)
    
    const button = screen.getByRole('button', { name: 'Default button' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('h-9')
  })

  it('should handle multiple props together', () => {
    const handleClick = jest.fn()
    
    render(
      <Button 
        variant="destructive" 
        size="lg" 
        className="custom-class"
        onClick={handleClick}
      >
        Complex button
      </Button>
    )
    
    const button = screen.getByRole('button', { name: 'Complex button' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('custom-class')
    expect(button).not.toBeDisabled()
  })
})