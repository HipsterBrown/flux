var __slice = [].slice;

define(['require', './lib/EventEmitter'], function(require) {
  var EventEmitter, Store;
  EventEmitter = require('./lib/EventEmitter');
  return Store = (function() {
    function Store() {
      this.events = {};
    }

    Store.prototype.emitChange = function() {
      return this.fireEvent('change');
    };

    Store.prototype.addChangeListener = function(callback) {
      return this.on('change', callback);
    };

    Store.prototype.removeChangeListener = function(callback) {
      return this.removeListener('change', callback);
    };

    Store.prototype.load = function() {
      return this.collection.fetch().then((function(_this) {
        return function() {
          return _this.emitChange();
        };
      })(this));
    };

    Store.prototype.getState = function() {
      return this.collection.toJSON();
    };

    Store.prototype.fireEvent = function() {
      var args, event, listener, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.events[event]) {
        return false;
      }
      _ref = this.events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.apply(null, args);
      }
      return true;
    };

    Store.prototype.addEvent = function(event, listener) {
      var _base;
      this.fireEvent('newListener', event, listener);
      ((_base = this.events)[event] != null ? _base[event] : _base[event] = []).push(listener);
      return this;
    };

    Store.prototype.on = Store.prototype.addEvent;

    Store.prototype.once = function(event, listener) {
      var fn;
      fn = (function(_this) {
        return function() {
          _this.removeListener(event, fn);
          return listener.apply(null, arguments);
        };
      })(this);
      this.on(event, fn);
      return this;
    };

    Store.prototype.removeListener = function(event, listener) {
      var l;
      if (!this.events[event]) {
        return this;
      }
      this.events[event] = (function() {
        var _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          if (l !== listener) {
            _results.push(l);
          }
        }
        return _results;
      }).call(this);
      return this;
    };

    Store.prototype.removeAllListeners = function(event) {
      return delete this.events[event];
    };

    return Store;

  })();
});
