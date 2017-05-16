let Event = (function () {
  let
  _default,
  Event

  // The default namespace
  _default = 'default'

  Event = (function () {
    let 
    _iterator,
    _listen,
    _remove,
    _trigger,
    _create,
    namespaceCache

    // Namespaces
    namespaceCache = {}

    // External iterator
    _iterator = function (array) {
      let
      _current,
      next,
      isDone,
      getCurrentItem,
      getCurrentIndex

      _current = 0

      next = () => _current++

      isDone = () => { return _current >= array.length }

      getCurrentIndex = () => { return _current }

      getCurrentItem = () => { return array[_current] }

      return { next, isDone, getCurrentIndex, getCurrentItem }
    }

    // Subscribe to events
    _listen = (cache, key, fn) => {
      if (!cache[key]) cache[key] = []
      cache[key].push(fn)
    }

    // Cancel the subscription event
    _remove = (cache, key, fn) => {
      let fns = cache[key]

      if (!fns) return

      if (fn)
        for (let i = fns.length, curFn; curFn = fns[--i];) {
          if (curFn === fn) fns.splice(i, 1)
        }
      else
        fns.length = 0
    }

    // Publish event
    _trigger = function (cache, key, res) {
      let fns = cache[key]

      if (!fns) return

      let
      stack,
      _self

      stack = _iterator(fns)
      _self = this

      while (!stack.isDone()) {
        stack.getCurrentItem().call(_self, res)
        stack.next()
      }

      // Unblock the reference
      stack = null 
    }

    // Create a namespace and expose the interface
    _create = namespace => {
      let 
      space,
      cache,
      offlineCache,
      ret

      space = namespace ? namespace : _default
      // Subscribe to the event list
      cache = {}
      // Offline message list
      offlineCache = {}

      ret = {
        listen: (key, fn, last) => {
          _listen(cache, key, fn)

          if (!offlineCache[key]) return

          if (last === true) {
            offlineCache[key].pop()()
          } else {
            let stack = _iterator(offlineCache[key])
            
            while (!stack.isDone()) {
              stack.getCurrentItem()()
              stack.next()
            }
          }

          offlineCache[key] = null
        },

        remove: (key, fn) => {
          _remove(cache, key, fn)
        },

        trigger: (key, res) => {
          _trigger(cache, key, res)
        },

        triggerOffline: (key, res) => {
          let curFn = () => { return _trigger(cache, key, res) }

          if (!(key in cache) || (cache[kye].length === 0)) {
            if (!offlineCache[key]) offlineCache[key] = []
            return offlineCache[key].push(curFn)
          }

          curFn()
        }
      }

      return space ?
        (namespaceCache[space] ? namespaceCache[space] : namespaceCache[space] = ret) :
        ret 
    }

    return {
      create: _create,

      listen: function (key, fn, last) {
        let space = this.create()
            space.listen(key, fn, last)
      },

      remove: function (key, fn) {
        let space = this.create()
            space.remove(key, fn)
      },

      trigger: function (key, res) {
        let space = this.create()
            space.trigger(key, res)
      }
    }
  })()
  return Event
})()