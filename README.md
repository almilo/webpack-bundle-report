# webpack-bundle-report

Reporting tool to analyse Webpack bundles

## Installation:

```
npm i -g webpack-bundle-report
```

## Usage from JS:

```javascript
var webpackBundleReport = require('webpack-bundle-report'),
    webpackConfigurationPath = path.resolve('webpack.config.js'),
    webpackConfiguration = require(webpackConfigurationPath);

webpackBundleReport(webpackConfiguration, function (error, report) {
    if (error) {
        throw new Error(error);
    }

    console.log(report);
});
```

## Usage from CLI:

```
wrb webpack.config.js > report.txt
```
