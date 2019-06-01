const path = require("path");
// const webpack = require("webpack");
const createElectronReloadWebpackPlugin = require("electron-reload-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const useElectronConnect = process.env.ELECTRON_CONNECT === "true";

const ElectronReloadWebpackPlugin = createElectronReloadWebpackPlugin({
  path: path.join(__dirname, "./dist/main.js"),
  // Or
  // path: './',
  logLevel: 0
});

// You could also create some baseConfig and extend from it
const rendererConfig = {
  target: "electron-renderer",
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? undefined : "inline-source-map",
  entry: {
    renderer: "./src/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  plugins: [
    useElectronConnect && ElectronReloadWebpackPlugin(),
    new HtmlWebpackPlugin({
      // title: "Web Helper",
      template: "index.template.html"
    }),
    new CopyWebpackPlugin([{ from: "static/**/*" }])
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }],
        exclude: /node_modules/
      }
    ]
  },
  node: {
    __dirname: true
  }
};

const mainConfig = {
  target: "electron-main",
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? undefined : "inline-source-map",
  // watch: !isProduction,
  entry: {
    main: "./main.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  plugins: [useElectronConnect && ElectronReloadWebpackPlugin()].filter(
    Boolean
  ),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }],
        exclude: /node_modules/
      }
    ]
  },
  node: {
    __dirname: true
  }
};

module.exports = [rendererConfig, mainConfig];
