// Initial array of quote objects
let quotes = []; // Initialize as empty, will load from local storage

let filteredQuotes = [...quotes]; // Initially, no filter is applied
let currentCategory = "All"; // Track the currently active category, will load from local storage

// Server sync configuration
const SERVER_API_URL = 'https://your-mockapi-url.com/quotes'; // Replace with your mock API URL
const SYNC_INTERVAL_MS = 60000; // 60 seconds

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

function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      quotes = quotes.filter(quote => quote.text && quote.category);
    } catch (e) {
      console.error("Error parsing quotes from local storage:", e);
      quotes = [];
    }
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Inspiration", updatedAt: new Date().toISOString() },
      { text: "Strive not to be a success, but rather to be of value.", category: "Motivation", updatedAt: new Date().toISOString() },
      { text: "The mind is everything. What you think you become.", category: "Mindset", updatedAt: new Date().toISOString() },
      { text: "Life is what happens when you're busy making other plans.", category: "Life", updatedAt: new Date().toISOString() },
      { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", updatedAt: new Date().toISOString() },
      { text: "The best way to predict the future is to create it.", category: "Innovation", updatedAt: new Date().toISOString() },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Resilience", updatedAt: new Date().toISOString() }
    ];
    saveQuotes();
  }

  const storedCategory = localStorage.getItem(LOCAL_STORAGE_LAST_CATEGORY_KEY);
  currentCategory = storedCategory || "All";
}

function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `
      <p class="text-red-500 font-bold">No quotes found for this category.</p>
      <span>Please add more quotes or select 'All' categories.</span>
    `;
    sessionStorage.removeItem(SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY);
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <span>- ${quote.category}</span>
  `;

  sessionStorage.setItem(SESSION_STORAGE_LAST_VIEWED_QUOTE_KEY, JSON.stringify(quote));
}

async function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
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

  try {
    await fetch(SERVER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuote)
    });
  } catch (error) {
    console.warn('Could not post to server. Will sync later.', error);
  }

  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

function filterQuotes(category) {
  currentCategory = category;
  localStorage.setItem(LOCAL_STORAGE_LAST_CATEGORY_KEY, currentCategory);

  filteredQuotes = category === "All"
    ? [...quotes]
    : quotes.filter(q => q.category === category);

  showRandomQuote();
}

function populateCategories() {
  categoryFilterSelect.innerHTML = '';
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
    button.classList.toggle('active', button.textContent === selectedCategory);
  });
}

function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = 'message-box';
  if (type === 'success') messageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-400');
  if (type === 'error') messageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-400');
  messageBox.style.display = 'block';
  setTimeout(() => {
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  }, 3000);
}

function createAddQuoteForm() {
  addQuoteButton.addEventListener('click', addQuote);
  messageBox.style.display = 'none';
}

function exportQuotes() {
  if (quotes.length === 0) {
    showMessage("No quotes to export.", "error");
    return;
  }
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showMessage("Quotes exported successfully!", "success");
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        showMessage('Quotes imported successfully!', 'success');
        filterQuotes(currentCategory);
        populateCategories();
      } else {
        showMessage('Invalid JSON format for quotes.', 'error');
      }
    } catch (error) {
      console.error("Error importing JSON file:", error);
      showMessage('Error importing quotes.', 'error');
    }
    event.target.value = '';
  };
  fileReader.onerror = function() {
    showMessage('Failed to read file.', 'error');
  };
  fileReader.readAsText(file);
}

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
        return true;
      }
    } catch (e) {
      console.error("Error parsing last viewed quote from session storage:", e);
    }
  }
  return false;
}

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    const serverQuotes = await response.json();
    if (!Array.isArray(serverQuotes)) throw new Error('Invalid server data');

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
  } catch (error) {
    console.error('Failed to sync with server:', error);
    showMessage('Sync error: ' + error.message, 'error');
  }
}

newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes);
categoryFilterSelect.addEventListener('change', (event) => filterQuotes(event.target.value));

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  const lastQuoteLoaded = loadLastViewedQuote();
  if (!lastQuoteLoaded) filterQuotes(currentCategory);
  createAddQuoteForm();
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
  syncWithServer();
});
