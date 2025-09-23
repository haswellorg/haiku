(function(){
    const triggers = "load" | "click"

    function initMatcha() {
        // window.addEventListener("load", () => {
        //     document.querySelectorAll('[_hook]').forEach((el) => {
        //         const code = el.getAttribute('_hook');
        //         const computed = Function(`return ${code}`)();
        //         el.innerHTML = computed;
        //     })
        // })
        initAllTriggers();
    }

    function initAllTriggers() {
        document.querySelectorAll('[_trigger]').forEach((el) => {
            const triggerType = el.getAttribute('_trigger');
            switch(triggerType) {
                case "load":
                    initLoadTrigger(el);
                    break;
                case "click":
                    initClickTrigger(el);
                    break;
                default:
                    break;
            }
        });
    }

    function initLoadTrigger(el) {
        window.addEventListener("load", () => {
            const code = el.getAttribute('_hook');
            const computed = Function(`return ${code}`)();
            el.innerHTML = computed;
        })
    }

    function initClickTrigger(el) {
        el.addEventListener("click", () => {
            const code = el.getAttribute('_hook');
            const computed = Function(`return ${code}`)();
            el.innerHTML = computed;
        })
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", initMatcha);
    else
        initMatcha();
})();