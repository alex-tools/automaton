'use strict';

var fs     = require('fs'),
    interp = require('../lib/string/interpolate'),
    glob   = require('glob'),
    async  = require('async'),
    utils  = require('amd-utils')
;

var task = {
    id          : 'scaffolding-close',
    author      : 'Indigo United',
    name        : 'Scaffolding: close',
    description : 'Close {{placeholders}} in files.',
    options: {
        files: {
            description: 'Which files to process. Accepts a filename and array of filenames. Also note that the filenames can be minimatch patterns.'
        },
        placeholders: {
            description: 'Which placeholders to close. Accepts a string, or an array of strings.'
        },
        trim: {
            description: 'Trim leading or trailing spaces',
            'default': true
        },
        glob: {
            description: 'The options to pass to glob (check https://npmjs.org/package/glob for details).',
            'default': null
        }
    },
    tasks       :
    [
        {
            task: function (opt, ctx, next) {
                opt.glob = opt.glob || {};
                var files = !utils.lang.isArray(opt.files) ? [opt.files] : opt.files;
                var placeholders = !utils.lang.isArray(opt.placeholders) ? [opt.placeholders] : opt.placeholders;
                var data = {};

                placeholders.forEach(function (placeholder) {
                    data[placeholder] = '';
                });

                // data is done at this time
                // For each item in the files array, perform a glob
                async.forEach(files, function (file, next) {
                    glob(file, opt.glob, function (err, matches) {
                        if (err) {
                            return next(err);
                        }

                        // For each match in the glob result,
                        // perform the interpolation
                        async.forEach(matches, function (file, next) {
                            // Check if is an actual file
                            // We couldn't use mark option because is bugged
                            // See: https://github.com/isaacs/node-glob/issues/50
                            fs.stat(file, function (err, stat) {
                                if (err) {
                                    return next(err);
                                }

                                if (!stat.isFile()) {
                                    return next();
                                }

                                fs.readFile(file, function (err, contents) {
                                    if (err) {
                                        return next(err);
                                    }

                                    contents = interp(contents.toString(), data, { trim: opt.trim });
                                    fs.writeFile(file, contents, next);
                                });
                            });
                        }, next);
                    });
                }, next);
            }
        }
    ]
};

module.exports = task;