const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack           = require('webpack');
const prod              = process.env.NODE_ENV === 'production';
const isDevelopment     = process.env.NODE_ENV === 'development';
const ip                = require('ip');
const serverIp          = ip.address();
const fs                = require('fs');


function getOutput() {

  if(prod) {
    return path.resolve(__dirname, "dist/" )  
  } else {
    return path.resolve(__dirname, "src/" )  
  }
  
}
module.exports = {
    entry: './src/app.js',
    output: {
        path: getOutput(),//file system
        filename: isDevelopment ? 'bundle.js': 'bundle.js',
        publicPath: isDevelopment ? `http://localhost:8081/` : ''//browser link
        //libraryTarget: "var",
        //library: "app"
    },
    cache: isDevelopment,
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
        extensions: [ '.js', '.jsx'],
        modules: [
            __dirname + "/src",
            "node_modules"
        ]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query:{
                presets:['es2015','stage-0'],
                plugins: ['transform-runtime']
            }
        },
        {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        },
        {
            test: /\.scss$/,
            loader: prod ?
          ExtractTextPlugin.extract({
            fallback:"style-loader",
            use:`css-loader?minimize=true!autoprefixer-loader?browsers=last 4 version!sass-loader?includePaths[]=dist`
          }) :
          `style-loader!css-loader!autoprefixer-loader?browsers=last 4 version!sass-loader?includePaths[]=dist` 
        },
        { test: /\.(jpg|png|gif)$/i, exclude: /node_modules/, 
            loader: "url-loader?limit=10000&name=distImg/[name].[ext]&publicPath=../"
        },
        { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
        { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ }
        ]
    },
    plugins: prod ? [
        new webpack.LoaderOptionsPlugin({
          debug: true
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true,
            warnings: false
          }
        }),
        new ExtractTextPlugin('css/main.css'),
        function() {
            this.plugin("done", function(statsData) {

                return;
                const stats = statsData.toJson();

                if (!stats.errors.length) {
                    //Filter js file
                    stats.assets.filter(asset => /.js$/.test(asset.name))
                    .forEach((asset) => {
                        console.log("Wepback: Added ${asset.name} to prefetch");
                        const htmlFileName = "index.html";
                        const html = fs.readFileSync(path.join(__dirname, "src", htmlFileName), "utf8");


                        let htmlOutput = html.replace("bundle.js", asset.name);
                        htmlOutput = htmlOutput.replace('<!--<link rel="stylesheet" href="css/main.css">-->','<link rel="stylesheet" href="css/main.css">');
                        fs.writeFileSync(
                            path.join(__dirname, "dist", htmlFileName),
                            htmlOutput);
                    })
                }
            });
        }
    ] : []
}
