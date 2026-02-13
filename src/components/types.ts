import type { Feature, FeatureCollection, Point } from 'geojson';

export type EarthquakeProperties = {
  mag: number | null;
  place?: string;
  time?: number;
};

export type EarthquakeFeature = Feature<Point, EarthquakeProperties>;
export type EarthquakeFeatureCollection = FeatureCollection<Point, EarthquakeProperties>;
