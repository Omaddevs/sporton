const path = require('path');

// babel-preset-expo ba'zan loyiha ildiziga emas, node_modules/expo/node_modules ichiga o'rnatiladi.
// Ikkala joydan ham qidiramiz, aks holda bundle yig'ilmaydi va brauzerda oq ekran chiqadi.
const expoDir = path.dirname(require.resolve('expo/package.json'));
const presetExpo = require.resolve('babel-preset-expo', { paths: [__dirname, expoDir] });

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [presetExpo],
  };
};
