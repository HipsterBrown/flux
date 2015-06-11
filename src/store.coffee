EventEmitter = require('event-emitter')

module.exports = class Store
  constructor: ->
    @events = {}

  emitChange: ->
    @fireEvent('change')

  addChangeListener: (callback) ->
    @on('change', callback)

  removeChangeListener: (callback) ->
    @removeListener('change', callback)

  load: ->
    @collection.fetch().then(=> @emitChange())

  getState: ->
    @collection.toJSON()

  fireEvent: (event, args...) ->
    return false unless @events[event]
    listener args... for listener in @events[event]
    return true

  addEvent: (event, listener) ->
    @fireEvent 'newListener', event, listener
    (@events[event]?=[]).push listener
    return @

  on: @::addEvent

  once: (event, listener) ->
    fn = =>
      @removeListener event, fn
      listener arguments...
    @on event, fn
    return @

  removeListener: (event, listener) ->
    return @ unless @events[event]
    @events[event] = (l for l in @events[event] when l isnt listener)
    return @

  removeAllListeners: (event) ->
    delete @events[event]

