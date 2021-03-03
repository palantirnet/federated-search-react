import PropTypes from 'prop-types';
import React from 'react';
import { LiveMessage } from 'react-aria-live';

function searchResultsStat(currentPage, numFound, rows, pageAmt, noResultsText, termValue) {
  // Set visible and a11y message based on query results.
  let message = '';
  let a11yMessage = '';
  if (numFound > rows) { // Many pages
    a11yMessage = `Showing page ${currentPage + 1} of ${pageAmt} (${numFound} results).`;
    message = (
      <span>
        Showing page
        <b>
          {' '}
          {currentPage + 1}
        </b>
        {' '}
        of
        <b>
          {' '}
          {pageAmt}
        </b>
        {' '}
        (
        <b>{numFound}</b>
        {' '}
        results).
      </span>
    );
  } else if (numFound <= rows && numFound > 1) { // Single page
    a11yMessage = `Showing ${numFound} results.`;
    message = (
      <span>
        {'Showing '}
        <b>{numFound}</b>
        {' '}
        results.
      </span>
    );
  } else if (numFound === 1) { // Single item
    a11yMessage = `Showing ${numFound} result.`;
    message = (
      <span>
        {'Showing '}
        <b>{numFound}</b>
        {' '}
        result.
      </span>
    );
  } else if (numFound === 0) { // No results
    message = noResultsText || 'Sorry, your search yielded no results.';
    a11yMessage = message;
  }
  // Don't announce total results when wildcard query sent on term clear.
  a11yMessage = termValue ? a11yMessage : '';
  return (
    <>
      <LiveMessage message={a11yMessage} aria-live="polite" />
      <p id="stat" tabIndex="-1" className="fs-search-results-stat">{message}</p>
    </>
  );
}

const FederatedCountLabel = function ({
  numFound,
  start,
  rows,
  noResultsText,
  termValue,
}) {
  const currentPage = start / rows;
  const pageAmt = Math.ceil(numFound / rows);
  return (
    <>
      {searchResultsStat(currentPage, numFound, rows, pageAmt, noResultsText, termValue)}
    </>
  );
};

FederatedCountLabel.propTypes = {
  numFound: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  noResultsText: PropTypes.string,
  termValue: PropTypes.string,
};

FederatedCountLabel.defaultProps = {
  noResultsText: '',
  termValue: '',
};

export default FederatedCountLabel;
