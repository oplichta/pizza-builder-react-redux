// Twin of the Angular app's enviroment.ts, adapted for Vite/React.
export const environment = {
    production: import.meta.env.PROD,
    // Own token, URL-restricted to oplichta.github.io/pizza-builder(-react-redux).
    mapboxAccessToken:
        import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
        'pk.eyJ1Ijoib3NpMjIiLCJhIjoiY21ybjQ0NjFuMGJmejJ6czllNDd4MjE3YyJ9.KvIL47fNCSTcQk2NeHr5HQ',
    // Pizzeria location: Obrońców Wybrzeża 1, 80-398 Gdańsk - the delivery route's starting point.
    pizzeriaOrigin: [18.591345, 54.409251],
};
