// ==========================================================================
// Local Testing Simulation Mode (No External Keys Required)
// ==========================================================================

// Global System Variables
let users = JSON.parse(localStorage.getItem('hubUsers')) || [];
let currentUser = sessionStorage.getItem('activeHubUser') || null;
let files = [];
let historyLog = [];
let simulatedOTP = null; // Fake Token Store
const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

function checkAuthState() {
    if (currentUser) {
        document.getElementById('authBox').classList.add('hidden');
        document.getElementById('appBox').classList.remove('hidden');
        
        const account = users.find(u => u.username === currentUser);
        if (account) {
            document.getElementById('displayNavName').innerText = account.fullName;
            document.getElementById('displayNavUser').innerText = `@${account.username}`;
            
            const userImg = account.avatar || defaultAvatar;
            document.getElementById('navAvatar').src = userImg;
            document.getElementById('editAvatarPreview').src = userImg;
            
            document.getElementById('editFullName').value = account.fullName;
            document.getElementById('editMobile').value = account.mobile;
        }

        files = JSON.parse(localStorage.getItem(`files_${currentUser}`)) || [];
        historyLog = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
        renderFiles();
        renderHistory();
    } else {
        document.getElementById('authBox').classList.remove('hidden');
        document.getElementById('appBox').classList.add('hidden');
    }
}

// ==========================================================================
// Simulated OTP Dispatcher (Pehle Jaisa Fake Token System)
// ==========================================================================
function sendOTPFlow(type) {
    let mobile = (type === 'signup') ? document.getElementById('regMobile').value.trim() : document.getElementById('forgotMobile').value.trim();
    let code = (type === 'signup') ? document.getElementById('regCountryCode').value : document.getElementById('forgotCountryCode').value;

    if (mobile.length < 10) { 
        alert("Please enter a valid 10-digit mobile number."); return; 
    }

    // 6-digit ka random number generator
    simulatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    if (type === 'signup') { 
        document.getElementById('otpGroup').classList.remove('hidden'); 
    } else { 
        document.getElementById('forgotOtpGroup').classList.remove('hidden'); 
        document.getElementById('newPassGroup').classList.remove('hidden'); 
    }
    
    // Screen par hi token dikhane wala box
    alert(`[COM-LINK DISPATCH SIMULATOR]\nToken transmitted to ${code} ${mobile}.\n\nVerification key: ${simulatedOTP}`);
}

function handleSignUp() {
    const fullName = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUser').value.trim().toLowerCase();
    const pass = document.getElementById('regPass').value;
    const rePass = document.getElementById('regRePass').value;
    const mobile = document.getElementById('regMobile').value.trim();
    const userOTP = document.getElementById('regOTP').value.trim();

    if (!fullName || !username || !pass || !mobile || !userOTP) { alert("All fields are required."); return; }
    if (pass !== rePass) { alert("Passwords do not match."); return; }
    if (users.some(u => u.username === username || u.mobile === mobile)) { alert("Username or Mobile already registered."); return; }

    // Alert wale OTP se match check karna
    if (userOTP === simulatedOTP) {
        users.push({ fullName, username, pass, mobile, avatar: defaultAvatar });
        localStorage.setItem('hubUsers', JSON.stringify(users));
        alert("Simulated Mobile Handshake Verified! Profile successfully created.");
        switchAuth('login');
    } else {
        alert("Invalid verification token code.");
    }
}

function handleResetPassword() {
    const mobile = document.getElementById('forgotMobile').value.trim();
    const userOTP = document.getElementById('forgotOTP').value.trim();
    const newPass = document.getElementById('forgotNewPass').value;

    if (userOTP === simulatedOTP) {
        const index = users.findIndex(u => u.mobile === mobile);
        if (index === -1) { alert("No user found with this mobile number."); return; }

        users[index].pass = newPass;
        localStorage.setItem('hubUsers', JSON.stringify(users));
        alert("Password updated successfully via simulation link.");
        switchAuth('login');
    } else {
        alert("Invalid token code.");
    }
}

