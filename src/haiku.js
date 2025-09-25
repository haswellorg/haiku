/**
 * Haiku
 */
(function(){

    /**
     * A central hash table to store all data returned from requests
     */
    const data = {}

    /** 
     * A property holding all Haiku's attributes and their corresponding handlers
    */
    const actions = {}

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
        defaultLoadAttributes: [""]
    
    }

    //========================================================
    // Utilities
    //========================================================

    /**
     * @param {Node} elt 
     * @param {string} name 
     * @returns {(string | null)}
     */
    function getRawAttribute(elt, name) {
        return elt.getRawAttribute(`${name}`);
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
        return getRawAttribute("hk-trigger") || getDefaultTrigger(elt);
    }

    /**
     * @param {Node} elt 
     * @returns {string}
     */
    function getDefaultTrigger(elt) {
        if (hasAttribute(elt, "if")) {
            return "load"
        }
        return "click";
    }

    //========================================================
    // Handlers
    //========================================================

    //========================================================
    // Dispatcher
    //========================================================

    function haikuDispatcher() {

    }

    //========================================================
    // Custom Events
    //========================================================

    //========================================================
    // Initialization
    //========================================================

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", haikuDispatcher);
    } else {
        haikuDispatcher();
    }
})();