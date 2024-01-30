const pepisShop = {
    elements: {
        cartTable: qs('.cart-table'),
        carts: qsa('[data-micro="cartItem"]'),
        cartItemInput: qsa('[data-testid="cartAmount"]'),
        recapFullPrice: qs('[data-testid="recapFullPrice"]'),
        deliveryTime: qs('.delivery-time'),
    },


    addToCart: {
        headers: {
            'X-Shoptet-XHR': 'Shoptet_Coo7ai',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        messages: {
            success: /Množství bylo úspěšně změněno\./,
            notEnoughStock1: /Tento produkt má omezený počet kusů, které je možno zakoupit/,
            notEnoughStock2: /Maximálně lze objednat \d+ kusů produktů\.<br\/>Množství nebylo změněno\./,
        },
        url: 'https://www.pepis.shop/action/Cart/setCartItemAmount/',
    }
}

documentReady(init)

function init() {
    if (qs('[data-byte-update-cart]')) {
        alert('Sorry babe, already injected, refresh the page and try again')
        return
    }

    if (qs('.ordering-process')) {
        addProxyInputs()
        addCartItemButtons()
        addCartItemButtonsMaths()
        addUpdateButton()
        addSetAll()
        fixTabIndexes()
    } else {
        initLoadAllPages()
        initShoppingPopupWatcher()
    }

}

function initShoppingPopupWatcher() {
    if (!document.querySelector('.category-content-wrapper')) {
        alert('Cannot init pop up killer on this page')
    }

    // Poll for existence of buttonCardSelector
    setInterval(() => {
        const button = document.querySelector('[data-testid="buttonPopupCart"]')
        if (button) {
            const parent = button.closest('#colorbox')
            const closeModalButton = parent.querySelector('#cboxClose')
            closeModalButton.click()
        }
    }, 50);
}

async function initLoadAllPages() {
    const loadAllButtonSelector = '[data-testid="buttonMoreItems"]'
    const lastPageSelector = '[data-testid="linkLastPage"]'
    const totalNumberOfPages = document.querySelector(lastPageSelector)?.textContent - 1 || 0
    for (let i = 0; i < totalNumberOfPages; i++) {
        await sleep(650)
        document.querySelector(loadAllButtonSelector).click()
    }
}

function fixTabIndexes() {
    pepisShop.elements.carts.forEach(cart => {
        cart.querySelector('[data-testid="cartProductName"] .main-link').tabIndex = -1
        cart.querySelector('.cart-p-image a').tabIndex = -1
        cart.querySelector('[data-testid="buttonDeleteItem"]').tabIndex = -1
        cart.querySelector('[data-byte-set-quantity]').tabIndex = -1
        cart.querySelector('[data-byte-divide-by]').tabIndex = -1
        cart.querySelector('[data-byte-multiply-by]').tabIndex = -1
    })
}

function addProxyInputs() {
    // Loop through all the inputs and create a custom input next to the existing one
    pepisShop.elements.cartItemInput.forEach(input => {
        // Create a new input
        const newInput = document.createElement('input')
        newInput.type = 'number'
        newInput.value = input.value
        newInput.min = 1
        newInput.style.width = '50px'
        newInput.style.marginRight = '-23px'
        newInput.dataset.byteInputProxy = true
        newInput.tabIndex = 0

        // Add the new input next to the existing one
        input.parentNode.insertBefore(newInput, input.nextSibling)

        // Hide the existing input
        input.style.display = 'none'

        // Hide the increase and decrease buttons
        input.parentNode.querySelector('.increase').style.display = 'none'
        input.parentNode.querySelector('.decrease').style.display = 'none'

        // Calculate the new price including the discount and update the price for the item
        newInput.addEventListener('change', async (e) => {
            newInput.dataset.byteInputDirty = true
        })

        newInput.addEventListener('keyup', async (e) => {
            // Update the existing input
            input.value = e.target.value

            updateRowPrice([input.closest('[data-micro="cartItem"]')])

        })
    })
}

// Add button to set quanity to 12, 24, 48
function addCartItemButtons() {
    pepisShop.elements.carts.forEach(cart => {
        
        const div = document.createElement('div')
        div.style.margin = '10px'
        div.style.display = "flex";

        [12, 24, 30, 48, 120].forEach(value => {
            const button = document.createElement('button')
            button.innerText = value
            button.style.marginRight = '10px'
            button.dataset.byteSetQuantity = value
            div.appendChild(button)
        })
        

        // const button12 = document.createElement('button')
        // button12.innerText = '12'
        // button12.style.marginRight = '10px'
        // button12.dataset.byteSetQuantity = 12
        // div.appendChild(button12)
        
        // const button24 = document.createElement('button')
        // button24.innerText = '24'
        // button24.style.marginRight = '10px'
        // button24.dataset.byteSetQuantity = 24
        // div.appendChild(button24)

        // const button30 = document.createElement('button')
        // button12.innerText = '30'
        // button12.style.marginRight = '10px'
        // button12.dataset.byteSetQuantity = 30
        // div.appendChild(button30)

        // const button48 = document.createElement('button')
        // button48.innerText = '48'
        // button48.style.marginRight = '10px'
        // button48.dataset.byteSetQuantity = 48
        // div.appendChild(button48)

        // const button120 = document.createElement('button')
        // button48.innerText = '120'
        // button48.style.marginRight = '10px'
        // button48.dataset.byteSetQuantity = 120
        // div.appendChild(button120)

        cart.querySelector('[data-testid="cartProductName"]').insertAdjacentHTML('beforeend', div.outerHTML)
        
    })

    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-byte-set-quantity]')) {
            const parent = event.target.closest('[data-micro="cartItem"]')
            const inputProxy = parent.querySelector('[data-byte-input-proxy]')

            // Update old input
            const inputOld = parent.querySelector('[data-testid="cartAmount"]')
            const quantity = event.target.dataset.byteSetQuantity
            inputProxy.value = quantity
            inputOld.value = quantity
            inputProxy.dataset.byteInputDirty = true
            updateRowPrice([parent])
        }
    })

}

