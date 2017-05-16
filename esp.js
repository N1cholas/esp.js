let Event = (function () {
  let
  _default,
  Event

  // 默认的命名空间
  _default = 'default'

  Event = (function () {
    let 
    _iterator,
    _listen,
    _remove,
    _trigger,
    _create,
    namespaceCache

    // 命名空间
    namespaceCache = {}

    // 外部迭代器
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

    // 订阅事件
    _listen = (cache, key, fn) => {
      if (!cache[key]) cache[key] = []
      cache[key].push(fn)
    }

    // 取消订阅事件
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

    // 发布事件
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

      // 解除闭包引用
      stack = null 
    }

    // 创建命名空间并暴露接口
    _create = namespace => {
      let 
      space,
      cache,
      offlineCache,
      ret

      space = namespace ? namespace : _default
      // 订阅事件列表
      cache = {}
      // 离线消息列表
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