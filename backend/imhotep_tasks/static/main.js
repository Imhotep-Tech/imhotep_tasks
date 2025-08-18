// Loading overlay handler
window.addEventListener('load', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'none'; // Hide the overlay after the page loads
});

// Password visibility toggle
function togglePasswordVisibility(passwordFieldId) {
  var passwordField = document.getElementById(passwordFieldId);
  var showPasswordButton = passwordField.nextElementSibling;
  if (passwordField.type === "password") {
      passwordField.type = "text";
      showPasswordButton.textContent = "Hide";
  } else {
      passwordField.type = "password";
      showPasswordButton.textContent = "Show";
  }
}

// Password confirmation validator
function validatePassword() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm_password").value;
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }
    return true;
}

// Dropdown menu toggle
function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.classList.toggle('hidden');
}

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Task form choices management
document.addEventListener('DOMContentLoaded', function() {
    const choicesContainer = document.getElementById('choices-container');
    const addChoiceButton = document.getElementById('add-choice');

    if (addChoiceButton && choicesContainer) {
        addChoiceButton.addEventListener('click', function() {
            const choiceInput = document.createElement('div');
            choiceInput.classList.add('col-span-6', 'sm:col-span-3', 'relative', 'choice-input');
            choiceInput.innerHTML = `
                <label class="block text-sm font-medium text-gray-700"> Choice </label>
                <input
                    type="text"
                    name="choices"
                    class="w-full rounded-lg border-2 border-blue-500 p-4 pe-12 text-sm shadow-sm focus:ring-2 focus:ring-blue-200"
                    placeholder="Choice"
                    required
                />
                <button type="button" class="mt-2 text-red-600 hover:text-red-800 remove-choice">Remove</button>
            `;
            choicesContainer.appendChild(choiceInput);
        });
    }

    if (choicesContainer) {
        choicesContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-choice')) {
                event.target.parentElement.remove();
            }
        });
    }
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('Link copied to clipboard');
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}

// Sidebar navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    
    // Task completion animation
    initializeTaskCompletionAnimation();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const desktopSidebarToggle = document.getElementById('desktopSidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const collapseIcon = document.getElementById('collapseIcon');
    const collapseText = document.getElementById('collapseText');
    const content = document.getElementById('content');
    
    if (!sidebar || !content) return;
    
    let isSidebarCollapsed = false;
    
    // Set initial state based on screen size
    if (window.innerWidth >= 768) {
        // Desktop - show sidebar
        sidebar.style.width = '16rem';
        sidebar.style.transform = 'translateX(0)';
        content.style.marginLeft = '16rem';
    } else {
        // Mobile - hide sidebar
        sidebar.style.width = '16rem';
        sidebar.style.transform = 'translateX(-100%)';
        content.style.marginLeft = '0';
    }
    
    // Mobile toggle functionality
    if (mobileSidebarToggle && sidebarBackdrop) {
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.style.transform = 'translateX(0)';
            sidebarBackdrop.classList.remove('hidden');
            sidebarBackdrop.classList.add('block');
        });
        
        sidebarBackdrop.addEventListener('click', function() {
            sidebar.style.transform = 'translateX(-100%)';
            sidebarBackdrop.classList.add('hidden');
            sidebarBackdrop.classList.remove('block');
        });
    }
    
    // Desktop toggle functionality
    if (desktopSidebarToggle) {
        desktopSidebarToggle.addEventListener('click', function() {
            isSidebarCollapsed = !isSidebarCollapsed;
            
            if (isSidebarCollapsed) {
                // Hide sidebar completely
                sidebar.style.transform = 'translateX(-100%)';
                content.style.marginLeft = '0';
                collapseText.textContent = 'Show Sidebar';
                
                // Add a fixed button to show sidebar again
                let showBtn = document.createElement('button');
                showBtn.id = 'showSidebarBtn';
                showBtn.className = 'fixed top-4 left-4 bg-indigo-800 p-2 rounded-lg text-white shadow-lg z-40';
                showBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                `;
                document.body.appendChild(showBtn);
                
                showBtn.addEventListener('click', function() {
                    sidebar.style.transform = 'translateX(0)';
                    content.style.marginLeft = '16rem';
                    isSidebarCollapsed = false;
                    collapseText.textContent = 'Hide Sidebar';
                    showBtn.remove();
                });
            } else {
                // Show sidebar
                sidebar.style.transform = 'translateX(0)';
                content.style.marginLeft = '16rem';
                collapseText.textContent = 'Hide Sidebar';
                
                // Remove show button if it exists
                const showBtn = document.getElementById('showSidebarBtn');
                if (showBtn) showBtn.remove();
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            // Desktop view
            if (!isSidebarCollapsed) {
                sidebar.style.transform = 'translateX(0)';
                sidebar.style.width = '16rem';
                content.style.marginLeft = '16rem';
            }
            
            // Hide mobile elements
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.add('hidden');
            }
        } else {
            // Mobile view - make sure sidebar is hidden initially
            sidebar.style.transform = 'translateX(-100%)';
            content.style.marginLeft = '0';
        }
    });
}

function initializeTaskCompletionAnimation() {
    const taskItems = document.querySelectorAll('form[action="#"] button[type="submit"]');
    taskItems.forEach(button => {
        button.addEventListener('click', function() {
            const taskItem = this.closest('li');
            const taskText = taskItem.querySelector('p');
            
            if (!this.classList.contains('bg-green-500')) {
                // Visual feedback before form submission
                this.classList.add('bg-green-500', 'border-green-500', 'text-white');
                taskText.classList.add('line-through', 'text-gray-500');
            } else {
                this.classList.remove('bg-green-500', 'border-green-500', 'text-white');
                taskText.classList.remove('line-through', 'text-gray-500');
            }
        });
    });
}