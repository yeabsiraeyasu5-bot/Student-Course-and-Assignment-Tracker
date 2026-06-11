// ============================================================
// script.js — HOME PAGE (index.html)
// Handles: adding courses, filtering, searching, dashboard
// ============================================================


// ============================================================
// STEP 1: GRAB ALL HTML ELEMENTS WE NEED
// document.getElementById finds an element by its id attribute
// ============================================================

const courseInput     = document.getElementById("courseInput");
const instructorInput = document.getElementById("instructorInput");
const deadlineInput   = document.getElementById("deadlineInput");
const addBtn          = document.getElementById("addBtn");
const courseList      = document.getElementById("courseList");
const searchInput     = document.getElementById("searchInput");
const allBtn          = document.getElementById("allBtn");
const completedBtn    = document.getElementById("completedBtn");
const pendingBtn      = document.getElementById("pendingBtn");
const totalCourses    = document.getElementById("totalCourses");
const completedCourses = document.getElementById("completedCourses");
const pendingCourses  = document.getElementById("pendingCourses");
const totalAssignments = document.getElementById("totalAssignments");
const welcomeMsg      = document.getElementById("welcomeMsg");


// ============================================================
// STEP 2: LOAD DATA FROM LOCALSTORAGE
// localStorage saves data in the browser permanently
// JSON.parse converts saved text back into a JavaScript array
// If nothing saved yet, start with empty array []
// ============================================================

let courses = JSON.parse(localStorage.getItem("courses")) || [];
// courses is our main data — an array of objects
// Each course looks like:
// { id, name, instructor, deadline, completed }

let currentFilter = "all";
// Tracks which filter button is active (all / pending / completed)


// ============================================================
// STEP 3: SHOW WELCOME MESSAGE FROM PROFILE
// Reads the student's name saved on the profile page
// ============================================================

const profile = JSON.parse(localStorage.getItem("profile")) || {};
// Load profile data (name, grade, school)

if (profile.name) {
    welcomeMsg.textContent = `Welcome back, ${profile.name}! 👋`;
    // Shows a greeting if the student has set their name
}


// ============================================================
// STEP 4: APPLY DARK MODE IF SAVED
// Checks if the user turned on dark mode on the profile page
// ============================================================

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    // Adds the "dark" CSS class to <body> which changes all colors
}


// ============================================================
// STEP 5: RUN ON PAGE LOAD
// Show courses immediately when the page opens
// ============================================================

displayCourses();


// ============================================================
// STEP 6: ADD COURSE
// Runs when the "+ Add Course" button is clicked
// ============================================================

addBtn.addEventListener("click", () => {

    const courseName  = courseInput.value.trim();
    const instructor  = instructorInput.value.trim();
    const deadline    = deadlineInput.value;

    // Validation — stop if name is empty
    if (courseName === "") {
        alert("Please enter a course name!");
        return;
        // "return" stops the function from continuing
    }

    const newCourse = {
        id: Date.now(),
        // Date.now() gives the current time in milliseconds
        // This makes a unique id for each course (e.g. 1718123456789)
        // We use this id to link assignments to their course

        name: courseName,
        instructor: instructor || "No instructor",
        // If instructor field left empty, use "No instructor"
        deadline: deadline || "No deadline",
        completed: false
        // New courses always start as not completed
    };

    courses.push(newCourse);
    // .push() adds new course to end of the array

    saveCourses();
    displayCourses();

    // Clear the form inputs after adding
    courseInput.value = "";
    instructorInput.value = "";
    deadlineInput.value = "";
});


// ============================================================
// STEP 7: FILTER BUTTONS
// Each button updates currentFilter and refreshes the list
// ============================================================

allBtn.addEventListener("click", () => {
    currentFilter = "all";
    setActiveFilter(allBtn);
    displayCourses();
});

completedBtn.addEventListener("click", () => {
    currentFilter = "completed";
    setActiveFilter(completedBtn);
    displayCourses();
});

pendingBtn.addEventListener("click", () => {
    currentFilter = "pending";
    setActiveFilter(pendingBtn);
    displayCourses();
});

function setActiveFilter(clickedBtn) {
    // Remove "active" class from all filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    // Add "active" only to the button that was clicked
    clickedBtn.classList.add("active");
}


// ============================================================
// STEP 8: SEARCH
// Fires every time the user types a character
// ============================================================

searchInput.addEventListener("input", () => {
    displayCourses();
    // Just re-run display — it reads searchInput.value inside
});


// ============================================================
// STEP 9: DISPLAY COURSES
// Builds the course cards and injects them into the page
// This runs every time something changes
// ============================================================

