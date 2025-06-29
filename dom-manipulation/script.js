// Initial array of quote objects
let quotes = []; // Initialize as empty, will load from local storage

// Simulate server data (this would be fetched from a real backend)
// This array will be updated as local changes are "pushed" to the "server"
let serverQuotes = [
  { text: "The journey of a thousand miles begins with a single step.", category: "Journey" },
  { text: "Believe you can and you're halfway there.", category: "Belief" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Life is what you make it. Always has been, always will be.", category: "Life" },
  { text: "The best revenge is massive success.", category: "Success" }
];

let filteredQuotes = [...quotes]; // Initially, no filter is applied
let currentCategory = "All"; // Track the currently active category, will load from local storage

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteButton = document.getElementById('addQuoteBtn');
const categoryFilterSelect = document.getElementById('categoryFilter'); // Changed to select element
const messageBox = document.getElementById('messageBox');
const exportQuotesButton = document.getElementById('exportQuotesBtn');
const syncNowButton = document.getElementById('syncNowBtn'); // New sync button

// Local Storage Keys
const LOCAL_STORAGE_QUOTES_KEY = 'quotes';
const LOCAL_STORAGE_LAST_CATEGORY_KEY = 'lastSelectedCategory';
const SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY = 'lastViewedQuote';

// Sync interval (e.g., every 10 seconds for demonstration)
const SYNC_INTERVAL = 10000; // 10 seconds


/**
 * Saves the current quotes array to local storage.
 */
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(quotes));
}

/**
 * Loads quotes from local storage when the application initializes.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      // Ensure that loaded quotes have text and category properties
      quotes = quotes.filter(quote => quote.text && quote.category);
    } catch (e) {
      console.error("Error parsing quotes from local storage:", e);
      quotes = []; // Reset if parsing fails
    }
  } else {
    // If no quotes in local storage, initialize with server data
    quotes = [...serverQuotes];
    saveQuotes(); // Save this initial set to local storage
  }

  // Load last selected category from local storage
  const storedCategory = localStorage.getItem(LOCAL_STORAGE_LAST_CATEGORY_KEY);
  currentCategory = storedCategory || "All"; // Default to "All" if not found
}


/**
 * Displays a random quote from the filteredQuotes array in the DOM.
 * If filteredQuotes is empty, it displays a message.
 */
