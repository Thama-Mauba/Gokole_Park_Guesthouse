/* =====================================================
   GOKOLE PARK & GUESTHOUSE - SCRIPT.JS
   One file, used by every page. Each feature checks that
   its elements exist, so it is safe to load everywhere.
   1. Mobile navigation menu
   2. Toast notification helper
   3. Scroll reveal
   4. Gallery lightbox
   5. Category filter buttons
   6. Live search
   7. Remember the chosen service (dynamic content)
   8. Quick booking bar (home page) and pre-filled enquiry
   9. Form validation and AJAX submission
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initScrollReveal();
    initLightbox();
    initCategoryFilter();
    initServiceSearch();
    initServiceMemory();
    initBookingBar();
    applyBookingToEnquiry();
    initForm("enquiry-form", "enquiry-status", "Enquiry sent");
    initForm("contact-form", "contact-status", "Message sent");
});


/* ---------- 1. MOBILE NAVIGATION MENU ---------- */
function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("site-nav");
    if (!toggle || !menu) return;

    function setMenu(open) {
        menu.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        toggle.innerHTML = open ? "&times;" : "&#9776;";
    }

    toggle.addEventListener("click", function () {
        setMenu(!menu.classList.contains("open"));
    });

    // Close the menu when a link is chosen, Escape is pressed, or the screen gets wide
    menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) setMenu(false);
    });
}


/* ---------- 2. TOAST NOTIFICATION HELPER ---------- */
let toastElement = null;
let toastTimer = null;

function showToast(title, message) {
    if (!toastElement) {
        toastElement = document.createElement("div");
        toastElement.className = "toast-drawer";
        toastElement.setAttribute("role", "status");
        toastElement.setAttribute("aria-live", "polite");
        toastElement.innerHTML = "<div><h4></h4><p></p></div>";
        document.body.appendChild(toastElement);
    }
    toastElement.querySelector("h4").textContent = title;
    toastElement.querySelector("p").textContent = message;
    toastElement.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toastElement.classList.remove("show");
    }, 4000);
}


/* ---------- 3. SCROLL REVEAL ---------- */
function initScrollReveal() {
    const items = document.querySelectorAll(".room-card, .testimonial-card, .section-title, .about-intro-content, .panel");
    if (!items.length) return;

    // Older browsers without IntersectionObserver simply show everything
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(function (item) {
        item.classList.add("reveal");
        observer.observe(item);
    });
}


/* ---------- 4. GALLERY LIGHTBOX ---------- */
function initLightbox() {
    const images = document.querySelectorAll(".card-image-wrapper img");
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged photo");
    overlay.innerHTML =
        '<div class="lightbox-content">' +
        '<button class="lightbox-close" type="button" aria-label="Close photo">&times;</button>' +
        '<img src="" alt="">' +
        "</div>";
    document.body.appendChild(overlay);

    const bigImage = overlay.querySelector("img");
    const closeButton = overlay.querySelector(".lightbox-close");
    let lastFocused = null;

    function openLightbox(source) {
        lastFocused = document.activeElement;
        bigImage.src = source.currentSrc || source.src;
        bigImage.alt = source.alt;
        overlay.classList.add("active");
        closeButton.focus();
    }

    function closeLightbox() {
        overlay.classList.remove("active");
        if (lastFocused) lastFocused.focus();
    }

    images.forEach(function (img) {
        // Make the photos usable with the keyboard as well as the mouse
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.addEventListener("click", function () { openLightbox(img); });
        img.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(img);
            }
        });
    });

    closeButton.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay.classList.contains("active")) closeLightbox();
    });
}


