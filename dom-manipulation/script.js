// Initial array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
  { text: "The mind is everything. What you think you become.", category: "Mindset" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "The best way to predict the future is to create it.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Resilience" }
];

let filteredQuotes = [...quotes]; // Initially, no filter is applied
let currentCategory = "All"; // Track the currently active category

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteButton = document.getElementById('addQuoteBtn');
const categoryFilterContainer = document.getElementById('categoryFilter');
const messageBox = document.getElementById('messageBox');

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
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <span>- ${quote.category}</span>
  `;
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

  showMessage("Quote added successfully!", "success");

  // Re-filter and re-render categories to include the new one if it's new
  filterQuotes(currentCategory); // Re-apply current filter
  renderCategoryButtons();
}

/**
 * Filters the quotes array based on the selected category.
 * If category is "All", all quotes are displayed.
 * @param {string} category - The category to filter by.
 */
function filterQuotes(category) {
  currentCategory = category; // Update the current category tracker

  if (category === "All") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === category);
  }

  // Update active button styling
  document.querySelectorAll('.category-button').forEach(button => {
    if (button.textContent === category) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  showRandomQuote(); // Display a random quote from the newly filtered list
}

/**
 * Renders category buttons based on the unique categories in the quotes array.
 * Includes an "All" button.
 */
function renderCategoryButtons() {
  categoryFilterContainer.innerHTML = ''; // Clear existing buttons

  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categories.sort(); // Sort categories alphabetically

  // Add "All" button
  const allButton = document.createElement('button');
  allButton.textContent = "All";
  allButton.classList.add('category-button');
  if (currentCategory === "All") {
    allButton.classList.add('active');
  }
  allButton.addEventListener('click', () => filterQuotes("All"));
  categoryFilterContainer.appendChild(allButton);

  // Add buttons for each unique category
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.classList.add('category-button');
    if (currentCategory === category) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => filterQuotes(category));
    categoryFilterContainer.appendChild(button);
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


// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
addQuoteButton.addEventListener('click', addQuote);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryButtons(); // Render category buttons on page load
  showRandomQuote(); // Display an initial random quote
});
