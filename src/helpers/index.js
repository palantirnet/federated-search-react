import React from 'react';

/**
 * Find and highlight relevant keywords within a block of text
 * @param  {string} text - The text to parse
 * @param  {string} highlight - The search keyword/partial to highlight
 * @return {object} A JSX object containing an array of alternating strings and JSX
 */
const highlightText = (text, highlight) => {
  if (!highlight.toString().trim()) {
    return <span>{text}</span>;
  }
  // Split on highlight term and include term into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span> { parts.map((part, i) =>
      (
        <span key={i} style={part.toLowerCase() === highlight.toString().toLowerCase() ? { fontWeight: 'bold' } : {}}>
          { part }
        </span>
      ))}
    </span>);
};

export default {
  highlightText,
};
