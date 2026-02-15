(function() {
    // 1. ADMIN BYPASS: If you have already logged in as admin once, skip the check
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (isAdmin) return; 

    // 2. ARUA BOUNDARIES
    const ARUA = { latMin: 2.80, latMax: 3.30, lngMin: 30.70, lngMax: 31.30 };

    function checkLocation() {
        if (!navigator.geolocation) {
            renderBlock("Browser Error", "Your device does not support location services.");
            return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            const isInside = (latitude >= ARUA.latMin && latitude <= ARUA.latMax) &&
                             (longitude >= ARUA.lngMin && longitude <= ARUA.lngMax);

            if (!isInside) {
                renderBlock("Service Restricted", "Campus Bite only operates in Arua. You appear to be outside the region.");
            }
        }, (err) => {
            renderBlock("Access Denied", "Campus Bite requires your location to verify you are in Arua before you can log in.");
        }, { 
            enableHighAccuracy: true, // Forces physical GPS over IP/VPN
            timeout: 10000 
        });
    }

    function renderBlock(title, message) {
        // Wipes the page before the body can even finish loading
        document.documentElement.innerHTML = `
            <body style="margin:0; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; text-align:center; padding:20px; background:#fff;">
              <div>
                <h1 style="color:#ff914d; font-size:40px; margin-bottom:10px;">Campus Bite</h1>
                <h2 style="color:#333;">${title}</h2>
                <p style="color:#666; max-width:300px; margin: 0 auto;">${message}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:12px 25px; background:#ff914d; color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer;">Retry</button>
              </div>
            </body>`;
    }

    // Execute the check
    checkLocation();
})();