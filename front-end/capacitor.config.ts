import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zlpix.premiado',
  appName: 'ZLPix Premiado',
  webDir: 'dist',

  server: {
    url: 'https://zlpixpremiado.com.br'
  },

  android: {
    adjustMarginsForEdgeToEdge: "auto"
  }
};

export default config;