/* ---------- 5. CATEGORY FILTER BUTTONS ---------- */
// Builds filter buttons from the badges on the cards, so they always match.
function initCategoryFilter() {
    document.querySelectorAll(".card-grid").forEach(function (grid) {
        const cards = Array.from(grid.querySelectorAll(".room-card"));
        if (cards.length < 5) return; // only worth filtering larger grids

        const categories = [];
        cards.forEach(function (card) {
            const badge = card.querySelector(".card-badge");
            const name = badge ? badge.textContent.trim() : "";
            if (name && categories.indexOf(name) === -1) categories.push(name);
        });

        const bar = document.createElement("div");
        bar.className = "filter-container";
        bar.setAttribute("role", "group");
        bar.setAttribute("aria-label", "Filter by category");

        ["All"].concat(categories).forEach(function (name, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-btn" + (index === 0 ? " active" : "");
            button.textContent = name;
            button.dataset.filter = index === 0 ? "all" : name;
            button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
            bar.appendChild(button);
        });

        grid.parentNode.insertBefore(bar, grid);

        bar.addEventListener("click", function (e) {
            const button = e.target.closest(".filter-btn");
            if (!button) return;

            bar.querySelectorAll(".filter-btn").forEach(function (b) {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            cards.forEach(function (card) {
                const badge = card.querySelector(".card-badge");
                const name = badge ? badge.textContent.trim() : "";
                card.classList.toggle("hide", button.dataset.filter !== "all" && name !== button.dataset.filter);
            });
        });
    });
}


/* ---------- 6. LIVE SEARCH ---------- */
function initServiceSearch() {
    const input = document.getElementById("service-search");
    const message = document.getElementById("no-results");
    const cards = document.querySelectorAll("[data-service]");
    if (!input || !cards.length) return;

    function runSearch() {
        const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        let visible = 0;

        cards.forEach(function (card) {
            const text = card.textContent.toLowerCase();
            const match = words.every(function (word) { return text.indexOf(word) !== -1; });
            card.classList.toggle("hide", !match);
            if (match) visible++;
        });

        // Hide a whole section if none of its cards match
        document.querySelectorAll("main section").forEach(function (section) {
            const sectionCards = section.querySelectorAll("[data-service]");
            if (!sectionCards.length) return;
            const anyVisible = Array.from(sectionCards).some(function (c) { return !c.classList.contains("hide"); });
            section.hidden = !anyVisible;
        });

        if (message) message.classList.toggle("show", visible === 0);
    }

    input.addEventListener("input", runSearch);
}


/* ---------- 7. REMEMBER THE CHOSEN SERVICE ---------- */
// Clicking "Book..." on a card pre-selects that service on the enquiry form.
function initServiceMemory() {
    // Part A: save the card title when a booking button is clicked
    document.querySelectorAll('.room-card a[href="enquiry.html"]').forEach(function (link) {
        link.addEventListener("click", function () {
            const title = link.closest(".room-card").querySelector("h3");
            if (!title) return;
            try {
                sessionStorage.setItem("gokoleService", title.textContent.trim());
            } catch (error) {
                /* storage blocked: the form simply opens empty */
            }
        });
    });

    // Part B: on the enquiry page, use the saved title
    const select = document.getElementById("enquiry-service");
    const message = document.getElementById("enquiry-message");
    if (!select) return;

    let saved = null;
    try {
        saved = sessionStorage.getItem("gokoleService");
        sessionStorage.removeItem("gokoleService");
    } catch (error) {
        return;
    }
    if (!saved) return;

    const keywords = [
        ["conference", "conference"],
        ["kraal", "kraal"],
        ["tour", "tour"],
        ["fishing", "fishing"],
        ["horse", "horse"],
        ["ride", "horse"],
        ["braai", "general"],
        ["room", "room"],
        ["suite", "room"],
        ["accommodation", "room"]
    ];

    const lower = saved.toLowerCase();
    let target = null;
    for (let i = 0; i < keywords.length; i++) {
        if (lower.indexOf(keywords[i][0]) !== -1) { target = keywords[i][1]; break; }
    }

    if (target) {
        Array.from(select.options).forEach(function (option) {
            if (option.textContent.toLowerCase().indexOf(target) !== -1) select.value = option.value || option.textContent;
        });
    }
    if (message && !message.value) message.value = "I would like to ask about: " + saved + ". ";
    showToast("Service selected", "We filled in \"" + saved + "\" for you.");
}


/* ---------- 8. QUICK BOOKING BAR AND PRE-FILLED ENQUIRY ---------- */
// Home page: save what the visitor picked, then open the enquiry page.
function initBookingBar() {
    const bar = document.getElementById("booking-bar");
    if (!bar) return;

    const dateField = document.getElementById("booking-date");
    const now = new Date();
    const pad = function (n) { return String(n).padStart(2, "0"); };
    if (dateField) {
        dateField.min = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    }

    bar.addEventListener("submit", function (e) {
        e.preventDefault();
        const booking = {
            service: document.getElementById("booking-service").value,
            date: dateField ? dateField.value : "",
            guests: document.getElementById("booking-guests").value
        };
        try {
            sessionStorage.setItem("gokoleBooking", JSON.stringify(booking));
        } catch (error) {
            /* storage blocked: the enquiry page simply opens empty */
        }
        window.location.href = "enquiry.html";
    });
}

// Enquiry page: fill in the form with the choices made on the home page.
function applyBookingToEnquiry() {
    const form = document.getElementById("enquiry-form");
    if (!form) return;

    let booking = null;
    try {
        booking = JSON.parse(sessionStorage.getItem("gokoleBooking"));
        sessionStorage.removeItem("gokoleBooking");
    } catch (error) {
        return;
    }
    if (!booking) return;

    const service = document.getElementById("enquiry-service");
    const date = document.getElementById("enquiry-date");
    const guests = document.getElementById("enquiry-guests");

    if (service && booking.service) {
        const match = Array.from(service.options).some(function (option) {
            return option.value === booking.service;
        });
        if (match) service.value = booking.service;
    }
    if (date && booking.date) date.value = booking.date;
    if (guests && booking.guests) guests.value = booking.guests;

    showToast("Details filled in", "We added your choices from the home page.");
}


/* ---------- 9. FORM VALIDATION AND AJAX SUBMISSION ---------- */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Friendly wording for each field, keyed by the field's name attribute
const fieldText = {
    name:           { empty: "Please enter your full name." },
    email:          { empty: "Please enter your email address.", invalid: "Enter a valid email, like name@example.com." },
    phone:          { empty: "Please enter your phone number.", invalid: "Enter a valid phone number, like 063 143 8609." },
    service:        { empty: "Please choose a service." },
    message:        { empty: "Please write a message." },
    contact_method: { empty: "Please choose how we should reply." },
    consent:        { empty: "Please tick the box so we can contact you." },
    preferred_date: { invalid: "Choose today or a later date." },
    guests:         { invalid: "Enter a number of guests from 1 to 200." }
};

function errorElementFor(field) {
    const holder = field.closest("fieldset") || field;
    const id = holder.getAttribute("aria-describedby");
    return id ? document.getElementById(id) : null;
}

// Returns an error message, or "" when the field is fine
function getFieldError(field) {
    const text = fieldText[field.name] || {};
    const emptyMessage = text.empty || "This field is required.";

    // Radio buttons: one choice from the group is enough
    if (field.type === "radio") {
        const group = field.form.querySelectorAll('input[name="' + field.name + '"]');
        const chosen = Array.from(group).some(function (r) { return r.checked; });
        return field.required && !chosen ? emptyMessage : "";
    }

    if (field.type === "checkbox") {
        return field.required && !field.checked ? emptyMessage : "";
    }

    const value = field.value.trim();

    if (!value) return field.required ? emptyMessage : "";

    if (field.type === "email" && !emailPattern.test(value)) return text.invalid;

    if (field.type === "tel") {
        const digits = value.replace(/\D/g, "");
        if (!/^[0-9 +()\-]+$/.test(value) || digits.length < 10 || digits.length > 15) return text.invalid;
    }

    if (field.type === "number") {
        const number = Number(value);
        if (isNaN(number) || number < Number(field.min) || number > Number(field.max)) return text.invalid;
    }

    if (field.type === "date") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chosen = new Date(value + "T00:00:00");
        if (isNaN(chosen.getTime()) || chosen < today) return text.invalid;
    }

    const minLength = Number(field.getAttribute("minlength")) || 0;
    if (minLength && value.length < minLength) return "Please enter at least " + minLength + " characters.";

    return "";
}

// Shows or clears the message for one field. Returns true if the field is valid.
function checkField(field) {
    const message = getFieldError(field);
    const errorBox = errorElementFor(field);
    const isGroup = field.type === "radio";
    const targets = isGroup ? field.form.querySelectorAll('input[name="' + field.name + '"]') : [field];

    targets.forEach(function (target) {
        target.classList.toggle("is-invalid", Boolean(message));
        target.classList.toggle("is-valid", !message && target.value.trim() !== "" && target.type !== "radio" && target.type !== "checkbox");
        target.setAttribute("aria-invalid", message ? "true" : "false");
    });

    if (errorBox) errorBox.textContent = message;
    return !message;
}

function setStatus(box, type, text) {
    box.className = "form-status" + (type ? " " + type : "");
    box.textContent = text;
}

function initForm(formId, statusId, successTitle) {
    const form = document.getElementById(formId);
    const status = document.getElementById(statusId);
    if (!form || !status) return;

    const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(function (f) {
        return f.name && f.name !== "bot-field" && f.type !== "hidden";
    });
    const submitButton = form.querySelector('button[type="submit"]');

    // Don't allow past dates in the date picker
    const dateField = form.querySelector('input[type="date"]');
    if (dateField) {
        const now = new Date();
        const pad = function (n) { return String(n).padStart(2, "0"); };
        dateField.min = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    }

    // Check each field as the visitor leaves it, then keep checking while they fix it
    fields.forEach(function (field) {
        field.addEventListener("blur", function () { checkField(field); });
        const liveEvent = (field.type === "checkbox" || field.type === "radio" || field.tagName === "SELECT") ? "change" : "input";
        field.addEventListener(liveEvent, function () {
            if (field.classList.contains("is-invalid") || liveEvent === "change") checkField(field);
        });
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        setStatus(status, "", "");

        // Validate everything and find the first problem
        let firstInvalid = null;
        fields.forEach(function (field) {
            if (!checkField(field) && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid) {
            setStatus(status, "error", "Please fix the highlighted fields and try again.");
            firstInvalid.focus();
            return;
        }

        // Sending only works once the site is online on Netlify
        const onLocalComputer = location.protocol === "file:" ||
            location.hostname === "localhost" || location.hostname === "127.0.0.1";
        if (onLocalComputer) {
            setStatus(status, "error", "Your form is valid! Sending works once the website is online on Netlify.");
            return;
        }

        // AJAX submission: send the data without reloading the page
        submitButton.disabled = true;
        const originalLabel = submitButton.textContent;
        submitButton.textContent = "Sending...";

        // Netlify Forms expects the data in this format
        const body = new URLSearchParams(new FormData(form)).toString();

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body
        })
            .then(function (response) {
                if (response.ok) {
                    form.reset();
                    fields.forEach(function (field) {
                        field.classList.remove("is-valid", "is-invalid");
                        field.removeAttribute("aria-invalid");
                    });
                    setStatus(status, "success", "Thank you! We have received your message and will reply soon.");
                    showToast(successTitle, "We will get back to you shortly.");
                } else {
                    throw new Error("Server said no");
                }
            })
            .catch(function () {
                setStatus(status, "error", "Sorry, we could not send that. Please try again, or call or WhatsApp 063 143 8609.");
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = originalLabel;
            });
    });
}