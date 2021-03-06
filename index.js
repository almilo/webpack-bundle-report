var path = require('path'), _ = require('lodash'), webpack = require('webpack'), Table = require('cli-table');

module.exports = function bundle(webpackConfiguration, callback) {
    webpack(webpackConfiguration, function (error, stats) {
        if (error) {
            callback(error);
        } else {
            analyse(stats.toJson(), callback);
        }
    });
};

module.exports.analyse = analyse;

function analyse(jsonStats, callback) {
    try {
        var report =
            showAssetTypesAndSizes(jsonStats) + '\n' +
            showCriticalAssetsNamesAndSizes(jsonStats, ['.js', '.css']) + '\n' +
            showModuleNamesAndSizes(jsonStats);

        callback(undefined, report);
    } catch (error) {
        callback(error);
    }

    function showAssetTypesAndSizes(jsonStats) {
        var assetsTable = new Table({head: ['Asset type (number)', 'Size'], colWidths: [133, 10]}),
            assetsStatsByType = _.chain(jsonStats.assets)
                .groupBy(function (asset) {
                    return path.extname(asset.name);
                })
                .map(function (assetGroup, assetType) {
                    return {type: assetType, itemNumber: assetGroup.length, size: assetGroup.reduce(sumSize, 0)};
                })
                .sort(function (assetStats1, assetStats2) {
                    return assetStats2.size - assetStats1.size;
                })
                .value();

        assetsStatsByType.forEach(function (assetStats) {
            assetsTable.push(['"' + assetStats.type + '" (' + assetStats.itemNumber + ')', padNumber(assetStats.size)]);
        });

        var totalAssetsSize = assetsStatsByType
            .reduce(function (accumulator, assetStats) {
                return accumulator + assetStats.size;
            }, 0);

        assetsTable.push(['Total assets size', padNumber(totalAssetsSize)]);

        return assetsTable.toString();
    }

    function showCriticalAssetsNamesAndSizes(jsonStats, criticalAssetExtensions) {
        var criticalAssetsTable = new Table({head: ['Asset name', 'Size'], colWidths: [133, 10]}),
            criticalAssetsNamesAndSizes = _.chain(jsonStats.assets)
                .filter(function (asset) {
                    var assetExtension = path.extname(asset.name);

                    return criticalAssetExtensions.indexOf(assetExtension) >= 0;
                })
                .map(function (asset) {
                    return {name: asset.name, size: asset.size};
                })
                .sort(function (assetNameAndSize1, assetNameAndSize2) {
                    var asset1Extension = path.extname(assetNameAndSize1.name),
                        asset2Extension = path.extname(assetNameAndSize2.name);

                    if (asset1Extension === asset2Extension) {
                        return assetNameAndSize2.size - assetNameAndSize1.size;
                    } else if (asset1Extension < asset2Extension) {
                        return 1
                    } else {
                        return -1;
                    }
                })
                .value();

        criticalAssetsNamesAndSizes.forEach(function (assetNameAndSize) {
            criticalAssetsTable.push(['"' + assetNameAndSize.name + '"', padNumber(assetNameAndSize.size)]);
        });

        return criticalAssetsTable.toString();
    }

    function showModuleNamesAndSizes(jsonStats) {
        var lastModule, modulesTable = new Table({
                head: ['Module name', 'Duplicated', 'Size'],
                colWidths: [120, 12, 10]
            }),
            totalModulesSize = _.chain(jsonStats.modules)
                .sort(function (module1, module2) {
                    return module2.size - module1.size;
                })
                .forEach(function (module) {
                    modulesTable.push([module.name, isDuplicated(module) || '', padNumber(module.size)]);
                })
                .reduce(sumSize, 0)
                .value();

        modulesTable.push(['Total modules size', '', padNumber(totalModulesSize)]);

        return modulesTable.toString();

        function isDuplicated(module) {
            var duplicated = lastModule &&
                (path.basename(lastModule.name) === path.basename(module.name)) &&
                (lastModule.size === module.size);

            lastModule = module;

            return duplicated;
        }
    }

    function padNumber(number) {
        return _.padLeft(String(number), 8);
    }

    function sumSize(accumulator, item) {
        return accumulator + item.size;
    }
}