// Add buttons to divide by 2 or times by 2
function addCartItemButtonsMaths () {
    pepisShop.elements.carts.forEach(cart => {
        const div = document.createElement('div')
        div.style.margin = '10px'
        div.style.display = 'flex'

        const buttonDivide = document.createElement('button')
        buttonDivide.innerText = '÷ 2'
        buttonDivide.style.marginRight = '10px'
        buttonDivide.dataset.byteDivideBy = 2
        div.appendChild(buttonDivide)

        const buttonMultiply = document.createElement('button')
        buttonMultiply.innerText = '× 2'
        buttonMultiply.style.marginRight = '10px'
        buttonMultiply.dataset.byteMultiplyBy = 2
        div.appendChild(buttonMultiply)

        cart.querySelector('[data-testid="cartProductName"]').insertAdjacentHTML('beforeend', div.outerHTML)
    })

    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-byte-divide-by]')) {
            const parent = event.target.closest('[data-micro="cartItem"]')
            const inputProxy = parent.querySelector('[data-byte-input-proxy]')

            // Update old input
            const inputOld = parent.querySelector('[data-testid="cartAmount"]')
            const quantity = inputProxy.value / event.target.dataset.byteDivideBy
            inputProxy.value = quantity
            inputOld.value = quantity
            inputProxy.dataset.byteInputDirty = true
            updateRowPrice([parent])
        }

        if (event.target.closest('[data-byte-multiply-by]')) {
            const parent = event.target.closest('[data-micro="cartItem"]')
            const inputProxy = parent.querySelector('[data-byte-input-proxy]')

            // Update old input
            const inputOld = parent.querySelector('[data-testid="cartAmount"]')
            const quantity = inputProxy.value * event.target.dataset.byteMultiplyBy
            inputProxy.value = quantity
            inputOld.value = quantity
            inputProxy.dataset.byteInputDirty = true
            updateRowPrice([parent])
        }
    })
}


