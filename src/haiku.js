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
        HK_POST: "hk-post",

        HK_REGISTER: "hk-register",

        HK_DATA_KEY: "hk-data-key",
        HK_DATA: "hk-data",
        HK_RENDER: "hk-render",

        HK_TARGET: "hk-target"
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
        [attributes.HK_POST]: handlePost,
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
            attributes.HK_DATA,
            attributes.HK_RENDER
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
        return elt.hasAttribute(name);
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
    function setData(key, value) {
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
            config.defaultLoadTags.some(tag => isTag(elt, tag)) || 
            config.defaultLoadAttributes.some(attr => hasAttribute(elt, attr))) {
            return triggers.LOAD;
        }
        return triggers.CLICK;
    }

    /**
     * @param {Node} elt 
     * @param {Function} actionFn 
     */
    function triggerImmediately(elt, actionFn) {
        actionFn(elt)
    }

    /**
     * @param {Node} elt 
     * @param {Object} data 
     */
    function maybeStoreData(elt, data) {
        if (hasAttribute(elt, attributes.HK_DATA_KEY)) {
            const key = getRawAttribute(elt, attributes.HK_DATA_KEY);
            setData(key, data);
            emit(elt, events.HAIKU_FETCH_COMPLETED, {
                key,
                value: data
            })
        }
    }

    /**
     * @param {string} key 
     */
    function loadAllDataAttributes(key) {
        document.querySelectorAll(`[hk-data^="${key}."]`).forEach(elt => {
            handleData(elt)
        })
    }

    /**
     * @param {string} key 
     */
    function loadAllRenderAttributes(key) {
        document.querySelectorAll(`[hk-render]`).forEach(elt => {
            const fn = getRawAttribute(elt, attributes.HK_RENDER);
            const params = fn.slice(fn.indexOf("(") + 1, -1).split(",").map(s => s.trim())
            handleRender(elt, fn, params);
        })
    }

    /**
     * @param {*} target 
     * @param {*} value 
     */
    function replace(target, value) {
        //TODO: This needs to be sanitized lol
        const tplElt = document.createElement("template");
        tplElt.innerHTML = value;
        target.replaceWith(tplElt.content.cloneNode(true));
    }

    /**
     * @param {Node} elt 
     * @returns {Node | null}
     */
    function findTargetElement(elt) {
        const targetElement = getRawAttribute(elt, attributes.HK_TARGET);
        return document.querySelector(targetElement)
    }

    /**
     * @param {Node[]} children 
     * @param {string} tag 
     * @returns {Node[]}
     */
    function findAllTagsWrapper(children, tag) {
        return findAllTags(children, [], tag, 0);
    }

    /**
     * Recursively loop through an input, and insert it into the output if it matches the given tag
     * @param {Node[]} input 
     * @param {Node[]} output 
     * @param {string} tag 
     * @param {number} pos 
     * @returns {Node[]}
     */
    function findAllTags(input, output, tag, pos) {
        if (pos >= input.length) {
            console.log(input[pos])
            return output
        }
        if (input[pos].children.length > 0) {
            findAllTags(Array.from(input[pos].children), output, tag, 0)
        } 
        if (isTag(input[pos], tag)) {
            output.push(input[pos])
        }
        return findAllTags(input, output, tag, ++pos);
    }

    //========================================================
    // Handlers
    //========================================================

    /**
     * @param {Node} elt 
     * @param {string} url 
     */
    async function handleGetFetchRequest(elt, url) {
        let response;
        try {
            response = await fetch(url, {
                method: "GET"
            })
            determineFetchResponse(elt, response);
        } catch (err) {
            emit(elt, events.HAIKU_ERROR, {
                msg: err
            });
        }
    }

    /**
     * @param {Node} elt 
     * @param {string} url 
     * @param {Body} body 
     */
    async function handlePostFetchRequest(elt, url, body) {
        let response;
        try {

        } catch (err) {
            emit(elt, events.HAIKU_ERROR, {
                msg: err
            })
        }
    }

    /**
     * @param {Node} elt 
     * @param {Response} response 
     */
    async function determineFetchResponse(elt, response) {
        type = response.headers.get("content-type").split("; ")[0]
        switch (type) {
            case "application/json":
                handleFetchResponse(elt, await response.json());
                break;
            default: 
                handleFetchResponse(elt, await response.text());
                break;
        }
    }

    /**
     * @param {elt} elt 
     * @param {Object | string} response 
     */
    function handleFetchResponse(elt, response) {
        maybeStoreData(elt, response);
        if (hasAttribute(elt, attributes.HK_TARGET)) {
            replace(findTargetElement(elt), response)
        }
    }

    /**
     * @param {Node} elt 
     */
    function handleGet(elt) {
        handleGetFetchRequest(elt, getRawAttribute(elt, attributes.HK_GET));
    }

    function handlePost(elt) {
        const children = Array.from(elt.children)
        console.log("Found:",findAllTagsWrapper(children, "input"))
    }

    /**
     * @param {Node} elt 
     */
    function handleData(elt) {
        const [key, prop] = getRawAttribute(elt, attributes.HK_DATA).split(".");
        const data = getData(key);
        if (prop !== undefined) {
            replace(elt, data?.[prop])
        }
    }

    /**
     * Executes and returns a function
     * @param {Node} elt 
     * @param {Function} fn 
     * @param {string[]} params 
     */
    function handleRender(elt, fn, params) {
        const render = Function(params, `return ${fn}`);
        const result = render(getData(params))
        replace(elt, result)
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
        const { msg } = e.detail;
        error(msg);
    })

    /**
     * Haiku fetch completed event
     */
    document.addEventListener(events.HAIKU_FETCH_COMPLETED, (e) => {
        const { key } = e.detail;
        loadAllDataAttributes(key)
        loadAllRenderAttributes(key)
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