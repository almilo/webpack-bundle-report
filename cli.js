#!/usr/bin/env node

var path = require('path'), webpackBundleReport = require('./'), args = process.argv;

switch (args.length) {
    case 2:
    case 3:
        var webpackConfiguration = require(path.resolve(args[2] || 'webpack.config.js'));

        webpackBundleReport(webpackConfiguration, reportCallback);
        break;
    case 4:
        if (args[2] !== '-s' && args[2] !== '--stats') {
            error('Error: wrong argument: "' + args[2] + '".');
        }
        var webpackJsonStats = require(path.resolve(args[3]));

        webpackBundleReport.analyse(webpackJsonStats, reportCallback);
        break;
    default:
        error('Error: wrong number of arguments.');
}

function reportCallback(error, report) {
    if (error) {
        throw new Error(error);
    }

    console.log(report);
}

function error(message) {
    console.log(message);
    process.exit(1);
}
