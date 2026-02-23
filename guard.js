// arua-guard.js - Unified Service Area Guard
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

(function() {
    const WHITELIST = ["ezrasykar@gmail.com", "admin@campusbite.com"];
    const BLACKLIST = ["ezrasychar1@gmail.com", "test@user.com"];
    const ARUA = { latMin: 2.85, latMax: 3.20, lngMin: 30.75, lngMax: 31.10 };

    // 1. INSTANT BLUR (Applied before logic runs)
    const style = document.createElement('style');
    style.innerHTML = `
        body.guarded > *:not(#guard-overlay) { filter: blur(30px); pointer-events: none; overflow: hidden; }
        #guard-overlay { position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); backdrop-filter: blur(20px); font-family: -apple-system, sans-serif; }
        .guard-card { background: #fff; padding: 35px; width: 90%; max-width: 400px; border-radius: 30px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .logo-img { width: 85px; border-radius: 22px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .guard-btn { background: #ff914d; color: white; border: none; padding: 16px; border-radius: 16px; width: 100%; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 15px; }
        .wl-input, .wl-select { width: 100%; padding: 14px; margin: 10px 0; border: 1.5px solid #f0f0f0; border-radius: 14px; box-sizing: border-box; font-size: 16px; background: #fafafa; }
        .wl-input:focus { border-color: #ff914d; background: #fff; outline: none; }
        #success-state { display: none; }
    `;
    document.head.appendChild(style);
    document.body.classList.add('guarded');

    // 2. AUTH LISTENER
    onAuthStateChanged(auth, (user) => {
        const email = user ? user.email : null;

        if (email && BLACKLIST.includes(email)) {
            return showWaitlistUI("Outside Service Area");
        }
        if (email && WHITELIST.includes(email)) {
            return unlock();
        }
        if (sessionStorage.getItem("arua_passed") === "true") {
            return unlock();
        }

        requestLocation();
    });

    function requestLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                if (latitude >= ARUA.latMin && latitude <= ARUA.latMax && longitude >= ARUA.lngMin && longitude <= ARUA.lngMax) {
                    sessionStorage.setItem("arua_passed", "true");
                    unlock();
                } else {
                    showWaitlistUI("Outside Service Area");
                }
            },
            () => showWaitlistUI("Outside Service Area"),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    function showWaitlistUI(title) {
        if (document.getElementById('guard-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = "guard-overlay";
        overlay.innerHTML = `
            <div class="guard-card">
                <img src="/images/tent.jpeg" class="logo-img">
                <div id="form-state">
                    <h1 style="font-size: 1.5rem; margin: 0 0 10px; color: #111;">${title}</h1>
                    <p style="color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;">
                        Please join the waitlist below to bring Campus Bite to your campus!
                    </p>
                    <input type="text" id="wlName" placeholder="Full Name" class="wl-input">
                    <select id="wlUni" class="wl-select">
                        <option value="" disabled selected>Select University</option>
                        <option value="Makerere University">Makerere University</option>
                        <option value="Kyambogo University">Kyambogo University</option>
                        <option value="Gulu University">Gulu University</option>
                        <option value="Other">Other / Not Listed</option>
                    </select>
                    <input type="text" id="wlOther" placeholder="Enter University Name" class="wl-input" style="display:none; border-color: #ff914d;">
                    <button class="guard-btn" id="submitBtn">Join Waitlist</button>
                </div>
                <div id="success-state">
                    <div style="font-size: 50px; margin-bottom: 10px;">🚀</div>
                    <h2 style="color: #27ae60; margin: 0;">Joined!</h2>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">We'll notify you when we expand.</p>
                    <button class="guard-btn" id="logoutBtn" style="background: #333;">Logout of App</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle "Other" field
        document.getElementById('wlUni').onchange = (e) => {
            document.getElementById('wlOther').style.display = e.target.value === 'Other' ? 'block' : 'none';
        };

        // Submit Logic
        document.getElementById('submitBtn').onclick = async () => {
            const name = document.getElementById('wlName').value;
            let uni = document.getElementById('wlUni').value;
            if (uni === "Other") uni = document.getElementById('wlOther').value;

            if (!name || !uni) return alert("Please fill in all fields");

            try {
                await addDoc(collection(db, "waiting_list"), { 
                    name, 
                    university: uni, 
                    timestamp: serverTimestamp() 
                });
                document.getElementById('form-state').style.display = 'none';
                document.getElementById('success-state').style.display = 'block';
            } catch (e) { alert("Error joining waitlist."); }
        };

        // Logout Logic
        document.getElementById('logoutBtn').onclick = () => {
            signOut(auth).then(() => location.reload());
        };
    }

    function unlock() {
        document.body.classList.remove('guarded');
        document.getElementById('guard-overlay')?.remove();
    }
})();