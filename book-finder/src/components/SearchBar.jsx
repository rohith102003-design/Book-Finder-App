import React from "react";
import { Search } from "lucide-react"; // ✅ search icon

export default function SearchBar({ query, setQuery, handleSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="flex items-center w-full max-w-xl bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 🔍 Search Icon */}
        <div className="pl-4 text-gray-400 dark:text-gray-300">
          <Search size={20} />
        </div>

        {/* 🧠 Input Field */}
        <input
          type="text"
          placeholder="Search for books, e.g. Harry Potter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow px-4 py-3 text-gray-700 dark:text-gray-100 bg-transparent focus:outline-none"
        />

        {/* 🔘 Search Button */}
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-medium transition-colors duration-200"
        >
          Search
        </button>
      </div>
    </div>
  );
}
