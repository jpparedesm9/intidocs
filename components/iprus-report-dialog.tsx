"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ArrowLeft, Send, FileText, AlertCircle, Upload, Lock, Eye, ArrowRight, FileSignature } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createPortal } from "react-dom"

interface IprusReportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function IprusReportDialog({ isOpen, onClose }: IprusReportDialogProps) {
  // States for different views
  const [view, setView] = useState<'preview' | 'signing'>('preview')
  const [mounted, setMounted] = useState(false)
  const [pdfLoadError, setPdfLoadError] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Wait for component to be mounted to create portal and fetch PDF
  useEffect(() => {
    setMounted(true)
    
    // Fetch PDF data when component mounts
    const fetchPdfData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('https://servicios.municipiodemejia.gob.ec/planificacionTerritorial/rest/irm/consultarInformePreliminarPdf/10032', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data && data.irm && data.irm.pdf) {
          setPdfData(data.irm.pdf)
        } else {
          throw new Error('PDF data not found in the response')
        }
      } catch (error) {
        console.error('Error fetching PDF:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido al obtener el PDF')
        setPdfLoadError(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (mounted) {
      fetchPdfData()
    }
    
    return () => {
      setMounted(false)
    }
  }, [mounted])

  // Handle going to signing view
  const handleGoToSigning = useCallback(() => {
    setView('signing')
  }, [])

  // Handle file change for p12 certificate
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }, [])

  // Handle cancel button
  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  // Handle return to preview
  const handleReturnToPreview = useCallback(() => {
    setView('preview')
  }, [])

  // Handle send report
  const handleSendReport = useCallback(() => {
    if (view === 'signing' && (!selectedFile || !password)) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo .p12 y proporcione la contraseña",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Informe IPRUS enviado",
      description: "El informe ha sido firmado y enviado exitosamente.",
    })
    onClose()
  }, [view, selectedFile, password, toast, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Don't render anything if not open
  if (!isOpen || !mounted) return null
  
  // Use createPortal to render dialog at the root level
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center overflow-y-auto p-4"
      onClick={handleBackdropClick}
      style={{ isolation: 'isolate' }} // Crear nuevo contexto de apilamiento
    >
      <div 
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {view === 'preview' && "Informe IPRUS"}
            {view === 'signing' && "Firmar Informe IPRUS"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {view === 'preview' && (
            <div className="flex flex-col">
              {/* PDF Preview */}
              <div className="flex-1 relative">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[450px] text-gray-500 bg-gray-50 rounded border p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Cargando PDF...</h3>
                    <p className="text-sm text-center mb-4 max-w-md">
                      Obteniendo el documento del servidor. Por favor espere...
                    </p>
                  </div>
                ) : pdfLoadError || error ? (
                  <div className="flex flex-col items-center justify-center h-[450px] text-gray-500 bg-gray-50 rounded border p-4">
                    <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
                    <h3 className="text-lg font-medium mb-2">No se pudo cargar el PDF</h3>
                    <p className="text-sm text-center mb-4 max-w-md">
                      {error || "El documento no está disponible en este momento."}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfLoadError(false)
                        setError(null)
                        setIsLoading(true)
                        // Re-fetch the PDF
                        fetch('https://servicios.municipiodemejia.gob.ec/planificacionTerritorial/rest/irm/consultarInformePreliminarPdf/10032', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        })
                          .then(response => {
                            if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`)
                            return response.json()
                          })
                          .then(data => {
                            if (data && data.irm && data.irm.pdf) {
                              setPdfData(data.irm.pdf)
                              setPdfLoadError(false)
                            } else {
                              throw new Error('PDF data not found in the response')
                            }
                          })
                          .catch(err => {
                            console.error('Error fetching PDF:', err)
                            setError(err instanceof Error ? err.message : 'Error desconocido al obtener el PDF')
                            setPdfLoadError(true)
                          })
                          .finally(() => {
                            setIsLoading(false)
                          })
                      }}
                    >
                      Intentar de nuevo
                    </Button>
                  </div>
                ) : pdfData ? (
                  <div>
                    <iframe
                      id="iprus-preview-iframe"
                      src={`data:application/pdf;base64,${pdfData}`}
                      className="w-full h-[500px] border rounded"
                      onError={() => setPdfLoadError(true)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[450px] text-gray-500 bg-gray-50 rounded border p-4">
                    <AlertCircle className="h-12 w-12 mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">No hay datos de PDF</h3>
                    <p className="text-sm text-center mb-4 max-w-md">
                      No se recibieron datos del PDF desde el servidor.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                  <p className="font-medium">Información del documento:</p>
                  <p className="mt-1">Este es el Informe IPRUS oficial. Para continuar con el proceso de firma digital, haga clic en "Firmar Documento".</p>
                </div>
              </div>
            </div>
          )}

          {view === 'signing' && (
            <div className="flex flex-col">
              <div className="bg-gray-50 p-4 rounded border mb-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FileSignature className="h-5 w-5 mr-2 text-blue-600" />
                  Firma Digital
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Para firmar digitalmente el documento, necesita seleccionar su certificado digital (.p12) 
                  e ingresar la contraseña de protección.
                </p>
                
                <div className="space-y-4">
                  {/* Certificate File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="certificate" className="block font-medium">
                      Certificado Digital (.p12)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file" 
                        id="certificate" 
                        accept=".p12"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap"
                        onClick={() => document.getElementById('certificate')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Seleccionar
                      </Button>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-green-600 mt-1">
                        Archivo seleccionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Certificate Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="block font-medium">
                      Contraseña del Certificado
                    </Label>
                    <div className="relative">
                      <Input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        placeholder="Ingrese la contraseña de su certificado digital"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                <p className="font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Importante:
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>La firma digital tiene validez legal</li>
                  <li>Asegúrese de haber revisado el documento antes de firmarlo</li>
                  <li>Su certificado debe estar vigente y no revocado</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between gap-2">
          {/* Left side buttons */}
          <div>
            {view === 'signing' && (
              <Button 
                variant="outline" 
                onClick={handleReturnToPreview}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> 
                Volver a Vista Previa
              </Button>
            )}
          </div>
          
          {/* Right side buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            
            {view === 'preview' && (
              <Button 
                onClick={handleGoToSigning}
                disabled={isLoading || pdfLoadError || !pdfData}
              >
                <FileSignature className="h-4 w-4 mr-2" /> Firmar Documento
              </Button>
            )}
            
            {view === 'signing' && (
              <Button 
                onClick={handleSendReport}
                disabled={!selectedFile || !password}
              >
                <FileSignature className="h-4 w-4 mr-2" /> Firmar y Enviar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}