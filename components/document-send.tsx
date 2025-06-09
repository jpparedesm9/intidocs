"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Mail,
  Plus,
  X,
  Search,
  ChevronRight,
  Lock,
  Send,
  CheckCircle,
  Upload,
  Key,
  AlertCircle,
  Calendar,
  ChevronLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// Mock data for internal users
const mockInternalUsers = [
  { id: "u1", name: "Ana García", email: "ana.garcia@empresa.com", department: "Recursos Humanos" },
  { id: "u2", name: "Luis Fernández", email: "luis.fernandez@empresa.com", department: "Contabilidad" },
  { id: "u3", name: "Sofía Martínez", email: "sofia.martinez@empresa.com", department: "Tecnología" },
  { id: "u4", name: "Pedro Sánchez", email: "pedro.sanchez@empresa.com", department: "Ventas" },
  { id: "u5", name: "Laura Gómez", email: "laura.gomez@empresa.com", department: "Marketing" },
]

// Mock document details
const documentDetails = {
  id: "DOC-2024-002",
  title: "Informe Anual de Gestión 2023",
  status: "Borrador",
  size: "2.5 MB",
  lastModified: "2024-05-23 14:30",
  uploader: "Juan Pérez",
}

interface Recipient {
  id: string
  name: string
  email: string
  department?: string
  isExternal?: boolean
}

