import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectOrderDetails } from '../../redux/selectors';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { environment } from '../../environment';
import Loader from '../Loader/Loader';
import './Delivery.scss';

const ROUTE_DURATION_MS = 60000;
const COURIER_START_DELAY_MS = 5000;
const FALLBACK_ADDRESS = 'Plac Defilad 1, 00-901';
const PAYMENT_DELAY_MS = 2000;

// Minimal mapbox-gl types (no @types/mapbox-gl installed)
interface LngLatLike { lng(): number; lat(): number }
interface LngLatBoundsLike { extend(coord: LngLatLike | [number, number]): LngLatBoundsLike }
interface MapInstance {
  getSource(id: string): { setData(data: GeoJSONFeature): void } | null;
  addSource(id: string, config: { type: 'geojson'; data: GeoJSONFeature }): void;
  addLayer(config: { id: string; type: string; source: string; paint: Record<string, string | number> }): void;
  addControl(control: unknown): void;
  isStyleLoaded(): boolean;
  on(event: string, callback: () => void): void;
  remove(): void;
  fitBounds(bounds: LngLatBoundsLike, options: { padding: number }): void;
}

interface MarkerInstance {
  setLngLat(lngLat: [number, number]): MarkerInstance;
  addTo(map: MapInstance): MarkerInstance;
}

interface MapConstructor {
  new (options: { container: HTMLElement | null; style: string; center: [number, number]; zoom: number }): MapInstance;
}

interface MapboxGlModule {
  Map: MapConstructor;
  Marker: new (options?: { color: string }) => MarkerInstance;
  NavigationControl: new () => unknown;
  LngLatBounds: new (sw: [number, number], ne?: [number, number]) => LngLatBoundsLike;
  accessToken: string;
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}

const Delivery = () => {
  const orderDetails = useAppSelector(selectOrderDetails);

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const courierMarkerRef = useRef<MarkerInstance | null>(null);
  const animationFrameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const intervalRef = useRef<number | null>(null);
  const paymentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timerMinutes = Math.floor(secondsLeft / 60);
  const timerSeconds = secondsLeft % 60;

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
    url.searchParams.set('q', address);
    url.searchParams.set('access_token', environment.mapboxAccessToken);
    url.searchParams.set('country', 'PL');
    url.searchParams.set('limit', '1');
    try {
      const response = await fetch(url);
      const data = await response.json();
      return (data.features?.[0]?.geometry?.coordinates as [number, number] | null) ?? null;
    } catch {
      return null;
    }
  };

  const getDirections = async (
    origin: [number, number],
    destination: [number, number],
  ): Promise<[number, number][] | null> => {
    const url = new URL(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`,
    );
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'full');
    url.searchParams.set('access_token', environment.mapboxAccessToken);
    try {
      const response = await fetch(url);
      const data = await response.json();
      return (data.routes?.[0]?.geometry?.coordinates as [number, number][] | null) ?? null;
    } catch {
      return null;
    }
  };

  const initMap = (container: HTMLDivElement | null, origin: [number, number]) => {
    const mb = mapboxgl as unknown as MapboxGlModule;
    mb.accessToken = environment.mapboxAccessToken;
    const map = new mb.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: origin,
      zoom: 12,
    });
    map.addControl(new mb.NavigationControl());
    new mb.Marker({ color: '#4caf50' }).setLngLat(origin).addTo(map);
    mapRef.current = map;
  };

  const drawRoute = (coordinates: [number, number][], destination: [number, number] | null) => {
    const map = mapRef.current;
    if (!map) return;

    const mb = mapboxgl as unknown as MapboxGlModule;

    const render = () => {
      const source = map.getSource('route');
      const data: GeoJSONFeature = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates },
      };
      if (source) {
        source.setData(data);
      } else {
        map.addSource('route', { type: 'geojson', data });
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#4caf50', 'line-width': 4 },
        });
      }

      if (destination) {
        new mb.Marker({ color: '#9a2f17' })
          .setLngLat(destination)
          .addTo(map);
        const bounds = new mb.LngLatBounds(coordinates[0], coordinates[0]);
        for (const coord of coordinates) {
          bounds.extend(coord);
        }
        map.fitBounds(bounds, { padding: 60 });
      }
    };

    if (map.isStyleLoaded()) {
      render();
    } else {
      map.on('load', render);
    }
  };

  const animateCourier = (coordinates: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;

    const mb = mapboxgl as unknown as MapboxGlModule;
    courierMarkerRef.current = new mb.Marker({ color: '#1B98E0' }).setLngLat(coordinates[0]).addTo(map);

    const startTime = performance.now() + COURIER_START_DELAY_MS;
    const step = (now: number) => {
      const progress = Math.min(Math.max((now - startTime) / ROUTE_DURATION_MS, 0), 1);
      const index = Math.floor(progress * (coordinates.length - 1));
      courierMarkerRef.current?.setLngLat(coordinates[index]);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };
    animationFrameRef.current = requestAnimationFrame(step);
  };

  const startDeliverySimulation = async () => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    const origin = environment.pizzeriaOrigin;
    const address = orderDetails ? `${orderDetails.address}, ${orderDetails.postcode}` : FALLBACK_ADDRESS;

    initMap(container, origin);

    const destination = await geocodeAddress(address);
    if (!destination) {
      setMapError('Live map unavailable — showing an estimated route.');
      drawRoute([origin, origin], null);
      return;
    }

    const routeCoordinates = await getDirections(origin, destination);
    const coordinates = routeCoordinates ?? [origin, destination];
    if (!routeCoordinates) {
      setMapError('Live map unavailable — showing an estimated route.');
    }
    drawRoute(coordinates, destination);
    animateCourier(coordinates);
  };

  const startCountdown = () => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setDelivered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const makePayment = () => {
    setLoading(true);
    paymentTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setPaymentCompleted(true);
      startCountdown();
    }, PAYMENT_DELAY_MS);
  };

  useEffect(() => {
    if (paymentCompleted && !delivered) {
      startDeliverySimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentCompleted, delivered]);

  useEffect(() => {
    if (delivered) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      mapRef.current?.remove();
      mapRef.current = null;
    }
  }, [delivered]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="delivery-container">
      {!paymentCompleted && !delivered && (
        <>
          <h1>Card Payment</h1>
          <div>
            {!loading ? (
              <button onClick={makePayment}>Pay with Card</button>
            ) : (
              <div className="loader-container">
                <Loader color="white" height="20px" />
              </div>
            )}
          </div>
        </>
      )}

      {paymentCompleted && !delivered && (
        <>
          <h1>Card Payment</h1>
          <div className="timer-container">
            <h2>Your order has been paid!</h2>
            <h3>Delivery in:</h3>
            <div ref={mapContainerRef} className="delivery-map" />
            {mapError && <p className="delivery-map__error">{mapError}</p>}
            <h1>
              {timerMinutes}:{String(timerSeconds).padStart(2, '0')}
            </h1>
          </div>
        </>
      )}

      {delivered && (
        <div className="delivered-container">
          <h1>Your order is delivered. Enjoy your meal!</h1>
          <div className="pizza-size__pizza pizza-size__pizza--large">
            <div className="pizza-size__pizza__line" />
            <div className="pizza-size__pizza__line" />
            <div className="pizza-size__pizza__line" />
            <div className="pizza-size__pizza__line" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
