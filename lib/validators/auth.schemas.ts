import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis'),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[@$!%*?&]/, 'Au moins un caractère spécial (@$!%*?&)'),
  confirmPassword: z.string(),
  nom: z
    .string()
    .min(2, 'Nom requis'),
  prenoms: z
    .string()
    .min(2, 'Prénom requis'),
  telephone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  acceptCGU: z
    .boolean()
    .refine((val) => val === true, 'Vous devez accepter les CGU'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>