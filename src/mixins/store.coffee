define ['underscore', '../dispatcher'], (_, Dispatcher) ->
  StoreMixin = {
    _setUpStores: ->
      @_storeMap = {}
      @_listeners = {}
      @stores.forEach (store) =>
        unless Dispatcher.isRegistered(store)
          Dispatcher.registerStore(store)

        listener =  =>
          state = {}
          state[store.storeName] = store.getState()
          @setState(state)

        @_listeners[store.storeName] = listener
        store.addChangeListener(listener)
        @_storeMap[store.storeName] = store

    getInitialState: ->
      @_setUpStores()
      _.object(_.map(@_storeMap, (store, name) -> [name, store.getState()]))

    componentWillUnmount: ->
      @stores.forEach (store) =>
        store.removeChangeListener(@_listeners[store.storeName])
  }
