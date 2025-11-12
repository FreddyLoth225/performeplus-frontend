'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useImportPlayers } from '@/lib/hooks/use-players'
import { useTeamStore } from '@/lib/store/team-store'
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportPlayersDialog({ open, onOpenChange }: ImportPlayersDialogProps) {
  const { currentTeam } = useTeamStore()
  const importPlayers = useImportPlayers()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !currentTeam) return

    await importPlayers.mutateAsync({
      file: selectedFile,
      equipe_id: currentTeam.id,
    })

    setSelectedFile(null)
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    // Template CSV
    const template = `email,nom,prenoms,dateNaissance,dossard,poste,piedFort,poids,taille,nationalite
joueur1@example.com,Diallo,Mamadou,2005-03-15,10,ATTAQUANT,DROITE,75,180,Sénégal
joueur2@example.com,Kouassi,Jean,2004-07-22,7,MILIEU,GAUCHE,72,175,Côte d'Ivoire`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_import_joueurs.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import en masse de joueurs</DialogTitle>
          <DialogDescription>
            Importez plusieurs joueurs à la fois via un fichier CSV ou Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Instructions :</h4>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Téléchargez le modèle de fichier</li>
                <li>Remplissez les informations de vos joueurs</li>
                <li>Importez le fichier complété</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le modèle
              </Button>
            </CardContent>
          </Card>

          {/* Zone de drop */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 hover:border-slate-400',
              selectedFile && 'border-green-500 bg-green-50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Changer de fichier
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto" />
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-slate-600">
                    ou cliquez pour sélectionner
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner un fichier
                </Button>
                <p className="text-xs text-slate-500">
                  Formats acceptés : .csv, .xlsx, .xls (max 2MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importPlayers.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importPlayers.isPending}
          >
            {importPlayers.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Importer les joueurs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}