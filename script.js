// Application State
const state = {
    currentPage: 'home',
    isDarkMode: true,
    isLoggedIn: false, // New: Track login status
    resources: [],
    tasks: [],
    reminders: [], // New: Store calendar reminders
    calendarDate: new Date(),
    charts: {},
    quizHistory: [], // Permanent storage for quiz results
    currentQuestions: [],
    profile: null, // Store user profile details
    currentNoteContent: "", // New: Store text from uploaded AI notes
    chatHistory: [], // New: Store AI chat messages
    GEMINI_API_KEY: "AIzaSyBCrw7hB5IfxVFTEUnZ9y3hSQrRm43uAfc" 
};

// DOM Elements
const pageContainers = document.querySelectorAll('.page-container');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('themeToggle');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const quickAddBtn = document.getElementById('quickAddBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const calendarGrid = document.getElementById('calendarGrid');
const monthDisplay = document.getElementById('calendarMonthDisplay');
const deadlinesTable = document.getElementById('deadlines-table');
const scheduleItems = document.getElementById('scheduleItems');
const clearScheduleBtn = document.getElementById('clearScheduleBtn');
const generateScheduleBtn = document.getElementById('generateScheduleBtn');
const loadDemoSuggestions = document.getElementById('loadDemoSuggestions');
const uploadForm = document.getElementById('uploadForm');
const resourcesList = document.getElementById('resourcesList');
const noteUpload = document.getElementById('noteUpload');
const signUpBtn = document.getElementById('signUpBtn');
const tryDemoBtn = document.getElementById('tryDemoBtn');

// Initialize the application
function init() {
    // Set up event listeners
    setupEventListeners();

    // Initialize dark mode
    if (localStorage.getItem('theme') === 'light') {
        enableLightMode();
    } else {
        enableDarkMode();
    }
    updateTheme();

    // Initialize calendar
    generateCalendar();

    // Data persistence
    const savedQuizHistory = localStorage.getItem('quizHistory');
    if (savedQuizHistory) state.quizHistory = JSON.parse(savedQuizHistory);

    // Initialize Login State
    const savedLoginStatus = localStorage.getItem('studySmartLoggedIn');
    if (savedLoginStatus === 'true') {
        state.isLoggedIn = true;
    }

    // Initialize Profile
    const savedProfile = localStorage.getItem('studySmartProfile');
    if (savedProfile) {
        state.profile = JSON.parse(savedProfile);
        updateProfileIDCard(true);
    }

    // Initialize deadlines table
    populateDeadlinesTable();
    updateDashboardStats();
    updatePerformanceMetrics();

    // Initialize resources list
    renderResources();

    // Initialize charts
    initializeCharts();

    // Set current date for due date inputs
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('dueDate')) document.getElementById('dueDate').value = today;
    if (document.getElementById('taskDueDate')) document.getElementById('taskDueDate').value = today;
    if (document.getElementById('studyDay')) document.getElementById('studyDay').value = today;

    // Make schedule items draggable
    makeScheduleItemsDraggable();

    // Update active nav link
    setActiveNavLink();

    // Set initial Auth UI visibility
    updateAuthUI();
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                navigateToPage(page);

                // Hide offcanvas if it exists
                const offcanvasElement = document.getElementById('offcanvasNavbar');
                if (offcanvasElement) {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                    if (bsOffcanvas) bsOffcanvas.hide();
                }

                // Hide desktop collapse if it exists
                const desktopNav = document.getElementById('desktopNavbarNav');
                if (desktopNav) {
                    const bsCollapse = bootstrap.Collapse.getInstance(desktopNav);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });

    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'dark') {
                enableDarkMode();
            } else {
                enableLightMode();
            }
            localStorage.setItem('theme', e.target.value);
        });
    });

    // Quick add task
    if (saveTaskBtn) saveTaskBtn.addEventListener('click', addNewTask);

    // Calendar navigation
    if (document.getElementById('prevMonthBtn')) document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
    if (document.getElementById('nextMonthBtn')) document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));

    // AI Chatbot Initialization
    initAIChatbot();
    initAssessmentSystem();

    // Schedule planner
    if (clearScheduleBtn) clearScheduleBtn.addEventListener('click', clearSchedule);
    if (generateScheduleBtn) generateScheduleBtn.addEventListener('click', generateAISchedule);
    if (loadDemoSuggestions) loadDemoSuggestions.addEventListener('click', loadDemoAISuggestions);

    // Sound options
    document.querySelectorAll('[data-sound]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-sound]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Resources
    if (uploadForm) uploadForm.addEventListener('submit', handleResourceUpload);

    // Login functionality
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            navigateToPage('login');
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // If they already have a profile, they can log in
            if (localStorage.getItem('studySmartProfile')) {
                state.isLoggedIn = true;
                localStorage.setItem('studySmartLoggedIn', 'true');
                alert('Login successful! Welcome back.');
                navigateToPage('dashboard');
            } else {
                alert('No profile found. Please sign up first and complete your profile.');
                navigateToPage('signup');
            }
        });
    }

    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signUpEmail').value;
            // Set temporary registration state
            state.isRegistrationProcess = true;
            document.getElementById('email').value = email; // Pre-fill profile email

            alert('Account created! Now, please complete your profile to unlock all features.');
            navigateToPage('profile');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.isLoggedIn = false;
            localStorage.setItem('studySmartLoggedIn', 'false');
            alert('You have been logged out.');
            navigateToPage('home');
        });
    }

    // Profile photo upload
    const photoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('photoPreview');
    const placeholderIcon = document.getElementById('photoPlaceholderIcon');

    if (photoInput) {
        photoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const base64 = event.target.result;
                    photoPreview.src = base64;
                    photoPreview.style.display = 'block';
                    placeholderIcon.style.display = 'none';

                    // Also update card immediately for preview
                    const cardPic = document.getElementById('cardProfilePic');
                    if (cardPic) cardPic.src = base64;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateProfileIDCard();
        });
    }
}

