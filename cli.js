#!/usr/bin/env node

var path = require('path'),
    webpackBundleReport = require('./'),
    webpackConfigurationPath = path.resolve(process.argv[2] || 'webpack.config.js'),
    webpackConfiguration = require(webpackConfigurationPath);

webpackBundleReport(webpackConfiguration, function (error, report) {
    if (error) {
        throw new Error(error);
    }

    console.log(report);
});
