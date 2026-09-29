import React, { forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MAP_HTML } from './mapHtml';
import { useMapBridge } from './useMapBridge';

/** iOS/Android: Leaflet xaritasi WebView ichida. */
const SportMap = forwardRef(function SportMap({ style, ...props }, ref) {
  const web = useRef(null);
  const post = useCallback((payload) => {
    web.current?.injectJavaScript(`window.__sportmap && window.__sportmap(${JSON.stringify(payload)});true;`);
  }, []);
  const receive = useMapBridge(ref, props, post);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <WebView
        ref={web}
        originWhitelist={['*']}
        source={{ html: MAP_HTML, baseUrl: 'https://sporton.uz/' }}
        onMessage={(e) => receive(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        setSupportMultipleWindows={false}
        style={{ flex: 1, backgroundColor: '#EEF0F3' }}
      />
    </View>
  );
});

export default SportMap;
