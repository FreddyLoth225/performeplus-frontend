import { LoginForm } from '@/components/auth/login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <LoginForm />
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="text-white max-w-md space-y-6">
          <h1 className="text-4xl font-bold">PerformePLUS</h1>
          <p className="text-xl">
            La plateforme de gestion de performance sportive pour les équipes modernes
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <span>Suivi complet de la charge d'entraînement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <span>Prévention des blessures par l'analyse</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <span>Visualisation avancée des performances</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}