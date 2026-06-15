const MIN_RESULTS = 8
const resultCache = new Map<string, { results: AddressResult[]; timestamp: number }>()

export interface AddressResult {
  id: string
  latitude: number
  longitude: number
  primaryText: string
  secondaryText: string
  displayName: string
  source: "photon" | "nominatim" | "nominatim-structured"
  importance: number
  distanceKm?: number | null
  distanceLabel?: string | null
  finalScore: number
}

interface UserCoords {
  latitude: number
  longitude: number
}

function normalizeText(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&")
}

function getDistanceKm(from: UserCoords, to: UserCoords): number {
  const R = 6371
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180
  const lat1 = (from.latitude * Math.PI) / 180
  const lat2 = (to.latitude * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function levenshteinDistance(s: string, t: string): number {
  if (!s.length) return t.length
  if (!t.length) return s.length
  const m = Array.from({ length: s.length + 1 }, (_, i) =>
    Array.from({ length: t.length + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= s.length; i++)
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost)
    }
  return m[s.length][t.length]
}

function similarityScore(query: string, candidate: string): number {
  const q = normalizeText(query)
  const c = normalizeText(candidate)
  if (!q || !c) return 0
  if (c === q) return 1
  if (c.startsWith(q)) return 0.98
  if (c.includes(q)) return 0.9
  const qt = q.split(" ").filter(Boolean)
  const ct = c.split(" ").filter(Boolean)
  const tokenMatch = qt.filter((t) => ct.some((ct) => ct.includes(t))).length / Math.max(qt.length, 1)
  const edit = 1 - levenshteinDistance(q, c) / Math.max(q.length, c.length, 1)
  return Math.max(tokenMatch * 0.85, edit * 0.75)
}

function formatDistanceLabel(km: number | null | undefined): string | null {
  if (km == null) return null
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`
}

function buildSecondaryText(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(", ")
}

function getQueryParts(query: string) {
  const segments = query.split(",").map((s) => s.trim()).filter(Boolean)
  const first = segments[0] || query.trim()
  const match = first.match(/\b\d+[A-Za-z]?\b/)
  const houseNumber = match?.[0] || ""
  const street = first.replace(/\b\d+[A-Za-z]?\b/, "").replace(/\s+/g, " ").trim()
  return { street, houseNumber, cityHint: segments[1] || "", districtHint: segments[2] || "" }
}

function hasHouseNumber(query: string): boolean {
  return /\b\d+[A-Za-z]?\b/.test(query)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhotonResult(feature: any): AddressResult | null {
  const p = feature.properties || {}
  const [longitude, latitude] = feature.geometry?.coordinates || []
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  const primaryText = p.name || p.street || p.city || p.state || p.country || "Local encontrado"
  const secondaryText = buildSecondaryText([p.street, p.housenumber, p.city || p.state, p.countrycode?.toUpperCase()])
  return {
    id: `photon-${p.osm_type || "x"}-${p.osm_id || `${latitude}-${longitude}`}`,
    latitude, longitude,
    primaryText,
    secondaryText,
    displayName: buildSecondaryText([primaryText, secondaryText]),
    source: "photon",
    importance: p.type === "house" ? 0.95 : p.type === "street" ? 0.85 : 0.75,
    finalScore: 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNominatimResult(item: any, source: AddressResult["source"] = "nominatim"): AddressResult | null {
  const a = item.address || {}
  const lat = Number(item.lat)
  const lon = Number(item.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  const primaryText = a.road || a.neighbourhood || a.suburb || a.city || a.town || a.village || item.name || item.display_name
  const secondaryText = buildSecondaryText([a.house_number, a.suburb || a.neighbourhood, a.city || a.town || a.state, a.country_code?.toUpperCase()])
  return {
    id: `${source}-${item.place_id}`,
    latitude: lat, longitude: lon,
    primaryText: primaryText || "Local encontrado",
    secondaryText,
    displayName: item.display_name || buildSecondaryText([primaryText, secondaryText]),
    source,
    importance: Number(item.importance || 0.6),
    finalScore: 0,
  }
}

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Rastreai/1.0 (delivery-tracking-app)",
}

async function fetchPhoton(query: string, userCoords?: UserCoords | null): Promise<AddressResult[]> {
  const params: Record<string, string | number> = { q: query, limit: MIN_RESULTS }
  if (userCoords) { params.lat = userCoords.latitude; params.lon = userCoords.longitude }
  const res = await fetch(`https://photon.komoot.io/api/?${buildQueryString(params)}`)
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const data = await res.json()
  return (data.features || []).map(mapPhotonResult).filter(Boolean) as AddressResult[]
}

function buildViewbox(userCoords: UserCoords) {
  return {
    viewbox: [
      userCoords.longitude - 0.45,
      userCoords.latitude + 0.3,
      userCoords.longitude + 0.45,
      userCoords.latitude - 0.3,
    ].join(","),
  }
}

async function fetchNominatim(query: string, userCoords?: UserCoords | null): Promise<AddressResult[]> {
  const params = {
    format: "jsonv2", addressdetails: 1, dedupe: 1, limit: MIN_RESULTS, "accept-language": "pt-BR",
    q: query,
    ...(userCoords ? buildViewbox(userCoords) : {}),
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${buildQueryString(params)}`, { headers: NOMINATIM_HEADERS })
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  const data = await res.json()
  return (data as object[]).map((item) => mapNominatimResult(item)).filter(Boolean) as AddressResult[]
}

async function fetchNominatimStructured(query: string, userCoords?: UserCoords | null): Promise<AddressResult[]> {
  const { street, houseNumber, cityHint } = getQueryParts(query)
  if (!street || !houseNumber) return []
  const params = {
    format: "jsonv2", addressdetails: 1, dedupe: 1, limit: MIN_RESULTS, "accept-language": "pt-BR",
    street: `${houseNumber} ${street}`,
    city: cityHint,
    ...(userCoords ? buildViewbox(userCoords) : {}),
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${buildQueryString(params)}`, { headers: NOMINATIM_HEADERS })
  if (!res.ok) throw new Error(`Nominatim structured ${res.status}`)
  const data = await res.json()
  return (data as object[]).map((item) => mapNominatimResult(item, "nominatim-structured")).filter(Boolean) as AddressResult[]
}

function dedupeResults(results: AddressResult[]): AddressResult[] {
  const seen = new Map<string, AddressResult>()
  results.forEach((r) => {
    const key = `${normalizeText(r.displayName)}-${r.latitude.toFixed(4)}-${r.longitude.toFixed(4)}`
    if (!seen.has(key) || seen.get(key)!.source === "photon") seen.set(key, r)
  })
  return [...seen.values()]
}

function rankResults(results: AddressResult[], query: string, userCoords?: UserCoords | null): AddressResult[] {
  const { street, houseNumber, cityHint } = getQueryParts(query)
  const ns = normalizeText(street)
  const nh = normalizeText(houseNumber)
  const nc = normalizeText(cityHint)

  return results
    .map((r) => {
      const textScore = Math.max(
        similarityScore(query, r.primaryText),
        similarityScore(query, r.displayName),
        similarityScore(query, r.secondaryText),
      )
      const nd = normalizeText(r.displayName)
      const nsec = normalizeText(r.secondaryText)
      const numberBonus = nh && nd.includes(nh) ? 0.16 : nh ? -0.08 : 0
      const streetBonus = ns && (nd.includes(ns) || nsec.includes(ns)) ? 0.1 : 0
      const cityBonus = nc && (nd.includes(nc) || nsec.includes(nc)) ? 0.06 : 0
      const distanceKm = userCoords ? getDistanceKm(userCoords, { latitude: r.latitude, longitude: r.longitude }) : null
      const proximityScore = distanceKm == null ? 0.4 : Math.max(0, 1 - Math.min(distanceKm, 50) / 50)
      const sourceBonus = r.source === "nominatim-structured" ? 0.06 : 0
      const finalScore =
        textScore * 0.58 + proximityScore * 0.18 + Math.min(r.importance, 1) * 0.08 +
        numberBonus + streetBonus + cityBonus + sourceBonus
      return { ...r, distanceKm, distanceLabel: formatDistanceLabel(distanceKm), finalScore }
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, MIN_RESULTS)
}

export async function searchAddresses(
  query: string,
  userCoords?: UserCoords | null,
  options: { includeFallback?: boolean } = {},
): Promise<AddressResult[]> {
  const { includeFallback = false } = options
  const trimmed = query.trim()
  const cacheKey = `${trimmed}::${includeFallback ? "full" : "lite"}::${userCoords?.latitude ?? ""}::${userCoords?.longitude ?? ""}`
  const cached = resultCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < 60_000) return cached.results

  const photonResults = await fetchPhoton(trimmed, userCoords)
  let all = [...photonResults]

  if (includeFallback || hasHouseNumber(trimmed)) {
    const [nom, struct] = await Promise.all([
      fetchNominatim(trimmed, userCoords).catch(() => []),
      fetchNominatimStructured(trimmed, userCoords).catch(() => []),
    ])
    all = [...all, ...nom, ...struct]
  }

  const results = rankResults(dedupeResults(all), trimmed, userCoords)
  resultCache.set(cacheKey, { results, timestamp: Date.now() })
  return results
}
