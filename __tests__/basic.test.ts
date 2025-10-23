// Basic test to verify Jest is working
describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const message = 'Hello, World!'
    expect(message).toContain('World')
    expect(message.length).toBeGreaterThan(0)
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
    expect(numbers[0]).toBe(1)
  })

  it('should handle object operations', () => {
    const user = { id: 1, name: 'John', email: 'john@example.com' }
    expect(user).toHaveProperty('name')
    expect(user.name).toBe('John')
    expect(user.id).toBe(1)
  })
})
