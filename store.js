var EventEmitter, Store,
  slice = [].slice;

EventEmitter = require('event-emitter');

module.exports = Store = (function() {
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
    var args, event, i, len, listener, ref;
    event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!this.events[event]) {
      return false;
    }
    ref = this.events[event];
    for (i = 0, len = ref.length; i < len; i++) {
      listener = ref[i];
      listener.apply(null, args);
    }
    return true;
  };

  Store.prototype.addEvent = function(event, listener) {
    var base;
    this.fireEvent('newListener', event, listener);
    ((base = this.events)[event] != null ? base[event] : base[event] = []).push(listener);
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
      var i, len, ref, results;
      ref = this.events[event];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        l = ref[i];
        if (l !== listener) {
          results.push(l);
        }
      }
      return results;
    }).call(this);
    return this;
  };

  Store.prototype.removeAllListeners = function(event) {
    return delete this.events[event];
  };

  return Store;

})();
