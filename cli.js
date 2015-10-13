#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    webpackBundleReport = require('./'),
    webpackConfigurationPath = path.resolve(process.argv[2] || 'webpack.config.js'),
    webpackConfiguration = require(webpackConfigurationPath),
    outputFileName = process.argv[3];

webpackBundleReport(webpackConfiguration, function (error, report) {
    if (error) {
        throw new Error(error);
    }

    if (outputFileName) {
        fs.writeFile(outputFileName, report, function (err) {
            if (err) {
                throw new Error(err);
            }
        });
    } else {
        console.log(report);
    }
});
