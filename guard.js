// arua-guard.js - THE IRON VAULT VERSION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Firebase Config (For Waitlist)
const firebaseConfig = {
    apiKey: "AIzaSyATGWLqyjWJUaDXwudubIc_Hvh5yPVDyOI",
    authDomain: "campus-bite-9dbaa.firebaseapp.com",
    projectId: "campus-bite-9dbaa",
    storageBucket: "campus-bite-9dbaa.appspot.com",
    messagingSenderId: "294389261625",
    appId: "1:294389261625:web:095d6e5f85f4e8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(function() {
    // 2. FORCE HIDE: Stop the page from showing even for a millisecond
    const hideStyle = document.createElement('style');
    hideStyle.id = "guard-shield";
    hideStyle.innerHTML = `body { display: none !important; }`;
    document.head.appendChild(hideStyle);

    const ARUA = { latMin: 2.80, latMax: 3.30, lngMin: 30.70, lngMax: 31.30 };

    async function verifyAccess() {
        // Admin Bypass for your Mac
        if (localStorage.getItem("isAdmin") === "true") {
            console.log("Admin Verified. Shield Deactivated.");
            showContent();
            return;
        }

        if (!navigator.geolocation) {
            renderLockPage("Device Error", "GPS is required to use Campus Bite.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                                 (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);

                if (isInside) {
                    showContent();
                } else {
                    renderLockPage("Outside Arua", "Muni University territory only.");
                }
            },
            (err) => {
                // If they click 'Block' or 'Deny'
                renderLockPage("Access Denied", "Location access is mandatory for Campus Bite.");
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }

    function showContent() {
        const shield = document.getElementById("guard-shield");
        if (shield) shield.remove();
        // Force the body to be visible
        document.body.style.setProperty('display', 'block', 'important');
    }

    function renderLockPage(title, reason) {
        // REPLACE the entire body so the menu doesn't even exist in the DOM
        document.body.innerHTML = `
        <div style="height:100vh; width:100vw; background:#fff; display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; z-index:999999; font-family:'Inter', sans-serif;">
            <div style="text-align:center; padding:30px; max-width:400px; width:100%;">
                <img src="/images/tent.jpeg" style="width: 80px; border-radius: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(255,145,77,0.3);">
                <h1 style="color: #ff914d; font-size: 26px; margin-bottom: 10px;">${title}</h1>
                <p style="color: #666; margin-bottom: 25px;">${reason}<br>Campus Bite is currently for <b>Muni University students</b> only.</p>
                
                <div id="wlForm" style="display: flex; flex-direction: column; gap: 12px; text-align: left; background: #fcfcfc; padding: 25px; border-radius: 22px; border: 1px solid #eee;">
                    <input type="text" id="wlName" placeholder="Full Name" style="padding:14px; border:1px solid #ddd; border-radius:12px; font-size:16px;">
                    <input type="email" id="wlEmail" placeholder="Email Address" style="padding:14px; border:1px solid #ddd; border-radius:12px; font-size:16px;">
                    <select id="wlLocation" style="padding:14px; border:1px solid #ddd; border-radius:12px; font-size:16px; background:white;">
                        <option value="" disabled selected>Select Your Campus</option>
                        <option value="Makerere">Makerere</option>
                        <option value="Kyambogo">Kyambogo</option>
                        <option value="MUBS">MUBS</option>
                        <option value="Gulu">Gulu</option>
                        <option value="Busitema">Busitema</option>
                        <option value="Other">Other</option>
                    </select>
                    <button id="submitWl" style="background: #ff914d; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 16px; margin-top:10px;">Join the Waitlist</button>
                    <button onclick="location.reload()" style="background:none; border:none; color:#999; font-size:12px; cursor:pointer; text-decoration:underline;">Retry Location Check</button>
                </div>

                <div id="successView" style="display: none; color: #27ae60;">
                    <h3>🚀 You're on the list!</h3>
                    <p>We will email you when we launch at your campus.</p>
                </div>
            </div>
        </div>`;

        // Make the lock page visible
        document.body.style.setProperty('display', 'block', 'important');
        
        // Attach event listener
        document.getElementById('submitWl').addEventListener('click', saveToWaitlist);
    }

    async function saveToWaitlist() {
        const name = document.getElementById('wlName').value;
        const email = document.getElementById('wlEmail').value;
        const campus = document.getElementById('wlLocation').value;
        const btn = document.getElementById('submitWl');

        if (!name || !email || !campus) return alert("Please fill all fields.");

        btn.disabled = true;
        btn.innerText = "Processing...";

        try {
            await addDoc(collection(db, "waiting_list"), {
                name, email, campus, timestamp: serverTimestamp()
            });
            document.getElementById('wlForm').style.display = 'none';
            document.getElementById('successView').style.display = 'block';
        } catch (e) {
            alert("Error saving. Check your internet.");
            btn.disabled = false;
            btn.innerText = "Join the Waitlist";
        }
    }

    // Start the process
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", verifyAccess);
    } else {
        verifyAccess();
    }
})();