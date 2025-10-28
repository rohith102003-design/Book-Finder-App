import React from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Star } from "lucide-react";

export default function FilterPanel({
  sortOrder,
  setSortOrder,
  showFavorites,
  setShowFavorites,
}) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
      {/* 🔹 Sort Button */}
      <button
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        {sortOrder === "asc" ? (
          <>
            <ArrowDownWideNarrow size={18} />
            <span>Sort A–Z</span>
          </>
        ) : (
          <>
            <ArrowUpWideNarrow size={18} />
            <span>Sort Z–A</span>
          </>
        )}
      </button>

      {/* 🔹 Favorites Filter Toggle */}
      <button
        onClick={() => setShowFavorites(!showFavorites)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition ${
          showFavorites
            ? "bg-yellow-500 text-white hover:bg-yellow-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        <Star
          size={18}
          className={showFavorites ? "fill-white" : "text-yellow-500"}
        />
        <span>{showFavorites ? "Show All Books" : "Show Favorites Only"}</span>
      </button>
    </div>
  );
}
