import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <RegisterForm />
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="text-white max-w-md space-y-6">
          <h1 className="text-4xl font-bold">Rejoignez PerformePLUS</h1>
          <p className="text-xl">
            Des milliers d'équipes nous font confiance pour optimiser leurs performances
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="font-semibold">Gratuit pour commencer</p>
                <p className="text-sm text-white/80">Créez votre équipe en 2 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="font-semibold">Conformité RGPD</p>
                <p className="text-sm text-white/80">Vos données sont sécurisées</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="font-semibold">Support dédié</p>
                <p className="text-sm text-white/80">Notre équipe vous accompagne</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}