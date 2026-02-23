// arua-guard.js - THE UNIVERSAL INTELLIGENT BARRIER
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

    // 1. Immediate Shield
    const blurStyle = document.createElement('style');
    blurStyle.id = "guard-blur";
    blurStyle.innerHTML = `
        body > *:not(#guard-overlay) { filter: blur(20px) !important; pointer-events: none !important; user-select: none !important; }
        #guard-overlay { position: fixed; inset: 0; z-index: 9999999; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); }
    `;
    document.head.appendChild(blurStyle);

    async function verifyAccess() {
        const userData = JSON.parse(localStorage.getItem(fbKey));
        const userEmail = userData ? userData.email : null;

        // VIP/Admin Bypass
        if (VIP_EMAILS.includes(userEmail) || localStorage.getItem("isAdmin") === "true") {
            removeShield();
            return;
        }

        // Silent Check (Works on PC and some Androids)
        // We avoid navigator.permissions.query because Safari (iPhone) rejects it.
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handlePositionSuccess(pos);
            },
            () => {
                // If silent check fails, we MUST show the popup for user-initiated gesture (Mobile Requirement)
                renderLockPopup();
            },
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 10000 }
        );
    }

    function removeShield() {
        const blur = document.getElementById("guard-blur");
        const overlay = document.getElementById("guard-overlay");
        if (blur) blur.remove();
        if (overlay) overlay.remove();
        // Signal to app-guide.js that it can now show up
        window.dispatchEvent(new Event('guard-cleared'));
    }

    function renderLockPopup(isOutside = false) {
        if (document.getElementById("guard-overlay")) {
            if(isOutside) showWaitlistUI();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = "guard-overlay";
        overlay.innerHTML = `
        <div id="lockCard" style="background: white; padding: 30px; border-radius: 28px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.15); max-width: 400px; width: 90%; font-family: sans-serif;">
            <div style="font-size: 50px; margin-bottom: 10px;">📍</div>
            <h2 style="color: #333; margin-bottom: 10px; font-size: 1.4rem;">Enable Location</h2>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5;">Campus Bite only serves <b>Muni University</b>. Tap below to verify your campus presence.</p>
            
            <button id="requestLocBtn" style="background: #ff914d; color: white; border: none; padding: 16px; border-radius: 16px; width: 100%; font-weight: 700; font-size: 1rem; cursor: pointer;">
                Allow Location Access
            </button>

            <div id="waitlistSection" style="display:none; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; text-align: left;">
                <p style="font-size: 0.8rem; color: #d32f2f; margin-bottom: 15px; text-align: center; font-weight: 600;">You appear to be outside Arua.</p>
                <input type="text" id="wlName" placeholder="Full Name" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ddd; border-radius:12px;">
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
            <div id="successMsg" style="display:none; color: #27ae60; margin-top: 15px; font-weight: 600;">🚀 Added to Waitlist!</div>
        </div>`;
        
        document.body.appendChild(overlay);

        document.getElementById('requestLocBtn').addEventListener('click', handleLocationRequest);
        document.getElementById('submitWl').addEventListener('click', saveToWaitlist);
        document.getElementById('wlLocation').addEventListener('change', (e) => {
            document.getElementById('otherUniContainer').style.display = (e.target.value === 'Other') ? 'block' : 'none';
        });

        if(isOutside) showWaitlistUI();
    }

    function handlePositionSuccess(pos) {
        const { latitude, longitude } = pos.coords;
        const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                         (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);
        if (isInside) removeShield();
        else renderLockPopup(true);
    }

    function handleLocationRequest() {
        const btn = document.getElementById('requestLocBtn');
        btn.innerText = "Verifying GPS...";
        
        // This direct call on click is the ONLY way to trigger iOS Safari
        navigator.geolocation.getCurrentPosition(
            (pos) => handlePositionSuccess(pos),
            (err) => {
                console.error(err);
                alert("Please enable Location Services in your Phone Settings and Refresh.");
                btn.innerText = "Retry Access";
            },
            { 
                enableHighAccuracy: true, 
                timeout: 15000, // Important: Phones take time to find satellites
                maximumAge: 0 
            }
        );
    }

    async function saveToWaitlist() {
        const name = document.getElementById('wlName').value;
        let campus = document.getElementById('wlLocation').value;
        if (campus === 'Other') campus = document.getElementById('wlOtherUni').value;
        if (!name || !campus) return alert("Fill all fields");

        try {
            await addDoc(collection(db, "waiting_list"), { name, campus, timestamp: serverTimestamp() });
            document.getElementById('waitlistSection').style.display = 'none';
            document.getElementById('successMsg').style.display = 'block';
        } catch (e) { alert("Error connecting to database."); }
    }

    window.addEventListener('load', verifyAccess);
})();