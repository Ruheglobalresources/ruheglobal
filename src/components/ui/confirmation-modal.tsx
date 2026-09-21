"use client"

import { AlertCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
  loadingText?: string
  error?: string | null
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  loadingText = "Processing...",
  error,
}: ConfirmationModalProps) {
  return (
    <Modal
      showModal={isOpen}
      setShowModal={onClose}
      className="max-w-md p-8"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}