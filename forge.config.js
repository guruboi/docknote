const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'icon.ico' // used for app icon in .exe too
  },
  rebuildConfig: {},
  makers: [
  {
    name: '@electron-forge/maker-wix',
    config: {
      language: 1033,
      manufacturer: 'Guruprasath M',
      description: 'DockNote - Lightweight Taskbar Notes',
      shortcutName: 'DockNote',
      upgradeCode: 'b5c4d8a9-91ab-48b3-bf40-2c34eb80caba',
      icon: 'icon.ico' // <-- Add this line
    }
  },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
