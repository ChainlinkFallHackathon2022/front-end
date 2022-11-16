const webpack = require("webpack");

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    // buffer: require.resolve("buffer"),
    // http: require.resolve("stream-http"),
    // https: require.resolve("https-browserify"),
    // os: require.resolve("os-browserify/browser"),
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
  };
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      // process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
