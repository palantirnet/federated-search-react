import React from 'react';
import PropTypes from 'prop-types';
import FederatedTextSearchNoAutocomplete from './no-autocomplete';
import FederatedTextSearchAsYouType from './search-as-you-type';

const FederatedTextSearch = (props) => {
  const { autocomplete } = props;
  const InputComponent = autocomplete
    ? FederatedTextSearchAsYouType
    : FederatedTextSearchNoAutocomplete;
  /* eslint-disable-next-line react/jsx-props-no-spreading */
  return <InputComponent {...props} />;
};

FederatedTextSearch.defaultProps = {
  autocomplete: false,
};

FederatedTextSearch.propTypes = {
  autocomplete: PropTypes.bool,
};

export default FederatedTextSearch;
