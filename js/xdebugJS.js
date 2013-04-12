var xDebugJS = {
    __options__: {
        traceSelector: [
            /* Notice */
            'table.xe-notice',
            /* Fatal */
            'table.xe-fatal-error',
            /* Warning */
            'table.xe-warning',
            /* Exception */
            'table.xe-exception',
            /* uncaught Exception */
            'table.xe-uncaught-exception',
            /* BackTrace */
            'table.xe-xdebug',
            /* Parse Error */
            'table.xe-parse-error',
        ],
        dumpSelector: [
            /* Dump */
            "pre.xdebug-var-dump"
        ],
        preObserve: function() {
        },
        postObserve: function() {
        },
        traceOperator: function(p_trace) {
        },
        dumpOperator: function(p_dump) {
        },
        removeTraces: true,
        removeDumps: true,
        selectors: {
            container: "div#xdebugContainer",
            opener: "a.xdebugOpener",
            labelCurrent: ".xdebugLabelCurrent",
            labelTotal: ".xdebugLabelTotal",
            controlePrev: ".xdebugControl.prev",
            controleNext: ".xdebugControl.next",
        },
        
        renderDump: function(p_val, p_key, p_obj) {},
        renderTrace: function(p_val, p_key, p_obj) {},
        notificator: function() {
            alert("new Traces/Dumps available");
        },
    },
    currentElement: null,
    container: null,
    persistentStore: [],
    init: function(p_options) {
        p_options = p_options || {};
        this.liveTraceStore = [],
                this.liveDumpStore = [],
                this.persistentStore = [];

        /* Extend the default options */
        this.__options__ = snack.extend(this.__options__, p_options);

        /* Register `open` link */
        snack.wrap(this.__options__.selectors.opener).attach('click', function() {
            this.container.style.display = (this.container.style.display == 'block') ? 'none' : 'block';
            
            /* Expand MainContainer dimensions */
            if (this.container.style.display == 'none')
                this.container.parentNode.setAttribute("style", "width:auto;height:auto;");
            else
                this.container.parentNode.setAttribute("style", "width:98%;height:96%;");
        }.bind(this));

        /* Register controls */
        snack.wrap(this.__options__.selectors.controleNext + ", " + this.__options__.selectors.controlePrev).attach('click', function(p_evt) {
            /* Start at the first contentEntry */
            if (snack.isArray(snack.wrap("div#xdebugContent > div.xdebugEntryVisible")[0])) {
                snack.wrap(this.__options__.selectors.labelCurrent)[0].innerHTML = 1;
                snack.wrap("div#xdebugContent > div.xdebugEntry")[0].className = 'xdebugEntry xdebugEntryVisible';
            } else {
                /* Store the actual visible Element */
                var l_visibleElement = snack.wrap("div#xdebugContent > div.xdebugEntryVisible")[0];

                /* Hide actual item */
                snack.wrap("div#xdebugContent > div.xdebugEntryVisible")[0].className = 'xdebugEntry';

                /* What is clicked: next or previous */
                var l_elementKey = (p_evt.target.parentNode.className.indexOf("next") != -1) ? 'nextSibling' : 'previousSibling';
                var l_newVisibleElement = null;
                try {
                    l_newVisibleElement = l_visibleElement[l_elementKey];
                    l_newVisibleElement.className = 'xdebugEntry xdebugEntryVisible';
                } catch (e) {
                    console.log(e);
                    var l_key = (l_elementKey == 'nextSibling') ? 0 : l_visibleElement.parentNode.childNodes.length-1;
                    l_newVisibleElement = l_visibleElement.parentNode.childNodes[l_key];
                    l_newVisibleElement.className = 'xdebugEntry xdebugEntryVisible';
                }

                snack.wrap(this.__options__.selectors.labelCurrent)[0].innerHTML = snack.indexOf(l_newVisibleElement, l_newVisibleElement.parentNode.childNodes) + 1;
            }
        }.bind(this));

        this.container = snack.wrap(this.__options__.selectors.container)[0];
        this.listener = snack.listener({
            node: document.body,
            event: 'DOMNodeInserted',
        }, function(p_evt) {
            this.liveTraceStore = [],
                    this.liveDumpStore = [];

            this.observer();
        }.bind(this));

        this.observer();
    },
    /**
     * General observer
     * 
     * This method will be executed every time
     * when the document is changed
     * @returns {undefined}
     */
    observer: function() {
        console.log("observer-start");
        this.__options__.preObserve();

        var l_dumpStore = [],
                l_traceStore = [];
        /* Iterate through trace selectors */
        snack.wrap(this.__options__.traceSelector.join(',')).each(function(p_element, p_index) {
            this.collector(p_element, this.__options__.traceOperator, "liveTraceStore", this.__options__.removeTraces);
        }.bind(this));

        /* Iterate through dump selectors */
        snack.wrap(this.__options__.dumpSelector.join(',')).each(function(p_element, p_index) {
            this.collector(p_element, this.__options__.dumpOperator, "liveDumpStore", this.__options__.removeDumps);
        }.bind(this));

        this.__options__.postObserve();

        l_dumpStore = this.liveDumpStore;
        l_traceStore = this.liveTraceStore;
        if (l_traceStore.length || l_dumpStore.length) {
            this.__options__.notificator(l_traceStore.length+l_dumpStore.length);

            snack.each(l_dumpStore, function(p_val, p_key, p_obj) {
                this.render(p_val, p_key, p_obj, 'renderDump');

                var l_entryDiv = document.createElement("div");
                l_entryDiv.className = 'xdebugEntry';
                l_entryDiv.appendChild(p_val);
                snack.wrap("#xdebugContent")[0].appendChild(l_entryDiv);
            }.bind(this));

            snack.each(l_traceStore, function(p_val, p_key, p_obj) {
                this.render(p_val, p_key, p_obj, 'renderTrace');

                var l_entryDiv = document.createElement("div");
                l_entryDiv.className = 'xdebugEntry';
                l_entryDiv.appendChild(p_val);
                snack.wrap("#xdebugContent")[0].appendChild(l_entryDiv);
            }.bind(this));
        }
        snack.wrap(this.__options__.selectors.labelTotal)[0].innerHTML = snack.wrap("div#xdebugContent")[0].childNodes.length;
        
        console.log("observer-end");
    },
    render: function(p_val, p_key, p_obj, p_renderer) {
        console.log("render-start");
        this.__options__[p_renderer].apply(this, [p_val, p_key, p_obj]);
        console.log("render-end");
    },
    /**
     * Collect necessary elements
     * 
     * @param {type} p_element
     * @param {type} p_customOperator
     * @param {type} p_store
     * @param {type} p_remove
     * @returns {undefined}
     */
    collector: function(p_element, p_customOperator, p_store, p_remove) {
        if (!snack.isArray(p_element) && p_element !== null && p_element.className !== '') {
            console.log(p_element);
            if (p_element.parentNode.getAttribute("colspan") == 3)
                return;
            p_remove = p_remove || false;
            /* Clone the element */
            this.currentElement = p_element.cloneNode(true);

            /* Unset class to prevent recursion */
            this.currentElement.setAttribute("class", "xdebugJS");
            p_element.setAttribute("class", "");

            /* Remove the element from DOM */
            if (p_element.parentNode !== null && p_remove)
                p_element.parentNode.removeChild(p_element);

            /* Apply Dumpoperator for custom modifications */
            p_customOperator.apply(this, [this.currentElement]);

            /* Store it if necessary! */
            if (snack.indexOf(this.currentElement, this[p_store]))
                this[p_store].push(this.currentElement.cloneNode(true));
        }
    },
    listener: null,
    liveTraceStore: [],
    liveDumpStore: []
}

snack.ready(function() {
    var xDebugInstance = Object.create(xDebugJS);
    xDebugInstance.init({});
});

