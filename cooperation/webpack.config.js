const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    codemirror: './codemirror.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].bundle.js',
    publicPath: '/codemirror/dist/'
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    publicPath: '/dist/',
    proxy: {
      '/api': {
        target: 'http://localhost:5000/',//接口域名
        changeOrigin: true,//是否跨域
        pathRewrite: {
          '^/api': '/'//需要rewrite重写
        }
      }
    }
  }

}
