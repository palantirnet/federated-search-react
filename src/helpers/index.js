import React from 'react';

/**
 * Find and highlight relevant keywords within a block of text
 * @param  {string} text - The text to parse
 * @param  {string} value - The search keyword to highlight
 * @return {object} A JSX object containing an array of alternating strings and JSX
 */
const highlightText = (text, value) => {
  if (!value) {
    return text;
  }
  return (<span>
    { text.split(value)
      .reduce((prev, current, i) => {
        if (!i) {
          return [current];
        }
        return prev.concat(<b key={value + current}>{ value }</b>, current);
      }, [])
    }
  </span>);
};

export default {
  highlightText,
}