function displayCourses() {

    courseList.innerHTML = "";
    // Wipe the current list clean before rebuilding

    // --- FILTER ---
    let filtered = [...courses];
    // [...courses] makes a copy — we never modify the original

    if (currentFilter === "completed") {
        filtered = filtered.filter(c => c.completed === true);
    }
    if (currentFilter === "pending") {
        filtered = filtered.filter(c => c.completed === false);
    }

    // --- SEARCH ---
    const searchText = searchInput.value.toLowerCase();
    if (searchText !== "") {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchText)
        );
    }

    // --- EMPTY STATE ---
    if (filtered.length === 0) {
        courseList.innerHTML = `<p class="empty-state">No courses found. Add one above! 📖</p>`;
        updateDashboard();
        return;
    }

    // --- BUILD EACH COURSE CARD ---
    filtered.forEach((course) => {

        const index = courses.indexOf(course);
        // Find the position of this course in the ORIGINAL array
        // We need this so edit/delete/toggle work on the right item

        // Load assignments for this course from localStorage
        const allAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
        // assignments is a separate array saved by detail.js
        // We filter to only get assignments that belong to this course
        const courseAssigns = allAssignments.filter(a => a.courseId === course.id);
        const doneCount = courseAssigns.filter(a => a.completed).length;
        const totalCount = courseAssigns.length;

        // Calculate progress percentage
        const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
        // If no assignments yet, show 0%
        // Math.round removes decimals (e.g. 66.66 becomes 67)

        // Format deadline text
        let deadlineText = "No deadline";
        if (course.deadline && course.deadline !== "No deadline") {
            const dateObj = new Date(course.deadline + "T00:00:00");
            deadlineText = dateObj.toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });

            // Check if overdue
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dateObj < today && !course.completed) {
                deadlineText += " ⚠️ Overdue";
            }
        }

        // Status badge HTML
        const badge = course.completed
            ? `<span class="status-badge badge-completed">Completed ✅</span>`
            : `<span class="status-badge badge-pending">Pending ⏳</span>`;

        const completeText = course.completed ? "Undo" : "✔ Done";

        const li = document.createElement("li");
        if (course.completed) li.classList.add("completed-item");

        li.innerHTML = `
            <div class="course-info">
                <span class="course-name">${course.name}</span>
                <span class="course-detail">👩‍🏫 ${course.instructor}</span>
                <span class="course-detail">📅 ${deadlineText}</span>
                ${badge}

                <!-- PROGRESS BAR — shows visually how much is done -->
                <div class="progress-bar-wrap" style="margin-top:8px;">
                    <div class="progress-bar-fill" style="width: ${percent}%"></div>
                    <!-- style="width: X%" is set by JS based on completion -->
                </div>
                <span class="progress-label">${doneCount}/${totalCount} assignments done (${percent}%)</span>
            </div>

            <div class="course-actions">
                <!-- View button links to detail.html with the course id in the URL -->
                <!-- ?id=${course.id} passes the course id to the next page -->
                <a href="detail.html?id=${course.id}" class="btn btn-view">📋 View</a>

                <button class="btn btn-complete" onclick="toggleComplete(${index})">
                    ${completeText}
                </button>

                <button class="btn btn-edit" onclick="editCourse(${index})">✏️ Edit</button>

                <button class="btn btn-delete" onclick="deleteCourse(${index})">🗑️</button>
            </div>
        `;

        courseList.appendChild(li);
        // Add the completed card to the list on screen
    });

    updateDashboard();
}


// ============================================================
// STEP 10: TOGGLE COMPLETE
// Flips a course between completed / not completed
// ============================================================

function toggleComplete(index) {
    courses[index].completed = !courses[index].completed;
    // ! means "flip it" — true becomes false, false becomes true
    saveCourses();
    displayCourses();
}


// ============================================================
// STEP 11: EDIT COURSE
// ============================================================

function editCourse(index) {
    const newName = prompt("Edit course name:", courses[index].name);
    if (newName && newName.trim() !== "") {
        courses[index].name = newName.trim();

        const newInstructor = prompt("Edit instructor name:", courses[index].instructor);
        if (newInstructor !== null) {
            courses[index].instructor = newInstructor.trim() || "No instructor";
        }

        saveCourses();
        displayCourses();
    }
}


// ============================================================
// STEP 12: DELETE COURSE
// Also deletes all assignments that belong to this course
// ============================================================

function deleteCourse(index) {
    const confirmed = confirm(`Delete "${courses[index].name}"? This will also delete its assignments.`);

    if (confirmed) {
        const courseId = courses[index].id;
        // Save the id before removing the course

        courses.splice(index, 1);
        // Remove 1 item at position "index" from the array

        // Also remove all assignments for this course
        let allAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
        allAssignments = allAssignments.filter(a => a.courseId !== courseId);
        // Keep only assignments that do NOT belong to the deleted course
        localStorage.setItem("assignments", JSON.stringify(allAssignments));

        saveCourses();
        displayCourses();
    }
}


// ============================================================
// STEP 13: SAVE COURSES TO LOCALSTORAGE
// ============================================================

function saveCourses() {
    localStorage.setItem("courses", JSON.stringify(courses));
    // JSON.stringify converts array to text for storage
}


// ============================================================
// STEP 14: UPDATE DASHBOARD NUMBERS
// ============================================================

function updateDashboard() {
    const total     = courses.length;
    const completed = courses.filter(c => c.completed).length;
    const pending   = total - completed;

    totalCourses.textContent     = total;
    completedCourses.textContent = completed;
    pendingCourses.textContent   = pending;

    // Count ALL assignments across all courses
    const allAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    totalAssignments.textContent = allAssignments.length;
    // .textContent updates the number shown in the stat card
}
