/* 
 * compile主要做的事情是解析模板指令，将模板中的变量替换成数据，
 * 然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，
 * 一旦数据有变动，收到通知，更新视图
 */
function Compile(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    this.$frament = null
    this.init()
}

Compile.prototype = {
    init: function() {
        if (this.$el) {
            // 因为遍历解析的过程有多次操作 dom 节点，为提高性能和效率，会先将跟节点 el 转换成文档碎片 fragment 进行解析编译操作，解析完成，再将 fragment 添加回原来的真实 dom 节点中
            this.$fragment = this.nodeToFragment(this.$el)
            this.compileElement(this.$fragment)
            this.$el.appendChild(this.$fragment)
        } else {
            console.log('Dom元素不存在')
        }
    },
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment()
        var child
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment
    },
    compileElement: function(el) {  
        var childNodes = el.childNodes
        var self = this
        Array.prototype.forEach.call(childNodes, function(node) {
            var reg = /\{\{(.*)\}\}/
            var text = node.textContent
            if (self.isElementNode(node)) {
                self.compile(node)
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1])
            }
            if (node.childNodes && node.childNodes.length) { // 递归循环遍历子节点
                self.compileElement(node)
            }
        })
    },
    compile: function(node) {
        var nodeAttrs = node.attributes
        var self = this
        Array.prototype.forEach.call(nodeAttrs, function(attr) {
            var attrName = attr.name
            if (self.isDirective(attrName)) { // 如果指令包含 v-
                var exp = attr.value
                var dir = attrName.substring(2)
                if (self.isEventDirective(dir)) { // 如果是事件指令, 包含 on:
                    self.compileEvent(node, self.$vm, exp, dir)
                } else { // v-model 普通指令
                    self.compileModel(node, self.$vm, exp)
                }
            }
        })
    },
    compileEvent: function(node, vm, exp, dir) {
        var arr = dir.split(':')
        if (arr.length < 2) return
        var eventType = arr[1]
        var cb = vm.methods && vm.methods[exp]
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false)
        }
    },
    compileText: function(node, exp) { // 将{{}}替换掉
        var self = this
        var initText = this.$vm[exp]
        this.updateText(node, initText)
        new Watcher(this.$vm, exp, function(value){
            self.updateText(node, value)
        })
    },
    compileModel: function(node, vm, exp) {
        var val = vm[exp]
        var self = this
        this.modelUpdate(node, val)
        node.addEventListener('input', function(e) {
            var newValue = e.target.value
            self.$vm[exp] = newValue  // 绑定 model 到 view
        })
    },
    updateText: function(node, val) {
        node.textContent = typeof val === 'undefined' ? '' : val
    },
    modelUpdate: function(node, value) {
        node.value = typeof val === 'undefined' ? '' : val
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0
    },
    isElementNode: function(node) {
        return node.nodeType === 1
    },
    isTextNode: function(node) {
        return node.nodeType === 3
    }
}