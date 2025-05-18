"use client"

import { useState } from "react"
import {
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Inbox,
  Send,
  CheckSquare,
  Hourglass,
  BarChart,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TramiteStats {
  total: number
  pendientes: number
  enProceso: number
  finalizados: number
  vencidos: number
  porVencer: number
}

interface TramiteReciente {
  id: string
  titulo: string
  estado: "pendiente" | "en_proceso" | "finalizado" | "vencido"
  responsable: string
  fechaIngreso: string
  fechaVencimiento?: string
}

export function DashboardView() {
  const [periodo, setPeriodo] = useState("mes")
  const [departamento, setDepartamento] = useState("todos")

  // Datos de ejemplo para el dashboard
  const tramiteStats: TramiteStats = {
    total: 124,
    pendientes: 42,
    enProceso: 35,
    finalizados: 38,
    vencidos: 5,
    porVencer: 4,
  }

  const tramitesRecientes: TramiteReciente[] = [
    {
      id: "TRM-2024-001",
      titulo: "Solicitud de Licencia Ambiental",
      estado: "pendiente",
      responsable: "Ana M.",
      fechaIngreso: "01/05/2024",
      fechaVencimiento: "15/05/2024",
    },
    {
      id: "TRM-2024-002",
      titulo: "Emisión de Certificado TRM",
      estado: "en_proceso",
      responsable: "Carlos V.",
      fechaIngreso: "02/05/2024",
      fechaVencimiento: "20/05/2024",
    },
    {
      id: "TRM-2024-003",
      titulo: "Análisis de Propuesta Comercial",
      estado: "finalizado",
      responsable: "Juan P.",
      fechaIngreso: "03/05/2024",
    },
    {
      id: "TRM-2024-004",
      titulo: "Actualización Base de Datos Proveedores",
      estado: "vencido",
      responsable: "Ana M.",
      fechaIngreso: "15/04/2024",
      fechaVencimiento: "01/05/2024",
    },
    {
      id: "TRM-2024-005",
      titulo: "Solicitud de Permiso Ambiental",
      estado: "pendiente",
      responsable: "Carlos V.",
      fechaIngreso: "06/05/2024",
      fechaVencimiento: "30/05/2024",
    },
  ]

  // Comparación con periodo anterior (datos de ejemplo)
  const comparacion = {
    total: 12, // 12% más que el periodo anterior
    pendientes: -5, // 5% menos que el periodo anterior
    enProceso: 8, // 8% más que el periodo anterior
    finalizados: 15, // 15% más que el periodo anterior
  }

  // Función para obtener el color y el icono según el estado
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pendiente":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-4 w-4" />,
          text: "Pendiente",
        }
      case "en_proceso":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <Hourglass className="h-4 w-4" />,
          text: "En Proceso",
        }
      case "finalizado":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Finalizado",
        }
      case "vencido":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="h-4 w-4" />,
          text: "Vencido",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <FileText className="h-4 w-4" />,
          text: status,
        }
    }
  }

  return (
    <div className="flex flex-col w-full h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Trámites</h1>
            <p className="text-gray-500">Resumen y estadísticas de trámites en el sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="año">Este año</option>
            </select>
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="todos">Todos los departamentos</option>
              <option value="legal">Departamento Legal</option>
              <option value="ambiental">Departamento Ambiental</option>
              <option value="comercial">Departamento Comercial</option>
            </select>
            <Button variant="outline" size="sm" className="text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Trámites</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.total}</h3>
              </div>
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {comparacion.total > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{comparacion.total}% </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{Math.abs(comparacion.total)}% </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs. periodo anterior</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.pendientes}</h3>
              </div>
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {comparacion.pendientes > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{comparacion.pendientes}% </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{Math.abs(comparacion.pendientes)}% </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs. periodo anterior</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">En Proceso</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.enProceso}</h3>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Hourglass className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {comparacion.enProceso > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-blue-500">{comparacion.enProceso}% </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-blue-500">{Math.abs(comparacion.enProceso)}% </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs. periodo anterior</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Finalizados</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.finalizados}</h3>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {comparacion.finalizados > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{comparacion.finalizados}% </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{Math.abs(comparacion.finalizados)}% </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs. periodo anterior</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Vencidos</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.vencidos}</h3>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-gray-500">
                {((tramiteStats.vencidos / tramiteStats.total) * 100).toFixed(1)}% del total
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Por Vencer</p>
                <h3 className="text-2xl font-bold mt-1">{tramiteStats.porVencer}</h3>
              </div>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-gray-500">Próximos 7 días</span>
            </div>
          </div>
        </div>

        {/* Gráficos y Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de distribución */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Distribución por Estado</h3>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center items-center h-64">
              {/* Aquí iría un gráfico real, pero usaremos una representación visual simple */}
              <div className="relative w-48 h-48">
                <PieChart className="w-full h-full text-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{tramiteStats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-sm text-gray-600">Pendientes ({tramiteStats.pendientes})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                <span className="text-sm text-gray-600">En Proceso ({tramiteStats.enProceso})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm text-gray-600">Finalizados ({tramiteStats.finalizados})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                <span className="text-sm text-gray-600">Vencidos ({tramiteStats.vencidos})</span>
              </div>
            </div>
          </div>

          {/* Gráfico de tendencia */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Tendencia de Trámites</h3>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center items-center h-64">
              {/* Aquí iría un gráfico real, pero usaremos una representación visual simple */}
              <div className="w-full h-full flex flex-col justify-end">
                <div className="flex items-end justify-between h-48 border-b border-l">
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1">
                      <div className="w-6 bg-yellow-400 rounded-t" style={{ height: "60px" }}></div>
                      <div className="w-6 bg-blue-400 rounded-t" style={{ height: "40px" }}></div>
                      <div className="w-6 bg-green-400 rounded-t" style={{ height: "30px" }}></div>
                    </div>
                    <span className="text-xs mt-1">Ene</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1">
                      <div className="w-6 bg-yellow-400 rounded-t" style={{ height: "50px" }}></div>
                      <div className="w-6 bg-blue-400 rounded-t" style={{ height: "45px" }}></div>
                      <div className="w-6 bg-green-400 rounded-t" style={{ height: "35px" }}></div>
                    </div>
                    <span className="text-xs mt-1">Feb</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1">
                      <div className="w-6 bg-yellow-400 rounded-t" style={{ height: "40px" }}></div>
                      <div className="w-6 bg-blue-400 rounded-t" style={{ height: "50px" }}></div>
                      <div className="w-6 bg-green-400 rounded-t" style={{ height: "45px" }}></div>
                    </div>
                    <span className="text-xs mt-1">Mar</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1">
                      <div className="w-6 bg-yellow-400 rounded-t" style={{ height: "45px" }}></div>
                      <div className="w-6 bg-blue-400 rounded-t" style={{ height: "55px" }}></div>
                      <div className="w-6 bg-green-400 rounded-t" style={{ height: "50px" }}></div>
                    </div>
                    <span className="text-xs mt-1">Abr</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1">
                      <div className="w-6 bg-yellow-400 rounded-t" style={{ height: "55px" }}></div>
                      <div className="w-6 bg-blue-400 rounded-t" style={{ height: "45px" }}></div>
                      <div className="w-6 bg-green-400 rounded-t" style={{ height: "40px" }}></div>
                    </div>
                    <span className="text-xs mt-1">May</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-sm text-gray-600">Pendientes</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                <span className="text-sm text-gray-600">En Proceso</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm text-gray-600">Finalizados</span>
              </div>
            </div>
          </div>

          {/* Resumen por departamento */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Resumen por Departamento</h3>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Departamento Legal</span>
                  <span className="text-sm text-gray-500">42 trámites</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Departamento Ambiental</span>
                  <span className="text-sm text-gray-500">38 trámites</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Departamento Comercial</span>
                  <span className="text-sm text-gray-500">25 trámites</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recursos Humanos</span>
                  <span className="text-sm text-gray-500">19 trámites</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="link" className="text-indigo-600 p-0 h-auto text-sm">
                Ver todos los departamentos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trámites recientes y Resumen de actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trámites recientes */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-700">Trámites Recientes</h3>
              <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200">
                Ver todos
              </Button>
            </div>
            <div className="divide-y">
              {tramitesRecientes.map((tramite) => {
                const statusInfo = getStatusInfo(tramite.estado)
                return (
                  <div key={tramite.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{tramite.id}</span>
                          <Badge variant="outline" className={`ml-2 ${statusInfo.color} flex items-center gap-1`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{tramite.titulo}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          <span>{tramite.responsable}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{tramite.fechaIngreso}</span>
                        </div>
                      </div>
                      {tramite.fechaVencimiento && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Vence el:</div>
                          <div
                            className={
                              tramite.estado === "vencido"
                                ? "text-sm font-medium text-red-600"
                                : "text-sm font-medium text-gray-700"
                            }
                          >
                            {tramite.fechaVencimiento}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resumen de actividad */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-700">Mi Resumen</h3>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center text-indigo-600 mb-2">
                    <Inbox className="h-5 w-5 mr-2" />
                    <span className="font-medium">Recibidos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                  <p className="text-xs text-gray-500 mt-1">Trámites por revisar</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-600 mb-2">
                    <CheckSquare className="h-5 w-5 mr-2" />
                    <span className="font-medium">Tareas</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                  <p className="text-xs text-gray-500 mt-1">Tareas pendientes</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center text-green-600 mb-2">
                    <Send className="h-5 w-5 mr-2" />
                    <span className="font-medium">Enviados</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">24</p>
                  <p className="text-xs text-gray-500 mt-1">Trámites enviados</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Vencidos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">2</p>
                  <p className="text-xs text-gray-500 mt-1">Trámites vencidos</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Solicitudes que vencen hoy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium">TRM-2024-008</p>
                        <p className="text-xs text-gray-500">Solicitud de Permiso</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600">
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium">TRM-2024-012</p>
                        <p className="text-xs text-gray-500">Certificado Ambiental</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600">
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de rendimiento */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-700">Indicadores de Rendimiento</h3>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-700">Tiempo Promedio de Resolución</span>
                  </div>
                  <span className="text-sm text-gray-500">Este mes</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">4.2</span>
                  <span className="text-gray-500 pb-1">días</span>
                </div>
                <div className="flex items-center text-xs">
                  <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">12% </span>
                  <span className="text-gray-500 ml-1">vs. mes anterior (4.8 días)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-700">Tasa de Finalización</span>
                  </div>
                  <span className="text-sm text-gray-500">Este mes</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">78</span>
                  <span className="text-gray-500 pb-1">%</span>
                </div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">5% </span>
                  <span className="text-gray-500 ml-1">vs. mes anterior (73%)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-700">Eficiencia de Procesamiento</span>
                  </div>
                  <span className="text-sm text-gray-500">Este mes</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800">92</span>
                  <span className="text-gray-500 pb-1">%</span>
                </div>
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">3% </span>
                  <span className="text-gray-500 ml-1">vs. mes anterior (89%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
