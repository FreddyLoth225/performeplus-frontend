import { z } from 'zod'

const phoneRegex = /^\+?1?\d{9,15}$/
const passwordPolicy = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const optionalNameField = (max: number, message: string) =>
	z.union([z.string().max(max, message), z.literal('')]).optional()

const optionalPhoneField = z
	.union([
		z.string().regex(phoneRegex, 'Format de téléphone invalide'),
		z.literal(''),
	])
	.optional()

export const profileInfoSchema = z.object({
	nom: optionalNameField(50, '50 caractères maximum'),
	prenoms: optionalNameField(100, '100 caractères maximum'),
	telephone: optionalPhoneField,
	whatsapp: optionalPhoneField,
	langue: z.enum(['fr', 'en', 'pt', 'ar', 'es', 'sw']),
	fuseau_horaire: z.string().min(1, 'Fuseau horaire requis'),
})

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>

export const passwordUpdateSchema = z
	.object({
		old_password: z.string().min(1, 'Ancien mot de passe requis'),
		password: z
			.string()
			.min(8, 'Au moins 8 caractères')
			.regex(
				passwordPolicy,
				'Inclure une majuscule, un chiffre et un caractère spécial'
			),
		confirm_password: z.string().min(1, 'Confirmation requise'),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirm_password'],
	})

export type PasswordUpdateFormValues = z.infer<typeof passwordUpdateSchema>

export const emailChangeSchema = z.object({
	new_email: z.string().email('Email invalide'),
	password: z.string().min(1, 'Mot de passe requis'),
})

export type EmailChangeFormValues = z.infer<typeof emailChangeSchema>
