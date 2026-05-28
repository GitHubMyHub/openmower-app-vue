/**
 * Pinia replacement for the original React `MapContext`.
 * Holds the editable feature collection plus undo/redo history,
 * draw-mode flags and active edit workflow.
 */
import { defineStore } from 'pinia'
import type { Feature, FeatureCollection } from 'geojson'
import { featureCollection } from '@turf/helpers'
import { produce } from 'immer'
import bbox from '@turf/bbox'
import { fallbackDatum, type Datum } from '@/stores/schemas'
import { detectFeatureIssues, type MapIssue } from '@/utils/map-issues'

type Bounds = [west: number, south: number, east: number, north: number]

// String union mirroring @mapbox/mapbox-gl-draw's DrawMode — kept as a string
// so this Vue port doesn't pull the React-specific draw library in.
export type DrawMode =
  | 'static'
  | 'simple_select'
  | 'direct_select'
  | 'draw_polygon'
  | 'draw_line_string'
  | 'draw_point'

interface SplitPolygonWorkflow {
  type: 'split_polygon'
  areaId: string
}
type Workflow = SplitPolygonWorkflow

const MAX_HISTORY_STEPS = 10

interface State {
  id: string
  datum: Datum
  features: FeatureCollection
  editMode: boolean
  drawMode: DrawMode
  drawWorkflow: Workflow | null
  trashEnabled: boolean
  hasUnsavedChanges: boolean
  hoveredId: string | null
  past: FeatureCollection[]
  future: FeatureCollection[]
}

export const useMapStore = defineStore('map', {
  state: (): State => ({
    id: 'map',
    datum: { ...fallbackDatum },
    features: featureCollection([]),
    editMode: false,
    drawMode: 'static',
    drawWorkflow: null,
    trashEnabled: false,
    hasUnsavedChanges: false,
    hoveredId: null,
    past: [],
    future: [],
  }),
  getters: {
    bounds: (state): Bounds => {
      if (state.features.features.length > 0) {
        return bbox(state.features) as Bounds
      }
      const { lat, long } = state.datum
      return [long, lat, long, lat]
    },
    issues: (state): MapIssue[] =>
      state.features.features.flatMap((f: Feature) => detectFeatureIssues(f)),
    canUndo: (state) => state.past.length > 0,
    canRedo: (state) => state.future.length > 0,
  },
  actions: {
    setDatum(datum: Datum) {
      this.datum = datum
    },
    setFeatures(
      recipe: FeatureCollection | ((draft: FeatureCollection) => void),
      userChange = true,
    ) {
      if (userChange) {
        this.past = [...this.past, this.features].slice(-MAX_HISTORY_STEPS)
        this.future = []
      }
      this.features =
        typeof recipe === 'function'
          ? (produce(this.features, recipe as (draft: FeatureCollection) => void) as FeatureCollection)
          : recipe
      this.hasUnsavedChanges = userChange
    },
    setEditMode(value: boolean) {
      this.editMode = value
      if (!value) {
        this.past = []
        this.future = []
      }
    },
    setDrawMode(mode: DrawMode) {
      this.drawMode = mode
    },
    setDrawWorkflow(workflow: Workflow | null) {
      this.drawWorkflow = workflow
    },
    setHoveredId(id: string | null) {
      this.hoveredId = id
    },
    undo(): FeatureCollection | null {
      const snapshot = this.past[this.past.length - 1]
      if (!snapshot) return null
      this.past = this.past.slice(0, -1)
      this.future = [this.features, ...this.future]
      this.features = snapshot
      this.hasUnsavedChanges = this.past.length > 0
      return snapshot
    },
    redo(): FeatureCollection | null {
      const snapshot = this.future[0]
      if (!snapshot) return null
      this.future = this.future.slice(1)
      this.past = [...this.past, this.features].slice(-MAX_HISTORY_STEPS)
      this.features = snapshot
      this.hasUnsavedChanges = true
      return snapshot
    },
  },
})
