// arua-guard.js - THE INTELLIGENT BARRIER
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const VIP_EMAILS = ["ezrasykar@gmail.com", "admin@campusbite.com"];
    const fbKey = "firebase:authUser:AIzaSyATGWLqyjWJUaDXwudubIc_Hvh5yPVDyOI:[DEFAULT]";
    const ARUA = { latMin: 2.80, latMax: 3.30, lngMin: 30.70, lngMax: 31.30 };

    // 1. Apply Shield Immediately
    const blurStyle = document.createElement('style');
    blurStyle.id = "guard-blur";
    blurStyle.innerHTML = `
        body > *:not(#guard-overlay) { 
            filter: blur(20px) !important; 
            pointer-events: none !important; 
            user-select: none !important; 
        }
        #guard-overlay { position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); }
    `;
    document.head.appendChild(blurStyle);

    async function verifyAccess() {
        const userData = JSON.parse(localStorage.getItem(fbKey));
        const userEmail = userData ? userData.email : null;

        // 2. VIP Bypass
        if (VIP_EMAILS.includes(userEmail) || localStorage.getItem("isAdmin") === "true") {
            removeShield();
            return;
        }

        // 3. Check if Permission is ALREADY granted
        if (navigator.permissions && navigator.permissions.query) {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            if (status.state === 'granted') {
                // Try to verify location silently
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                                         (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);
                        if (isInside) {
                            removeShield(); // User is in Arua and already allowed, let them in!
                        } else {
                            renderLockPopup(true); // User allowed, but is outside Arua
                        }
                    },
                    () => renderLockPopup(), // If GPS fails, show popup
                    { enableHighAccuracy: true }
                );
                return;
            }
        }
        
        // 4. Default: Show the lock popup if permission isn't granted or known
        renderLockPopup();
    }

    function removeShield() {
        const blur = document.getElementById("guard-blur");
        const overlay = document.getElementById("guard-overlay");
        if (blur) blur.remove();
        if (overlay) overlay.remove();
    }

    function renderLockPopup(isOutside = false) {
        if (document.getElementById("guard-overlay")) {
            // If already exists and we just found out they are outside, update view
            if(isOutside) showWaitlistUI();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = "guard-overlay";
        overlay.innerHTML = `
        <div id="lockCard" style="background: white; padding: 30px; border-radius: 28px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.15); max-width: 400px; width: 90%; font-family: 'Poppins', sans-serif;">
            <img src="/images/tent.jpeg" style="width: 70px; border-radius: 15px; margin-bottom: 15px;">
            <h2 style="color: #333; margin-bottom: 10px; font-size: 1.4rem;">Location Access Required</h2>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5;">Campus Bite is only available within <b>Muni University</b>. Please allow location access to browse the menu.</p>
            
            <button id="requestLocBtn" style="background: #ff914d; color: white; border: none; padding: 15px; border-radius: 15px; width: 100%; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.3s;">
                Allow Location Access
            </button>

            <div id="waitlistSection" style="display:none; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; text-align: left;">
                <p style="font-size: 0.8rem; color: #888; margin-bottom: 15px; text-align: center;">Outside Arua? Join our waitlist for your campus.</p>
                <label style="font-size: 0.75rem; color: #555;">Full Name</label>
                <input type="text" id="wlName" placeholder="Enter your name" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ddd; border-radius:12px; outline: none;">
                <label style="font-size: 0.75rem; color: #555;">Select University</label>
                <select id="wlLocation" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ddd; border-radius:12px; background: white;">
                    <option value="Makerere">Makerere University</option>
                    <option value="Kyambogo">Kyambogo University</option>
                    <option value="Gulu">Gulu University</option>
                    <option value="Busitema">Busitema University</option>
                    <option value="Other">Other</option>
                </select>
                <div id="otherUniContainer" style="display: none; margin-bottom: 12px;">
                    <input type="text" id="wlOtherUni" placeholder="Specify University" style="width:100%; padding:12px; border:2px solid #ff914d; border-radius:12px;">
                </div>
                <button id="submitWl" style="background: #333; color: white; border: none; padding: 15px; border-radius: 15px; width: 100%; font-weight: 600; cursor: pointer;">Join Waitlist</button>
            </div>
            <div id="successMsg" style="display:none; color: #27ae60; margin-top: 15px; font-weight: 600;">🚀 You're on the list!</div>
        </div>`;
        
        document.body.appendChild(overlay);

        document.getElementById('requestLocBtn').addEventListener('click', handleLocationRequest);
        document.getElementById('submitWl').addEventListener('click', saveToWaitlist);
        document.getElementById('wlLocation').addEventListener('change', (e) => {
            document.getElementById('otherUniContainer').style.display = (e.target.value === 'Other') ? 'block' : 'none';
        });

        if(isOutside) showWaitlistUI();
    }

    function showWaitlistUI() {
        const btn = document.getElementById('requestLocBtn');
        if(btn) btn.style.display = 'none';
        const p = document.querySelector('#lockCard p');
        if(p) p.innerText = "Verified: You are outside the Muni University service area.";
        const wl = document.getElementById('waitlistSection');
        if(wl) wl.style.display = 'block';
    }

    function handleLocationRequest() {
        const btn = document.getElementById('requestLocBtn');
        btn.innerText = "Verifying...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                                 (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);
                if (isInside) removeShield();
                else showWaitlistUI();
            },
            () => {
                alert("Access Denied. Please enable GPS.");
                btn.innerText = "Allow Location Access";
            },
            { enableHighAccuracy: true }
        );
    }

    async function saveToWaitlist() {
        const name = document.getElementById('wlName').value;
        let campus = document.getElementById('wlLocation').value;
        if (campus === 'Other') campus = document.getElementById('wlOtherUni').value;
        const email = JSON.parse(localStorage.getItem(fbKey))?.email || "anonymous";

        if (!name || !campus) return alert("Fill all fields");
        try {
            await addDoc(collection(db, "waiting_list"), { name, email, campus, timestamp: serverTimestamp() });
            document.getElementById('waitlistSection').style.display = 'none';
            document.getElementById('successMsg').style.display = 'block';
        } catch (e) { alert("Error joining waitlist."); }
    }

    window.addEventListener('load', verifyAccess);
})();