// Navigation between pages
function navigateToPage(page) {
    // Feature gating: check if user is logged in
    const protectedPages = ['dashboard', 'schedule', 'resources', 'analytics', 'profile', 'ai-chatbot'];

    // Exception for profile page during registration
    if (page === 'profile' && state.isRegistrationProcess) {
        // Allow access
    } else if (protectedPages.includes(page) && !state.isLoggedIn) {
        alert('Access denied. Please log in or sign up to access this feature.');
        navigateToPage('login');
        return;
    }

    // Redirect logged in users away from auth pages
    if ((page === 'login' || page === 'signup') && state.isLoggedIn) {
        navigateToPage('dashboard');
        return;
    }

    // Hide all pages
    pageContainers.forEach(container => {
        container.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) targetPage.classList.add('active');

    // Update state
    state.currentPage = page;

    // Update active nav link
    setActiveNavLink();

    // Update Auth UI
    updateAuthUI();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Special initialization for specific pages
    if (page === 'dashboard') {
        generateCalendar();
    } else if (page === 'analytics') {
        // Delay slightly to ensure container is visible
        setTimeout(initializeCharts, 100);
    }
}

// Update UI based on auth status
function updateAuthUI() {
    const protectedPages = ['dashboard', 'schedule', 'resources', 'analytics', 'profile'];
    const logoutBtn = document.getElementById('logoutBtn');
    const loginMenuRow = document.getElementById('authMenuRow');

    // Protected menu links
    document.querySelectorAll('.nav-box[data-page]').forEach(link => {
        const page = link.getAttribute('data-page');
        if (protectedPages.includes(page)) {
            link.style.display = state.isLoggedIn ? 'flex' : 'none';
        }
    });

    // Logout Button
    if (logoutBtn) logoutBtn.style.display = state.isLoggedIn ? 'flex' : 'none';

    // Login Row (Greeting and CTAs) - Only show if logged in
    if (loginMenuRow) loginMenuRow.style.setProperty('display', state.isLoggedIn ? 'flex' : 'none', 'important');
}

// Set active navigation link
function setActiveNavLink() {
    document.querySelectorAll('.nav-link-item, .nav-link, .nav-box').forEach(link => {
        const page = link.getAttribute('data-page');
        if (page === state.currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Theme management
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    updateTheme();
}

function updateTheme() {
    if (state.isDarkMode) {
        enableDarkMode();
        // Update radio buttons
        const darkRadio = document.getElementById('darkTheme');
        if (darkRadio) darkRadio.checked = true;
    } else {
        enableLightMode();
        // Update radio buttons
        const lightRadio = document.getElementById('lightTheme');
        if (lightRadio) lightRadio.checked = true;
    }

    // Re-initialize charts to update colors if on analytics page
    if (state.currentPage === 'analytics') {
        initializeCharts();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    state.isDarkMode = true;
    localStorage.setItem('theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    // Update radio buttons
    const darkRadio = document.getElementById('darkTheme');
    if (darkRadio) darkRadio.checked = true;
}

function enableLightMode() {
    document.body.classList.remove('dark-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    state.isDarkMode = false;
    localStorage.setItem('theme', 'light');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    // Update radio buttons
    const lightRadio = document.getElementById('lightTheme');
    if (lightRadio) lightRadio.checked = true;
}

// Calendar functions
// Calendar functions
function generateCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';

    // Add headers
    const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    headers.forEach(h => {
        const hDiv = document.createElement('div');
        hDiv.classList.add('calendar-day-header');
        hDiv.textContent = h;
        calendarGrid.appendChild(hDiv);
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'other-month');
        calendarGrid.appendChild(emptyDiv);
    }

    // Add cells for each day of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.innerHTML = `<span class="fw-bold">${day}</span>`;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.dataset.date = dateStr;

        // Click to add reminder
        dayDiv.onclick = () => openReminderModal(dateStr);

        // Add reminders for this day
        const dayReminders = state.reminders.filter(r => r.date === dateStr);
        dayReminders.forEach(r => {
            const rDiv = document.createElement('div');
            rDiv.classList.add('calendar-event');
            rDiv.textContent = r.title;
            rDiv.dataset.type = r.type;
            dayDiv.appendChild(rDiv);
        });

        // Highlight today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        calendarGrid.appendChild(dayDiv);
    }

    // Fill the rest of the grid to make it a rectangle
    const totalCells = startingDay + daysInMonth;
    const paddingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let i = 0; i < paddingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'other-month');
        calendarGrid.appendChild(emptyDiv);
    }
}

function openReminderModal(date) {
    if (typeof bootstrap !== 'undefined') {
        const modalElement = document.getElementById('addReminderModal');
        const modal = new bootstrap.Modal(modalElement);
        document.getElementById('reminderDateInput').value = date;
        modal.show();
    } else {
        const title = prompt(`Add reminder for ${date}:`);
        if (title) {
            saveReminder(date, title, 'General', 'Medium');
        }
    }
}

const saveReminderBtn = document.getElementById('saveReminderBtn');
if (saveReminderBtn) {
    saveReminderBtn.onclick = () => {
        const date = document.getElementById('reminderDateInput').value;
        const title = document.getElementById('reminderTitle').value;
        const type = document.getElementById('reminderType').value;
        const priority = document.getElementById('reminderPriority').value;

        if (!title) {
            alert('Please enter a title for the reminder.');
            return;
        }

        saveReminder(date, title, type, priority);

        const modalElement = document.getElementById('addReminderModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        document.getElementById('reminderForm').reset();
    };
}

function saveReminder(date, title, type, priority) {
    state.reminders.push({ date, title, type, priority, status: 'Upcoming' });
    localStorage.setItem('reminders', JSON.stringify(state.reminders));

    generateCalendar();
    populateDeadlinesTable();
    checkRemindersForToday();
}

function checkRemindersForToday() {
    const today = new Date().toISOString().split('T')[0];
    const todaysReminders = state.reminders.filter(r => r.date === today);
    const notificationArea = document.getElementById('notification-area');

    if (notificationArea) {
        notificationArea.innerHTML = '';
        if (todaysReminders.length > 0) {
            todaysReminders.forEach(r => {
                const toast = document.createElement('div');
                toast.className = 'alert alert-warning alert-dismissible fade show shadow-lg mb-2';
                toast.innerHTML = `
                    <strong>Today's Reminder:</strong> ${r.title} (${r.type})
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                notificationArea.appendChild(toast);
            });
        }
    }
}

function changeMonth(direction) {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + direction);
    generateCalendar();
}

// Tasks and deadlines
function populateDeadlinesTable() {
    if (!deadlinesTable) return;
    deadlinesTable.innerHTML = '';

    const allDeadlines = [
        ...state.tasks.map(t => ({ ...t, date: t.dueDate, source: 'Task' })),
        ...state.reminders.map(r => ({ ...r, source: r.type }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (allDeadlines.length === 0) {
        deadlinesTable.innerHTML = '<tr><td colspan="5" class="text-center p-3 text-muted">No upcoming deadlines found. Click a date on the calendar to add a reminder!</td></tr>';
        return;
    }

    allDeadlines.forEach(item => {
        const row = document.createElement('tr');

        // Priority badge color
        let priorityClass = '';
        const priority = (item.priority || 'medium').toLowerCase();
        switch (priority) {
            case 'high': priorityClass = 'bg-danger text-white'; break;
            case 'medium': priorityClass = 'bg-warning text-dark'; break;
            case 'low': priorityClass = 'bg-success text-white'; break;
            default: priorityClass = 'bg-secondary text-white';
        }

        // Status badge
        let statusBadge = item.status === 'Completed' || item.status === 'completed'
            ? '<span class="badge bg-success">Completed</span>'
            : '<span class="badge bg-secondary">Upcoming</span>';

        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.source}</td>
            <td>${item.date}</td>
            <td><span class="badge ${priorityClass}">${item.priority}</span></td>
            <td>${statusBadge}</td>
        `;

        deadlinesTable.appendChild(row);
    });
}

function updateDashboardStats() {
    // Stats elements removed to focus on Google Calendar style reminder dashboard
}

function addNewTask() {
    const title = document.getElementById('taskTitle').value;
    const subject = document.getElementById('taskSubject').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;

    if (!title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    // Add task to state
    const newTask = {
        id: state.tasks.length + 1,
        title,
        subject,
        dueDate,
        priority,
        status: 'pending'
    };

    state.tasks.push(newTask);

    // Update table
    populateDeadlinesTable();

    // Close modal and reset form
    const modalElement = document.getElementById('addTaskModal');
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
    }
    const taskForm = document.getElementById('taskForm');
    if (taskForm) taskForm.reset();

    // Show confirmation
    alert('Task added successfully!');
}

// Schedule planner functions
function makeScheduleItemsDraggable() {
    if (!scheduleItems) return;
    const items = scheduleItems.querySelectorAll('.schedule-item');

    items.forEach(item => {
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    scheduleItems.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        if (!draggingItem) return;
        const siblings = [...scheduleItems.querySelectorAll('.schedule-item:not(.dragging)')];

        const nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
        });

        scheduleItems.insertBefore(draggingItem, nextSibling);
    });
}

function clearSchedule() {
    if (confirm('Are you sure you want to clear your schedule?')) {
        if (scheduleItems) {
            scheduleItems.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-magic fa-4x text-muted mb-3 opacity-25"></i>
                    <p class="text-muted fs-5">Ready for Analysis</p>
                    <p class="small text-muted px-4">Fill out the form on the left to generate your AI-optimized study plan.</p>
                </div>
            `;
        }
        const suggestionsCard = document.getElementById('suggestionsCard');
        if (suggestionsCard) suggestionsCard.style.display = 'none';
        if (clearScheduleBtn) clearScheduleBtn.style.display = 'none';
    }
}

function generateAISchedule() {
    // This would normally call the Gemini API
    // For demo purposes, we'll simulate an AI response

    const course = document.getElementById('courseName').value;
    const taskType = document.getElementById('assignmentType').value;
    const dueDate = document.getElementById('dueDate').value;
    const hours = document.getElementById('studyHours').value;

    if (!course || !dueDate || !hours) {
        alert('Please fill in all required fields');
        return;
    }

    if (hours < 0) {
        alert('Study hours cannot be negative');
        return;
    }

    // Show loading state
    if (generateScheduleBtn) {
        generateScheduleBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Generating...';
        generateScheduleBtn.disabled = true;
    }

    // Simulate API call delay
    setTimeout(() => {
        // Check for uploaded notes or pasted text
        const hasUploadedNotes = noteUpload && noteUpload.files.length > 0;
        const pastedNotes = document.getElementById('notes').value;
        const noteAction = hasUploadedNotes ? `Analyzing uploaded notes...` : `Analyzing pasted content...`;

        // Create new schedule item
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item mb-3';
        scheduleItem.setAttribute('draggable', 'true');

        // Priority badge
        const priority = document.getElementById('priority').value;
        let priorityBadge = '';
        switch (priority) {
            case 'high': priorityBadge = '<span class="badge bg-danger">High</span>'; break;
            case 'medium': priorityBadge = '<span class="badge bg-warning text-dark">Medium</span>'; break;
            case 'low': priorityBadge = '<span class="badge bg-success">Low</span>'; break;
            case 'urgent': priorityBadge = '<span class="badge bg-danger">Urgent</span>'; break;
        }

        // Study Day and Time
        const selectedDate = document.getElementById('studyDay').value;
        const selectedTime = document.getElementById('studyTime').value;
        const autoSuggest = document.getElementById('autoTimeSuggest').checked;

        let finalTimeDisplay = selectedTime;
        let finalDayDisplay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Logic check for priority vs time
        if (autoSuggest) {
            // Priority-based adjustment (Mocking "Optimal" suggestion)
            if (priority === 'high' || priority === 'urgent') {
                finalTimeDisplay = "06:00 AM (AI Optimized for Focus)";
            } else if (priority === 'low') {
                finalTimeDisplay = "04:00 PM (AI Optimized for Energy)";
            }
        }

        scheduleItem.innerHTML = `
            <div class="d-flex justify-content-between">
                <h6>${course} ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}</h6>
                <small class="text-muted">${hours} hrs</small>
            </div>
            <p class="mb-1">${hasUploadedNotes ? 'Content from uploaded notes analyzed' : pastedNotes || 'No additional notes'}</p>
            <div class="d-flex justify-content-between">
                <small><i class="fas fa-calendar-alt me-1"></i> ${finalDayDisplay}, ${finalTimeDisplay}</small>
                ${priorityBadge}
            </div>
        `;

        // Show clear button and suggestions card
        const suggestionsCard = document.getElementById('suggestionsCard');
        const clearBtn = document.getElementById('clearScheduleBtn');
        const quizSection = document.getElementById('quizSection');

        if (clearBtn) clearBtn.style.display = 'block';
        if (suggestionsCard) suggestionsCard.style.display = 'block';

        // Generate Quiz from notes
        if (quizSection) {
            quizSection.style.display = 'block';
            generateMCQs(course, hasUploadedNotes || pastedNotes);
        }

        // Add to schedule
        if (scheduleItems) {
            // Clear placeholder
            if (scheduleItems.querySelector('.text-muted')) {
                scheduleItems.innerHTML = '';
            }
            scheduleItems.appendChild(scheduleItem);
        }

        // Make draggable
        makeScheduleItemsDraggable();

        // Show AI suggestions specific to full schedule prep
        showAISuggestions(course, taskType, hours, priority, hasUploadedNotes || pastedNotes, selectedTime, autoSuggest);

        // Reset button
        if (generateScheduleBtn) {
            generateScheduleBtn.innerHTML = '<i class="fas fa-robot me-2"></i> Generate AI Schedule';
            generateScheduleBtn.disabled = false;
        }
    }, 1500);
}

function showAISuggestions(course, taskType, hours, priority, hasNotes, manualTime, isAuto) {
    const suggestions = document.getElementById('aiSuggestions');
    if (!suggestions) return;

    let timeInsight = '';
    if (isAuto) {
        timeInsight = `<p class="badge bg-info mt-2"><i class="fas fa-magic me-1"></i> AI Insight: Your highest concentration is usually recorded at ${priority === 'high' ? '6:00 AM' : '4:00 PM'}. Schedule adjusted.</p>`;
    } else {
        timeInsight = `<p class="badge bg-secondary mt-2"><i class="fas fa-clock me-1"></i> Following your manual slot: ${manualTime}</p>`;
    }

    let strategyContent = '';
    if (hasNotes) {
        strategyContent = `
            <h6 class="mt-3 text-primary"><i class="fas fa-book-reader me-2"></i> How to Read & Prepare Based on Your Notes</h6>
            ${timeInsight}
            <p>Your notes for <strong>${course}</strong> have been analyzed. Here is how you should tackle this content:</p>
            <ul>
                <li><strong>Skim First:</strong> Spend 10 minutes scanning headings and summaries in your notes to get the big picture.</li>
                <li><strong>Active Recall:</strong> After reading a section, close your notes and write down 3 key concepts from memory.</li>
                <li><strong>Feynman Technique:</strong> Explain the most complex part of your notes to an imaginary beginner to ensure deep understanding.</li>
                <li><strong>Preparation:</strong> Organized your study space by keeping only the related reference materials and your notes visible.</li>
            </ul>

            <h6 class="mt-3 text-primary"><i class="fas fa-calendar-day me-2"></i> How to Prepare for Your Scheduled Day</h6>
            <p>To master the <strong>${hours} hours</strong> of content expected for this task:</p>
            <ul>
                <li><strong>Pre-Study Ritual:</strong> Review the index of your uploaded notes 5 minutes before your scheduled start time of ${manualTime}.</li>
                <li><strong>The 50/10 Rule:</strong> Study for 50 minutes, then take a 10-minute break for peak performance.</li>
                <li><strong>Eat the Frog:</strong> Since this is a <strong>${priority}</strong> task, completing it during your ${manualTime} block will reduce academic stress significantly.</li>
            </ul>
        `;
    } else {
        strategyContent = `
            <h6><i class="fas fa-lightbulb me-2"></i> AI Suggestions for Your Study Plan</h6>
            <hr style="opacity: 0.2;">
            ${timeInsight}
            <ul>
                <li>Based on the <strong>${priority}</strong> priority, consider starting this task at least 3 days before the due date.</li>
                <li>Break down the ${hours} hours into ${Math.ceil(hours / 2)} sessions of 2 hours each for better retention.</li>
                <li>For <strong>${course}</strong>, try to study during your peak focus hours (morning is recommended for technical subjects).</li>
                <li>Use the Pomodoro technique (25 min focus, 5 min break) to maintain concentration during study sessions.</li>
            </ul>
        `;
    }

    const suggestionsHTML = `
        <div class="alert" style="background-color: var(--accent-blue); color: var(--dark-blue); border: 1px solid var(--primary-blue); border-radius: 15px;">
            ${strategyContent}
            <p class="mb-0 mt-3 pt-2 border-top"><strong>Overall Goal:</strong> Complete ${hours} hours of focused work with active recall strategies.</p>
        </div>
    `;

    suggestions.innerHTML = suggestionsHTML;
}

function loadDemoAISuggestions() {
    const suggestions = document.getElementById('aiSuggestions');
    if (!suggestions) return;

    // Show suggestions card if hidden
    const suggestionsCard = document.getElementById('suggestionsCard');
    if (suggestionsCard) suggestionsCard.style.display = 'block';

    suggestions.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-robot me-2"></i> AI-Powered Study Schedule Suggestions</h6>
            <hr>
            <p>Based on your courses and deadlines, here's an optimized study plan generated by AI:</p>
            
            <h6 class="mt-3">Week 1 Focus:</h6>
            <ul>
                <li><strong>Mathematics (Calculus):</strong> 2 hours daily, focusing on derivative applications</li>
                <li><strong>Computer Science:</strong> 1.5 hours daily, database design and SQL queries</li>
                <li><strong>Physics:</strong> 1 hour daily, quantum mechanics principles</li>
            </ul>
            
            <h6 class="mt-3">Study Strategies:</h6>
            <ul>
                <li>Use spaced repetition for formula memorization</li>
                <li>Practice active recall with past exam questions</li>
                <li>Schedule difficult topics during your peak energy times</li>
                <li>Take regular breaks to avoid burnout (5 min every 25 min)</li>
            </ul>
            
            <h6 class="mt-3">Exam Preparation Timeline:</h6>
            <ul>
                <li>3 weeks before: Complete all reading materials</li>
                <li>2 weeks before: Practice problems and past papers</li>
                <li>1 week before: Review weak areas and create summary sheets</li>
                <li>2 days before: Final review and relaxation</li>
            </ul>
        </div>
    `;
}



// Resources functions
function renderResources() {
    if (!resourcesList) return;
    resourcesList.innerHTML = '';

    if (state.resources.length === 0) {
        resourcesList.innerHTML = '<div class="col-12 text-center p-5"><p class="text-muted">No resources uploaded yet. Start by adding notes, links, or documents above.</p></div>';
        return;
    }

    state.resources.forEach(resource => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        // Icon based on type
        let icon = 'file';
        switch (resource.type) {
            case 'pdf': icon = 'file-pdf'; break;
            case 'doc': icon = 'file-word'; break;
            case 'ppt': icon = 'file-powerpoint'; break;
            case 'image': icon = 'file-image'; break;
            case 'video': icon = 'file-video'; break;
            case 'link': icon = 'link'; break;
        }

        // Tags HTML
        let tagsHTML = '';
        resource.tags.forEach(tag => {
            tagsHTML += `<span class="tag">${tag}</span>`;
        });

        col.innerHTML = `
            <div class="card resource-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title">${resource.name}</h5>
                        <i class="fas fa-${icon} fa-2x text-primary-blue"></i>
                    </div>
                    <p class="card-text">${resource.description}</p>
                    <div class="mb-3">
                        ${tagsHTML}
                    </div>
                    <div class="resource-actions">
                        <small class="text-muted">${resource.date}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadResource(${resource.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteResource(${resource.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resourcesList.appendChild(col);
    });
}

function handleResourceUpload(e) {
    e.preventDefault();

    const name = document.getElementById('resourceName').value;
    const type = document.getElementById('resourceType').value;
    const subject = document.getElementById('resourceSubject').value;
    const tags = document.getElementById('resourceTags').value.split(',').map(tag => tag.trim());
    const description = document.getElementById('resourceDescription').value;

    if (!name) {
        alert('Please enter a resource name');
        return;
    }

    // Create new resource
    const newResource = {
        id: state.resources.length + 1,
        name,
        type,
        subject,
        tags: tags.filter(tag => tag !== ''),
        description,
        date: new Date().toISOString().split('T')[0]
    };

    // Add to state
    state.resources.push(newResource);

    // Re-render resources
    renderResources();

    // Reset form
    if (uploadForm) uploadForm.reset();

    // Show confirmation
    alert('Resource added successfully!');
}

// These functions would be implemented in a full application
function downloadResource(id) {
    alert(`Resource ${id} download would start in a full implementation.`);
}

function deleteResource(id) {
    // Deletion disabled as per academic record requirements
    alert('System Note: Resource deletion is disabled to maintain a complete academic history.');
}

// Charts initialization
function initializeCharts() {
    const chartTextColor = state.isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = state.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Destroy existing charts to prevent duplication
    Object.values(state.charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Weekly Study Hours Chart
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
        state.charts.weekly = new Chart(weeklyCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Hours',
                    data: [3.5, 4.2, 2.8, 5.1, 3.8, 2.5, 4.0],
                    backgroundColor: '#ffcc00',
                    borderColor: '#e6b800',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: chartTextColor } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: chartTextColor },
                        title: { display: true, text: 'Hours', color: chartTextColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartTextColor }
                    }
                }
            }
        });
    }

    // Subject Distribution Chart
    const subjectCtx = document.getElementById('subjectChart');
    if (subjectCtx) {
        state.charts.subject = new Chart(subjectCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Mathematics', 'Computer Science', 'Physics', 'English', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#ffcc00',
                        '#e6b800',
                        '#facc15',
                        '#fde047',
                        '#fef08a'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: chartTextColor }
                    }
                }
            }
        });
    }

    // Monthly Progress Chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        state.charts.monthly = new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Study Hours',
                        data: [18, 22, 24, 26],
                        borderColor: '#ffcc00',
                        backgroundColor: 'rgba(255, 204, 0, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Tasks Completed',
                        data: [12, 15, 18, 20],
                        borderColor: '#facc15',
                        backgroundColor: 'rgba(250, 204, 21, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: chartTextColor } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: chartTextColor }
                    },
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: chartTextColor }
                    }
                }
            }
        });
    }

    // Performance Report Chart (Analytics Page)
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        const labels = state.quizHistory.length > 0 ? state.quizHistory.map((_, i) => `Test ${i + 1}`) : ['Start'];
        const scores = state.quizHistory.length > 0 ? state.quizHistory.map(q => q.score) : [0];

        state.charts.performance = new Chart(perfCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Proficiency Score',
                    data: scores,
                    borderColor: '#ffcc00',
                    backgroundColor: 'rgba(255, 204, 0, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#ffcc00'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: chartTextColor } },
                    x: { ticks: { color: chartTextColor } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Profile Performance Chart (Condensed)
    const profilePerfCtx = document.getElementById('profilePerformanceChart');
    if (profilePerfCtx && state.quizHistory.length > 0) {
        document.getElementById('profileReportPlaceholder').style.display = 'none';
        profilePerfCtx.style.display = 'block';

        state.charts.profilePerf = new Chart(profilePerfCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: state.quizHistory.slice(-5).map((h, i) => h.subject.substring(0, 3)),
                datasets: [{
                    data: state.quizHistory.slice(-5).map(h => h.score),
                    backgroundColor: '#ffcc00',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false, max: 100 },
                    x: { ticks: { color: chartTextColor, font: { size: 10 } } }
                }
            }
        });
    }
}

// AI MCQ Generation & Handling
function generateMCQs(subject, content) {
    const container = document.getElementById('quizContainer');
    const qCount = document.getElementById('questionCount');
    const quizTitle = document.getElementById('quizTitle');

    if (!container) return;

    container.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div><p class="mt-2">AI is generating unique questions from your notes...</p></div>';

    // Simulate complex AI generation of 20-40 questions
    setTimeout(() => {
        const count = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
        state.currentQuestions = [];

        for (let i = 1; i <= count; i++) {
            const options = ["Option A (Correct Answer Dynamic)", "Option B (Plausible Distractor)", "Option C (Related Concept)", "Option D (Incorrect Path)"];
            // Shuffle options
            const shuffled = options.sort(() => Math.random() - 0.5);
            const correctIndex = shuffled.indexOf("Option A (Correct Answer Dynamic)");

            state.currentQuestions.push({
                id: i,
                text: `Que ${i}: Based on your ${subject} notes, analyze the core principle of ${i % 3 === 0 ? 'Theoretical Analysis' : 'Practical Application'}?`,
                options: shuffled,
                correct: correctIndex,
                answered: null
            });
        }

        quizTitle.innerHTML = `<i class="fas fa-brain me-2"></i> ${subject} Mastery Quiz`;
        qCount.textContent = `0/${count} Questions`;
        renderQuiz();
    }, 2000);
}

function renderQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    container.innerHTML = state.currentQuestions.map(q => `
        <div class="quiz-question border-bottom py-3">
            <p class="fw-bold mb-3">${q.text}</p>
            <div class="row g-2">
                ${q.options.map((opt, idx) => `
                    <div class="col-md-6">
                        <input type="radio" class="btn-check" name="q${q.id}" id="q${q.id}o${idx}" value="${idx}" autocomplete="off">
                        <label class="btn btn-outline-secondary w-100 text-start py-2" for="q${q.id}o${idx}">
                            ${opt}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Update count on radio click
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            const answered = container.querySelectorAll('input:checked').length;
            document.getElementById('questionCount').textContent = `${answered}/${state.currentQuestions.length} Questions`;
        });
    });
}

const submitQuizBtn = document.getElementById('submitQuizBtn');
if (submitQuizBtn) {
    submitQuizBtn.onclick = () => {
        const container = document.getElementById('quizContainer');
        const checked = container.querySelectorAll('input:checked');

        if (checked.length < state.currentQuestions.length) {
            if (!confirm(`You have only answered ${checked.length}/${state.currentQuestions.length} questions. Submit anyway?`)) return;
        }

        let correctCount = 0;
        checked.forEach(input => {
            const qId = parseInt(input.name.replace('q', ''));
            const oIdx = parseInt(input.value);
            const question = state.currentQuestions.find(q => q.id === qId);
            if (question && question.correct === oIdx) correctCount++;
        });

        const score = Math.round((correctCount / state.currentQuestions.length) * 100);
        const subjectName = document.getElementById('quizTitle').textContent.trim();

        // Save to History (Permanent - No delete implemented)
        state.quizHistory.push({
            date: new Date().toLocaleDateString(),
            subject: subjectName,
            score: score,
            totalQ: state.currentQuestions.length
        });

        // UI Feedback
        container.innerHTML = `
            <div class="text-center p-5 animated pulse">
                <i class="fas fa-trophy fa-4x text-warning mb-3"></i>
                <h2>Quiz Submitted!</h2>
                <h1 class="display-3 fw-bold text-primary">${score}%</h1>
                <p class="lead">Great effort! Your score has been added to your Permanent Academic Record.</p>
                <div class="alert alert-info d-inline-block">
                    Questions: ${correctCount}/${state.currentQuestions.length} Correct
                </div>
            </div>
        `;

        document.getElementById('submitQuizBtn').style.display = 'none';

        // Update Charts
        updatePerformanceMetrics();
    };
}

function updatePerformanceMetrics() {
    const avgScoreDisplay = document.getElementById('avgScoreDisplay');
    const totalQuizzesDisplay = document.getElementById('totalQuizzesDisplay');

    if (state.quizHistory.length === 0) return;

    const totalScore = state.quizHistory.reduce((sum, q) => sum + q.score, 0);
    const avgScore = Math.round(totalScore / state.quizHistory.length);

    if (avgScoreDisplay) avgScoreDisplay.textContent = `${avgScore}%`;
    if (totalQuizzesDisplay) totalQuizzesDisplay.textContent = state.quizHistory.length;

    // Save to local storage
    localStorage.setItem('quizHistory', JSON.stringify(state.quizHistory));

    // Refresh ID card if visible to show updated performance
    if (state.profile) updateProfileIDCard(true);

    // Refresh all charts
    initializeCharts();
}

function updateProfileIDCard(isRefresh = false) {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const university = document.getElementById('university').value;
    const studyLevel = document.getElementById('studyField').value;
    const subjects = document.getElementById('subjects').value;
    const photoSrc = document.getElementById('photoPreview').src;

    if (!isRefresh && (!firstName || !lastName || !email || !university || !studyLevel)) {
        alert('Please fill in all required fields to generate your ID card');
        return;
    }

    // Update state if not just refreshing
    if (!isRefresh) {
        state.profile = { firstName, lastName, email, university, studyLevel, subjects, photo: photoSrc };
        localStorage.setItem('studySmartProfile', JSON.stringify(state.profile));
    } else if (state.profile) {
        // Use existing state for refresh
        const p = state.profile;
        document.getElementById('cardFullName').textContent = `${p.firstName} ${p.lastName}`;
        document.getElementById('cardEmail').textContent = p.email;
        document.getElementById('cardUniversity').textContent = p.university;
        document.getElementById('cardStudyLevel').textContent = p.studyLevel;
        document.getElementById('cardMajor').textContent = p.subjects ? p.subjects.split(',')[0].trim() : p.studyLevel;

        // Load Photo into both card and form preview
        if (p.photo && p.photo.startsWith('data:image')) {
            document.getElementById('cardProfilePic').src = p.photo;
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = p.photo;
                preview.style.display = 'block';
                const icon = document.getElementById('photoPlaceholderIcon');
                if (icon) icon.style.display = 'none';
            }
        }
    }

    if (!isRefresh) {
        // Direct update from form
        document.getElementById('cardFullName').textContent = `${firstName} ${lastName}`;
        document.getElementById('cardEmail').textContent = email;
        document.getElementById('cardUniversity').textContent = university;
        document.getElementById('cardStudyLevel').textContent = studyLevel;
        document.getElementById('cardMajor').textContent = subjects ? subjects.split(',')[0].trim() : studyLevel;

        const cardPic = document.getElementById('cardProfilePic');
        if (photoSrc && photoSrc.startsWith('data:image')) {
            cardPic.src = photoSrc;
        }

        // Update Navbar Greeting
        const greeting = document.getElementById('userGreetingName');
        if (greeting) greeting.textContent = firstName;

        // If this was during a fresh signup registration, now enable login
        if (state.isRegistrationProcess) {
            state.isLoggedIn = true;
            state.isRegistrationProcess = false;
            localStorage.setItem('studySmartLoggedIn', 'true');
            alert('Profile updated successfully! All features are now enabled.');
            navigateToPage('dashboard');
        } else {
            alert('Profile updated successfully!');
        }
    } else if (state.profile) {
        // Update Navbar Greeting on refresh/load
        const greeting = document.getElementById('userGreetingName');
        if (greeting) greeting.textContent = state.profile.firstName;
    }

    // Toggle visibility
    document.getElementById('emptyProfilePlaceholder').style.display = 'none';
    document.getElementById('profileIDCard').style.display = 'block';

    if (!isRefresh) {
        alert('Profile updated! Your Student ID has been generated.');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

