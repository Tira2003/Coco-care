import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

function DiseaseLeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([7.6, 80.1], 7)

    mapInstanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map)

    map.on('click', () => map.scrollWheelZoom.enable())

    const colors: Record<string, string> = {
      verified: '#E5484D',
      suspected: '#F5A524',
      cleared: '#3DA35D',
    }

    const spots = [
      { c: [7.48, 80.36] as [number, number], t: 'Kurunegala', s: 'verified', r: 22, d: 'Bud Rot — 12 verified reports this month' },
      { c: [7.94, 79.84] as [number, number], t: 'Puttalam', s: 'verified', r: 18, d: 'Stem Bleeding — 7 verified reports' },
      { c: [7.09, 80.15] as [number, number], t: 'Kegalle', s: 'suspected', r: 14, d: 'Leaf Miner — 3 suspected cases under review' },
      { c: [7.29, 80.63] as [number, number], t: 'Matale', s: 'suspected', r: 12, d: 'Grey Leaf Spot — 2 suspected cases' },
      { c: [6.93, 79.86] as [number, number], t: 'Colombo / Gampaha', s: 'cleared', r: 10, d: 'Cleared — no active outbreaks' },
      { c: [8.35, 80.50] as [number, number], t: 'Anamaduwa', s: 'cleared', r: 9, d: 'Cleared — treated & recovered' },
    ]

    spots.forEach((p) => {
      L.circleMarker(p.c, {
        radius: p.r,
        color: colors[p.s],
        weight: 2,
        fillColor: colors[p.s],
        fillOpacity: 0.32,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:'Inter',sans-serif;font-size:13px;line-height:1.4;">
            <b style="color:#10241A;font-size:14px;">${p.t}</b><br>
            <span style="color:#5C6B60;">${p.d}</span><br>
            <span style="color:${colors[p.s]};font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;display:inline-block;margin-top:4px;">
              ${p.s}
            </span>
          </div>`
        )
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return <div ref={mapContainerRef} className="h-[460px] w-full rounded-2xl overflow-hidden filter saturate-[.95]" />
}

export function DiseaseMapSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#123524] text-white" id="map">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-9">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9F169] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
              Live Disease Heatmap
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
              See outbreaks before
              <br />
              they reach your gate
            </h2>
            <p className="text-[#AEC0A6] text-base max-w-xl leading-relaxed">
              Verified and suspected cases, mapped across the Coconut Triangle. Try it — drag, zoom, tap the markers.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold bg-[#C9F169]/15 border border-[#C9F169]/30 text-[#C9F169] px-4 py-2 rounded-full self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#C9F169] animate-ping" />
            Live · syncs every 5 min
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0C281B]">
          <DiseaseLeafletMap />

          {/* Map Legend */}
          <div className="absolute left-4 bottom-4 z-[500] bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#10241A] shadow-md">
            <span className="flex items-center gap-2">
              <i className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
              Verified outbreak
            </span>
            <span className="flex items-center gap-2">
              <i className="w-2.5 h-2.5 rounded-full bg-[#F5A524]" />
              Suspected
            </span>
            <span className="flex items-center gap-2">
              <i className="w-2.5 h-2.5 rounded-full bg-[#3DA35D]" />
              Cleared
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-[#8FA68B]">
          Showing live regional field telemetry. In production, markers reflect officer-verified reports and suspected cases streamed in real time.
        </p>
      </div>
    </section>
  )
}
