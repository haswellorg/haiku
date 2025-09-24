(function(){
    const state = {};
    const actions = {
        // 'hk-hook': handleHook,
        // 'hk-if': handleIf,
        'hk-get': handleGet,
        'hk-data': handleData,
    }

    function getRawAttribute(el, name) {
        return el.getAttribute(`hk-${name}`);
    }

    function hasAttribute(el, name) {
        return el.hasAttribute(`hk-${name}`);
    }

    function findNearest(el, attribute) {
        let nearestEl = null;
        let sibling = el.nextElementSibling;
        while (sibling) {
            if (hasAttribute(sibling, attribute)) {
                break
            }
            sibling = sibling.nextElementSibling
        }
        nearestEl = sibling;
        return nearestEl;
    }

    function findTarget(el) {
        const targetSelector = getRawAttribute(el, "target");
        return document.querySelector(targetSelector);
    }

    function setState(key, value) {
        state[key] = value;
    }

    function getState(key) {
        return state[key];
    }

    function haiku() {
        const allElements = Object.keys(actions).map(attr => `[${attr}]`).join(',');
        document.querySelectorAll(allElements).forEach(el => {
            const trigger = getRawAttribute(el, "trigger") || getDefaultTrigger(el)
            const actionAttr = Object.keys(actions).find(attr => el.hasAttribute(attr));
            const actionFn = actions[actionAttr];
            if (trigger == "load") {
                loadImmediately(el, actionFn);
                return;
            }
            el.addEventListener(trigger, (e) => {
                actionFn(el)
            })
        })
    }

    function loadImmediately(el, actionFn) {
        actionFn(el)
    }

    function executeFunction(fn) {
        return Function(`return ${fn}`)()
    }

    function handleHook(el) {
        const hook = getRawAttribute(el, "hook");
        const result = executeFunction(hook);
        el.innerHTML = result;
    }

    function handleIf(el) {
        const statement = getRawAttribute(el, "if");
        const truthy = executeFunction(statement);
        if (truthy) {
            hideElse(el)
            return
        }
        el.remove();
        return;
    }

    function hideElse(el) {
        const nearestElseEl = findNearest(el, 'else')
        nearestElseEl.remove();
    }

    async function handleGet(el) {
        try {
            const url = getRawAttribute(el, "get")
            const response = await fetch(url, { 
                method: "GET" 
            })
            const data = await response.json();
            if (hasAttribute(el, "key")) {
                const key = getRawAttribute(el, "key");
                setState(key, data);
                document.querySelectorAll(`[hk-data^="${key}."]`).forEach(handleData)
            }
        } catch(err) {
            console.error("Request failed: ", err)
        }
    }

    function handleData(el) {
        const rawData = getRawAttribute(el, "data").split(".");
        const key = rawData[0];
        const stateValue = getState(key);
        el.innerHTML = stateValue[rawData[1]]
    }

    function getDefaultTrigger(el) {
        if (hasAttribute(el, "if")) {
            return 'load';
        }
        return 'click';
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", haiku);   
    } else {
        haiku();
    }
}());