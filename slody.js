
(function () {
    documentReady(init)

    function init() {
        addQuantityButtons();
    }

    function addQuantityButtons() {
        const element = qs('.productlist.table.zebra');

        if (!element) {
            alert('Product table not found');
            return;
        }

        // Loop over tbody>tr elements and add a div in the td.name element
        qsa('tbody>tr', element).forEach(row => {
            const nameElement = qs('.name', row);
            const div = document.createElement('div')
            div.style.margin = '10px'
            div.style.display = "flex";

            [1, 12, 24, 30, 48, 120].forEach(value => {
                const button = document.createElement('button')
                button.innerText = value
                button.style.marginRight = '10px'
                button.tabIndex = -1
                button.dataset.byteSetQuantity = value
                div.appendChild(button)
            })

            nameElement.insertAdjacentHTML('beforeend', div.outerHTML)
        });

        // Add event listener to the buttons
        qsa('button[data-byte-set-quantity]').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault()
                event.stopPropagation()
                const row = event.target.closest('tr')
                const input = qsa('input', row)
                const value = event.target.dataset.byteSetQuantity
                // Loop over the inputs and set the value
                input.forEach(input => {
                    console.log('Setting value', value);

                    input.value = value
                    // const changeEvent = new Event('change', { bubbles: true })
                    // input.dispatchEvent(changeEvent)
                })

            })
        })
    }



    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    function documentReady(callbackFunc) {
        if (!document.addEventListener) {
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState === 'complete') {
                    callbackFunc();
                }
            });
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callbackFunc);
        } else {
            callbackFunc();
        }
    };


    /**
     * Alias for document.querySelector
     * @param {string} selector query selector string
     * @param {Element} [scope] element to query against, defaults to document
     * @returns {Element}
     */
    function qs(selector, scope = window.document) {
        return scope.querySelector(selector);
    }

    /**
     * Alias for document.querySelectorAll
     * @param {string} selector query selector string
     * @param {Element} [scope] element to query against, defaults to document
     * @returns {array} array of Elements
     */
    function qsa(selector, scope = window.document) {
        return [...scope.querySelectorAll(selector)];
    }

})();