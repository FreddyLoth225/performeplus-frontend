'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from '@/lib/validators/auth.schemas'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isRegistering } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptCGU: false,
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, acceptCGU, ...registerData } = data
    registerUser(registerData)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
        <CardDescription>
          Créez votre compte PerformePLUS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                placeholder="Doe"
                disabled={isRegistering}
                {...register('nom')}
              />
              {errors.nom && (
                <p className="text-sm text-danger">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenoms">Prénom(s) *</Label>
              <Input
                id="prenoms"
                placeholder="John"
                disabled={isRegistering}
                {...register('prenoms')}
              />
              {errors.prenoms && (
                <p className="text-sm text-danger">{errors.prenoms.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              disabled={isRegistering}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone (optionnel)</Label>
            <Input
              id="telephone"
              type="tel"
              placeholder="+225 07 XX XX XX XX"
              disabled={isRegistering}
              {...register('telephone')}
            />
            {errors.telephone && (
              <p className="text-sm text-danger">{errors.telephone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isRegistering}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-danger">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              8 caractères min., 1 majuscule, 1 chiffre, 1 caractère spécial
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isRegistering}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptCGU"
              checked={watch('acceptCGU')}
              onCheckedChange={(checked) => setValue('acceptCGU', checked as boolean)}
            />
            <Label htmlFor="acceptCGU" className="text-sm font-normal leading-tight cursor-pointer">
              J'accepte les{' '}
              <Link href="/cgu" className="text-primary hover:underline">
                Conditions Générales d'Utilisation
              </Link>{' '}
              et la{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>
            </Label>
          </div>
          {errors.acceptCGU && (
            <p className="text-sm text-danger">{errors.acceptCGU.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}