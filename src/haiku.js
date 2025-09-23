(function(){
    const actions = {
        'hk-hook': handleHook
    }

    function getRawAttribute(el, name) {
        return el.getAttribute(`hk-${name}`);
    }

    function haiku() {
        const selectors = Object.keys(actions).map(attr => `[${attr}]`).join(',');
        document.querySelectorAll(selectors).forEach(el => {
            const trigger = getRawAttribute(el, "trigger") || getDefaultTrigger(el)
            const actionAttr = Object.keys(actions).find(attr => el.hasAttribute(attr));
            const actionFn = actions[actionAttr];
            el.addEventListener(trigger, (e) => {
                actionFn(el)
            })
        })
    }

    function getDefaultTrigger(el) {
        return 'click';
    }

    function handleHook(el) {
        const hook = getRawAttribute(el, "hook");
        const result = Function(`return ${hook}`)();
        el.innerHTML = result;
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", haiku);
    else
        haiku();
}());