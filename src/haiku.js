/**
 * Haiku
 */
(function(){

    //========================================================
    // Definitions
    //========================================================

    /**
     * Definitions for all Haiku actions
     * @type Object
     */
    const attributes = {
        HK_TRIGGER: "hk-trigger",
        HK_GET: "hk-get",

        HK_DATA_KEY: "hk-data-key",
        HK_DATA: "hk-data",

        HK_RENDER: "hk-render"
    }

    /**
     * Definitions for all custom Haiku events
     * @type Object
     */
    const events = {
        HAIKU_ERROR: "haiku:error",
        HAIKU_FETCH_COMPLETED: "haiku:fetchCompleted"
    }

    /**
     * Definitions for all Haiku triggers
     * @type Object
     */
    const triggers =  {
        LOAD: "load",
        CLICK: "click"
    }

    /**
     * A central hash table to store all data returned from requests
     */
    const data = {}

    /** 
     * A property holding all Haiku's attributes and their corresponding handlers
     * @type Object
    */
    const actions = {
        [attributes.HK_GET]: handleGet,
        [attributes.HK_RENDER]: handleGet
    }

    /**
     * A property holding all Haiku's configs
     */
    const config = {
        /**
         * Holds all the elements that will have a default load trigger
         * @type string[]
         */
        defaultLoadTags: ["div"],

        /**
         * Holds all the Haiku attributes that will have a default load trigger
         * @type string[] 
        */
        defaultLoadAttributes: [
            attributes.HK_RENDER,
            attributes.HK_DATA
        ],
    }

    //========================================================
    // Utilities
    //========================================================

    /**
     * @param {String} msg 
     */
    function error(msg) {
        console.error(msg);
    }

    /**
     * @param {Node} elt 
     * @param {string} name 
     * @returns {(string | null)}
     */
    function getRawAttribute(elt, name) {
        return elt.getAttribute(name);
    }

    /**
     * @param {Node} elt 
     * @param {string} name 
     * @returns {boolean}
     */
    function hasAttribute(elt, name) {
        return elt.hasAttribute(elt, `${name}`);
    }

    /**
     * @param {Node} elt 
     * @param {string} tag 
     * @returns {boolean}
     */
    function isTag(elt, tag) {
        return elt.tagName === tag.toUpperCase()
    }

    /**
     * Finds the nearest element with the given attribute
     * @param {Node} elt 
     * @param {string} attribute 
     * @returns {Node | null}
     */
    function findNearest(elt, attribute) {
        let nearest = null;
        let sibling = elt.nextElementSibling;
        
        while (sibling) {
            if (hasAttribute(sibling, attribute)) {
                nearest = sibling;
                break
            }
            sibling = sibling.nextElementSibling;
        }

        return nearest;
    }

    /**
     * @param {string} key 
     * @param {Object} value 
     */
    function storeData(key, value) {
        data[key] = value;
    }

    /**
     * @param {string} key 
     * @returns {Object | null}
     */
    function getData(key) {
        return data[key]
    }

    /**
     * Emits a custom event
     * @param {Node} elt 
     * @param {string} type 
     * @param {Object} detail 
     */
    function emit(elt, type, detail = {}) {
        const event = new CustomEvent(type, {
            bubbles: true,
            detail
        })

        elt.dispatchEvent(event);
    }

    /**
     * @param {Node} elt 
     * @returns {string}
     */
    function getTrigger(elt) {
        return getRawAttribute(elt, attributes.HK_TRIGGER) || getDefaultTrigger(elt);
    }

    /**
     * @param {Node} elt 
     * @returns {string}
     */
    function getDefaultTrigger(elt) {
        if (
            config.defaultLoadTags.map(tag => isTag(elt, tag)) || 
            config.defaultLoadAttributes.map(attr => hasAttribute(elt, attr))) {
            return triggers.LOAD;
        }
        return triggers.CLICK;
    }

    /**
     * Triggers the action immediately
     * @param {Node} elt 
     * @param {Function} actionFn 
     */
    function triggerImmediately(elt, actionFn) {
        actionFn(elt)
    }

    /**
     * @param {Node} elt 
     * @param {string} url 
     * @param {string} method 
     */
    async function handleFetchRequest(elt, url, method) {
        let response;
        try {
            response = await fetch(url, {
                method: method
            })
            handleFetchResponse(elt, response);
        } catch (err) {
            emit(elt, events.HAIKU_ERROR, {
                msg: err
            });
        }
    }

    async function handleFetchResponse(elt, response) {
        type = response.headers.get("content-type").split("; ")[0]
        switch (type) {
            case "application/json":
                handleJsonData(elt, await response.json());
                break;
            default: 
                handleTextData(elt, await response.text());
                break;
        }
    }

    function handleJsonData(elt, data) {
        if (hasAttribute(elt)) {

        }
    }

    function handleTextData(elt, data) {

    }

    //========================================================
    // Handlers
    //========================================================

    /**
     * @param {Node} elt 
     * @param {Function} emit 
     */
    function handleGet(elt, emit) {
        handleFetchRequest(elt, getRawAttribute(elt, attributes.HK_GET), "GET");
    }


    //========================================================
    // Dispatcher
    //========================================================

    /**
     * Dispatches all Haiku elements
     */
    function haikuDispatcher() {
        const hkAttributes = Object.keys(actions).map(attr => `[${attr}]`).join(',')
        document.querySelectorAll(hkAttributes).forEach(dispatchElement)
    }

    /**
     * @param {Node} elt 
     */
    function dispatchElement(elt) {
        const actionTrigger = getTrigger(elt);
        const actionAttr = Object.keys(actions).find(attr => elt.hasAttribute(attr))
        const actionFn = actions[actionAttr]
        triggerEvent(elt, actionTrigger, actionFn)
    }

    /**
     * @param {Node} elt 
     * @param {string} trigger 
     * @param {Function} actionFn 
     */
    function triggerEvent(elt, trigger, actionFn) {
        if (trigger === triggers.LOAD) {
            triggerImmediately(elt, actionFn);
        } else {
            elt.addEventListener(trigger, (e) => {
                e.preventDefault();
                actionFn(elt, emit)
            })
        }
    }

    //========================================================
    // Custom Events
    //========================================================
    
    /**
     * Haiku error event
     */
    document.addEventListener(events.HAIKU_ERROR, (e) => {
        const {msg} = e.detail;
        error(msg);
    })

    /**
     * Haiku fetch completed event
     */
    document.addEventListener(events.HAIKU_FETCH_COMPLETED, (e) => {
        console.log("update stuff")
    })

    //========================================================
    // Initialization
    //========================================================

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", haikuDispatcher);
    } else {
        haikuDispatcher();
    }
})();