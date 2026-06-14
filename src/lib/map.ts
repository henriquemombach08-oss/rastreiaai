/**
 * Configuração da camada de tiles (imagens) do mapa.
 *
 * Em produção, defina NEXT_PUBLIC_MAPTILER_KEY com uma chave gratuita do
 * MapTiler (https://www.maptiler.com/) — tiles bonitos, cobertura do Brasil
 * inteiro e free tier generoso, sem o risco de bloqueio do servidor público
 * do OpenStreetMap.
 *
 * Sem a chave, cai automaticamente no servidor público do OSM, que serve bem
 * para desenvolvimento e validação, mas NÃO é permitido para tráfego de
 * produção em escala.
 */
export interface TileConfig {
  url: string
  attribution: string
  maxZoom: number
}

export function getTileConfig(): TileConfig {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY

  if (maptilerKey) {
    return {
      url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      attribution:
        '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }
  }

  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }
}
