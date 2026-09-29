import { TASHKENT } from '../../utils/geo';

/**
 * Leaflet xaritasi uchun mustaqil HTML sahifa. Web'da <iframe>, mobilda WebView ichida ochiladi.
 * Ilova bilan xabarlar orqali gaplashadi:
 *   ilova → xarita: data | fly | fit | zoom | insets
 *   xarita → ilova: ready | select | mapPress
 */
export const MAP_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" />
<style>
  :root { --top: 0px; --bottom: 0px; }
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EEF0F3; }
  body { font-family: Inter, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }
  .leaflet-container { background: #EEF0F3; font-family: inherit; }
  /* OSM plitkalari biroz yumshatiladi — markerlar ajralib tursin */
  .sp-tiles { filter: saturate(.7) brightness(1.03) contrast(.95); }
  .leaflet-top { top: var(--top); }
  .leaflet-bottom { bottom: var(--bottom); transition: bottom .25s ease; }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.75) !important; border-radius: 6px 0 0 0; }

  /* ---- Sport majmuasi markeri ---- */
  .sp-marker { background: none; border: 0; }
  .pin {
    position: absolute; left: 0; top: 0;
    transform: translate(-50%, calc(-100% - 7px));
    display: flex; align-items: center; gap: 6px;
    padding: 4px 11px 4px 4px; border-radius: 999px;
    background: #fff; color: #141824; white-space: nowrap;
    box-shadow: 0 4px 14px rgba(20,24,36,.18), 0 0 0 1px rgba(20,24,36,.04);
    font-size: 12.5px; font-weight: 700; letter-spacing: -.1px;
    cursor: pointer; transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  }
  .pin::after {
    content: ''; position: absolute; left: 50%; bottom: -6px; width: 12px; height: 12px;
    background: inherit; transform: translateX(-50%) rotate(45deg); border-radius: 0 0 3px 0;
    box-shadow: 3px 3px 6px rgba(20,24,36,.08); z-index: -1;
  }
  .pin .ic {
    width: 26px; height: 26px; border-radius: 50%; flex: none;
    display: flex; align-items: center; justify-content: center;
    background: var(--c); color: #fff; font-size: 16px;
  }
  .pin .km { color: #9CA3AF; font-weight: 600; font-size: 11.5px; }
  .pin:hover { transform: translate(-50%, calc(-100% - 9px)) scale(1.04); }
  .pin.sel {
    background: var(--c); color: #fff; transform: translate(-50%, calc(-100% - 9px)) scale(1.1);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--c) 45%, transparent);
  }
  .pin.sel .ic { background: #fff; color: var(--c); }
  .pin.sel .km { color: rgba(255,255,255,.85); }
  .pin.dim { opacity: .45; }
  /* Uzoqlashtirilganda faqat ikonka qoladi */
  .compact .pin:not(.sel) { padding: 4px; }
  .compact .pin:not(.sel) .lb, .compact .pin:not(.sel) .km { display: none; }

  /* ---- Foydalanuvchi joylashuvi ---- */
  .me-wrap { background: none; border: 0; }
  .me { position: absolute; left: -11px; top: -11px; width: 22px; height: 22px; }
  .me .dot {
    position: absolute; inset: 0; border-radius: 50%; background: #1F6BFF;
    border: 3.5px solid #fff; box-shadow: 0 2px 8px rgba(31,107,255,.5); box-sizing: border-box;
  }
  .me .pulse {
    position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; margin: -11px 0 0 -11px;
    border-radius: 50%; background: rgba(31,107,255,.35); animation: pulse 2s ease-out infinite;
  }
  @keyframes pulse { 0% { transform: scale(1); opacity: .9 } 100% { transform: scale(3.6); opacity: 0 } }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function () {
  function send(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage({ __sportmap: true, payload: s }, '*');
  }
  if (!window.L) { send({ type: 'error' }); return; }

  var map = L.map('map', { zoomControl: false, attributionControl: true, zoomSnap: 0.5 })
    .setView([${TASHKENT.lat}, ${TASHKENT.lng}], 12);
  map.attributionControl.setPrefix(false);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, className: 'sp-tiles',
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  var layer = L.layerGroup().addTo(map);
  var meLayer = L.layerGroup().addTo(map);
  var state = { venues: [], user: null, selectedId: null, radiusKm: null };
  var insets = { top: 0, bottom: 0 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
    layer.clearLayers();
    state.venues.forEach(function (v) {
      var sel = v.id === state.selectedId;
      var html = '<div class="pin' + (sel ? ' sel' : '') + '" style="--c:' + v.color + '">' +
        '<span class="ic"><i class="mdi mdi-' + v.icon + '"></i></span>' +
        '<span class="lb">' + esc(v.name) + '</span>' +
        (v.km ? '<span class="km">' + esc(v.km) + '</span>' : '') + '</div>';
      var m = L.marker([v.lat, v.lng], {
        icon: L.divIcon({ className: 'sp-marker', html: html, iconSize: [0, 0], iconAnchor: [0, 0] }),
        zIndexOffset: sel ? 1000 : 0,
        keyboard: false
      }).addTo(layer);
      m.on('click', function (e) { L.DomEvent.stopPropagation(e); send({ type: 'select', id: v.id }); });
    });

    meLayer.clearLayers();
    if (state.user) {
      var u = [state.user.lat, state.user.lng];
      if (state.radiusKm) {
        var accent = state.accent || '#0078FF';
        L.circle(u, { radius: state.radiusKm * 1000, color: accent, weight: 1.5, dashArray: '6 6', fillColor: accent, fillOpacity: 0.05, interactive: false }).addTo(meLayer);
      }
      if (state.user.accuracy && state.user.accuracy < 1500) {
        L.circle(u, { radius: state.user.accuracy, stroke: false, fillColor: '#1F6BFF', fillOpacity: 0.08, interactive: false }).addTo(meLayer);
      }
      L.marker(u, {
        icon: L.divIcon({ className: 'me-wrap', html: '<div class="me"><div class="pulse"></div><div class="dot"></div></div>', iconSize: [0, 0] }),
        zIndexOffset: 2000, interactive: false, keyboard: false
      }).addTo(meLayer);
    }
  }

  // Pastdagi kartochkalar xaritani yopib turadi — markazni biroz yuqoriga suramiz
  function flyTo(lat, lng, zoom) {
    var z = zoom || Math.max(map.getZoom(), 14);
    var shift = (insets.bottom - insets.top) / 2;
    var p = map.project([lat, lng], z).add([0, shift]);
    map.flyTo(map.unproject(p, z), z, { duration: 0.6 });
  }

  function fit() {
    var pts = state.venues.map(function (v) { return [v.lat, v.lng]; });
    if (state.user) pts.push([state.user.lat, state.user.lng]);
    if (!pts.length) return;
    if (pts.length === 1) return flyTo(pts[0][0], pts[0][1], 14);
    map.flyToBounds(L.latLngBounds(pts), {
      paddingTopLeft: [40, insets.top + 50], paddingBottomRight: [40, insets.bottom + 30], maxZoom: 15, duration: 0.6
    });
  }

  function onZoom() { document.body.classList.toggle('compact', map.getZoom() < 12); }
  map.on('zoomend', onZoom); onZoom();
  map.on('click', function () { send({ type: 'mapPress' }); });

  function handle(m) {
    if (!m) return;
    if (m.type === 'data') { state = m; render(); }
    else if (m.type === 'fly') flyTo(m.lat, m.lng, m.zoom);
    else if (m.type === 'fit') fit();
    else if (m.type === 'zoom') map.setZoom(map.getZoom() + m.delta);
    else if (m.type === 'insets') {
      insets = m;
      document.documentElement.style.setProperty('--top', m.top + 'px');
      document.documentElement.style.setProperty('--bottom', m.bottom + 'px');
      map.invalidateSize();
    }
  }
  window.__sportmap = handle;
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.__sportmapIn) handle(d.payload);
  });
  send({ type: 'ready' });
})();
</script>
</body>
</html>`;
