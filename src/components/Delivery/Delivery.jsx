import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { selectOrderDetails } from '../../redux/selectors';
import { environment } from '../../environment';
import Loader from '../Loader/Loader';
import './Delivery.scss';

const ROUTE_DURATION_MS = 60000;
// Grace period before the courier leaves the pizzeria, so the route is visible before it moves.
const COURIER_START_DELAY_MS = 5000;
// Demo fallback used when the delivery step is reached without filling the order form first.
const FALLBACK_ADDRESS = 'Plac Defilad 1, 00-901';
const PAYMENT_DELAY_MS = 2000;

const Delivery = () => {
    const orderDetails = useSelector(selectOrderDetails);

    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [delivered, setDelivered] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [mapError, setMapError] = useState(null);

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const courierMarkerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const intervalRef = useRef(null);
    const paymentTimeoutRef = useRef(null);

    const timerMinutes = Math.floor(secondsLeft / 60);
    const timerSeconds = secondsLeft % 60;

    const geocodeAddress = async (address) => {
        const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
        url.searchParams.set('q', address);
        url.searchParams.set('access_token', environment.mapboxAccessToken);
        url.searchParams.set('country', 'PL');
        url.searchParams.set('limit', '1');
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.features?.[0]?.geometry?.coordinates ?? null;
        } catch {
            return null;
        }
    };

    const getDirections = async (origin, destination) => {
        const url = new URL(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`
        );
        url.searchParams.set('geometries', 'geojson');
        url.searchParams.set('overview', 'full');
        url.searchParams.set('access_token', environment.mapboxAccessToken);
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.routes?.[0]?.geometry?.coordinates ?? null;
        } catch {
            return null;
        }
    };

    const initMap = (container, origin) => {
        mapboxgl.accessToken = environment.mapboxAccessToken;
        const map = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: origin,
            zoom: 12,
        });
        map.addControl(new mapboxgl.NavigationControl());
        new mapboxgl.Marker({ color: '#4caf50' }).setLngLat(origin).addTo(map);
        mapRef.current = map;
    };

    const drawRoute = (coordinates, destination) => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        const render = () => {
            const source = map.getSource('route');
            const data = {
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
                new mapboxgl.Marker({ color: '#9a2f17' }).setLngLat(destination).addTo(map);
                const bounds = coordinates.reduce(
                    (extended, coord) => extended.extend(coord),
                    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
                );
                map.fitBounds(bounds, { padding: 60 });
            }
        };

        if (map.isStyleLoaded()) {
            render();
        } else {
            map.on('load', render);
        }
    };

    const animateCourier = (coordinates) => {
        const map = mapRef.current;
        if (!map) {
            return;
        }
        courierMarkerRef.current = new mapboxgl.Marker({ color: '#1B98E0' }).setLngLat(coordinates[0]).addTo(map);

        // Offset the clock by the delay: progress stays clamped at 0 (courier idle at the origin)
        // until the grace period elapses, then it animates over ROUTE_DURATION_MS.
        const startTime = performance.now() + COURIER_START_DELAY_MS;
        const step = (now) => {
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
        if (!container || mapRef.current) {
            return;
        }

        const origin = environment.pizzeriaOrigin;
        // Demo-scoped limitation: the order form has no city field, so a fixed city/country is
        // appended for geocoding (the Geocoding call below is also filtered to country=PL).
        const address = orderDetails ? `${orderDetails.address}, ${orderDetails.postcode}` : FALLBACK_ADDRESS;

        initMap(container, origin);

        const destination = await geocodeAddress(address);
        if (!destination) {
            setMapError('Live map unavailable — showing an estimated route.');
            drawRoute([origin, origin]);
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
                    clearInterval(intervalRef.current);
                    setDelivered(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const makePayment = () => {
        setLoading(true);
        // Simulated card payment.
        paymentTimeoutRef.current = setTimeout(() => {
            setLoading(false);
            setPaymentCompleted(true);
            startCountdown();
        }, PAYMENT_DELAY_MS);
    };

    // Kick off the map + route once the map container has been rendered.
    useEffect(() => {
        if (paymentCompleted && !delivered) {
            startDeliverySimulation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentCompleted, delivered]);

    // Tear the map down once the order is delivered (the map container unmounts).
    useEffect(() => {
        if (delivered) {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            mapRef.current?.remove();
            mapRef.current = null;
        }
    }, [delivered]);

    // Global cleanup on unmount.
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (paymentTimeoutRef.current) {
                clearTimeout(paymentTimeoutRef.current);
            }
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
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
                        <div ref={mapContainerRef} className="delivery-map"></div>
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
                        <div className="pizza-size__pizza__line"></div>
                        <div className="pizza-size__pizza__line"></div>
                        <div className="pizza-size__pizza__line"></div>
                        <div className="pizza-size__pizza__line"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Delivery;
