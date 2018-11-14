import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .cleanupOutputBeforeBuild()
    .addEntry('app', './assets/scripts/main.js')
    .enableSingleRuntimeChunk()

    .addStyleEntry('style', './assets/styles/main.scss')
    .enableSassLoader()

    .copyFiles({from: './assets/images', to: 'images/[path][name].[hash:8].[ext]'})

    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning()
;

export default Encore.getWebpackConfig();