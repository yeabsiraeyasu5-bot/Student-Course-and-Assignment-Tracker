// ============================================================
// profile.js — PROFILE PAGE (profile.html)
// Handles: saving name/grade/school, photo upload,
//          dark mode toggle, clear all data
// ============================================================


// ============================================================
// STEP 1: GRAB HTML ELEMENTS
// ============================================================

const nameInput      = document.getElementById("nameInput");
const gradeInput     = document.getElementById("gradeInput");
const schoolInput    = document.getElementById("schoolInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const saveMsg        = document.getElementById("saveMsg");
const photoInput     = document.getElementById("photoInput");
const avatarImg      = document.getElementById("avatarImg");
const avatarInitials = document.getElementById("avatarInitials");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const clearAllBtn    = document.getElementById("clearAllBtn");


// ============================================================
// STEP 2: LOAD SAVED PROFILE DATA ON PAGE OPEN
// ============================================================

const profile = JSON.parse(localStorage.getItem("profile")) || {};
// Load saved profile — if none, start with empty object {}

// Fill in the inputs with previously saved values
if (profile.name)   nameInput.value   = profile.name;
if (profile.grade)  gradeInput.value  = profile.grade;
if (profile.school) schoolInput.value = profile.school;
// If these are empty/undefined, the inputs just stay blank


// ============================================================
// STEP 3: LOAD SAVED PROFILE PHOTO
// ============================================================

const savedPhoto = localStorage.getItem("profilePhoto");
// profilePhoto is stored separately because it can be a large string

if (savedPhoto) {
    showPhoto(savedPhoto);
    // Show the photo if one was saved
} else {
    showInitials();
    // Otherwise show initials from the name
}


// ============================================================
// STEP 4: LOAD DARK MODE SETTING
// ============================================================

const darkMode = localStorage.getItem("darkMode") === "true";
// localStorage only stores strings — "true" is a string, not boolean
// === "true" converts it to a real boolean (true/false)

darkModeToggle.checked = darkMode;
// Sets the toggle switch to on or off based on saved setting

if (darkMode) {
    document.body.classList.add("dark");
    // Apply dark mode immediately when page loads
}


// ============================================================
// STEP 5: SAVE PROFILE BUTTON
// Saves name, grade, school to localStorage
// ============================================================

saveProfileBtn.addEventListener("click", () => {

    const updatedProfile = {
        name:   nameInput.value.trim(),
        grade:  gradeInput.value.trim(),
        school: schoolInput.value.trim()
    };

    localStorage.setItem("profile", JSON.stringify(updatedProfile));
    // Save the profile object as text

    // Update initials on the avatar if no photo
    if (!localStorage.getItem("profilePhoto")) {
        showInitials();
    }

    // Show "✅ Profile saved!" message briefly
    saveMsg.style.display = "block";
    // display: block makes the hidden message visible

    setTimeout(() => {
        saveMsg.style.display = "none";
        // Hide it again after 2 seconds
    }, 2000);
    // setTimeout(function, milliseconds) — 2000ms = 2 seconds
});


// ============================================================
// STEP 6: PHOTO UPLOAD
// When user picks a file, convert it to base64 and save it
// ============================================================

photoInput.addEventListener("change", () => {
    // "change" fires when the user picks a file

    const file = photoInput.files[0];
    // files[0] = the first (and only) file the user picked

    if (!file) return;
    // If no file selected, do nothing

    const reader = new FileReader();
    // FileReader is a built-in browser tool to read files

    reader.onload = (e) => {
        // onload fires when the file has finished being read
        const base64 = e.target.result;
        // e.target.result is the file as a base64 string
        // base64 is a way to store image data as plain text
        // It looks like: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."

        localStorage.setItem("profilePhoto", base64);
        // Save the photo as text in localStorage

        showPhoto(base64);
        // Display it on screen
    };

    reader.readAsDataURL(file);
    // Start reading the file — triggers onload when done
});


// ============================================================
// STEP 7: REMOVE PHOTO BUTTON
// ============================================================

removePhotoBtn.addEventListener("click", () => {
    localStorage.removeItem("profilePhoto");
    // .removeItem() deletes a key from localStorage

    avatarImg.style.display      = "none";
    // Hide the photo
    avatarInitials.style.display = "block";
    // Show initials instead

    showInitials();
});


// ============================================================
// STEP 8: SHOW PHOTO FUNCTION
// Displays the profile photo in the avatar circle
// ============================================================

function showPhoto(base64) {
    avatarImg.src             = base64;
    // Set the <img> source to the base64 string
    avatarImg.style.display   = "block";
    // Make the image visible
    avatarInitials.style.display = "none";
    // Hide the initials text
}


// ============================================================
// STEP 9: SHOW INITIALS FUNCTION
// When no photo, show first letters of the student's name
// ============================================================

function showInitials() {
    const p = JSON.parse(localStorage.getItem("profile")) || {};

    if (p.name) {
        const parts    = p.name.trim().split(" ");
        // .split(" ") breaks "John Doe" into ["John", "Doe"]

        const initials = parts.map(w => w[0]).join("").toUpperCase();
        // .map(w => w[0]) takes first letter of each word: ["J", "D"]
        // .join("") combines them: "JD"
        // .toUpperCase() makes them capital letters

        avatarInitials.textContent    = initials;
        avatarInitials.style.display  = "block";
        avatarImg.style.display       = "none";
    } else {
        avatarInitials.textContent = "?";
        // If no name saved, show a question mark
    }
}


// ============================================================
// STEP 10: DARK MODE TOGGLE
// Switches between light and dark theme
// ============================================================

darkModeToggle.addEventListener("change", () => {
    // "change" fires when the checkbox is checked or unchecked

    if (darkModeToggle.checked) {
        document.body.classList.add("dark");
        // Add "dark" class to body — CSS handles the color changes
        localStorage.setItem("darkMode", "true");
        // Save the preference so it persists on all pages
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("darkMode", "false");
    }
});


// ============================================================
// STEP 11: CLEAR ALL DATA
// Deletes everything from localStorage and resets the app
// ============================================================

clearAllBtn.addEventListener("click", () => {
    const confirmed = confirm("Are you sure? This will delete ALL your data permanently!");

    if (confirmed) {
        localStorage.clear();
        // .clear() removes EVERYTHING from localStorage at once

        alert("All data cleared. Starting fresh!");
        window.location.href = "index.html";
        // Redirect to home page after clearing
    }
});