export function DocumentSend() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)

  // Recipients State
  const [toRecipients, setToRecipients] = useState<Recipient[]>([])
  const [ccRecipients, setCcRecipients] = useState<Recipient[]>([])
  const [bccRecipients, setBccRecipients] = useState<Recipient[]>([])
  const [internalUserSearch, setInternalUserSearch] = useState("")
  const [filteredInternalUsers, setFilteredInternalUsers] = useState(mockInternalUsers)
  const [externalEmailInput, setExternalEmailInput] = useState("")
  const [externalEmailError, setExternalEmailError] = useState("")

  // Send Options State (now integrated)
  const [priority, setPriority] = useState("Normal")
  const [confidentiality, setConfidentiality] = useState("Normal")
  const [dueDate, setDueDate] = useState("")

  // Sign & Send State
  const [signOption, setSignOption] = useState("signWithP12")
  const [p12File, setP12File] = useState<File | null>(null)
  const [p12Password, setP12Password] = useState("")
  const [systemPassword, setSystemPassword] = useState("")
  const [signingMessage, setSigningMessage] = useState("")
  const [isSigning, setIsSigning] = useState(false)

  // Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)

  // Filter internal users based on search term
  useEffect(() => {
    if (internalUserSearch) {
      setFilteredInternalUsers(
        mockInternalUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(internalUserSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(internalUserSearch.toLowerCase()) ||
            user.department.toLowerCase().includes(internalUserSearch.toLowerCase()),
        ),
      )
    } else {
      setFilteredInternalUsers(mockInternalUsers)
    }
  }, [internalUserSearch])

  // Handle adding internal user to a recipient list
  const addInternalRecipient = (user: any, listSetter: React.Dispatch<React.SetStateAction<Recipient[]>>) => {
    listSetter((prev) => {
      if (!prev.some((r) => r.id === user.id)) {
        return [...prev, user]
      }
      return prev
    })
    setInternalUserSearch("")
  }

  // Handle adding external email
  const addExternalEmail = (listSetter: React.Dispatch<React.SetStateAction<Recipient[]>>) => {
    const email = externalEmailInput.trim()
    if (!email) {
      setExternalEmailError("El correo electrónico no puede estar vacío.")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setExternalEmailError("Formato de correo electrónico inválido.")
      return
    }
    listSetter((prev) => {
      if (!prev.some((r) => r.email === email)) {
        return [...prev, { id: `ext-${Date.now()}`, name: email, email: email, isExternal: true }]
      }
      return prev
    })
    setExternalEmailInput("")
    setExternalEmailError("")
  }

  // Handle removing recipient
  const removeRecipient = (recipientId: string, listSetter: React.Dispatch<React.SetStateAction<Recipient[]>>) => {
    listSetter((prev) => prev.filter((r) => r.id !== recipientId))
  }

  // Handle file upload for .p12
  const handleP12FileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith(".p12")) {
      setP12File(file)
      setSigningMessage("")
    } else {
      setP12File(null)
      setSigningMessage("Por favor, selecciona un archivo .p12 válido.")
    }
  }

  // Simulate document signing
  const handleSignDocument = async () => {
    setIsSigning(true)
    setSigningMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let success = false
    let msg = ""

    if (signOption === "signWithP12") {
      if (!p12File || !p12Password) {
        msg = "Por favor, carga el archivo .p12 y la contraseña."
      } else {
        msg = "Documento firmado exitosamente con .p12. ¡Enviando!"
        success = true
      }
    } else if (signOption === "signWithSystemPassword") {
      if (!systemPassword) {
        msg = "Por favor, ingresa tu contraseña del sistema."
      } else {
        msg = "Documento firmado exitosamente con contraseña del sistema. ¡Enviando!"
        success = true
      }
    }

    setIsSigning(false)
    setSigningMessage(msg)

    if (success) {
      setModalMessage("¡Documento enviado y firmado con éxito!")
      setIsSuccessModalOpen(true)
      resetFormStates()
    }
  }

  // Handle sending without signing
  const handleSendWithoutSigning = () => {
    setModalMessage("¿Estás seguro de que quieres enviar el documento sin firmar?")
    setConfirmAction(() => () => {
      toast({
        title: "Documento enviado",
        description: "El documento se ha enviado sin firma digital.",
      })
      resetFormStates()
    })
    setIsConfirmModalOpen(true)
  }

  const resetFormStates = () => {
    setStep(1)
    setToRecipients([])
    setCcRecipients([])
    setBccRecipients([])
    setInternalUserSearch("")
    setExternalEmailInput("")
    setExternalEmailError("")
    setPriority("Normal")
    setConfidentiality("Normal")
    setDueDate("")
    setSignOption("signWithP12")
    setP12File(null)
    setP12Password("")
    setSystemPassword("")
    setSigningMessage("")
  }

  const renderRecipientList = (
    recipients: Recipient[],
    listSetter: React.Dispatch<React.SetStateAction<Recipient[]>>,
  ) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {recipients.map((recipient) => (
        <Badge key={recipient.id} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
          {recipient.name}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-4 w-4 p-0 hover:bg-blue-200"
            onClick={() => removeRecipient(recipient.id, listSetter)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )

  const canProceedToSign = toRecipients.length > 0

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Enviar Documento</h1>
            <p className="text-sm text-gray-500 mt-1">
              {documentDetails.title} - {documentDetails.id}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>
              Estado: <span className="font-medium">{documentDetails.status}</span>
            </p>
            <p>Tamaño: {documentDetails.size}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Step Navigation */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Button
                  variant={step === 1 ? "default" : "ghost"}
                  className={`flex-1 ${step === 1 ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setStep(1)}
                >
                  1. Destinatarios y Opciones
                </Button>
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                <Button
                  variant={step === 2 ? "default" : "ghost"}
                  className={`flex-1 ${step === 2 ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setStep(2)}
                  disabled={!canProceedToSign}
                >
                  2. Firmar y Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Recipients & Options Combined */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Recipients Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      Destinatarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Para */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Para:</Label>
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Buscar usuario interno..."
                            className="pl-10"
                            value={internalUserSearch}
                            onChange={(e) => setInternalUserSearch(e.target.value)}
                          />
                        </div>

                        {internalUserSearch && filteredInternalUsers.length > 0 && (
                          <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
                            {filteredInternalUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => addInternalRecipient(user, setToRecipients)}
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {user.email} - {user.department}
                                  </p>
                                </div>
                                <Plus className="h-4 w-4 text-blue-600" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Añadir correo externo"
                            value={externalEmailInput}
                            onChange={(e) => {
                              setExternalEmailInput(e.target.value)
                              setExternalEmailError("")
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") addExternalEmail(setToRecipients)
                            }}
                            className={externalEmailError ? "border-red-500" : ""}
                          />
                          <Button onClick={() => addExternalEmail(setToRecipients)} size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {externalEmailError && <p className="text-sm text-red-600">{externalEmailError}</p>}

                        <div className="min-h-[2rem]">{renderRecipientList(toRecipients, setToRecipients)}</div>
                      </div>
                    </div>

                    <Separator />

                    {/* CC & BCC in compact layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Copia (CC):</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            type="email"
                            placeholder="Añadir CC"
                            value={externalEmailInput}
                            onChange={(e) => setExternalEmailInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") addExternalEmail(setCcRecipients)
                            }}
                            className="text-sm"
                          />
                          <Button onClick={() => addExternalEmail(setCcRecipients)} size="icon" className="h-9 w-9">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="min-h-[1.5rem]">{renderRecipientList(ccRecipients, setCcRecipients)}</div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Copia Oculta (BCC):</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            type="email"
                            placeholder="Añadir BCC"
                            value={externalEmailInput}
                            onChange={(e) => setExternalEmailInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") addExternalEmail(setBccRecipients)
                            }}
                            className="text-sm"
                          />
                          <Button onClick={() => addExternalEmail(setBccRecipients)} size="icon" className="h-9 w-9">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="min-h-[1.5rem]">{renderRecipientList(bccRecipients, setBccRecipients)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Send Options */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      Opciones de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="flex items-center mb-2 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                        Prioridad
                      </Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center mb-2 text-sm">
                        <Lock className="h-4 w-4 mr-2 text-red-500" />
                        Confidencialidad
                      </Label>
                      <Select value={confidentiality} onValueChange={setConfidentiality}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Confidencial">Confidencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center mb-2 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-teal-500" />
                        Fecha Límite
                      </Label>
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
                    </div>

                    <Separator />

                    <div className="pt-2">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!canProceedToSign}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Continuar a Firma
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                      {!canProceedToSign && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Agrega al menos un destinatario para continuar
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Sign & Send */}
          {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Firmar y Enviar Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Resumen del Envío</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Destinatarios:</span>
                        <span className="ml-2 font-medium">{toRecipients.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Prioridad:</span>
                        <span
                          className={`ml-2 font-medium ${priority === "Urgente" ? "text-orange-600" : "text-gray-900"}`}
                        >
                          {priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidencialidad:</span>
                        <span
                          className={`ml-2 font-medium ${confidentiality === "Confidencial" ? "text-red-600" : "text-gray-900"}`}
                        >
                          {confidentiality}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Método de Firma</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${signOption === "signWithP12" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}
                      >
                        <CardContent className="p-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="signOption"
                              value="signWithP12"
                              checked={signOption === "signWithP12"}
                              onChange={(e) => setSignOption(e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex items-center">
                              <Upload className="h-4 w-4 mr-2" />
                              <span className="font-medium">Archivo .p12</span>
                            </div>
                          </label>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${signOption === "signWithSystemPassword" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}
                      >
                        <CardContent className="p-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="signOption"
                              value="signWithSystemPassword"
                              checked={signOption === "signWithSystemPassword"}
                              onChange={(e) => setSignOption(e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex items-center">
                              <Key className="h-4 w-4 mr-2" />
                              <span className="font-medium">Contraseña</span>
                            </div>
                          </label>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${signOption === "sendWithoutSigning" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}
                      >
                        <CardContent className="p-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="signOption"
                              value="sendWithoutSigning"
                              checked={signOption === "sendWithoutSigning"}
                              onChange={(e) => setSignOption(e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex items-center">
                              <Send className="h-4 w-4 mr-2" />
                              <span className="font-medium">Sin firma</span>
                            </div>
                          </label>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {signOption === "signWithP12" && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="p12File" className="text-sm">
                              Archivo .p12:
                            </Label>
                            <Input
                              type="file"
                              id="p12File"
                              accept=".p12"
                              onChange={handleP12FileChange}
                              className="mt-1 h-9"
                            />
                            {p12File && <p className="text-xs text-gray-600 mt-1">Archivo: {p12File.name}</p>}
                          </div>
                          <div>
                            <Label htmlFor="p12Password" className="text-sm">
                              Contraseña:
                            </Label>
                            <Input
                              type="password"
                              id="p12Password"
                              value={p12Password}
                              onChange={(e) => setP12Password(e.target.value)}
                              className="mt-1 h-9"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleSignDocument}
                          disabled={isSigning || !p12File || !p12Password}
                          className="mt-4 bg-green-600 hover:bg-green-700"
                        >
                          {isSigning ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Firmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Firmar y Enviar
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {signOption === "signWithSystemPassword" && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="max-w-md">
                          <Label htmlFor="systemPassword" className="text-sm">
                            Contraseña del sistema:
                          </Label>
                          <Input
                            type="password"
                            id="systemPassword"
                            value={systemPassword}
                            onChange={(e) => setSystemPassword(e.target.value)}
                            className="mt-1 h-9"
                          />
                        </div>
                        <Button
                          onClick={handleSignDocument}
                          disabled={isSigning || !systemPassword}
                          className="mt-4 bg-green-600 hover:bg-green-700"
                        >
                          {isSigning ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Firmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Firmar y Enviar
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {signOption === "sendWithoutSigning" && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4 text-center">
                        <p className="text-gray-600 mb-4">El documento se enviará sin firma digital.</p>
                        <Button onClick={handleSendWithoutSigning} className="bg-red-600 hover:bg-red-700">
                          <Send className="h-4 w-4 mr-2" />
                          Enviar sin Firma
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {signingMessage && (
                    <div
                      className={`p-4 rounded-lg text-center ${signingMessage.includes("exitosamente") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {signingMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Volver a Destinatarios
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
