"use client"

import { useEffect, useState, memo, useMemo, useCallback } from "react"
import type { Editor } from "@tiptap/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, FileSpreadsheet, FileCheck } from "lucide-react"

interface TemplateManagerProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
  getTemplates?: () => Promise<Template[]>
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string
  html: string
}

const TemplateManager = memo(function TemplateManager({ editor, isOpen, onClose, getTemplates }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "invoice-basic",
      name: "Basic Invoice",
      description: "A simple invoice template with company and client details",
      category: "Invoice",
      icon: "receipt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h1 style="color: #2563eb; margin: 0;">INVOICE</h1>
              <p style="margin: 5px 0; color: #64748b;">Invoice #: INV-2023-001</p>
              <p style="margin: 5px 0; color: #64748b;">Date: {{date}}</p>
              <p style="margin: 5px 0; color: #64748b;">Due Date: {{dueDate}}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #334155;">{{companyName}}</h2>
              <p style="margin: 5px 0;">{{companyAddress}}</p>
              <p style="margin: 5px 0;">{{companyCity}}, {{companyState}} {{companyZip}}</p>
              <p style="margin: 5px 0;">{{companyPhone}}</p>
              <p style="margin: 5px 0;">{{companyEmail}}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0; color: #334155;">Bill To:</h3>
            <p style="margin: 5px 0;">{{clientName}}</p>
            <p style="margin: 5px 0;">{{clientAddress}}</p>
            <p style="margin: 5px 0;">{{clientCity}}, {{clientState}} {{clientZip}}</p>
            <p style="margin: 5px 0;">{{clientEmail}}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1;">Item</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Rate</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item1Name}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Quantity}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Rate}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Amount}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item2Name}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Quantity}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Rate}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Amount}}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 300px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>{{subtotal}}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Tax ({{taxRate}}%):</span>
                <span>{{taxAmount}}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                <span>Total:</span>
                <span>{{total}}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 10px 0; color: #334155;">Payment Information:</h3>
            <p style="margin: 5px 0;">Bank: {{bankName}}</p>
            <p style="margin: 5px 0;">Account Name: {{accountName}}</p>
            <p style="margin: 5px 0;">Account Number: {{accountNumber}}</p>
            <p style="margin: 5px 0;">Routing Number: {{routingNumber}}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #64748b;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      `,
    },
    {
      id: "invoice-detailed",
      name: "Detailed Invoice",
      description: "A comprehensive invoice with payment terms and notes",
      category: "Invoice",
      icon: "fileCheck",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h1 style="color: #0f766e; margin: 0; font-size: 28px;">INVOICE</h1>
              <div style="height: 4px; width: 100px; background-color: #0f766e; margin: 10px 0;"></div>
              <p style="margin: 5px 0; color: #334155;"><strong>Invoice #:</strong> INV-{{invoiceNumber}}</p>
              <p style="margin: 5px 0; color: #334155;"><strong>Date:</strong> {{date}}</p>
              <p style="margin: 5px 0; color: #334155;"><strong>Due Date:</strong> {{dueDate}}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #0f766e;">{{companyName}}</h2>
              <p style="margin: 5px 0;">{{companyAddress}}</p>
              <p style="margin: 5px 0;">{{companyCity}}, {{companyState}} {{companyZip}}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> {{companyPhone}}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> {{companyEmail}}</p>
              <p style="margin: 5px 0;"><strong>Website:</strong> {{companyWebsite}}</p>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="width: 48%;">
              <h3 style="margin: 0; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Bill To:</h3>
              <p style="margin: 10px 0;"><strong>{{clientName}}</strong></p>
              <p style="margin: 5px 0;">{{clientAddress}}</p>
              <p style="margin: 5px 0;">{{clientCity}}, {{clientState}} {{clientZip}}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> {{clientPhone}}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> {{clientEmail}}</p>
            </div>
            <div style="width: 48%;">
              <h3 style="margin: 0; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Ship To:</h3>
              <p style="margin: 10px 0;"><strong>{{shipName}}</strong></p>
              <p style="margin: 5px 0;">{{shipAddress}}</p>
              <p style="margin: 5px 0;">{{shipCity}}, {{shipState}} {{shipZip}}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> {{shipPhone}}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #0f766e; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #0f766e;">#</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #0f766e;">Item & Description</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #0f766e;">Quantity</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #0f766e;">Rate</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #0f766e;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">1</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">
                  <div><strong>{{item1Name}}</strong></div>
                  <div style="color: #64748b; font-size: 0.9em;">{{item1Description}}</div>
                </td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item1Quantity}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item1Rate}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item1Amount}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">2</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">
                  <div><strong>{{item2Name}}</strong></div>
                  <div style="color: #64748b; font-size: 0.9em;">{{item2Description}}</div>
                </td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item2Quantity}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item2Rate}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item2Amount}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">3</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">
                  <div><strong>{{item3Name}}</strong></div>
                  <div style="color: #64748b; font-size: 0.9em;">{{item3Description}}</div>
                </td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item3Quantity}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item3Rate}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">{{item3Amount}}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="width: 48%;">
              <h3 style="margin: 0 0 10px 0; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Notes:</h3>
              <p style="margin: 5px 0;">{{notes}}</p>
              
              <h3 style="margin: 20px 0 10px 0; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Terms & Conditions:</h3>
              <p style="margin: 5px 0;">{{terms}}</p>
            </div>
            <div style="width: 48%;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{subtotal}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Discount ({{discountRate}}%):</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{discountAmount}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tax ({{taxRate}}%):</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{taxAmount}}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 8px; text-align: left; font-weight: bold; font-size: 1.1em; border-bottom: 2px solid #0f766e;">Total:</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 1.1em; border-bottom: 2px solid #0f766e;">{{total}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; text-align: left; color: #0f766e; font-weight: bold;">Amount Due:</td>
                  <td style="padding: 8px; text-align: right; color: #0f766e; font-weight: bold;">{{amountDue}}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 10px 0; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Payment Information:</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <p style="margin: 5px 0;"><strong>Bank:</strong> {{bankName}}</p>
                <p style="margin: 5px 0;"><strong>Account Name:</strong> {{accountName}}</p>
                <p style="margin: 5px 0;"><strong>Account Number:</strong> {{accountNumber}}</p>
                <p style="margin: 5px 0;"><strong>Routing Number:</strong> {{routingNumber}}</p>
              </div>
              <div style="width: 48%;">
                <p style="margin: 5px 0;"><strong>Payment Terms:</strong> {{paymentTerms}}</p>
                <p style="margin: 5px 0;"><strong>Due Date:</strong> {{dueDate}}</p>
                <p style="margin: 5px 0;"><strong>Late Fee:</strong> {{lateFee}}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #0f766e; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-weight: bold;">Thank you for your business!</p>
          </div>
        </div>
      `,
    },
    {
      id: "receipt",
      name: "Payment Receipt",
      description: "A simple receipt for payment confirmation",
      category: "Receipt",
      icon: "fileText",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; margin: 0;">RECEIPT</h1>
            <p style="margin: 5px 0; color: #64748b;">Receipt #: REC-{{receiptNumber}}</p>
            <p style="margin: 5px 0; color: #64748b;">Date: {{date}}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">From:</h3>
            <p style="margin: 5px 0;">{{companyName}}</p>
            <p style="margin: 5px 0;">{{companyAddress}}</p>
            <p style="margin: 5px 0;">{{companyCity}}, {{companyState}} {{companyZip}}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">To:</h3>
            <p style="margin: 5px 0;">{{clientName}}</p>
            <p style="margin: 5px 0;">{{clientEmail}}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Payment Details:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e2e8f0;">{{paymentMethod}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Invoice Number:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e2e8f0;">INV-{{invoiceNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Amount Paid:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">{{amountPaid}}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #64748b;">
            <p>Thank you for your payment!</p>
          </div>
        </div>
      `,
    },
    {
      id: "quote",
      name: "Business Quote",
      description: "A professional quote for services or products",
      category: "Quote",
      icon: "fileSpreadsheet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h1 style="color: #7c3aed; margin: 0;">QUOTE</h1>
              <p style="margin: 5px 0; color: #64748b;">Quote #: QT-{{quoteNumber}}</p>
              <p style="margin: 5px 0; color: #64748b;">Date: {{date}}</p>
              <p style="margin: 5px 0; color: #64748b;">Valid Until: {{validUntil}}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #334155;">{{companyName}}</h2>
              <p style="margin: 5px 0;">{{companyAddress}}</p>
              <p style="margin: 5px 0;">{{companyCity}}, {{companyState}} {{companyZip}}</p>
              <p style="margin: 5px 0;">{{companyPhone}}</p>
              <p style="margin: 5px 0;">{{companyEmail}}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Prepared For:</h3>
            <p style="margin: 5px 0;">{{clientName}}</p>
            <p style="margin: 5px 0;">{{clientAddress}}</p>
            <p style="margin: 5px 0;">{{clientCity}}, {{clientState}} {{clientZip}}</p>
            <p style="margin: 5px 0;">{{clientEmail}}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1;">Item</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1;">Description</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Rate</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item1Name}}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item1Description}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Quantity}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Rate}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item1Amount}}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item2Name}}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{item2Description}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Quantity}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Rate}}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">{{item2Amount}}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 300px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>{{subtotal}}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Tax ({{taxRate}}%):</span>
                <span>{{taxAmount}}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                <span>Total:</span>
                <span>{{total}}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 40px;">
            <h3 style="margin: 0 0 10px 0; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Terms & Conditions:</h3>
            <p style="margin: 5px 0;">{{terms}}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #7c3aed;">
            <p>Thank you for considering our services!</p>
          </div>
        </div>
      `,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Load templates from external source if provided
  useEffect(() => {
    const loadTemplates = async () => {
      if (getTemplates) {
        try {
          setLoading(true)
          const loadedTemplates = await getTemplates()
          if (loadedTemplates && loadedTemplates.length > 0) {
            setTemplates(loadedTemplates)
          }
        } catch (error) {
          console.error("Error loading templates:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, getTemplates])

  // Get unique categories - memoize to prevent recalculation on each render
  const categories = useMemo(() => Array.from(new Set(templates.map((t) => t.category))), [templates])

  // Filter templates by category - memoize to prevent filtering on every render
  const filteredTemplates = useMemo(() => 
    selectedCategory ? templates.filter((t) => t.category === selectedCategory) : templates
  , [selectedCategory, templates])

  const insertTemplate = useCallback((template: Template) => {
    if (editor) {
      try {
        editor.commands.insertContent(template.html)
        onClose()
      } catch (error) {
        console.error("Error inserting template:", error)
      }
    }
  }, [editor, onClose])

  const getIcon = useCallback((iconName: string) => {
    switch (iconName) {
      case "receipt":
        return <Receipt className="h-6 w-6" />
      case "fileText":
        return <FileText className="h-6 w-6" />
      case "fileSpreadsheet":
        return <FileSpreadsheet className="h-6 w-6" />
      case "fileCheck":
        return <FileCheck className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to insert into your document. You can customize it after insertion.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 my-4">
          <Button variant={selectedCategory === null ? "default" : "outline"} onClick={() => setSelectedCategory(null)}>
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getIcon(template.icon)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-40 overflow-hidden bg-gray-50 border-y border-gray-100">
                      <div className="scale-[0.4] origin-top-left h-full w-[250%] p-4 overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: template.html }} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button onClick={() => insertTemplate(template)} className="w-full">
                      Insert Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

TemplateManager.displayName = "TemplateManager"

export default TemplateManager
