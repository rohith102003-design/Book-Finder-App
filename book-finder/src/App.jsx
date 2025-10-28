import React, { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Star,
  StarOff,
  Loader2,
  Search,
  BookOpen,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added for animation

export default function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortAZ, setSortAZ] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${query}`
      );
      const data = await response.json();
      setBooks(data.docs || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    setLoading(false);
  };

  const toggleFavorite = (book) => {
    const isFav = favorites.some((fav) => fav.key === book.key);
    if (isFav) {
      setFavorites(favorites.filter((fav) => fav.key !== book.key));
    } else {
      setFavorites([...favorites, book]);
    }
  };

  const displayedBooks = showFavorites
    ? favorites
    : sortAZ
    ? [...books].sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    : books;

  return (
    <div
      className={`min-h-screen relative ${
        darkMode ? "bg-[#0d1117] text-white" : "bg-gray-100 text-gray-900"
      } transition-colors`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between px-6 py-5 shadow-md rounded-b-2xl ${
          darkMode
            ? "bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900"
            : "bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-400 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-wide">Book Finder</h1>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition-all ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-100 text-gray-800"
          }`}
        >
          {darkMode ? <Sun /> : <Moon />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      {/* Blur background if modal open */}
      <div className={selectedBook ? "blur-md pointer-events-none" : ""}>
        {/* Search Section */}
        <div className="flex flex-col items-center justify-center mt-10 space-y-4">
          <div className="flex items-center bg-gray-800 dark:bg-gray-700 rounded-full overflow-hidden w-[90%] sm:w-[500px] shadow-lg">
            <Search className="text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search for books, e.g. Harry Potter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow bg-transparent text-white px-3 py-2 focus:outline-none"
            />
            <button
              onClick={searchBooks}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white font-semibold rounded-r-full transition-all"
            >
              Search
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setSortAZ(!sortAZ)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white font-semibold transition-all"
            >
              Sort A–Z
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                showFavorites
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {showFavorites ? <Star /> : <StarOff />}
              Show Favorites Only
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-10 px-6 text-center">
          <h2 className="text-xl font-semibold mb-6">Search Results</h2>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          ) : displayedBooks.length === 0 ? (
            <p className="text-gray-400">Search for a book to get started.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedBooks.map((book) => (
                <div
                  key={book.key}
                  onClick={() => setSelectedBook(book)}
                  className="bg-gray-800 dark:bg-gray-700 rounded-xl p-3 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer transition-all"
                >
                  <img
                    src={
                      book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "https://via.placeholder.com/128x200?text=No+Image"
                    }
                    alt={book.title}
                    className="w-full h-52 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold text-md truncate">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {book.author_name ? book.author_name.join(", ") : "Unknown"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(book);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white w-full transition-all text-sm"
                  >
                    {favorites.some((fav) => fav.key === book.key) ? (
                      <>
                        <Star className="text-yellow-400" /> Remove Favorite
                      </>
                    ) : (
                      <>
                        <StarOff /> Add to Favorites
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animated Modal for book details */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
              className={`relative p-6 rounded-2xl max-w-lg w-[90%] shadow-2xl ${
                darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              }`}
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-700 transition"
              >
                <X />
              </button>

              <img
                src={
                  selectedBook.cover_i
                    ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`
                    : "https://via.placeholder.com/200x300?text=No+Image"
                }
                alt={selectedBook.title}
                className="w-48 h-72 object-cover rounded-lg mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 text-center">
                {selectedBook.title}
              </h2>
              <p className="text-center text-gray-400 mb-4">
                {selectedBook.author_name
                  ? selectedBook.author_name.join(", ")
                  : "Unknown Author"}
              </p>

              <div className="flex justify-center mt-3">
                <button
                  onClick={() => toggleFavorite(selectedBook)}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                >
                  {favorites.some((fav) => fav.key === selectedBook.key) ? (
                    <>
                      <Star className="text-yellow-400" /> Remove Favorite
                    </>
                  ) : (
                    <>
                      <StarOff /> Add to Favorites
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