function updateRowPrice(carts) {
    carts.forEach(cart => {
        const quantity = cart.querySelector('[data-testid="cartAmount"]').value
        const cartItemPrice = cart.querySelector('[data-testid="cartItemPrice"]')
        const cartItemDiscountPercentage = cart.querySelector('.p-discount [data-testid="cartItemDiscount"]')
        const cartPrice = cart.querySelector('[data-testid="cartPrice"]')

        const price = convertStringToNumber(cartItemPrice.innerText)
        const discountPercentage = cartItemDiscountPercentage?.innerText?.replace?.(/\D/g, '') || 0
        const discount = price * ((discountPercentage / 100).toFixed(2))
        const newPrice = Number(price - discount).toFixed(2)

        cartPrice.innerText = convertNumberToString(newPrice * quantity)
    })
    updateTotal()

}


function updateTotal() {
    let sum = 0
    qsa('[data-testid="cartPrice"]').forEach(price => {
        sum += convertStringToNumber(price.innerText)
    })
    pepisShop.elements.recapFullPrice.innerText = convertNumberToString(sum)
}

function addSetAll() {
    const div = document.createElement('div')
    div.style.margin = '10px'


    div.id = 'setAll'

    const span = document.createElement('span')
    span.innerText = 'Set all items to: '
    div.appendChild(span)


    const input = document.createElement('input')
    input.type = 'number'
    input.value = 24
    input.width = '150px'
    input.height = '50px'
    input.dataset.byteSetAllInput = true

    const button = document.createElement('button')
    button.innerText = 'Set all'
    button.style.marginLeft = '10px'
    button.dataset.byteSetAllButton = true

    div.appendChild(input)

    div.appendChild(button)

    const span2 = document.createElement('span')
    span2.style.right = '0'
    span2.style.position = 'absolute'

    // const updateAll = document.createElement('button')
    // updateAll.innerText = 'Update all'
    // updateAll.dataset.byteUpdateCart = true

    // span2.appendChild(updateAll)


    const updateAllFast = document.createElement('button')
    updateAllFast.innerText = 'Update all fast'
    updateAllFast.style.marginLeft = '10px'
    updateAllFast.dataset.byteUpdateCartFast = true

    span2.appendChild(updateAllFast)

    div.appendChild(span2)

    pepisShop.elements.cartTable.insertAdjacentHTML('beforebegin', div.outerHTML)




    qs('[data-byte-set-all-button]').addEventListener('click', (e) => {
        const value = qs('[data-byte-set-all-input]').value
        qsa('[data-byte-input-proxy]').forEach(input => {
            input.value = value
            input.dataset.byteInputDirty = true
            // Find sibling input and update value
            input.parentNode.querySelector('[data-testid="cartAmount"]').value = value
        })
        updateRowPrice(pepisShop.elements.carts)
    })
}



// Find an element with ".delivery-time" and inserts a div containing a button 
function addUpdateButton() {
    pepisShop.elements.deliveryTime.insertAdjacentHTML('beforebegin', '<div id="updateAllButton" style="margin-bottom: 10px;"><button  data-byte-update-cart>Update All</button></div>')
    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-byte-update-cart]')) {
            updateCartAll()
        }

        if (event.target.closest('[data-byte-update-cart-fast]')) {
            updateCartAll(true)
        }
    })
}

