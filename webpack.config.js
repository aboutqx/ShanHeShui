const path = require('path');
const webpack           = require('webpack');
const prod              = process.env.NODE_ENV === 'production';
const isDevelopment     = process.env.NODE_ENV === 'development';
const ip                = require('ip');
const serverIp          = ip.address();

function getOutput() {

  if(prod) {
    return path.resolve(__dirname, "dist/" )  
  } else {
    return path.resolve(__dirname, "dist/" )  
  }
  
}
module.exports = {
    entry: './src/index.js',
    output: {
        path: getOutput(),
        filename: 'bundle.js',
        publicPath: isDevelopment ? `http://${serverIp}:8081/` : '/'
        //libraryTarget: "var",
        //library: "app"
    },
    cache: isDevelopment,
    debug: isDevelopment,
    devServer: { inline: true },
    stats: {
        cached: false,
        cachedAssets: false,
        chunkModules: false,
        chunks: false,
        colors: true,
        errorDetails: true,
        hash: false,
        progress: true,
        reasons: false,
        timings: true,
        version: false
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        root:__dirname + "/src",
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel",
            query:{
                presets:['es2015'],
                plugins: ['transform-runtime']
            }
        },
        { test: /\.jpg$/, exclude: /node_modules/, loader: "file-loader?name=[name].[ext]" },
        { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
        { test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
        ]
    },
    plugins: prod ? [
    new webpack.optimize.DedupePlugin(),//去重
    new webpack.optimize.OccurenceOrderPlugin(),//分配最小id
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }),
  ] : [new webpack.optimize.OccurenceOrderPlugin()]
}