function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `
      <p class="text-red-500 font-bold">No quotes found for this category.</p>
      <span>Please add more quotes or select 'All' categories.</span>
    `;
    // Clear last viewed quote from session storage if no quotes are displayed
    sessionStorage.removeItem(SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY);
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <span>- ${quote.category}</span>
  `;

  // Save the last viewed quote to session storage
  sessionStorage.setItem(SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY, JSON.stringify(quote));
}

/**
 * Adds a new quote to the main quotes array.
 * Validates inputs, clears them, and updates the category filter.
 */
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    showMessage("Please enter both quote text and category.", "error");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote); // Add to local quotes
  serverQuotes.push(newQuote); // Simulate pushing to "server"

  newQuoteText.value = ""; // Clear input field
  newQuoteCategory.value = ""; // Clear input field

  saveQuotes(); // Save updated quotes to local storage
  showMessage("Quote added successfully! Syncing...", "success");

  // Re-filter and re-render categories to include the new one if it's new
  filterQuotes(currentCategory); // Re-apply current filter
  populateCategories(); // Update category dropdown
}

/**
 * Filters the quotes array based on the selected category.
 * If category is "All", all quotes are displayed.
 * @param {string} category - The category to filter by.
 */
function filterQuotes(category) {
  currentCategory = category; // Update the current category tracker
  localStorage.setItem(LOCAL_STORAGE_LAST_CATEGORY_KEY, currentCategory); // Save selected category to local storage

  if (category === "All") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === category);
  }

  // Set the selected value in the dropdown
  categoryFilterSelect.value = currentCategory;

  showRandomQuote(); // Display a random quote from the newly filtered list
}

/**
 * Populates the category dropdown menu based on the unique categories in the quotes array.
 * Includes an "All Categories" option.
 */
function populateCategories() {
  categoryFilterSelect.innerHTML = ''; // Clear existing options

  // Add "All Categories" option
  const allOption = document.createElement('option');
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categoryFilterSelect.appendChild(allOption);

  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categories.sort(); // Sort categories alphabetically

  // Add options for each unique category
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterSelect.appendChild(option);
  });

  // Set the selected option based on currentCategory
  categoryFilterSelect.value = currentCategory;
}

/**
 * Displays a temporary message in the message box.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' to apply appropriate styling.
 */
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = 'message-box'; // Reset class
  if (type === 'success') {
    messageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-400');
  } else if (type === 'error') {
    messageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-400');
  } else if (type === 'info') { // For sync messages
    messageBox.classList.add('bg-blue-100', 'text-blue-800', 'border-blue-400');
  }
  messageBox.style.display = 'block';

  // Hide the message after 3 seconds
  setTimeout(() => {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  }, 3000);
}

/**
 * Sets up the add quote form functionality.
 * This function attaches event listeners to the pre-existing form elements in the HTML.
 */
function createAddQuoteForm() {
  addQuoteButton.addEventListener('click', addQuote);
  messageBox.style.display = 'none'; // Ensure message box is hidden initially
}

/**
 * Exports quotes to a JSON file.
 */
function exportQuotes() {
  if (quotes.length === 0) {
    showMessage("No quotes to export.", "error");
    return;
  }
  const dataStr = JSON.stringify(quotes, null, 2); // Pretty print JSON
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up the URL object
  showMessage("Quotes exported successfully!", "success");
}

/**
 * Imports quotes from a JSON file selected by the user.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      // Validate that importedQuotes is an array and contains objects with text and category
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => q && typeof q.text === 'string' && typeof q.category === 'string')) {
        quotes.push(...importedQuotes); // Add new quotes to existing ones
        // Also add imported quotes to serverQuotes simulation
        serverQuotes.push(...importedQuotes);
        saveQuotes(); // Save the combined quotes to local storage
        showMessage('Quotes imported successfully! Syncing...', 'success');
        // Re-populate categories and show a random quote to reflect changes
        syncQuotesWithServer(); // Trigger a sync after import to resolve any conflicts/duplicates
      } else {
        showMessage('Invalid JSON format for quotes. Please ensure it\'s an array of objects with "text" and "category" properties.', 'error');
      }
    } catch (error) {
      console.error("Error importing JSON file:", error);
      showMessage('Error importing quotes. Please ensure it\'s a valid JSON file.', 'error');
    }
    event.target.value = ''; // Clear the file input after import
  };
  fileReader.onerror = function() {
    showMessage('Failed to read file.', 'error');
  };
  fileReader.readAsText(file);
}

/**
 * Loads the last viewed quote from session storage and displays it.
 */
function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem(SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY);
  if (lastQuote) {
    try {
      const parsedQuote = JSON.parse(lastQuote);
      if (parsedQuote.text && parsedQuote.category) {
        quoteDisplay.innerHTML = `
          <p>"${parsedQuote.text}"</p>
          <span>- ${parsedQuote.category}</span>
        `;
        return true; // Indicate that a quote was loaded
      }
    } catch (e) {
      console.error("Error parsing last viewed quote from session storage:", e);
    }
  }
  return false; // Indicate no quote was loaded
}

/**
 * Simulates syncing local quotes with a server.
 * Implements server precedence for conflict resolution.
 */
function syncQuotesWithServer() {
  showMessage("Syncing with server...", "info");

  // Step 1: Simulate fetching server data (serverQuotes is our mock server)
  const latestServerQuotes = JSON.parse(JSON.stringify(serverQuotes)); // Deep copy to simulate fetch

  let newMergedQuotes = [];
  let changesDetected = false;

  // Add all server quotes to the merged set first (server precedence)
  newMergedQuotes = [...latestServerQuotes];

  // Add local quotes that are not present in the server's data
  quotes.forEach(localQuote => {
    const isPresentInServer = latestServerQuotes.some(serverQ =>
      serverQ.text === localQuote.text && serverQ.category === localQuote.category
    );
    if (!isPresentInServer) {
      newMergedQuotes.push(localQuote); // Add new local quote
      changesDetected = true;
    }
  });

  // Check if current local quotes are different from newMergedQuotes
  // This is a simplified check and might not catch all discrepancies,
  // but covers added/removed items.
  if (quotes.length !== newMergedQuotes.length || JSON.stringify(quotes) !== JSON.stringify(newMergedQuotes)) {
    quotes = newMergedQuotes; // Update local quotes
    serverQuotes = newMergedQuotes; // Update "server" with the merged set (simulates push back)
    saveQuotes(); // Persist changes to local storage
    populateCategories(); // Update category dropdown
    filterQuotes(currentCategory); // Re-apply current filter and display random quote
    showMessage("Sync complete! Data updated.", "success");
  } else {
    showMessage("Sync complete! No changes found.", "info");
  }
}


// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes); // Add event listener for export button
syncNowButton.addEventListener('click', syncQuotesWithServer); // Event listener for manual sync

// Event listener for category filter dropdown
categoryFilterSelect.addEventListener('change', (event) => filterQuotes(event.target.value));


// Initial load and periodic sync setup
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes(); // Load quotes and last selected category from local storage
  populateCategories(); // Populate category dropdown based on loaded quotes and active category

  const lastQuoteLoaded = loadLastViewedQuote(); // Try to load last viewed quote from session storage
  if (!lastQuoteLoaded) {
    // If no last viewed quote in session storage, display a random quote
    // filtered by the last selected category (which was loaded in loadQuotes)
    filterQuotes(currentCategory); // This will also call showRandomQuote
  }
  createAddQuoteForm(); // Set up the add quote form

  // Start periodic sync
  setInterval(syncQuotesWithServer, SYNC_INTERVAL);
});
