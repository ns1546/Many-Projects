document.androidEmbedViewManager = {
    parseObjectElement: function(e) {
        var t, n;
        if (e.children)
            for (var a = e.children.length, o = 0; o < a; o++) {
                var i = e.children[o];
                'type' === i.getAttribute('name') ? t = i.getAttribute('value') : 'id' === i.getAttribute('name') && (n = i.getAttribute('value'))
            }
        void 0 === n && (n = e.id);
        var l = e.getBoundingClientRect(),
            c = 0;
        document.documentElement && document.documentElement.scrollLeft ? c = document.documentElement.scrollLeft : document.body && (c = document.body.scrollLeft);
        var r = 0;
        document.documentElement && document.documentElement.scrollTop ? r = document.documentElement.scrollTop : document.body && (r = document.body.scrollTop);
        return {
            elementId: n,
            type: t,
            x: l.left + c,
            y: l.top + r,
            width: l.width,
            height: l.height
        }
    },
    parseObject: function(e, t) {
        var l = e.getBoundingClientRect(),
            elementId = e.getAttribute("id")
        c = 0;
        document.documentElement && document.documentElement.scrollLeft ? c = document.documentElement.scrollLeft : document.body && (c = document.body.scrollLeft);
        var r = 0;
        document.documentElement && document.documentElement.scrollTop ? r = document.documentElement.scrollTop : document.body && (r = document.body.scrollTop);
        var data = e.getAttribute("nbcomponent-data")

        obj = {
            elementId: elementId,
            type: t,
            x: l.left + c,
            y: l.top + r,
            width: l.width,
            height: l.height,
        }
        if (data) {
            obj.data = JSON.parse(data)
        }
      return obj
    },
    parseObjectElementList: function(element, list) {
        type = element.getAttribute("nbcomponent-type")
        if (type) {
            var elementNode = this.parseObject(element, type)
            list.push(elementNode)
            element.childNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 处理元素节点
                    if (!elementNode.array) {
                        elementNode.array = []
                    }
                    this.parseObjectElementList(document.getElementById(node.id),elementNode.array)
                }
            });
        }
    },
    render: function(e) {
        var t = document.getElementById(e);
        if (t && "OBJECT" === t.tagName) {
            console.log('render ' + e);
            return this.parseObjectElement(t)
        } else if (t && "DIV" === t.tagName) {
            console.log('render ' + e);
            var list = []
            this.parseObjectElementList(t, list)
            return list
        }
    }
}