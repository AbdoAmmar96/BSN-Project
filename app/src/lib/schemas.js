import { z } from 'zod';

/**
 * Shared Zod schemas for forms across the SPA. Keep error messages in Arabic
 * (matches the primary UI language); i18n the labels in components, not here.
 *
 * Each schema mirrors the validation rules on the corresponding backend
 * endpoint — if you change one side, change the other.
 */

const arabicMin = (n) => `الحد الأدنى ${n} حرف`;
const arabicMax = (n) => `الحد الأقصى ${n} حرف`;

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, arabicMin(6)),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, arabicMin(2)).max(120, arabicMax(120)),
    email: z.string().email('بريد إلكتروني غير صحيح'),
    password: z.string().min(8, arabicMin(8)),
    password_confirmation: z.string(),
    phone: z.string().max(20).optional().or(z.literal('')),
    company: z.string().max(120).optional().or(z.literal('')),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'كلمتا المرور غير متطابقتين',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email('بريد إلكتروني غير صحيح'),
    token: z.string().min(1, 'الرابط غير صحيح'),
    password: z.string().min(8, arabicMin(8)),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'كلمتا المرور غير متطابقتين',
  });

export const contactSchema = z.object({
  name: z.string().min(2, arabicMin(2)).max(120, arabicMax(120)),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: z.string().max(32).optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(10, arabicMin(10)).max(5000, arabicMax(5000)),
});

export const projectSchema = z.object({
  title: z.string().min(2, arabicMin(2)).max(200, arabicMax(200)),
  description: z.string().max(5000).optional().or(z.literal('')),
  service_type: z.enum(['web', 'ecommerce', 'branding', 'marketing'], {
    errorMap: () => ({ message: 'اختر نوع الخدمة' }),
  }),
  budget: z.coerce.number().nonnegative('قيمة غير صحيحة').optional().nullable(),
});

export const packageSchema = z.object({
  service_type: z.enum(['web', 'ecommerce', 'branding', 'marketing']),
  name: z.string().min(2, arabicMin(2)).max(120, arabicMax(120)),
  price: z.coerce.number().positive('السعر لازم يكون أكبر من صفر'),
  currency: z.string().default('EGP'),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});
