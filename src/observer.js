function Observer(data) {
    this.data = data
    var self = this
    Object.keys(data).forEach(function(key) {
        self.defineReactive(data, key, value)
    })
}
Observer.prototype = {
    defineReactive: function(data, key, value) {
        var dep = new dep();
        var subObj = observe(value)

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable:  false, // 不能再define
            get: function() {
                return value
            },
            set: function(newValue) {
                if (newValue = value) return
                value = newValue
                // consoel.log(newValue, value)
                subObj = observe(newValue) // 新值是object的时候进行监听
                dep.notify()
            }
        })
    }
}

function observe(value) {
    if (!value || typeof value !== 'object') return
    return new Observer(value)
}

var uuid = 0

function Dep() {
    this.uid = uuid++
    this.subs = []
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub)
    },
    removeSub: function(sub) {
        var key = this.subs.indexOf(sub)
        if (key > -1) {
            this.subs.splice(key, 1)
        }
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update()
        })
    }
}
