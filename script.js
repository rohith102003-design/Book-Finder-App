document.getElementById("searchBtn").addEventListener("click", searchBooks);

async function searchBooks() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // clear previous results

  if (!query) {
    resultsDiv.innerHTML = "<p>Please enter a book title.</p>";
    return;
  }

  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.docs.length === 0) {
    resultsDiv.innerHTML = "<p>No books found.</p>";
    return;
  }

  data.docs.slice(0, 12).forEach(book => {
    const title = book.title || "Unknown Title";
    const author = book.author_name ? book.author_name.join(", ") : "Unknown Author";
    const year = book.first_publish_year || "N/A";
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/150x220?text=No+Cover";

    const bookDiv = document.createElement("div");
    bookDiv.classList.add("book");

    bookDiv.innerHTML = `
      <img src="${cover}" alt="${title}">
      <h3>${title}</h3>
      <p><strong>Author:</strong> ${author}</p>
      <p><strong>Year:</strong> ${year}</p>
    `;

    resultsDiv.appendChild(bookDiv);
  });
}
