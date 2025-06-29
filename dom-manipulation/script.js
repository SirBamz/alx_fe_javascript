// Initial array of quote objects
let quotes = []; // Initialize as empty, will load from local storage

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

// Local Storage Keys
const LOCAL_STORAGE_QUOTES_KEY = 'quotes';
const LOCAL_STORAGE_LAST_CATEGORY_KEY = 'lastSelectedCategory';
const SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY = 'lastViewedQuote';
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL_MS = 60000; // 60 seconds



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
    // If no quotes in local storage, use default quotes
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
      { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
      { text: "The mind is everything. What you think you become.", category: "Mindset" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
      { text: "The best way to predict the future is to create it.", category: "Innovation" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Resilience" }
    ];
    saveQuotes(); // Save default quotes to local storage
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

  quotes.push({ text, category });
  newQuoteText.value = ""; // Clear input field
  newQuoteCategory.value = ""; // Clear input field

  saveQuotes(); // Save updated quotes to local storage
  showMessage("Quote added successfully!", "success");

  // Re-filter and re-render categories to include the new one if it's new
  // Note: filterQuotes will also call showRandomQuote
  filterQuotes(currentCategory); // Re-apply current filter
  populateCategories(); // Update category dropdown
}

/**
 * Filters the quotes array based on the selected category.
 * If category is "All", all quotes are displayed.
 * @param {string} category - The category to filter by.
 */
function filterQuotes(category) {
  currentCategory = category;
  localStorage.setItem(LOCAL_STORAGE_LAST_CATEGORY_KEY, currentCategory);

  if (category === "All") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === category);
  }

  showRandomQuote();
}


/**
 * Populates the category dropdown menu based on the unique categories in the quotes array.
 * Includes an "All Categories" option.
 */
function populateCategories() {
  categoryFilterSelect.innerHTML = ''; // Clear existing buttons

  const categories = ['All', ...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.className = 'category-button';
    if (category === currentCategory) btn.classList.add('active');

    btn.addEventListener('click', () => {
      filterQuotes(category);
      updateCategoryButtonState(category);
    });

    categoryFilterSelect.appendChild(btn);
  });
}

function updateCategoryButtonState(selectedCategory) {
  const buttons = categoryFilterSelect.querySelectorAll('.category-button');
  buttons.forEach(button => {
    if (button.textContent === selectedCategory) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
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
        saveQuotes(); // Save the combined quotes to local storage
        showMessage('Quotes imported successfully!', 'success');
        // Re-populate categories and show a random quote to reflect changes
        filterQuotes(currentCategory); // Apply current filter after import
        populateCategories(); // Update category dropdown with new categories
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

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes); // Add event listener for export button

// Event listener for category filter dropdown
categoryFilterSelect.addEventListener('change', (event) => filterQuotes(event.target.value));


// Initial load
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
});

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length === 0) return;

  let updated = false;

  const localMap = new Map(quotes.map(q => [q.text + q.category, q]));
  const serverMap = new Map(serverQuotes.map(q => [q.text + q.category, q]));

  serverMap.forEach((serverQuote, key) => {
    const localQuote = localMap.get(key);
    if (!localQuote || new Date(serverQuote.updatedAt) > new Date(localQuote.updatedAt || 0)) {
      localMap.set(key, {
        text: serverQuote.text,
        category: serverQuote.category,
        updatedAt: serverQuote.updatedAt
      });
      updated = true;
    }
  });

  quotes = Array.from(localMap.values());
  saveQuotes();

  if (updated) {
    showMessage('Quotes synced from server.', 'success');
    populateCategories();
    filterQuotes(currentCategory);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  const lastQuoteLoaded = loadLastViewedQuote();
  if (!lastQuoteLoaded) filterQuotes(currentCategory);
  createAddQuoteForm();

  // 🔁 Start periodic syncing
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
  syncWithServer(); // Also trigger once on load
});

async function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    showMessage("Please enter both quote text and category.", "error");
    return;
  }

  const newQuote = {
    text,
    category,
    updatedAt: new Date().toISOString()
  };

  quotes.push(newQuote);
  saveQuotes();
  showMessage("Quote added successfully!", "success");

  filterQuotes(currentCategory);
  populateCategories();

  // Post to server
  try {
    await fetch(SERVER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuote)
    });
  } catch (error) {
    console.warn('Could not post to server. Will sync later.', error);
  }

  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

/**
 * Fetches quotes from the server.
 * Returns a Promise that resolves to an array of quotes.
 */
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const quotesFromServer = await response.json();

    // Optional: validate each quote
    return quotesFromServer.filter(q =>
      q && typeof q.text === 'string' &&
      typeof q.category === 'string' &&
      typeof q.updatedAt === 'string'
    );
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    showMessage('Failed to fetch quotes from server.', 'error');
    return [];
  }
}
