"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchAddresses, type AddressResult } from "@/lib/address-search"

interface AddressSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: AddressResult) => void
  placeholder?: string
  className?: string
}

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 350

export function AddressSearch({ value, onChange, onSelect, placeholder, className }: AddressSearchProps) {
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null)

  // Tenta pegar localização do usuário silenciosamente (sem bloquear)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoordsRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      },
      () => { /* negado — continua sem proximidade */ },
      { timeout: 5000, maximumAge: 300_000 },
    )
  }, [])

  const runSearch = useCallback(async (query: string, includeFallback: boolean) => {
    const id = ++requestRef.current
    setLoading(true)
    try {
      const res = await searchAddresses(query, userCoordsRef.current, { includeFallback })
      if (requestRef.current !== id) return
      setResults(res)
      setOpen(res.length > 0)
      setActiveIndex(-1)
    } catch {
      if (requestRef.current !== id) return
      setResults([])
    } finally {
      if (requestRef.current === id) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = value.trim()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(trimmed, /\b\d+[A-Za-z]?\b/.test(trimmed))
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, runSearch])

  // Fecha ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  function handleSelect(result: AddressResult) {
    requestRef.current++ // cancela buscas pendentes
    onChange(result.displayName)
    onSelect(result)
    setOpen(false)
    setResults([])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Ex: Rua das Flores, 123 - Jardins"}
          autoComplete="off"
          className="flex h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.05] px-3 py-2 pr-9 text-sm text-white ring-offset-transparent placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border border-white/[0.08] bg-[#111111] shadow-xl overflow-hidden"
        >
          {results.map((result, i) => (
            <li
              key={result.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault() // evita blur antes do click
                handleSelect(result)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                i === activeIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.04]",
                i > 0 && "border-t border-white/[0.04]",
              )}
            >
              <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-white/30" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{result.primaryText}</p>
                {result.secondaryText && (
                  <p className="text-xs text-white/40 truncate mt-0.5">{result.secondaryText}</p>
                )}
              </div>
              {result.distanceLabel && (
                <span className="text-xs text-white/30 flex-shrink-0 mt-0.5">{result.distanceLabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
