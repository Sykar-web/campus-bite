// app-guide.js - Professional Assistant with Typing & Time-Aware Greetings
(function() {
    const pageGuides = {
        "home.html": {
            title: "Explore the Menu",
            message: "Select your favorite dishes from our partner restaurants. Add them to budget and navigate through the cart to complete your order. Use categories to filter and tap meals to view their ingredients.",
            icon: "🍽️"
        },
        "profile.html": {
            title: "Your Identity",
            message: "Manage your contact details and hostel location to ensure our delivery team finds you without delay.",
            icon: "👤"
        },
        "confirm-order.html": {
            title: "Final Verification",
            message: "Review your basket and delivery notes. Ensure your total and Transaction ID (for Mobile Money) are correct before confirming dispatch.",
            icon: "✅"
        },
        "order-history.html": {
            title: "Track Your Meals",
            message: "View the status of active orders or review your past cravings. Efficiency at your fingertips.",
            icon: "🕒"
        },
        "comments.html": {
            title: "Student Feedback",
            message: "Share your experience with the community. Your reviews help us maintain high quality standards.Swipe left or double tap to reply to a comment and engage with fellow foodies.",
            icon: "💬"
        },
        "budget.html": {
            title: "Financial Overview",
            message: "Track your spending and manage your meal allowances. Plan your orders to stay within your student budget.",
            icon: "💰"
        },
        "default": {
            title: "Welcome to Campus Bite",
            message: "Navigate through the app using the menu below to explore Muni University's top meals.",
            icon: "✨"
        }
    };

    function getTimeGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }

    function showGuide() {
        const path = window.location.pathname;
        const page = path.split("/").pop() || "home.html";
        const guide = pageGuides[page] || pageGuides["default"];

        if (localStorage.getItem(`hide_guide_${page}`)) return;
        if (document.getElementById("app-guide-popup")) return;

        // 1. Create and show Typing Indicator
        const typingDiv = document.createElement('div');
        typingDiv.id = "assistant-typing";
        typingDiv.innerHTML = `
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            <style>
                #assistant-typing {
                    position: fixed; top: 25px; right: 25px; z-index: 21000001;
                    background: white; padding: 12px 18px; border-radius: 25px;
                    display: flex; gap: 5px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    border: 1px solid #eee;
                }
                .dot { width: 7px; height: 7px; background: #ff914d; border-radius: 50%; animation: blink 1.4s infinite both; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
            </style>
        `;
        document.body.appendChild(typingDiv);

        // 2. Play subtle ping sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.1;
        audio.play().catch(() => {});

        // 3. Remove typing and show Guide after delay
        setTimeout(() => {
            typingDiv.remove();
            renderActualGuide(guide, page);
        }, 1600);
    }

    function renderActualGuide(guide, page) {
        const greeting = getTimeGreeting();
        const guideDiv = document.createElement('div');
        guideDiv.id = "app-guide-popup";
        guideDiv.innerHTML = `
            <div class="guide-card">
                <div class="guide-accent"></div>
                <div class="guide-header">
                    <span class="guide-icon-box">${guide.icon}</span>
                    <div class="guide-meta">
                        <span class="guide-tag">Assistant • ${greeting}</span>
                        <h4>${guide.title}</h4>
                    </div>
                </div>
                <div class="guide-body">
                    <p>${guide.message}</p>
                </div>
                <div class="guide-footer">
                    <label class="noshow-label">
                        <input type="checkbox" id="noShowCheck"> Don't show again
                    </label>
                    <button id="guide-ok">Proceed</button>
                </div>
            </div>
            <style>
                #app-guide-popup {
                    position: fixed; top: 25px; right: 25px;
                    z-index: 21000000; width: 320px;
                    font-family: 'Inter', -apple-system, sans-serif;
                    animation: slideInCustom 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .guide-card {
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 20px; padding: 18px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                    border: 1px solid #eee; position: relative;
                }
                .guide-accent {
                    position: absolute; top: 0; left: 0; width: 100%; height: 5px;
                    background: #ff914d;
                }
                .guide-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
                .guide-icon-box {
                    font-size: 18px; background: #fff5ee; width: 38px; height: 38px;
                    display: flex; align-items: center; justify-content: center; border-radius: 10px;
                }
                .guide-meta h4 { margin: 0; font-size: 15px; color: #1a1a1a; font-weight: 700; text-align: left; }
                .guide-tag { font-size: 8px; font-weight: 800; color: #ff914d; text-transform: uppercase; display: block; text-align: left; letter-spacing: 0.5px; }
                .guide-body p { margin: 0; font-size: 12.5px; color: #555; line-height: 1.5; text-align: left; }
                
                .guide-footer {
                    margin-top: 15px; display: flex; 
                    justify-content: space-between; align-items: center;
                    border-top: 1px solid #f9f9f9; padding-top: 10px;
                }
                .noshow-label { font-size: 10px; color: #aaa; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                #guide-ok {
                    background: #1a1a1a; color: white; border: none;
                    padding: 6px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 11px;
                }
                @keyframes slideInCustom {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @media (max-width: 600px) {
                    #app-guide-popup { width: 260px; top: 15px; right: 15px; }
                    .guide-card { padding: 14px; }
                    .guide-body p { font-size: 11.5px; }
                }
            </style>
        `;

        document.body.appendChild(guideDiv);

        document.getElementById('guide-ok').onclick = () => {
            if (document.getElementById('noShowCheck').checked) {
                localStorage.setItem(`hide_guide_${page}`, "true");
            }
            guideDiv.style.opacity = "0";
            setTimeout(() => guideDiv.remove(), 400);
        };
    }

    function checkStatus() {
        const guard = document.getElementById('guard-overlay');
        if (!guard) {
            setTimeout(showGuide, 1000);
        } else {
            setTimeout(checkStatus, 1500);
        }
    }

    if (document.readyState === 'complete') checkStatus();
    else window.addEventListener('load', checkStatus);
})();