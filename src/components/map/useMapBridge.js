import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Xarita sahifasi bilan xabar almashish: sahifa tayyor bo'lguncha buyruqlar navbatda turadi,
 * `data` o'zgarganda avtomatik yuboriladi. `post` — platformaga xos yuborish funksiyasi.
 */
export function useMapBridge(ref, { data, insets, onSelect, onMapPress, onReady }, post) {
  const ready = useRef(false);
  const queue = useRef([]);
  const handlers = useRef({});
  handlers.current = { onSelect, onMapPress, onReady };

  const send = useCallback(
    (msg) => {
      if (ready.current) post(msg);
      else queue.current.push(msg);
    },
    [post]
  );

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom) => send({ type: 'fly', lat, lng, zoom }),
    fit: () => send({ type: 'fit' }),
    zoom: (delta) => send({ type: 'zoom', delta }),
  }));

  useEffect(() => {
    send({ type: 'data', ...data });
  }, [data, send]);

  useEffect(() => {
    send({ type: 'insets', top: insets.top, bottom: insets.bottom });
  }, [insets.top, insets.bottom, send]);

  const receive = useCallback(
    (raw) => {
      let m;
      try {
        m = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        return;
      }
      if (m.type === 'ready') {
        ready.current = true;
        // 'insets' birinchi ketadi — 'fit' to'g'ri chegaralar bilan hisoblansin
        const pending = queue.current;
        queue.current = [];
        const latest = (t) => [...pending].reverse().find((x) => x.type === t);
        [latest('insets'), latest('data'), ...pending.filter((x) => x.type !== 'insets' && x.type !== 'data')]
          .filter(Boolean)
          .forEach(post);
        handlers.current.onReady?.();
      } else if (m.type === 'select') handlers.current.onSelect?.(m.id);
      else if (m.type === 'mapPress') handlers.current.onMapPress?.();
    },
    [post]
  );

  return receive;
}