// Workspace UI Controls
function toggleProfileDrawer() {
    const drawer = document.getElementById('profileDrawer');
    const overlay = document.getElementById('modalOverlay');
    if (drawer.classList.contains('closed')) {
        overlay.classList.remove('hidden'); drawer.classList.remove('closed');
    } else {
        drawer.classList.add('closed');
        setTimeout(() => overlay.classList.add('hidden'), 200);
    }
}

function previewAndSaveAvatar() {
    const fileInput = document.getElementById('avatarUploadInput');
    const file = fileInput.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Img = e.target.result;
        document.getElementById('editAvatarPreview').src = base64Img;
        const userIndex = users.findIndex(u => u.username === currentUser);
        if (userIndex !== -1) {
            users[userIndex].avatar = base64Img;
            localStorage.setItem('hubUsers', JSON.stringify(users));
            document.getElementById('navAvatar').src = base64Img;
        }
    };
    reader.readAsDataURL(file);
}

function saveProfileChanges() {
    const newName = document.getElementById('editFullName').value.trim();
    const newMobile = document.getElementById('editMobile').value.trim();
    if (!newName || !newMobile) { alert("Fields cannot be empty."); return; }
    const userIndex = users.findIndex(u => u.username === currentUser);
    if (userIndex !== -1) {
        users[userIndex].fullName = newName; users[userIndex].mobile = newMobile;
        localStorage.setItem('hubUsers', JSON.stringify(users));
        document.getElementById('displayNavName').innerText = newName;
        alert("Profile configurations saved locally."); toggleProfileDrawer();
    }
}

function switchAuth(panel) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('forgotForm').classList.add('hidden');
    if (panel === 'signup') document.getElementById('signupForm').classList.remove('hidden');
    else if (panel === 'forgot') document.getElementById('forgotForm').classList.remove('hidden');
    else document.getElementById('loginForm').classList.remove('hidden');
}

function togglePassword(id) {
    const el = document.getElementById(id); el.type = el.type === 'password' ? 'text' : 'password';
}

function handleLogin() {
    const target = document.getElementById('loginUserOrPhone').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const account = users.find(u => (u.username === target || u.mobile === target) && u.pass === pass);
    if (account) {
        currentUser = account.username; sessionStorage.setItem('activeHubUser', account.username); checkAuthState();
    } else { alert("Authentication failed. Invalid credentials."); }
}

function handleLogout() {
    currentUser = null; sessionStorage.removeItem('activeHubUser');
    if(!document.getElementById('profileDrawer').classList.contains('closed')) toggleProfileDrawer();
    checkAuthState();
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput'); const file = fileInput.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        files.push({ id: Date.now(), name: file.name, size: (file.size / 1024).toFixed(2) + " KB", data: e.target.result });
        addHistory(`Synced: ${file.name}`); localStorage.setItem(`files_${currentUser}`, JSON.stringify(files));
        fileInput.value = ''; renderFiles();
    };
    reader.readAsDataURL(file);
}

function deleteFile(id, name) {
    files = files.filter(f => f.id !== id); localStorage.setItem(`files_${currentUser}`, JSON.stringify(files));
    addHistory(`Purged: ${name}`); renderFiles();
}

function addHistory(action) {
    historyLog.unshift({ action, time: new Date().toLocaleString() });
    localStorage.setItem(`history_${currentUser}`, JSON.stringify(historyLog)); renderHistory();
}

function clearHistory() { if (confirm("Wipe logs?")) { historyLog = []; localStorage.removeItem(`history_${currentUser}`); renderHistory(); } }

function renderFiles() {
    const target = document.getElementById('fileList'); target.innerHTML = files.length === 0 ? '<li>Vault repository array is empty.</li>' : '';
    files.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<div><strong><a href="${f.data}" download="${f.name}">${f.name}</a></strong></div><button class="btn-cyber-danger delete-btn" onclick="deleteFile(${f.id}, '${f.name}')">Wipe</button>`;
        target.appendChild(li);
    });
}

function renderHistory() {
    const target = document.getElementById('historyList'); target.innerHTML = historyLog.length === 0 ? '<li>No telemetry events logged.</li>' : '';
    historyLog.forEach(l => {
        const li = document.createElement('li'); li.innerHTML = `<span>${l.action}</span><span class="history-time">${l.time}</span>`;
        target.appendChild(li);
    });
}