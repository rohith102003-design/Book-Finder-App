import React, { useState } from "react";
import { Star, StarOff } from "lucide-react";

export default function BookCard({ book, addToFavorites, removeFromFavorites, isFavorite }) {
  const [showDetails, setShowDetails] = useState(false);

  // ✅ Extract details safely
  const title = book.title || "Untitled";
  const authors = book.authors?.join(", ") || "Unknown Author";

  // 🧠 Detect year from multiple possible fields
  const year =
    book.first_publish_year ||
    (Array.isArray(book.publish_year) ? book.publish_year[0] : null) ||
    (Array.isArray(book.publish_date)
      ? book.publish_date[0]?.match(/\d{4}/)?.[0]
      : book.publish_date?.match(/\d{4}/)?.[0]) ||
    "N/A";

  const cover = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    : "https://via.placeholder.com/150x220?text=No+Cover";

  const description =
    book.description || book.first_sentence?.join(" ") || "No description available.";

  return (
    <>
      {/* Main Book Card */}
      <div
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-all cursor-pointer flex flex-col"
        onClick={() => setShowDetails(true)}
      >
        <img src={cover} alt={title} className="w-full h-64 object-cover" />
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{authors}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              📅 Published: {year}
            </p>
          </div>

          {/* Favorite Button (Card) */}
          <button
            className={`mt-3 self-start flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${
              isFavorite
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={(e) => {
              e.stopPropagation(); // prevent modal open
              isFavorite ? removeFromFavorites(book) : addToFavorites(book);
            }}
          >
            {isFavorite ? <Star size={16} /> : <StarOff size={16} />}
            {isFavorite ? "Favorited" : "Add to Favorite"}
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>

            <img
              src={cover}
              alt={title}
              className="w-40 h-60 object-cover mx-auto mb-4 rounded-lg shadow-md"
            />
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-1">{authors}</p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-1">
              📅 Published: {year}
            </p>

            <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {description}
            </p>

            {/* Favorite Button (Inside Modal) */}
            <div className="mt-6 text-center">
              <button
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isFavorite
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() =>
                  isFavorite ? removeFromFavorites(book) : addToFavorites(book)
                }
              >
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