async function updateCartAll(runInParallel = false) {
    const log = {
        success: [],
        error: []
    };

    qs('[data-byte-update-cart]').innerText = 'Updating...';
    qs('[data-byte-update-cart]').disabled = true;

    // Get all proxy inputs
    const inputs = qsa('[data-byte-input-dirty]');

    const updateOperations = [];

    for (const input of inputs) {
        delete input.dataset.byteInputDirty;

        const updateOperation = async () => {
            const parentTableRow = input.closest('tr');
            const parentForm = input.closest('form');

            const itemName = parentTableRow.querySelector('[data-testid="cartProductName"]').innerText;
            const itemId = parentForm.querySelector('[name="itemId"]').value;
            const priceId = parentForm.querySelector('[name="priceId"]').value;
            const amount = input.value;

            const response = await updateCartItem(itemId, priceId, amount);

            // If we successfully updated the cart set the border to green
            if (response.code === 200 && response.message.match(pepisShop.addToCart.messages.success)) {
                log.success.push({ itemName, itemId, priceId, amount })
                parentTableRow.style.borderLeft = '3px solid green'
                parentTableRow.style.borderRight = '3px solid green'
                console.log({ itemName, itemId, priceId, amount })
            } else {
                parentTableRow.style.borderLeft = '3px solid red'
                parentTableRow.style.borderRight = '3px solid red'

                // We got an error, check if it's a not enough stock error
                if (response.message.match(pepisShop.addToCart.messages.notEnoughStock) || response.message.match(pepisShop.addToCart.messages.notEnoughStock2)) {
                    // Extract the limit from the error message by removing everything except numbers
                    const maxItems = response.message.replace(/\D/g, '')
                    // Update the input value to the limit
                    input.value = maxItems

                    // Try to update the cart again with the new value
                    const response2 = await updateCartItem(itemId, priceId, maxItems)
                    console.log({ itemName, itemId, priceId, amount, error: { response, response2 } })
                    log.error.push({ itemName, itemId, priceId, amount, error: { response, response2 } })
                } else {
                    log.error.push({ itemName, itemId, priceId, amount, error: response })
                    console.log({ itemName, itemId, priceId, amount, error: response })
                }
            }
        };

        if (runInParallel) {
            updateOperations.push(updateOperation());
        } else {
            await updateOperation();
        }
    }

    if (runInParallel) {
        await Promise.all(updateOperations);
    }

    console.log({ log });

    playBase64String();

    qs('[data-byte-update-cart]').innerText = 'Update cart';
    qs('[data-byte-update-cart]').disabled = false;
}


function updateCartItem(itemId, priceId, amount) {
    const formData = Object.entries({ itemId, priceId, amount }).map(([key, value]) => `${key}=${value}`).join('&')
    return post(pepisShop.addToCart.url, pepisShop.addToCart.headers, formData)
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

function post(url, headers, data) {
    return fetch(url, {
        method: 'POST',
        body: data,
        headers: headers
    }).then(res => res.json())
}

function convertStringToNumber(str) {
    // Remove the euro symbol and replace comma with a dot
    const converted = str.replace("€", "").replace(",", ".");

    // Convert the string to a number
    return parseFloat(converted);
}

// Replace . with , and ensure there are always 2 decimal places
function convertNumberToString(number) {
    // First format the number with two decimal places
    const formattedNumber = number.toFixed(2);

    // Then replace the dot with a comma
    const str = formattedNumber.replace('.', ',');

    return `€${str}`;
}


function playBase64String() {
    const base64String = 'SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQxAFRTU0UAAAAPAAADTGF2ZjU4LjE5LjEwMgAAAAAAAAAAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAABJAAB40AAGCg0NERQYGBsfIiImKSksMDMzNzo+PkFFRUhMT09TVllZXWBkZGdra25ydXV5fH9/g4aGio2RkZSYm5ufoqKmqayssLO3t7q+wcHFyMjMz9PT1tnd3eDk5Ofr7u7y9fn5/P8AAAAATGF2YzU4LjM0AAAAAAAAAAAAAAAAJAZAAAAAAAAAeNChhhjaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uSZECP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkQI/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uSZECP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQAABCAP+pQmFwFmTKF/79uuaDjidRsb/4ZmSz9HFSOZNmwHBA8gGYlNvJwnDADOmLUDQ+NkDGoPzzRk4GFIAoGHwKQGBACIGCkBf201AYJAMgYSwSgYAgEAYHQMAYUglfmhcWmbwRAdAKBAGfhtYGD0L4GF8A/9NN6GBg4BIA8AgP/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQUAAAgAAA0goAABGBwBgvQMCIDwCgHju/5voWNFwyI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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkQI/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uSZECP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkQI/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uSZECP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='
    // Decode the base64 string to binary data
    const binaryData = window.atob(base64String);

    // Convert the binary data to a Blob
    const byteNumbers = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        byteNumbers[i] = binaryData.charCodeAt(i);
    }
    const blobData = new Blob([byteNumbers], { type: 'audio/mpeg' });

    // Create a Blob URL
    const blobUrl = URL.createObjectURL(blobData);

    // Create an audio element and set its source to the Blob URL
    const audio = new Audio(blobUrl);
    // hide audio
    audio.style.display = 'none'
    audio.controls = true;
    document.body.appendChild(audio);

    // Play the audio
    audio.play();
}
