rsvp = require('rsvp')

  # NOTE: rsvp must be set as a path in requirejs_config like this:
  #
  # rsvp: 'path/to/flux/lib/rsvp.amd.js'

Promise = rsvp.Promise

  # Based on https://github.com/yahoo/dispatchr
module.exports = class Dispatcher
  stores: {}
  handlers: {}
  context: {}
  storeInstances: {}
  currentAction: null
  actionQueue: []

  registerStore: (store) ->
    storeName = @getStoreName(store)
    throw new Error("Store is required to have a `storeName` property.")  unless storeName
    throw new Error("Store `#{ storeName }` is already registered.")  if @stores[storeName]
    @stores[storeName] = store
    if store.handlers
      Object.keys(store.handlers).forEach (action) =>
        handler = store.handlers[action]
        @registerHandler(action, storeName, handler)
    store

  isRegistered: (store) ->
    storeName = @getStoreName(store)
    storeInstance = @stores[storeName]
    return false  unless storeInstance
    return false  if store isnt storeInstance  if "function" is typeof store
    true

  getStoreName: (store) ->
    return store  if "string" is typeof store
    store.storeName

  # Adds a handler function to be called for the given action
  registerHandler: (action, name, handler) ->
    @handlers[action] = @handlers[action] or []
    @handlers[action].push
      name: @getStoreName(name)
      handler: handler

    @handlers.length - 1

  # Returns a single store instance and creates one if it doesn't already exist
  getStore: (name) ->
    @stores[name]


  # Dispatches a new action or queues it up if one is already in progress
  dispatch: (actionName, payload, callback) ->
    unless @handlers[actionName]
      callback
    @actionQueue.push
      name: actionName
      payload: payload
      callback: callback
      actionPromise: null
      handlerPromises: {}
      waiting: {}

    @next()


  # Handles the next Action in the queue if another Action is not in progress
  next: ->
    return @currentAction  if @currentAction
    nextAction = @actionQueue.shift()
    if nextAction
      @currentAction = nextAction
      actionPromise = @handleAction(nextAction)
      actionPromise.then((result) =>
        @currentAction = null
        if nextAction.callback
          nextAction.callback null, result

      )["catch"] (err) =>
        @currentAction = null
        if nextAction.callback
          nextAction.callback err
    @currentAction


  # Calls the handler functions for all stores that have registered for
  handleAction: (action) ->
    name = action.name
    payload = action.payload
    handlerPromises = []
    @handlers[name].forEach (store) =>
      handlerPromise = new Promise((resolve, reject) =>
        storeInstance = @getStore(store.name)
        storeInstance[store.handler] payload, storeHandlerDone = (err) =>
          if err
            reject err
          resolve()
      )
      handlerPromises.push handlerPromise
      action.handlerPromises[store.name] = handlerPromise

    Promise.all handlerPromises


  # Waits until all stores have finished handling an actionand then calls the callback
  waitFor: (stores, callback) ->
    currentAction = @currentAction
    waitHandlers = []
    throw new Error("waitFor called even though there is no action being handled!")  unless currentAction
    stores = [stores]  unless Array.isArray(stores)
    stores.forEach (store) =>
      storeName = @getStoreName(store)
      actionHandler = currentAction.handlerPromises[storeName]
      waitHandlers.push actionHandler  if actionHandler
      return

    Promise.all(waitHandlers).then((result) ->
      callback null, result
    )["catch"] (err) ->
      callback err

window.Dispatcher ?= new Dispatcher()
window.Dispatcher
