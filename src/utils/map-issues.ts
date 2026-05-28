import { generateId, getBiggestArea } from '@/utils/area-utils'
import unkinkPolygon from '@turf/unkink-polygon'
import type { Draft } from 'immer'
import type { Feature, FeatureCollection, Polygon } from 'geojson'
import sweeplineIntersections from 'sweepline-intersections'

export interface MapIssue {
  id: string
  featureId: string
  type: 'kinks'
  message: string
  fix: (feature: Draft<Feature>, collection: Draft<FeatureCollection>) => void
}

type DetectedIssue = Omit<MapIssue, 'id' | 'featureId'> | null

function hasSelfIntersections(poly: Feature<Polygon>): boolean {
  const pts = sweeplineIntersections(poly, false)
  return pts.length > 0
}

function makePolygon(coords: number[][]): Feature<Polygon> {
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }
}

function removeKinkVertices(poly: Feature<Polygon>): Feature<Polygon> {
  let coords = [...(poly.geometry.coordinates[0] ?? [])]
  for (let attempt = 0; attempt < coords.length; attempt++) {
    const intersections = sweeplineIntersections(makePolygon(coords), false)
    if (intersections.length === 0) break
    const first = intersections[0]
    if (!first) break
    const [ix, iy] = first as [number, number]
    let nearest = -1
    let minDist = Infinity
    for (let i = 1; i < coords.length - 1; i++) {
      const c = coords[i]!
      const dx = c[0]! - ix
      const dy = c[1]! - iy
      const d = dx * dx + dy * dy
      if (d < minDist) {
        minDist = d
        nearest = i
      }
    }
    if (nearest === -1 || coords.length <= 4) break
    coords = [...coords.slice(0, nearest), ...coords.slice(nearest + 1)]
    coords[coords.length - 1] = coords[0]!
  }
  return makePolygon(coords)
}

function checkKinks(feature: Feature): DetectedIssue {
  if (feature.geometry.type !== 'Polygon') return null
  if (!hasSelfIntersections(feature as Feature<Polygon>)) return null
  return {
    type: 'kinks',
    message: 'Self-intersection',
    fix: (feature) => {
      const pieces = unkinkPolygon(feature as Feature<Polygon>).features as Feature<Polygon>[]
      let result = getBiggestArea(pieces)
      if (hasSelfIntersections(result)) result = removeKinkVertices(result)
      ;(feature as Draft<Feature<Polygon>>).geometry = result.geometry
    },
  }
}

export function detectFeatureIssues(feature: Feature): MapIssue[] {
  return [checkKinks(feature)]
    .filter((issue) => issue !== null)
    .map((issue) => ({ ...issue!, id: generateId(), featureId: feature.id as string }))
}
