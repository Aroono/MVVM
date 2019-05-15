function Compile(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if (this.$el) {
        this.$frament = this.node2Frament(this.$el)
        this.init()
        this.$el.appendChild(this.$frament)
    }
}

Compile.prototype = {
    node2Frament: function(el) {
        var fragment = document.createDocumentFragment()
        var child
        // 将原生
    }
}