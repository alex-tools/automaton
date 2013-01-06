var mkdirp = require('mkdirp');
var fs     = require('fs');
var utils  = require('amd-utils');
var async  = require('async');

var task = {
    id         : 'mkdir',
    author     : 'Indigo United',
    name       : 'Make dir recursively',
    description: 'Make directories',
    options    : {
        dirs: {
            description: 'The directories you want to create. Accepts an array of directories or a single one through a string.'
        },
        mode: {
            description: 'The directory permissions',
            'default': '0777'
        }
    },
    filter     : function (opt, next) {
        if (!utils.lang.isNumber(opt.mode)) {
            opt.mode = parseInt(opt.mode, 8);
        }
        next();
    },
    tasks      :
    [
        {
            task: function (opt, next) {
                var dirs = utils.lang.isArray(opt.dirs) ? opt.dirs : [opt.dirs];
                async.forEach(dirs, function (dir, next) {
                    fs.stat(dir, function (err) {
                        if (!err || err.code !== 'ENOENT') {
                            return next(new Error(dir + ' already exists'));
                        }

                        mkdirp(dir, opt.mode, next);
                    });
                }, next);
            }
        }
    ]
};

module.exports = task;