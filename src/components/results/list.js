import PropTypes from 'prop-types';
import React from 'react';

const FederatedResultList = ({ children }) => (
  <>
    <h2 className="fs-element-invisible">Search results</h2>
    <ul className="fs-search-results">
      { children }
    </ul>
  </>
);

FederatedResultList.defaultProps = {
  children: [],
};

FederatedResultList.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object),
};

export default FederatedResultList;
