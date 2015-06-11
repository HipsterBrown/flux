var Dispatcher, StoreMixin, _;

_ = require('underscore');

Dispatcher = require('../dispatcher');

module.exports = StoreMixin = {
  _setUpStores: function() {
    this._storeMap = {};
    this._listeners = {};
    return this.stores.forEach((function(_this) {
      return function(store) {
        var listener;
        if (!Dispatcher.isRegistered(store)) {
          Dispatcher.registerStore(store);
        }
        listener = function() {
          var state;
          state = {};
          state[store.storeName] = store.getState();
          return _this.setState(state);
        };
        _this._listeners[store.storeName] = listener;
        store.addChangeListener(listener);
        return _this._storeMap[store.storeName] = store;
      };
    })(this));
  },
  getInitialState: function() {
    this._setUpStores();
    return _.object(_.map(this._storeMap, function(store, name) {
      return [name, store.getState()];
    }));
  },
  componentWillUnmount: function() {
    return this.stores.forEach((function(_this) {
      return function(store) {
        return store.removeChangeListener(_this._listeners[store.storeName]);
      };
    })(this));
  }
};
