// ads-manager.js - DYNAMIC ROTATING ANNOUNCEMENTS
(function() {
    // --- ADD AS MANY MESSAGES AS YOU WANT HERE ---
    const messages = [
        {
            title: "New Restaurant Alert! 🍕",
            message: "Arua Hill Cafe is now live on Campus Bite. Try their special chicken pizza!",
            icon: "🎉"
        },
        {
            title: "Free Delivery Week 🚚",
            message: "Get free delivery on all orders above 15,000 UGX this week at Muni University.",
            icon: "🎁"
        },
        {
            title: "Fast Loading ⚡",
            message: "We've optimized our app for Muni students. Enjoy a smoother browsing experience.",
            icon: "🚀"
        },
        {
            title: "Join the Community 📱",
            message: "Follow us on WhatsApp for daily meal updates and flash discounts!",
            icon: "📢"
        }
    ];

    function showNotification() {
        // Pick a random message from the list
        const announcement = messages[Math.floor(Math.random() * messages.length)];

        const notifyDiv = document.createElement('div');
        notifyDiv.id = "sys-notification";
        notifyDiv.innerHTML = `
            <div class="notify-card">
                <div class="notify-header">
                    <span class="notify-icon">${announcement.icon}</span>
                    <span class="notify-tag">Featured Update</span>
                    <button id="notify-close">&times;</button>
                </div>
                <div class="notify-body">
                    <h4>${announcement.title}</h4>
                    <p>${announcement.message}</p>
                </div>
                <div class="notify-footer">
                    <button id="notify-ack">Nice!</button>
                </div>
            </div>
            <style>
                #sys-notification {
                    position: fixed; top: 25px; right: 25px;
                    z-index: 20000000;
                    width: 320px;
                    animation: slideInRight 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
                }
                .notify-card {
                    background: white; border-left: 5px solid #ff914d;
                    border-radius: 15px; padding: 18px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
                    font-family: 'Poppins', sans-serif;
                }
                .notify-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
                .notify-tag { font-size: 10px; font-weight: 800; color: #ff914d; text-transform: uppercase; }
                #notify-close { margin-left: auto; background: none; border: none; font-size: 22px; cursor: pointer; color: #bbb; }
                .notify-body h4 { margin: 0 0 5px; font-size: 16px; color: #333; font-weight: 700; }
                .notify-body p { margin: 0; font-size: 13px; color: #666; line-height: 1.5; }
                .notify-footer { margin-top: 15px; display: flex; justify-content: flex-end; }
                #notify-ack {
                    background: #333; color: white; border: none;
                    padding: 8px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 12px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(110%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @media (max-width: 600px) {
                    #sys-notification { top: 15px; right: 15px; left: 15px; width: auto; }
                }
            </style>
        `;

        document.body.appendChild(notifyDiv);

        const dismiss = () => {
            notifyDiv.style.opacity = "0";
            notifyDiv.style.transform = "translateX(50px)";
            notifyDiv.style.transition = "0.3s";
            setTimeout(() => notifyDiv.remove(), 300);
        };

        document.getElementById('notify-close').onclick = dismiss;
        document.getElementById('notify-ack').onclick = dismiss;
    }

    // Check if Guard is gone before showing
    function checkGuardAndShow() {
        const isGuardActive = document.getElementById('guard-overlay');
        const isUserLoggedIn = Object.keys(localStorage).some(k => k.includes("firebase:authUser"));

        if (isUserLoggedIn && !isGuardActive) {
            setTimeout(showNotification, 1200);
        } else if (isGuardActive) {
            setTimeout(checkGuardAndShow, 1000); // Check again in 1s
        }
    }

    if (document.readyState === 'complete') checkGuardAndShow();
    else window.addEventListener('load', checkGuardAndShow);
})();