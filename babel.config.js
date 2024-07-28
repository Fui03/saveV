module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        'babel-preset-expo',
        // '@babel/preset-env',
        // '@babel/preset-react',
        // '@babel/preset-typescript',
      ],
      plugins: [['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]],
    };
  };
  