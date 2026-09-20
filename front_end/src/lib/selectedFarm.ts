import type { Farm } from '@/types'

export const SELECTED_FARM_KEY = 'coco_selected_farm'

export function persistSelectedFarm(farmId: string) {
  try {
    if (farmId) localStorage.setItem(SELECTED_FARM_KEY, farmId)
  } catch {
    /* ignore */
  }
}

export function readSelectedFarmId() {
  try {
    return localStorage.getItem(SELECTED_FARM_KEY) ?? ''
  } catch {
    return ''
  }
}

export function resolvePrimaryFarm(farms: Farm[]) {
  return farms.find((farm) => farm.isPrimary) ?? farms[0]
}

export function resolveSelectedFarm(farms: Farm[], selectedId?: string) {
  if (selectedId) {
    const match = farms.find((farm) => farm.id === selectedId)
    if (match) return match
  }
  const stored = readSelectedFarmId()
  const storedMatch = farms.find((farm) => farm.id === stored)
  return storedMatch ?? resolvePrimaryFarm(farms)
}
