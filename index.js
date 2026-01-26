let deferredPrompt;
const installBtn = document.getElementById('install-btn'); // Create a button with this ID

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your custom "Install App" button or popup
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed Campus Bite');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
  }
});
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();

// Function to trigger when user logs in or clicks "Enable Alerts"
const activateNotifications = async () => {
  try {
    // 1. Register your Service Worker specifically for Messaging
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // 2. Get the token using your VAPID key
    const token = await getToken(messaging, { 
      vapidKey: 'BCsn7-R1yc3DK8oIgjpO4gvQfethR8xZBeO4XQw2blzI7h__UVEBeOTUcGNMaE_sv04ido9SSaftHtShd9xJcV8', // Paste your VAPID public key here
      serviceWorkerRegistration: registration 
    });

    if (token) {
      console.log("Student Token:", token);
      // NEXT STEP: Save this token to the user's document in Firestore 
      // so you can send them notifications later.
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }
  } catch (err) {
    console.log("An error occurred while retrieving token: ", err);
  }
};