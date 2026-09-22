document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ADMIN FISH DATA
    ===================================================== */

    function getAdminFish() {

        try {

            return JSON.parse(
                localStorage.getItem("adminFish")
            ) || [];

        } catch (error) {

            return [];

        }

    }


    function saveAdminFish(fish) {

        localStorage.setItem(
            "adminFish",
            JSON.stringify(fish)
        );

    }


    /* =====================================================
       FISH NAME HELPERS
    ===================================================== */

    function normalizeName(name) {

        return String(name || "")
            .trim()
            .toLowerCase();

    }


    function findAdminFish(fishName) {

        const adminFish = getAdminFish();

        return adminFish.find(function (fish) {

            return normalizeName(fish.name) ===
                normalizeName(fishName);

        });

    }


    /* =====================================================
       REMOVED FISH TRACKING
    ===================================================== */

    function getRemovedFish() {

        try {

            return JSON.parse(
                localStorage.getItem("adminRemovedFish")
            ) || [];

        } catch (error) {

            return [];

        }

    }


    function saveRemovedFish(names) {

        localStorage.setItem(
            "adminRemovedFish",
            JSON.stringify(names)
        );

    }


    function isFishRemoved(fishName) {

        const removedFish =
            getRemovedFish();

        return removedFish.some(function (name) {

            return normalizeName(name) ===
                normalizeName(fishName);

        });

    }


    function markFishAsRemoved(fishName) {

        if (!fishName) {
            return;
        }

        const removedFish =
            getRemovedFish();

        const alreadyRemoved =
            removedFish.some(function (name) {

                return normalizeName(name) ===
                    normalizeName(fishName);

            });


        if (!alreadyRemoved) {

            removedFish.push(
                fishName.trim()
            );

            saveRemovedFish(
                removedFish
            );

        }

    }


    function unmarkFishAsRemoved(fishName) {

        const removedFish =
            getRemovedFish();

        const remaining =
            removedFish.filter(function (name) {

                return normalizeName(name) !==
                    normalizeName(fishName);

            });


        saveRemovedFish(
            remaining
        );

    }


    /* =====================================================
       DEFAULT WEBSITE FISH
    ===================================================== */

    const defaultFishNames = [

        "Surmai",
        "Pomfret",
        "Bangda",
        "Sardine",
        "Sakla",
        "Bhilji",
        "Mandeli",
        "Pala",
        "Vakti",
        "Ragesh",

        "Tiger Prawns",
        "White Prawns",
        "Crab",
        "Lobster",
        "Squid",

        "Dry Surmai",
        "Dry Bangda",
        "Sukat",
        "Bombil",
        "Sode",
        "Kardi",
        "Dry Vakti",
        "Dry Mandeli",

        "Rohu",
        "Catla",
        "Tilapia",
        "Pangas"

    ];


    function isDefaultFish(fishName) {

        return defaultFishNames.some(
            function (name) {

                return normalizeName(name) ===
                    normalizeName(fishName);

            }
        );

    }


    /* =====================================================
       TRACK ADMIN DATA CHANGES
    ===================================================== */

    function trackAdminChanges() {

        const currentFish =
            getAdminFish();


        let previousFish = [];

        try {

            previousFish =
                JSON.parse(
                    localStorage.getItem(
                        "adminFishSnapshot"
                    )
                ) || [];

        } catch (error) {

            previousFish = [];

        }


        previousFish.forEach(function (oldFish) {

            if (!oldFish.name) {
                return;
            }


            const stillExists =
                currentFish.some(
                    function (newFish) {

                        return normalizeName(
                            newFish.name
                        ) ===
                        normalizeName(
                            oldFish.name
                        );

                    }
                );


            if (!stillExists) {

                markFishAsRemoved(
                    oldFish.name
                );

            }

        });


        currentFish.forEach(function (fish) {

            if (fish.name) {

                unmarkFishAsRemoved(
                    fish.name
                );

            }

        });


        localStorage.setItem(
            "adminFishSnapshot",
            JSON.stringify(currentFish)
        );

    }


    /* =====================================================
       CREATE NEW FISH CARD
    ===================================================== */

    function createFishCard(fish) {

        const card =
            document.createElement("div");


        card.className =
            "fish-card";


        /*
           IMPORTANT:
           If MySQL contains an uploaded image,
           use that image.

           Otherwise use the existing project image.
        */

        let imageSource =
            fish.image ||
            "images/hero-fish-market.jpg";


        /*
           If the fish already exists in the
           original HTML, preserve its original image.
        */

        const existingCards =
            document.querySelectorAll(".fish-card");


        existingCards.forEach(function (existingCard) {

            const heading =
                existingCard.querySelector("h3");


            const image =
                existingCard.querySelector("img");


            if (
                heading &&
                image &&
                normalizeName(
                    heading.textContent
                ) ===
                normalizeName(
                    fish.name
                )
            ) {

                imageSource =
                    image.src;

            }

        });


        const price =
            Number(fish.price) || 0;


        const quantity =
            Number(fish.quantity) || 0;


        const availability =
            String(
                fish.availability ||
                "Available"
            );


        const isOutOfStock =
            availability
                .trim()
                .toLowerCase() ===
            "out of stock";


        const availabilityClass =
            isOutOfStock
                ? "unavailable"
                : "available";


        card.dataset.adminManaged =
            "true";


        card.dataset.databaseFish =
            "true";


        card.innerHTML = `

            <img
                class="fish-image"
                src="${imageSource}"
                alt="${fish.name}"
            >

            <div class="fish-info">

                <h3>${fish.name}</h3>

                <p>
                    Fresh quality fish
                </p>

                <p>
                    Price: ₹${price} / kg
                </p>

                <p>
                    Quantity: ${quantity} kg
                </p>

                <span class="${availabilityClass}">
                    ${availability}
                </span>

                <button class="add-cart">
                    Add to Cart
                </button>

            </div>

        `;


        return card;

    }


    /* =====================================================
       UPDATE EXISTING FISH CARDS
    ===================================================== */

    function updateExistingFishCards() {

        const adminFish =
            getAdminFish();


        const fishCards =
            document.querySelectorAll(
                ".fish-card"
            );


        fishCards.forEach(function (card) {

            const nameElement =
                card.querySelector("h3");


            if (!nameElement) {
                return;
            }


            const fishName =
                nameElement.textContent.trim();


            const updatedFish =
                adminFish.find(
                    function (fish) {

                        return normalizeName(
                            fish.name
                        ) ===
                        normalizeName(
                            fishName
                        );

                    }
                );


            if (
                isFishRemoved(fishName)
            ) {

                card.remove();

                return;

            }


            if (updatedFish) {

                card.dataset.adminManaged =
                    "true";


                const paragraphs =
                    card.querySelectorAll(
                        "p"
                    );


                const statusElement =
                    card.querySelector(
                        "span"
                    );


                if (
                    paragraphs[1] &&
                    updatedFish.price !==
                    undefined
                ) {

                    paragraphs[1].textContent =
                        "Price: ₹" +
                        Number(
                            updatedFish.price
                        ) +
                        " / kg";

                }


                if (
                    paragraphs[2] &&
                    updatedFish.quantity !==
                    undefined
                ) {

                    paragraphs[2].textContent =
                        "Quantity: " +
                        Number(
                            updatedFish.quantity
                        ) +
                        " kg";

                }


                if (
                    statusElement &&
                    updatedFish.availability !==
                    undefined
                ) {

                    const availability =
                        String(
                            updatedFish.availability
                        );


                    statusElement.textContent =
                        availability;


                    statusElement.classList.remove(
                        "available",
                        "unavailable"
                    );


                    if (
                        availability
                            .trim()
                            .toLowerCase() ===
                        "out of stock"
                    ) {

                        statusElement.classList.add(
                            "unavailable"
                        );

                    } else {

                        statusElement.classList.add(
                            "available"
                        );

                    }

                }

            }

        });

    }


    /* =====================================================
       ADD NEW ADMIN FISH TO MAIN PAGE
    ===================================================== */

    function addNewFishCards() {

        const adminFish =
            getAdminFish();


        if (
            adminFish.length === 0
        ) {

            return;

        }


        const fishCards =
            document.querySelectorAll(
                ".fish-card"
            );


        const existingNames = [];


        fishCards.forEach(function (card) {

            const heading =
                card.querySelector("h3");


            if (heading) {

                existingNames.push(
                    normalizeName(
                        heading.textContent
                    )
                );

            }

        });


        const fishGrid =
            document.querySelector(
                ".fish-grid"
            );


        if (!fishGrid) {
            return;
        }


        adminFish.forEach(function (fish) {

            if (!fish.name) {
                return;
            }


            const name =
                normalizeName(
                    fish.name
                );


            if (
                existingNames.includes(name)
            ) {

                return;

            }


            if (
                isFishRemoved(
                    fish.name
                )
            ) {

                return;

            }


            const newCard =
                createFishCard(
                    fish
                );


            fishGrid.appendChild(
                newCard
            );


            existingNames.push(
                name
            );

        });

    }


    /* =====================================================
       REMOVE DELETED FISH CARDS
    ===================================================== */

    function removeDeletedFishCards() {

        const fishCards =
            document.querySelectorAll(
                ".fish-card"
            );


        fishCards.forEach(function (card) {

            const heading =
                card.querySelector("h3");


            if (!heading) {
                return;
            }


            const fishName =
                heading.textContent.trim();


            if (
                isFishRemoved(fishName)
            ) {

                card.remove();

            }

        });

    }


    /* =====================================================
       APPLY ALL ADMIN CHANGES
    ===================================================== */

    function applyAdminUpdates() {

        trackAdminChanges();

        updateExistingFishCards();

        addNewFishCards();

        removeDeletedFishCards();

        attachFishCardEvents();

    }


    /* =====================================================
       LOAD FISH FROM MYSQL DATABASE
    ===================================================== */

    async function loadDatabaseFish() {

        try {

            console.log(
                "⏳ Loading fish from MySQL..."
            );


            const response =
                await fetch("/api/fish");


            if (!response.ok) {

                throw new Error(
                    "Failed to load fish from server."
                );

            }


            const data =
                await response.json();
checkForNewFishNotification(
    data.fish
);

            if (
                !data.success ||
                !Array.isArray(data.fish)
            ) {

                throw new Error(
                    "Invalid fish data received from server."
                );

            }


            console.log(
                "✅ Fish loaded from MySQL:",
                data.fish
            );


            const fishGrid =
                document.querySelector(
                    ".fish-grid"
                );


            if (!fishGrid) {

                console.error(
                    "❌ .fish-grid not found."
                );

                return;

            }


            data.fish.forEach(function (fish) {

                if (!fish.name) {
                    return;
                }


                /*
                   Check whether this fish already
                   exists in the original homepage.
                */

                const existingCards =
                    document.querySelectorAll(
                        ".fish-card"
                    );


                let existingCard = null;


                existingCards.forEach(
                    function (card) {

                        const heading =
                            card.querySelector(
                                "h3"
                            );


                        if (
                            heading &&
                            normalizeName(
                                heading.textContent
                            ) ===
                            normalizeName(
                                fish.name
                            )
                        ) {

                            existingCard =
                                card;

                        }

                    }
                );


                /*
                   If the fish already exists on the
                   website, update its information.
                */

                if (existingCard) {

                    existingCard.dataset.databaseFish =
                        "true";


                    const paragraphs =
                        existingCard.querySelectorAll(
                            "p"
                        );


                    const status =
                        existingCard.querySelector(
                            "span"
                        );


                    if (
                        paragraphs[1]
                    ) {

                        paragraphs[1].textContent =
                            "Price: ₹" +
                            Number(
                                fish.price
                            ) +
                            " / kg";

                    }


                    if (
                        paragraphs[2]
                    ) {

                        paragraphs[2].textContent =
                            "Quantity: " +
                            Number(
                                fish.quantity
                            ) +
                            " kg";

                    }


                    if (status) {

                        const availability =
                            String(
                                fish.availability ||
                                "Available"
                            );


                        status.textContent =
                            availability;


                        status.classList.remove(
                            "available",
                            "unavailable"
                        );


                        if (
                            availability
                                .trim()
                                .toLowerCase() ===
                            "out of stock"
                        ) {

                            status.classList.add(
                                "unavailable"
                            );

                        } else {

                            status.classList.add(
                                "available"
                            );

                        }

                    }


                    /*
                       Do NOT replace an existing
                       website image.

                       This preserves your original
                       fish image URLs.
                    */

                    return;

                }


                /*
                   If it is a new fish from MySQL,
                   create a new card.

                   The uploaded image from MySQL
                   will be displayed.
                */

                const newCard =
                    createFishCard(
                        fish
                    );


                fishGrid.appendChild(
                    newCard
                );

            });


            /*
               Attach popup and cart events to
               the newly created database cards.
            */

            attachFishCardEvents();


            console.log(
                "✅ MySQL fish displayed on homepage."
            );

        } catch (error) {

            console.error(
                "❌ MySQL fish loading error:",
                error
            );

        }

    }


    /* =====================================================
       FISH POPUP + CART EVENTS
    ===================================================== */

    function attachFishCardEvents() {

        const fishCards =
            document.querySelectorAll(
                ".fish-card"
            );


        fishCards.forEach(function (card) {

            if (
                card.dataset.eventsAttached ===
                "true"
            ) {

                return;

            }


            card.dataset.eventsAttached =
                "true";


            /* =========================
               FISH POPUP
            ========================= */

            card.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.classList.contains(
                            "add-cart"
                        )
                    ) {

                        return;

                    }


                    const fishName =
                        card.querySelector(
                            "h3"
                        );


                    if (!fishName) {
                        return;
                    }


                    const paragraphs =
                        card.querySelectorAll(
                            "p"
                        );


                    const status =
                        card.querySelector(
                            "span"
                        );


                    const fishImage =
                        card.querySelector(
                            "img"
                        );


                    let details = "";


                    paragraphs.forEach(
                        function (p) {

                            details +=
                                `<p>${p.textContent}</p>`;

                        }
                    );


                    const popup =
                        document.createElement(
                            "div"
                        );


                    popup.className =
                        "fish-popup";


                    popup.innerHTML = `

                        <div class="fish-popup-content">

                            <button class="close-popup">
                                &times;
                            </button>

                            <img
                                class="popup-fish-image"
                                src="${
                                    fishImage
                                        ? fishImage.src
                                        : ""
                                }"
                                alt="${fishName.textContent}"
                            >

                            <h2>
                                🐟
                                ${fishName.textContent}
                            </h2>

                            <div class="popup-details">
                                ${details}
                            </div>

                            <p class="popup-status ${
                                status
                                    ? status.className
                                    : ""
                            }">
                                ${
                                    status
                                        ? status.textContent
                                        : ""
                                }
                            </p>

                        </div>

                    `;


                    document.body.appendChild(
                        popup
                    );


                    const closeButton =
                        popup.querySelector(
                            ".close-popup"
                        );


                    if (closeButton) {

                        closeButton.addEventListener(
                            "click",
                            function () {

                                popup.remove();

                            }
                        );

                    }


                    popup.addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                popup
                            ) {

                                popup.remove();

                            }

                        }
                    );

                }
            );


            /* =========================
               ADD TO CART
            ========================= */

            const button =
                card.querySelector(
                    ".add-cart"
                );


            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const fishName =
                        card
                            .querySelector("h3")
                            .textContent
                            .trim();


                    const paragraphs =
                        card.querySelectorAll(
                            "p"
                        );


                    const priceText =
                        paragraphs[1]
                            ? paragraphs[1]
                                .textContent
                            : "";


                    const priceMatch =
                        priceText.match(
                            /₹\s*([\d,]+)/
                        );


                    const price =
                        priceMatch
                            ? Number(
                                priceMatch[1]
                                    .replace(
                                        /,/g,
                                        ""
                                    )
                              )
                            : 0;


                    const existingFish =
                        cart.find(
                            function (item) {

                                return normalizeName(
                                    item.name
                                ) ===
                                normalizeName(
                                    fishName
                                );

                            }
                        );


                    if (existingFish) {

                        existingFish.quantity++;

                    } else {

                        cart.push({

                            name:
                                fishName,

                            price:
                                price,

                            quantity:
                                1

                        });

                    }


                    button.textContent =
                        "✓ Added";


                    setTimeout(
                        function () {

                            button.textContent =
                                "Add to Cart";

                        },
                        1000
                    );


                    updateCart();

                }
            );

        });

    }


    /* =====================================================
       CART
    ===================================================== */

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "fishCart"
                )
            ) || [];

    } catch (error) {

        cart = [];

    }


    function updateCart() {

        let cartBox =
            document.querySelector(
                ".cart-box"
            );


        if (!cartBox) {

            cartBox =
                document.createElement(
                    "div"
                );


            cartBox.className =
                "cart-box";


            cartBox.innerHTML = `

                <div class="cart-header">

                    <h2>🛒 My Cart</h2>

                    <button class="close-cart">
                        &times;
                    </button>

                </div>

                <div class="cart-items"></div>

                <div class="cart-total"></div>

                <button class="checkout-button">
                    Proceed to Checkout
                </button>

            `;


            document.body.appendChild(
                cartBox
            );


            cartBox
                .querySelector(
                    ".close-cart"
                )
                .addEventListener(
                    "click",
                    function () {

                        cartBox.classList.remove(
                            "show"
                        );

                    }
                );


            cartBox
                .querySelector(
                    ".checkout-button"
                )
                .addEventListener(
                    "click",
                    function () {

                        if (
                            cart.length === 0
                        ) {

                            alert(
                                "Your cart is empty."
                            );

                            return;

                        }


                        localStorage.setItem(
                            "fishCart",
                            JSON.stringify(
                                cart
                            )
                        );


                        window.location.href =
                            "checkout.html";

                    }
                );

        }


        const cartItems =
            cartBox.querySelector(
                ".cart-items"
            );


        const cartTotal =
            cartBox.querySelector(
                ".cart-total"
            );


        if (
            cart.length === 0
        ) {

            cartItems.innerHTML =
                "<p>Your cart is empty.</p>";


            cartTotal.textContent =
                "Total: ₹0";


            cartBox.classList.add(
                "show"
            );


            return;

        }


        let total = 0;


        cartItems.innerHTML = "";


        cart.forEach(
            function (item, index) {

                const itemTotal =
                    Number(item.price) *
                    Number(item.quantity);


                total += itemTotal;


                const itemElement =
                    document.createElement(
                        "div"
                    );


                itemElement.className =
                    "cart-item";


                itemElement.innerHTML = `

                    <div>

                        <strong>
                            ${item.name}
                        </strong>

                        <p>
                            ₹${item.price}
                            ×
                            ${item.quantity}
                        </p>

                    </div>

                    <button
                        class="remove-item"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                `;


                cartItems.appendChild(
                    itemElement
                );

            }
        );


        cartTotal.textContent =
            `Total: ₹${total}`;


        const removeButtons =
            cartItems.querySelectorAll(
                ".remove-item"
            );


        removeButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        localStorage.setItem(
                            "fishCart",
                            JSON.stringify(
                                cart
                            )
                        );


                        updateCart();

                    }
                );

            }
        );


        cartBox.classList.add(
            "show"
        );

    }
        // YOUR EXISTING CODE ABOVE


    /* =====================================================
       CUSTOMER NEW FISH NOTIFICATION
    ===================================================== */

    function checkForNewFishNotification(fishList) {

        if (
            !Array.isArray(fishList) ||
            fishList.length === 0
        ) {
            return;
        }

        const storageKey =
            "smartFishLastNotificationCheck";

        const lastCheck =
            localStorage.getItem(storageKey);

        if (!lastCheck) {

            const newestFish =
                fishList.reduce(
                    function (latest, fish) {

                        if (!fish.created_at) {
                            return latest;
                        }

                        if (!latest) {
                            return fish;
                        }

                        return new Date(
                            fish.created_at
                        ) > new Date(
                            latest.created_at
                        )
                            ? fish
                            : latest;

                    },
                    null
                );

            if (
                newestFish &&
                newestFish.created_at
            ) {

                localStorage.setItem(
                    storageKey,
                    newestFish.created_at
                );

            }

            return;
        }

        const newFish =
            fishList.filter(
                function (fish) {

                    if (!fish.created_at) {
                        return false;
                    }

                    return new Date(
                        fish.created_at
                    ) > new Date(
                        lastCheck
                    );

                }
            );

        if (newFish.length === 0) {
            return;
        }

        let message =
            "🔔 NEW FISH AVAILABLE!\n\n";

        newFish.forEach(
            function (fish) {

                message +=
                    "🐟 " +
                    fish.name +
                    "\n" +
                    "💰 ₹" +
                    Number(
                        fish.price || 0
                    ) +
                    " / kg\n\n";

            }
        );

        alert(message);

        const newestFish =
            newFish.reduce(
                function (latest, fish) {

                    if (!latest) {
                        return fish;
                    }

                    return new Date(
                        fish.created_at
                    ) > new Date(
                        latest.created_at
                    )
                        ? fish
                        : latest;

                },
                null
            );

        if (
            newestFish &&
            newestFish.created_at
        ) {

            localStorage.setItem(
                storageKey,
                newestFish.created_at
            );

        }

    }


    /* =====================================================
       FIRST LOAD
    ===================================================== */

    applyAdminUpdates();


    /*
       NEW:
       Load products from MySQL.
    */

    loadDatabaseFish();


    /* =====================================================
       FIRST LOAD
    ===================================================== */

    applyAdminUpdates();


    /*
       NEW:
       Load products from MySQL.
    */

    loadDatabaseFish();


    /* =====================================================
       ADMIN DATA CHANGED IN ANOTHER TAB
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "adminFish"
            ) {

                window.location.reload();

            }

        }
    );


    /* =====================================================
       CART STORAGE CHANGES
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "fishCart"
            ) {

                try {

                    cart =
                        JSON.parse(
                            event.newValue
                        ) || [];

                } catch (error) {

                    cart = [];

                }


                updateCart();

            }

        }
    );

});