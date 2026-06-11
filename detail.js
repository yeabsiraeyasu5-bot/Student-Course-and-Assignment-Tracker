// ============================================================
// detail.js — COURSE DETAIL PAGE (detail.html)
// Handles: showing course info, adding/deleting assignments,
//          marking assignments complete, progress bar
// ============================================================


// ============================================================
// STEP 1: READ THE COURSE ID FROM THE URL
// When we link to detail.html?id=1718123456789
// the "?id=1718123456789" part is called a "query string"
// URLSearchParams lets us read it easily
// ============================================================

const params   = new URLSearchParams(window.location.search);
// window.location.search gives us "?id=1718123456789"
// URLSearchParams parses that into key=value pairs

const courseId = Number(params.get("id"));
// params.get("id") returns the string "1718123456789"
// Number(...) converts it to a number so we can compare it


// ============================================================
// STEP 2: LOAD DATA FROM LOCALSTORAGE
// ============================================================

let courses     = JSON.parse(localStorage.getItem("courses"))     || [];
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
// assignments is a flat list — all assignments from all courses
// Each assignment has a courseId field to link it to its course


// ============================================================
// STEP 3: FIND THE CURRENT COURSE
// Look through the courses array for the one matching our id
// ============================================================

const course = courses.find(c => c.id === courseId);
// .find() returns the FIRST item where the condition is true
// It returns undefined if nothing matches

if (!course) {
    // If no course found (bad URL or deleted), redirect home
    alert("Course not found!");
    window.location.href = "index.html";
    // window.location.href changes the page — like clicking a link
}


// ============================================================
// STEP 4: GRAB HTML ELEMENTS ON THIS PAGE
// ============================================================

const detailCourseName = document.getElementById("detailCourseName");
const detailInstructor = document.getElementById("detailInstructor");
const detailDeadline   = document.getElementById("detailDeadline");
const progressFill     = document.getElementById("progressFill");
const progressLabel    = document.getElementById("progressLabel");
const detailTotal      = document.getElementById("detailTotal");
const detailDone       = document.getElementById("detailDone");
const detailPending    = document.getElementById("detailPending");
const assignInput      = document.getElementById("assignInput");
const assignDeadline   = document.getElementById("assignDeadline");
const addAssignBtn     = document.getElementById("addAssignBtn");
const assignList       = document.getElementById("assignList");


// ============================================================
// STEP 5: APPLY DARK MODE IF SAVED
// ============================================================

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}


// ============================================================
// STEP 6: FILL IN COURSE INFORMATION AT TOP OF PAGE
// ============================================================

document.title = course.name + " — Detail";
// Updates the browser tab title to show the course name

detailCourseName.textContent = course.name;
// Sets the big heading on the page

detailInstructor.textContent = "👩‍🏫 " + course.instructor;
// Shows instructor name under the heading

// Format the deadline nicely
if (course.deadline && course.deadline !== "No deadline") {
    const d = new Date(course.deadline + "T00:00:00");
    detailDeadline.textContent = "📅 Deadline: " + d.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });
} else {
    detailDeadline.textContent = "📅 No deadline set";
}


// ============================================================
// STEP 7: SHOW ASSIGNMENTS ON PAGE LOAD
// ============================================================

displayAssignments();


// ============================================================
// STEP 8: ADD ASSIGNMENT BUTTON
// ============================================================

addAssignBtn.addEventListener("click", () => {

    const title    = assignInput.value.trim();
    const deadline = assignDeadline.value;

    if (title === "") {
        alert("Please enter an assignment title!");
        return;
    }

    const newAssignment = {
        id: Date.now(),
        // Unique id using current timestamp (same trick as courses)

        courseId: courseId,
        // Links this assignment to the current course
        // This is how we know which course each assignment belongs to

        title: title,
        deadline: deadline || "No deadline",
        completed: false
    };

    assignments.push(newAssignment);
    // Add to the assignments array

    saveAssignments();
    displayAssignments();

    // Clear inputs after adding
    assignInput.value    = "";
    assignDeadline.value = "";
});


// ============================================================
// STEP 9: DISPLAY ASSIGNMENTS
// Builds the assignment list cards
// Also updates the progress bar and stat numbers
// ============================================================

function displayAssignments() {

    assignList.innerHTML = "";
    // Clear the list before rebuilding

    // Filter: only show assignments for THIS course
    const mine = assignments.filter(a => a.courseId === courseId);
    // .filter() keeps only items where a.courseId matches our courseId

    // --- PROGRESS CALCULATION ---
    const total   = mine.length;
    const done    = mine.filter(a => a.completed).length;
    const pending = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    // Math.round(66.666) = 67 — removes long decimals

    // Update the progress bar width
    progressFill.style.width = percent + "%";
    // Sets the blue fill width — e.g. style="width: 67%"
    // The CSS transition makes this animate smoothly

    // Update progress text
    progressLabel.textContent = `${done} of ${total} assignments completed (${percent}%)`;

    // Update the 3 stat cards
    detailTotal.textContent   = total;
    detailDone.textContent    = done;
    detailPending.textContent = pending;

    // --- EMPTY STATE ---
    if (mine.length === 0) {
        assignList.innerHTML = `<p class="empty-state">No assignments yet. Add one above! ✏️</p>`;
        return;
    }

    // --- BUILD EACH ASSIGNMENT CARD ---
    mine.forEach((assign) => {

        const index = assignments.indexOf(assign);
        // Real index in the full assignments array — needed for toggle/delete

        // Format deadline
        let deadlineText = "No deadline";
        if (assign.deadline && assign.deadline !== "No deadline") {
            const d = new Date(assign.deadline + "T00:00:00");
            deadlineText = d.toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
            });

            // Check if overdue
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today && !assign.completed) {
                deadlineText += " ⚠️ Overdue";
            }
        }

        const badge = assign.completed
            ? `<span class="status-badge badge-completed">Completed ✅</span>`
            : `<span class="status-badge badge-pending">Pending ⏳</span>`;

        const li = document.createElement("li");
        if (assign.completed) li.classList.add("completed-item");

        li.innerHTML = `
            <div class="course-info">
                <span class="course-name">${assign.title}</span>
                <span class="course-detail">📅 Due: ${deadlineText}</span>
                ${badge}
            </div>

            <div class="course-actions">
                <button class="btn btn-complete" onclick="toggleAssign(${index})">
                    ${assign.completed ? "Undo" : "✔ Done"}
                </button>
                <button class="btn btn-delete" onclick="deleteAssign(${index})">🗑️</button>
            </div>
        `;

        assignList.appendChild(li);
    });
}


// ============================================================
// STEP 10: TOGGLE ASSIGNMENT COMPLETE
// ============================================================

function toggleAssign(index) {
    assignments[index].completed = !assignments[index].completed;
    // Flip between true and false

    saveAssignments();
    displayAssignments();
}


// ============================================================
// STEP 11: DELETE ASSIGNMENT
// ============================================================

function deleteAssign(index) {
    const confirmed = confirm(`Delete "${assignments[index].title}"?`);
    if (confirmed) {
        assignments.splice(index, 1);
        // Remove 1 item at position "index"
        saveAssignments();
        displayAssignments();
    }
}


// ============================================================
// STEP 12: SAVE ASSIGNMENTS TO LOCALSTORAGE
// ============================================================

function saveAssignments() {
    localStorage.setItem("assignments", JSON.stringify(assignments));
    // Saves ALL assignments (from all courses) as one list
}
