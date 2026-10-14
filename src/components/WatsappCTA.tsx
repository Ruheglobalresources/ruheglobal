"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default function WhatsAppFloatingButton() {
  const phoneNumber = "+2347079188992" // Replace with RUHE's WhatsApp number

  const message =
    "Hello RUHE Global Resources, I would like to make an enquiry about studying, working, or migrating abroad. Please I need some guidance."

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-[calc(1.25rem+var(--portal-bar-offset,0px))] left-5 z-50 lg:bottom-5">
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-full bg-green-500 px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-600"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
          <MessageCircle className="h-6 w-6" />
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-none">
            Chat with RUHE
          </p>
          <p className="mt-1 text-xs text-white/90">
            Start your journey abroad
          </p>
        </div>
      </Link>

      {/* Pulse animation */}
      <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-500/40" />
    </div>
  )
}