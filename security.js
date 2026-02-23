// security.js - Source Protection & Layout Lock
(function() {
    // 1. BLOCK SOURCE-VIEWING SHORTCUTS
    document.addEventListener('keydown', function(e) {
        
        // Block Cmd+Option+U (Mac) and Ctrl+U (Windows) - View Source
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            return false;
        }

        // Block F12 and Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows) - Inspect
        if (
            e.keyCode === 123 || 
            (e.metaKey && e.altKey && e.key.toLowerCase() === 'i') ||
            (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
        ) {
            e.preventDefault();
            return false;
        }

        // 2. BLOCK ZOOM SHORTCUTS
        // Block Cmd/Ctrl and +, -, or 0 (Reset zoom)
        if (
            (e.metaKey || e.ctrlKey) && 
            (e.key === '=' || e.key === '-' || e.key === '0' || e.keyCode === 187 || e.keyCode === 189)
        ) {
            e.preventDefault();
            return false;
        }
    }, { passive: false });

    // 3. DISABLE MOUSE WHEEL ZOOM (Ctrl/Cmd + Scroll)
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // 4. DISABLE PINCH-TO-ZOOM (Touchpads & Mobile)
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });

    // 5. THE DEBUGGER TRAP
    // If a user opens DevTools via the browser menu, this loop will 
    // trigger a 'debugger' pause every 100ms, making the app 
    // unusable until they close the inspector.
    setInterval(function() {
        (function() {
            (function a() {
                try {
                    (function b(i) {
                        if (("" + (i / i)).length !== 1 || i % 20 === 0) {
                            (function() {}).constructor("debugger")();
                        } else {
                            debugger;
                        }
                        b(++i);
                    })(0);
                } catch (e) {
                    setTimeout(a, 50);
                }
            })();
        })();
    }, 100);

    console.log("🛡️ Campus Bite Security: View-Source & Zoom Locked.");
})();