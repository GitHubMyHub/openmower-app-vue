import type { AreaProps } from '@/stores/schemas'
import type { Feature, FeatureCollection, Polygon } from 'geojson'

export type AreaFeature = Feature<Polygon, AreaProps>
export type AreaFeatureCollection = FeatureCollection<Polygon, AreaProps>
