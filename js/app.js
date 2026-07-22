// ==========================================
// 1. FIREBASE CONFIGURATION (REMOVED)
// ==========================================
// Firebase has been removed for this project setup. 
// OTP verification is mocked.

// ==========================================
// 2. UI TOGGLE LOGIC (SMOOTH SLIDER)
// ==========================================
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const authContainer = document.getElementById('auth-container');

// Slides to the Sign Up view
signUpButton.addEventListener('click', () => {
    authContainer.classList.add("right-panel-active");
});

// Slides back to the Log In view
signInButton.addEventListener('click', () => {
    authContainer.classList.remove("right-panel-active");
});

// Mobile switch handlers
const mobileSignUp = document.getElementById('mobileSignUp');
const mobileSignIn = document.getElementById('mobileSignIn');

if (mobileSignUp) {
    mobileSignUp.addEventListener('click', () => {
        authContainer.classList.add("right-panel-active");
    });
}

if (mobileSignIn) {
    mobileSignIn.addEventListener('click', () => {
        authContainer.classList.remove("right-panel-active");
    });
}

// ==========================================
// 3. TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remove after 3.5s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Auto-login Check
const currentUserJson = localStorage.getItem('currentUser');
if (currentUserJson) {
    window.location.href = 'home.html';
}

const API_URL = 'http://localhost:3000/api';

// ==========================================
// 4. FIREBASE PHONE OTP AUTHENTICATION
// ==========================================
let isPhoneVerified = false;

// MOCK OTP: No reCAPTCHA or Firebase needed

// DOM Elements
const sendOtpBtn = document.getElementById('send-otp-btn');
const phoneInput = document.getElementById('reg-phone');
const otpWrapper = document.getElementById('otp-wrapper');
const otpStatus = document.getElementById('otp-status');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const finalSignupBtn = document.getElementById('final-signup-btn');

// --- Step 4a: Send OTP ---
sendOtpBtn.addEventListener('click', () => {
    const rawPhoneNumber = phoneInput.value.trim();
    
    // Validation
    if (!rawPhoneNumber) {
        showToast("Phone number cannot be empty.", "error");
        return;
    }
    
    // Formatting: remove spaces, dashes, and non-numeric chars
    let numericNumber = rawPhoneNumber.replace(/\D/g, '');
    
    // If user typed 91 at the start and the length is 12, strip the 91 to check the core 10 digits
    if (numericNumber.startsWith('91') && numericNumber.length === 12) {
        numericNumber = numericNumber.substring(2);
    }
    
    // Add the +91 prefix for Indian numbers
    const formattedPhoneNumber = '+91' + numericNumber;
    
    // Detailed console logs
    console.log("Raw Input:", rawPhoneNumber);
    console.log("Numeric Number:", numericNumber);
    console.log("Formatted Number:", formattedPhoneNumber);
    
    // Verify +91 prefix, 13 chars total length, and matches Indian standard regex
    if (!formattedPhoneNumber.startsWith('+91') || formattedPhoneNumber.length !== 13 || !/^\+91[6-9]\d{9}$/.test(formattedPhoneNumber)) {
        showToast("Please enter a valid 10-digit Indian phone number.", "error");
        return;
    }

    // Disable button to prevent spamming
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    // Call Mock function to simulate sending the SMS
    setTimeout(() => {
        showToast("Mock OTP sent successfully to " + formattedPhoneNumber + ". Use any 6 digits.", "success");
        
        // Show OTP input UI
        otpWrapper.style.display = 'block';
        sendOtpBtn.innerHTML = '<i class="fa-solid fa-check"></i> OTP Sent';
    }, 1000);
});

// --- Step 4b: Verify OTP ---
verifyOtpBtn.addEventListener('click', () => {
    const code = document.getElementById('reg-otp').value.trim();
    
    // Validation
    if (!code) {
        showToast("OTP cannot be empty.", "error");
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

    // Call Mock verification: Accept any 6-digit number
    setTimeout(() => {
        if (/^\d{6}$/.test(code)) {
            // Success!
            isPhoneVerified = true;
            showToast("Phone Number Verified Successfully!", "success");
            
            otpStatus.textContent = "Verified!";
            otpStatus.className = "otp-status";
            verifyOtpBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verified';
            
            // Crucial: Only enable the final signup button after OTP success.
            finalSignupBtn.disabled = false; 
        } else {
            // Failed
            showToast("Invalid OTP. Please enter any 6-digit number.", "error");
            
            otpStatus.textContent = "Invalid OTP";
            otpStatus.className = "otp-status error";
            
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.innerHTML = 'Verify OTP';
        }
    }, 1000);
});

// ==========================================
// 5. EXISTING CUSTOM BACKEND INTEGRATION
// ==========================================

// Handle Final Signup Submission
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Double check that phone is verified before saving to node.js backend
    if (!isPhoneVerified) {
        showToast("Please verify your phone number first.", "error");
        return;
    }

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = phoneInput.value.trim();
    const password = document.getElementById('reg-password').value;

    finalSignupBtn.disabled = true;
    finalSignupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    try {
        // Send data to the existing database.json
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                phone, 
                password, 
                phoneVerified: true // Save the flag!
            })
        });

        const data = await response.json();

        if (data.success) {
            // Save locally and show success modal
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            const modal = document.getElementById('success-modal');
            document.getElementById('modal-userid').textContent = data.user.userId;
            modal.classList.add('active');

            // Redirect on continue
            document.getElementById('modal-continue-btn').onclick = () => {
                window.location.href = 'home.html';
            };
        } else {
            showToast(data.message || 'Signup Failed!', 'error');
            finalSignupBtn.disabled = false;
            finalSignupBtn.innerHTML = 'Sign Up <i class="fa-solid fa-arrow-right"></i>';
        }
    } catch (err) {
        console.error("Backend Error:", err);
        showToast('Server connection failed. Is the Node.js backend running?', 'error');
        finalSignupBtn.disabled = false;
        finalSignupBtn.innerHTML = 'Sign Up <i class="fa-solid fa-arrow-right"></i>';
    }
});

// Handle Login (unchanged logic, adapted to new UI)
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginId = document.getElementById('login-id').value.trim();
    const loginPassword = document.getElementById('login-password').value;
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginId, password: loginPassword })
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 800);
        } else {
            showToast(data.message || "Incorrect User ID or Password!", 'error');
        }
    } catch (err) {
        console.error("Login Error:", err);
        showToast('Server connection failed. Is the Node.js backend running?', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});
