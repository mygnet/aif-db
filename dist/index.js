'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _aifCipher = require('aif-cipher');

var _aifStr = require('aif-str');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function DataBase(dir, name, key, table) {
    _classCallCheck(this, DataBase);

    this.key = key || null;
    this.id = null;
    this.name = this.hash(name);
    this.path = _path2.default.join(dir, this.name);
    this.table = table || 'table';
    this.lastError = '';
    if (!_fs2.default.existsSync(this.path)) {
      _shelljs2.default.mkdir('-p', this.path);
    }
  }

  DataBase.prototype.hash = function hash(data) {
    return this.key ? (0, _aifCipher.md5)(data + this.key) : data;
  };

  DataBase.prototype.idHash = function idHash(id) {
    id = id || this.id;
    if (id) {
      this.id = id;
      return this.hash(id);
    }
    return null;
  };

  DataBase.prototype.dir = function dir(id, table) {
    id = id || this.id;
    if (id) {
      this.id = id;
      table = table || this.table;
      table = this.hash(table);
      return _path2.default.join(this.path, table) + _path2.default.sep + (0, _aifStr.split)(id + '', 2).join(_path2.default.sep);
    }
    return null;
  };

  DataBase.prototype.file = function file(_file, id) {
    id = id || this.id;
    _file = _file || this.table;
    _file = this.hash(_file);
    if (id) {
      this.id = id;
      return this.dir(id) + _path2.default.sep + _file;
    }
    return null;
  };

  DataBase.prototype.saveFile = function saveFile(content, file) {
    if (_fs2.default.existsSync(content)) {
      content = _fs2.default.readFileSync(content, { encoding: 'utf8' });
    }
    content = content || '';
    file = file || this.table;
    file = this.hash(file);
    var error = null;
    try {
      content = (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' ? JSON.stringify(content) : content;
      content = this.key ? _aifCipher.Aes.encode(content, this.key) : content;
      file = this.dir() + _path2.default.sep + file;
      _fs2.default.writeFileSync(file, content, { encoding: 'utf8' });
    } catch (err) {
      this.lastError = err.toString();
      error = err;
    }
    return !!error;
  };

  DataBase.prototype.loadFile = function loadFile(file) {
    file = file || this.table;
    file = this.hash(file);
    file = this.dir() + _path2.default.sep + file;
    var content = null;
    var error = null;
    if (_fs2.default.existsSync(file)) {
      try {
        content = _fs2.default.readFileSync(file, { encoding: 'utf8' });
        content = this.key ? _aifCipher.Aes.decode(content, this.key) : content;
        content = JSON.parse(content);
      } catch (err) {
        this.lastError = err.toString();
        content = null;
        error = err;
      }
    } else this.lastError = 'database failed to connect ';
    return content;
  };

  DataBase.prototype.put = function put(rd, table, callback) {
    var id = rd._id;
    if ((typeof rd === 'undefined' ? 'undefined' : _typeof(rd)) === 'object') {
      if (typeof table === 'function') {
        callback = table;
      } else {
        this.table = table || this.table;
      }
      if (id) {
        id = id + '';
        var dir = this.dir(id);
        // path.join(this.path, table) + path.sep + seg
        var content = null;
        var error = null;
        try {
          content = JSON.stringify(rd);
          content = this.key ? _aifCipher.Aes.encode(content, this.key) : content;
        } catch (err) {
          error = err;
        }
        if (error) return callback(null, error, id);
        if (!_fs2.default.existsSync(dir)) {
          _shelljs2.default.mkdir('-p', dir);
        }
        var file = _path2.default.join(dir, this.hash(id));
        try {
          _fs2.default.writeFileSync(file, content, { encoding: 'utf8' });
          content = id;
        } catch (err) {
          error = err;
          content = null;
        }
        callback(content, error, id);
      } else {
        callback(false, 'A table identifier (._id) is required', id);
      }
    } else {
      callback(false, 'Data object is required', id);
    }
  };

  DataBase.prototype.get = function get(id, table, callback) {
    if (typeof table === 'function') {
      callback = table;
    } else {
      this.table = table || this.table;
    }
    if (id) {
      id = id + '';
      var file = this.dir(id) + _path2.default.sep + this.hash(id);
      var content = null;
      var error = null;
      if (_fs2.default.existsSync(file)) {
        content = _fs2.default.readFileSync(file, { encoding: 'utf8' });
        try {
          content = this.key ? _aifCipher.Aes.decode(content, this.key) : content;
          content = JSON.parse(content);
        } catch (err) {
          content = null;
          error = err;
        }
        callback(content, error, id);
      } else {
        callback(false, 'Record with identifier does not exist', id);
      }
    }
  };

  DataBase.prototype.vacum = function vacum(folder) {
    var _this = this;

    if (folder) {
      if (!_fs2.default.statSync(folder).isDirectory()) {
        return;
      }
      var files = _fs2.default.readdirSync(folder);
      if (files.length > 0) {
        files.forEach(function (file) {
          _this.vacum(_path2.default.join(folder, file));
        });
        files = _fs2.default.readdirSync(folder);
      }
      if (files.length === 0) {
        _fs2.default.rmdirSync(folder);
        return;
      }
    }
  };

  DataBase.prototype.remove = function remove(id, table, callback) {
    if (typeof table === 'function') {
      callback = table;
      table = this.table;
    }
    table = this.hash(table);
    if (id) {
      id = id + '';
      var file = this.dir(id) + _path2.default.sep + this.hash(id);
      if (_fs2.default.existsSync(file)) {
        _fs2.default.unlinkSync(file);
        this.vacum(_path2.default.join(this.path, table));
        callback(true);
      } else {
        callback(false, 'The record with identifier does not exist', id);
      }
    }
  };

  DataBase.prototype.save = function save(rd, table, callback) {
    var _this2 = this;

    if (typeof table === 'function') {
      callback = table;
      table = this.table;
    }
    this.get(rd._id, table, function (rs, err) {
      if (rs) {
        for (var key in rs) {
          if (rd[key] !== undefined) {
            rs[key] = rd[key];
          }
        }
        _this2.put(rs, table, callback);
      } else {
        _this2.put(rd, table, callback);
      }
    });
  };

  return DataBase;
}();