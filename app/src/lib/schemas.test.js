import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  registerSchema,
  contactSchema,
  packageSchema,
} from './schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'hunter22' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'hunter22' });
    expect(r.success).toBe(false);
  });

  it('rejects a short password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '123' });
    expect(r.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('rejects mismatched password confirmation', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      password: 'longenough1',
      password_confirmation: 'different1',
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues?.[0]?.path).toContain('password_confirmation');
  });

  it('accepts a valid registration', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      password: 'longenough1',
      password_confirmation: 'longenough1',
    });
    expect(r.success).toBe(true);
  });
});

describe('contactSchema', () => {
  it('requires a message of at least 10 characters', () => {
    const r = contactSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      message: 'short',
    });
    expect(r.success).toBe(false);
  });

  it('accepts a complete payload', () => {
    const r = contactSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      message: 'محتاج معلومات عن باقات المواقع',
    });
    expect(r.success).toBe(true);
  });
});

describe('packageSchema', () => {
  it('coerces price strings to numbers', () => {
    const r = packageSchema.safeParse({
      service_type: 'web',
      name: 'Landing',
      price: '8500',
    });
    expect(r.success).toBe(true);
    expect(r.data.price).toBe(8500);
  });

  it('rejects non-positive prices', () => {
    const r = packageSchema.safeParse({
      service_type: 'web',
      name: 'Free',
      price: 0,
    });
    expect(r.success).toBe(false);
  });
});
