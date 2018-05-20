import PropTypes from 'prop-types';
import React from "react";

function searchResultsStat(currentPage, numFound, rows, pageAmt, noResultsText) {
  if (numFound > rows) { // Many pages
    return (
      <p id="stat" tabIndex="-1" className="search-results-stat">Showing page <strong>{currentPage+1}</strong> of <strong>{pageAmt}</strong> (<strong>{numFound}</strong> results). </p>
    )
  }
  else if (numFound < rows && numFound > 1) { // Single page
    return (
      <p id="stat" tabIndex="-1" className="search-results-stat">Showing <strong>{numFound}</strong> results.</p>
    )
  }
  else if (numFound === 1) { // Single item
    return (
      <p id="stat" tabIndex="-1" className="search-results-stat">Showing <strong>{numFound}</strong> result.</p>
    )
  }
  else if (numFound === 0) { // No results
    return (
      <p id="stat" tabIndex="-1" className="search-results-stat">{noResultsText || 'Your search yielded no results.'}</p>
    )
  }
}

class FederatedCountLabel extends React.Component {
  render() {
    const { numFound, start, rows, noResultsText } = this.props;
    const currentPage = start / rows;
    const pageAmt = Math.ceil(numFound / rows);

    return (
        <React.Fragment>
          {searchResultsStat(currentPage, numFound, rows, pageAmt, noResultsText)}
        </React.Fragment>
    );
  }
}

FederatedCountLabel.propTypes = {
  numFound: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  rows: PropTypes.number
};

FederatedCountLabel.defaultProps = {
  start: 0
};

export default FederatedCountLabel;
