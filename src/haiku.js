(function(){
    const actions = {
        'hk-hook': handleHook,
        'hk-if': handleIf,
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

    function getDefaultTrigger(el) {
        if (hasAttribute(el, "if")) {
            return 'load';
        }
        return 'click';
    }

    function loadImmediately(el, actionFn) {
        actionFn(el)
    }

    function handleHook(el) {
        const hook = getRawAttribute(el, "hook");
        const result = Function(`return ${hook}`)();
        el.innerHTML = result;
    }

    function handleIf(el) {
        const truthy = getRawAttribute(el, "if");
        const eval = Function(`return ${truthy}`)();
        if (eval) {
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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", haiku);   
    } else {
        haiku();
    }
}());