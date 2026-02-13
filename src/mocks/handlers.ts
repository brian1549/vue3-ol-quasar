import { USGS_URL } from '@/api/earthquakes';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import { earthquakesMock } from './earthquake.mock';

export const getEarthquakesHandler = vi.fn(() => {
  return HttpResponse.json(earthquakesMock);
});

export const handlers = [http.get(USGS_URL, getEarthquakesHandler)];
