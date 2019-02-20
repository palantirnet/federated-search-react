import React from 'react';
import FederatedTextSearchNoAutocomplete from './no-autocomplete';
import FederatedTextSearchAsYouType from './search-as-you-type';

const FederatedTextSearch = (props) => {
  const { autocomplete } = props;
  const InputComponent = autocomplete
    ? FederatedTextSearchAsYouType
    : FederatedTextSearchNoAutocomplete;
  return <InputComponent {...props} />
};

export default FederatedTextSearch;
