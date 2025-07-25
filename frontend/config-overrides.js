module.exports = function override(config) {
  // Update source-map-loader to exclude node_modules, chart.js, axios, and plotly.js
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.loader && rule.loader.includes('source-map-loader')) {
      return {
        ...rule,
        exclude: [
          /node_modules/,
          /node_modules\/chart\.js/,
          /node_modules\/axios/,
          /node_modules\/plotly\.js/,
        ],
      };
    }
    return rule;
  });

  // Update Webpack Dev Server to use setupMiddlewares
  config.devServer = {
    ...config.devServer,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('Webpack Dev Server is not initialized');
      }
      // Custom middleware logic (if any) can go here
      return middlewares;
    },
  };

  return config;
};