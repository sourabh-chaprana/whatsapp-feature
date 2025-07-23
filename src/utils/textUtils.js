/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 * @param {string} str - The string to format
 * @returns {string} - The formatted string with first letter capitalized
 */
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The string to format
 * @returns {string} - The formatted string with each word's first letter capitalized
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
};

/**
 * Formats status text - capitalizes first letter and handles special cases
 * @param {string} status - The status to format
 * @returns {string} - The formatted status
 */
export const formatStatus = (status) => {
  if (!status || typeof status !== "string") return status;

  // Handle special status cases
  const specialCases = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    booked: "Booked",
    lost: "Lost",
  };

  return specialCases[status.toLowerCase()] || capitalizeFirstLetter(status);
};

/**
 * Formats name text - capitalizes each word
 * @param {string} name - The name to format
 * @returns {string} - The formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== "string") return name;
  return capitalizeWords(name);
};
