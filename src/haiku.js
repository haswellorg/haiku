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
    }

    /**
     * Definitions for all custom Haiku events
     * @type Object
     */
    const events = {
        HAIKU_ERROR: "haiku:error"
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
    }

    /**
     * A property holding all Haiku's configs
     */
    const config = {
        /**
         * Holds all the elements that will have a default load trigger
         * @type string[]
         */
        defaultLoadElements: [""],

        /**
         * Holds all the Haiku attributes that will have a default load trigger
         * @type string[] 
        */
        defaultLoadAttributes: [""],
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

    async function handleFetchRequest(elt, url, method) {
        let response;
        try {
            response = await fetch(url, {
                method: method
            })
            console.log(response)
        } catch (err) {
            emit(elt, events.HAIKU_ERROR, {
                msg: err
            });
        }
    }

    //========================================================
    // Handlers
    //========================================================

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

    function dispatchElement(elt) {
        const actionTrigger = getTrigger(elt);
        const actionAttr = Object.keys(actions).find(attr => elt.hasAttribute(attr))
        const actionFn = actions[actionAttr]
        triggerEvent(elt, actionTrigger, actionFn)
    }

    function triggerEvent(elt, trigger, actionFn) {
        if (trigger === triggers.LOAD) {
            triggerImmediately(elt, actionFn);
        } else {
            elt.addEventListener(actionTrigger, (e) => {
                e.preventDefault();
                actionFn(elt, emit)
            })
        }
    }

    //========================================================
    // Custom Events
    //========================================================
    
    document.addEventListener(events.HAIKU_ERROR, (e) => {
        const {msg} = e.detail;
        error(msg);
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