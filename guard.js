// arua-guard.js - PWA Optimized & High Speed
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
    const WHITELIST = ["ezrasykar@gmail.com", "namitala.teddy@student.utamu.ac.ug","kemigishavanessa9@gmail.com",];
    const ARUA = { 
        latMin: 2.950000000000000, 
        latMax: 3.100000000000000, 
        lngMin: 30.850000000000000, 
        lngMax: 31.000000000000000 
    };

    const style = document.createElement('style');
    style.innerHTML = `
        body.out-of-zone > *:not(#guard-overlay) { filter: blur(30px); pointer-events: none; }
        #guard-overlay { position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.4); backdrop-filter: blur(15px); font-family: sans-serif; }
        .guard-card { background: #fff; padding: 30px; width: 90%; max-width: 380px; border-radius: 28px; text-align: center; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #eee; }
        .logo-img { width: 80px; border-radius: 20px; margin-bottom: 15px; }
        .guard-btn { background: #ff914d; color: white; border: none; padding: 15px; border-radius: 15px; width: 100%; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .wl-input, .wl-select { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #eee; border-radius: 12px; box-sizing: border-box; font-size: 16px; background: #fafafa; }
    `;
    document.head.appendChild(style);

    onAuthStateChanged(auth, (user) => {
        const email = user ? user.email : null;
        if (email && WHITELIST.includes(email)) return; // VIP Exit
        if (sessionStorage.getItem("arua_passed") === "true") return; // Session Exit

        // Instead of checking location silently (which apps block), show the Verification Request
        showLocationRequest();
    });

    function showLocationRequest(customMsg) {
        if (document.getElementById('guard-overlay')) {
            if(customMsg) document.querySelector('#guard-overlay p').innerText = customMsg;
            return;
        }
        const overlay = document.createElement('div');
        overlay.id = "guard-overlay";
        overlay.innerHTML = `
            <div class="guard-card">
                <img src="/images/tent.jpeg" class="logo-img">
                <h2 style="margin:0;">Location Check</h2>
                <p style="color:#666; font-size:14px; margin:10px 0 20px;">${customMsg || "Please verify you are in Arua to enable the menu."}</p>
                <button class="guard-btn" id="triggerLoc">Verify Location</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // USER GESTURE: This button click tells the PWA "it's okay to open GPS"
        document.getElementById('triggerLoc').onclick = () => {
            const btn = document.getElementById('triggerLoc');
            btn.innerText = "Checking GPS...";
            checkLocation();
        };
    }

    function checkLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                
                // Reject low accuracy (e.g., cell tower guessing)
                if (accuracy > 1000) {
                    return showLocationRequest("Signal weak. Please turn on Wi-Fi for better accuracy.");
                }

                const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                                 (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);

                if (isInside) {
                    sessionStorage.setItem("arua_passed", "true");
                    document.getElementById('guard-overlay')?.remove();
                } else {
                    showWaitlistUI();
                }
            },
            () => showLocationRequest("Location access denied. Please enable it in settings."),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }

    function showWaitlistUI() {
        document.body.classList.add('out-of-zone');
        const card = document.querySelector('.guard-card');
        card.innerHTML = `
            <img src="/images/tent.jpeg" class="logo-img">
            <h2 style="margin:0 0 5px;">Outside Service Area</h2>
            <p style="color:#666; font-size:14px; margin-bottom:15px;">Join the waitlist to bring Campus Bite to your campus!</p>
            <div id="wl-form">
                <input type="text" id="wlName" placeholder="Full Name" class="wl-input">
                <select id="wlUni" class="wl-select">
                    <option value="Makerere">Makerere University</option>
                    <option value="Kyambogo">Kyambogo University</option>
                    <option value="Gulu">Gulu University</option>
                    <option value="Other">Other University</option>
                </select>
                <input type="text" id="wlOther" placeholder="University Name" class="wl-input" style="display:none; border-color: #ff914d;">
                <button class="guard-btn" id="saveBtn">Join Waitlist</button>
                <button class="guard-btn" id="logoutBtn" style="background:#333;">Logout</button>
            </div>
        `;

        document.getElementById('wlUni').onchange = (e) => {
            document.getElementById('wlOther').style.display = e.target.value === 'Other' ? 'block' : 'none';
        };

        document.getElementById('saveBtn').onclick = async () => {
            const name = document.getElementById('wlName').value;
            let uni = document.getElementById('wlUni').value;
            if(uni === 'Other') uni = document.getElementById('wlOther').value;
            if(!name || !uni) return alert("Fill fields");

            try {
                await addDoc(collection(db, "waiting_list"), { name, university: uni, timestamp: serverTimestamp() });
                card.innerHTML = `<h2>✅ Joined!</h2><p>We'll notify you soon.</p><button class="guard-btn" id="finalLogout" style="background:#333;">Logout</button>`;
                document.getElementById('finalLogout').onclick = () => signOut(auth).then(() => location.reload());
            } catch(e) { alert("Error saving."); }
        };
        document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
    }
})();