/*  Footer office map: a real map of Odisha (Esri street basemap via Leaflet) with the
    state border highlighted and Cuttack + Puri pinned.
    - click the map  -> Google Maps with both offices
    - click a pin    -> Google Maps for that office
    Needs vendor/leaflet-1.9.4.min.js and images/odisha-boundary.js. If either is missing,
    the static outline image + pins already in the markup stay as they are. */
(function () {
    'use strict';
    var box = document.querySelector('.dm-office-map');
    if (!box || typeof L === 'undefined') return;

    var OFFICES = [
        { name: 'Cuttack', lat: 20.4625, lng: 85.8830, url: 'https://www.google.com/maps/search/?api=1&query=Cuttack%2C+Odisha' },
        { name: 'Puri', lat: 19.8135, lng: 85.8312, url: 'https://www.google.com/maps/search/?api=1&query=Puri%2C+Odisha' }
    ];
    var ALL_URL = 'https://www.google.com/maps/dir/Cuttack,+Odisha/Puri,+Odisha';
    // Esri basemaps: free with attribution, no API key
    var ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
    var TILES = {
        light: [ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}'],
        dark: [ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}']   // same colour street map in both themes
    };
    var ATTRIB = 'Map &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, OpenStreetMap contributors, HERE, Garmin';

    function open(url) { window.open(url, '_blank', 'noopener'); }
    function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

    // ---- TopoJSON -> list of [lat, lng] rings (small decoder, no extra library) ----
    function decodeRings(topo) {
        var tr = topo.transform, arcs = topo.arcs.map(function (arc) {
            var x = 0, y = 0;
            return arc.map(function (p) { x += p[0]; y += p[1]; return [y * tr.scale[1] + tr.translate[1], x * tr.scale[0] + tr.translate[0]]; });
        });
        function ring(ids) {
            var out = [];
            ids.forEach(function (i) {
                var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
                out = out.concat(out.length ? a.slice(1) : a);
            });
            return out;
        }
        var rings = [];
        var obj = topo.objects[Object.keys(topo.objects)[0]];
        (obj.geometries || [obj]).forEach(function (g) {
            if (g.type === 'Polygon') g.arcs.forEach(function (r) { rings.push(ring(r)); });
            else if (g.type === 'MultiPolygon') g.arcs.forEach(function (poly) { poly.forEach(function (r) { rings.push(ring(r)); }); });
        });
        return rings;
    }

    // replace the static image with the live map
    var holder = document.createElement('div');
    holder.className = 'dm-office-map-live';
    box.insertBefore(holder, box.firstChild);

    var map = L.map(holder, {
        zoomControl: false, attributionControl: true,
        dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false,
        zoomSnap: 0.25
    });
    var tileLayers = [];
    function setTiles() {
        tileLayers.forEach(function (l) { map.removeLayer(l); });
        tileLayers = TILES[theme()].map(function (url, i) {
            return L.tileLayer(url, { attribution: i ? '' : ATTRIB, maxZoom: 16 }).addTo(map);
        });
    }
    setTiles();
    map.attributionControl.setPrefix(false);

    var bounds = L.latLngBounds([[17.78, 81.35], [22.6, 87.52]]);
    if (window.ODISHA_TOPO) {
        var rings = decodeRings(window.ODISHA_TOPO);
        var border = L.polygon(rings, {
            color: '#e91d2b', weight: 2, opacity: .9, fillColor: '#e91d2b', fillOpacity: .06, interactive: false
        }).addTo(map);
        bounds = border.getBounds();
    }
    map.fitBounds(bounds, { padding: [6, 6] });

    OFFICES.forEach(function (o, i) {
        var icon = L.divIcon({
            className: 'dm-leaflet-pin',
            html: '<span class="dm-map-pin' + (i ? ' dm-map-pin--puri' : '') + '"><span class="dm-map-pin-dot"></span><span class="dm-map-pin-label">' + o.name + '</span></span>',
            iconSize: [14, 14], iconAnchor: [7, 7]
        });
        L.marker([o.lat, o.lng], { icon: icon, keyboard: true, title: o.name + ' office - open in Google Maps' })
            .addTo(map)
            .on('click', function (e) { L.DomEvent.stop(e); open(o.url); });
    });
    map.on('click', function () { open(ALL_URL); });

    // live map is ready: hide the static fallback image + overlay pins
    box.classList.add('is-live');
    setTimeout(function () { map.invalidateSize(); map.fitBounds(bounds, { padding: [6, 6] }); }, 300);
    window.addEventListener('resize', function () { map.invalidateSize(); map.fitBounds(bounds, { padding: [6, 6] }); });

    // follow the site's light / dark switch
    window.addEventListener('dm-themechange', setTiles);
}());
