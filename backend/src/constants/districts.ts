export const DISTRICT_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  Colombo: { latitude: 6.9271, longitude: 79.8612 },
  Gampaha: { latitude: 7.084, longitude: 80.0098 },
  Kalutara: { latitude: 6.5854, longitude: 79.9607 },
  Galle: { latitude: 6.0535, longitude: 80.221 },
  Matara: { latitude: 5.9548, longitude: 80.555 },
  Hambantota: { latitude: 6.1246, longitude: 81.1185 },
  Kurunegala: { latitude: 7.4863, longitude: 80.3647 },
  Puttalam: { latitude: 8.0408, longitude: 79.8394 },
}

export const DEFAULT_DISTRICT = 'Kurunegala'

export function centroidForLocation(location: string) {
  return DISTRICT_CENTROIDS[location] ?? DISTRICT_CENTROIDS[DEFAULT_DISTRICT]!
}
