import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { MAP_HTML } from './mapHtml';
import { useMapBridge } from './useMapBridge';

/** Web: Leaflet xaritasi alohida <iframe> ichida — ilova stillari bilan to'qnashmaydi. */
const SportMap = forwardRef(function SportMap({ style, ...props }, ref) {
  const frame = useRef(null);
  const post = useCallback((payload) => {
    frame.current?.contentWindow?.postMessage({ __sportmapIn: true, payload }, '*');
  }, []);
  const receive = useMapBridge(ref, props, post);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.source === frame.current?.contentWindow && e.data?.__sportmap) receive(e.data.payload);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [receive]);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <iframe
        ref={frame}
        title="Sport majmualari xaritasi"
        srcDoc={MAP_HTML}
        style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </View>
  );
});

export default SportMap;
