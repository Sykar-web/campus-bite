// arua-guard.js - The Gatekeeper for Campus Bite
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Firebase Configuration
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
    // 2. Admin Bypass (Set localStorage.setItem("isAdmin", "true") in console to skip)
    if (localStorage.getItem("isAdmin") === "true") {
        window.addEventListener('DOMContentLoaded', unlockButtons);
        return;
    }

    // Arua District Boundaries
    const ARUA = { latMin: 2.80, latMax: 3.30, lngMin: 30.70, lngMax: 31.30 };

    function unlockButtons() {
        const buttonIds = ['googleLoginBtn', 'emailLoginBtn', 'joinBtn'];
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.filter = "none";
                btn.style.cursor = "pointer";
            }
        });
    }

    function checkLocation() {
        if (!navigator.geolocation) {
            showFullPageBlock("Browser Error", "Your browser does not support location services.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                                 (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);

                if (isInside) {
                    unlockButtons();
                } else {
                    showFullPageBlock("Outside Arua", "We detected you are currently outside our service region.");
                }
            }, 
            (err) => {
                // If they haven't allowed yet, buttons stay locked. 
                // If they click 'Block', we show the full page instructions.
                if (err.code === 1) { 
                    showFullPageBlock("Location Required", "To access Campus Bite, you must allow location access to verify you are a student in Arua.");
                }
            }, 
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    function showFullPageBlock(title, reason) {
        document.documentElement.innerHTML = `
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; font-family: -apple-system, sans-serif; background: #fff; color: #333; display: flex; align-items:center; justify-content:center; min-height:100vh; text-align:center; }
                .container { padding: 30px; max-width: 380px; width: 100%; }
                .logo { width: 75px; border-radius: 20px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(255,145,77,0.3); }
                h1 { color: #ff914d; margin-bottom: 8px; font-size: 24px; }
                p { line-height: 1.5; color: #666; font-size: 14px; margin-bottom: 20px; }
                .waitlist-form { display: flex; flex-direction: column; gap: 12px; text-align: left; background: #fafafa; padding: 20px; border-radius: 18px; border: 1px solid #eee; }
                label { font-size: 11px; font-weight: bold; color: #999; margin-left: 5px; text-transform: uppercase; }
                input, select { padding: 12px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; outline: none; width: 100%; box-sizing: border-box; background: white; }
                input:focus, select:focus { border-color: #ff914d; }
                .notify-btn { background: #ff914d; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 16px; width: 100%; }
                .notify-btn:disabled { background: #ccc; cursor: not-allowed; }
                .success-view { display: none; color: #27ae60; }
                .footer-tip { font-size: 11px; color: #bbb; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="/images/tent.jpeg" class="logo" alt="Logo">
                <h1>${title}</h1>
                <p>Campus Bite is exclusive to <b>Muni University (Arua)</b>. Join the waitlist to bring us to your campus!</p>
                
                <div class="waitlist-form" id="wlForm">
                    <div>
                        <label>Full Name</label>
                        <input type="text" id="wlName" placeholder="Enter name">
                    </div>
                    <div>
                        <label>Email Address</label>
                        <input type="email" id="wlEmail" placeholder="your@email.com">
                    </div>
                    <div>
                        <label>Select Your Campus</label>
                        <select id="wlLocation">
                            <option value="" disabled selected>Choose University</option>
                            <option value="Makerere University">Makerere University</option>
                            <option value="Kyambogo University">Kyambogo University</option>
                            <option value="MUBS">MUBS</option>
                            <option value="Gulu University">Gulu University</option>
                            <option value="Busitema University">Busitema University</option>
                            <option value="MUST">MUST (Mbarara)</option>
                             <option value="Kabale University">Kabale University</option>
                                <option value="Lira University">Lira University</option>
                                 <option value="IUIU">IUIU</option>
                                  <option value="KIU">KIU</option>
                                      <option value="Nkumba University">Nkumba University</option>
                            <option value="Other">Other / Not Listed</option>
                        </select>
                    </div>
                    <button class="notify-btn" id="submitWl">Join Waitlist</button>
                    <p style="font-size:10px; margin:0; text-align:center;">Detected: ${reason}</p>
                </div>
                <div id="successView" class="success-view">
                    <h3>✅ You're on the list!</h3>
                    <p>We've recorded your interest. We will email you as soon as Campus Bite launches at your university.</p>
                    <button class="notify-btn" onclick="location.reload()" style="background:#333;">Back</button>
                </div>
                <div class="footer-tip">Are you actually in Arua? Try refreshing and allowing location access.</div>
            </div>
        </body>`;

        // Attach event listener to the dynamically created button
        document.getElementById('submitWl').addEventListener('click', saveToWaitlist);
    }

    async function saveToWaitlist() {
        const name = document.getElementById('wlName').value;
        const email = document.getElementById('wlEmail').value;
        const campus = document.getElementById('wlLocation').value;
        const btn = document.getElementById('submitWl');

        if (!name || !email || !campus) {
            alert("Please fill in all fields.");
            return;
        }

        btn.disabled = true;
        btn.innerText = "Saving...";

        try {
            await addDoc(collection(db, "waiting_list"), {
                name: name,
                email: email,
                campus: campus,
                timestamp: serverTimestamp(),
                regionVerified: false
            });

            document.getElementById('wlForm').style.display = 'none';
            document.getElementById('successView').style.display = 'block';
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error joining waitlist. Check connection.");
            btn.disabled = false;
            btn.innerText = "Join Waitlist";
        }
    }

    // Start check
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkLocation);
    } else {
        checkLocation();
    }
})();