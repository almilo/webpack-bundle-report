var path = require('path'), _ = require('lodash'), webpack = require('webpack'), Table = require('cli-table');

module.exports = function (webpackConfiguration, callback) {
    webpack(webpackConfiguration, function (error, stats) {
        if (error) {
            callback(error);
        } else {
            var asJsonStats = stats.toJson(),
                report = showAssetTypesAndSizes(asJsonStats) + '\n' + showModuleNamesAndSizes(asJsonStats);

            callback(undefined, report);
        }
    });

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
};
