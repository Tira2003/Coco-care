import { loginSchema, registerSchema, updateProfileSchema } from '../src/modules/auth/auth.schemas.js'

describe('auth schemas', () => {
  it('accepts a login payload', () => {
    const parsed = loginSchema.parse({ username: 'akeel', password: 'password' })
    expect(parsed.username).toBe('akeel')
  })

  it('rejects empty login fields', () => {
    expect(() => loginSchema.parse({ username: '', password: '' })).toThrow()
  })

  it('accepts a farmer registration payload', () => {
    const parsed = registerSchema.parse({
      role: 'farmer',
      username: '199012345678',
      password: 'Secret123',
      name: 'Akeel Bandara',
      phone: '0771234567',
      assignedRegion: 'Kurunegala',
    })
    expect(parsed.role).toBe('farmer')
    expect(parsed.assignedRegion).toBe('Kurunegala')
  })

  it('requires an 8 character password on register', () => {
    expect(() =>
      registerSchema.parse({
        username: '199012345678',
        password: 'short',
        name: 'Akeel Bandara',
        phone: '0771234567',
      }),
    ).toThrow()
  })

  it('accepts a profile update payload', () => {
    const parsed = updateProfileSchema.parse({
      name: 'Sadeepa Lakshan',
      email: 'sadeepal319@gmail.com',
      phone: '+94766668450',
    })
    expect(parsed.name).toBe('Sadeepa Lakshan')
    expect(parsed.email).toBe('sadeepal319@gmail.com')
    expect(parsed.phone).toBe('+94766668450')
  })

  it('treats blank email and phone as null', () => {
    const parsed = updateProfileSchema.parse({
      name: 'Sadeepa Lakshan',
      email: '  ',
      phone: '',
    })
    expect(parsed.email).toBeNull()
    expect(parsed.phone).toBeNull()
  })
})
