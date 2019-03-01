import React from 'react';
import queryString from 'query-string';

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

// Those filter fields for which we want to preserve state in qs.
const filterFieldsWithQsState = [
  'sm_site_name',
  'ss_federated_type',
  'sm_federated_terms',
];

const qs = {
  // Get the qs params, break into array of [key,value] pairs.
  // Params with multiple values (i.e. federated terms) use the following syntax:
  // ...&sm_federated_terms[]=value1&sm_federated_terms[]=value2
  getParsedQsAndParams: () => {
    const parsed = queryString.parse(window.location.search, { arrayFormat: 'bracket' });
    return {
      parsed,
      params: Object.entries(parsed),
    };
  },
  getFieldQsInfo: ({ field, values, value }) => {
    const foundIdx = values.indexOf(value);
    // Get existing querystring params.
    const { parsed, params } = qs.getParsedQsAndParams();

    // Check if the search field is one for which we preserve state through qs.
    const isQsParamField = filterFieldsWithQsState.find(item => item === field);

    // Check if the filter field exists in qs param.
    const param = params.find(item => item[0] === field);

    return {
      foundIdx,
      parsed,
      isQsParamField,
      param,
    };
  },
  addValueToQsParam: ({
    field,
    value,
    param,
    parsed,
  }) => {
    const newParsed = parsed;
    // Handle single value params.
    if (typeof param[1] !== 'object' && value !== param[1]) {
      // Add the param for this field from the parsed qs object.
      newParsed[field] = value;
    }
    // Handle multi value params.
    if (typeof param[1] === 'object' && !param[1].includes(value)) {
      // Add the list item facet value to the param value.
      param[1].push(value);
      // Set the new param value.
      newParsed[field] = [...param[1]];
    }
    return newParsed;
  },
  addQsParam: ({
    field,
    value,
    parsed,
  }) => {
    const newParsed = parsed;
    const fieldType = field.split('_')[0];
    const isMultiple = fieldType.charAt(fieldType.length - 1);

    // Handle single value params.
    if (!isMultiple) {
      // Add the param for this field from the parsed qs object.
      newParsed[field] = value;
    }
    // Handle multi value params.
    if (isMultiple) {
      // Set the new param value.
      newParsed[field] = [value];
    }
    return newParsed;
  },
  removeValueFromQsParam: ({
    field,
    value,
    param,
    parsed,
  }) => {
    const newParsed = parsed;
    // Remove value from parsed qs params.
    // Handle single value params.
    if (typeof param[1] !== 'object' && value === param[1]) {
      // Remove the param for this field from the parsed qs object.
      delete newParsed[field];
    }
    // Handle multi value params.
    if (typeof param[1] === 'object' && param[1].includes(value)) {
      // Remove the list facet value from the param.
      newParsed[field] = param[1].filter(item => item !== value);
    }

    return newParsed;
  },
  addNewUrlToBrowserHistory: (parsed) => {
    // Update the search querystring param with the value from the search field.
    const stringified = queryString.stringify(parsed, { arrayFormat: 'bracket' });
    // Update the querystring params in the browser, add path to history.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
    if (window.history.pushState) {
      const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${stringified}`;
      window.history.pushState({ path: newurl }, '', newurl);
    } else {
      window.location.search = stringified;
    }
  },
  setFieldStateFromQs: ({
    params,
    searchField,
  }) => {
    // Make a copy of the searchField arg.
    const newSearchField = searchField;
    // Check if the filter field exists in qs params.
    const param = params.find((item) => item[0] === searchField.field);
    // If searchField has corresponding qs param present.
    if (param) {
      // Ensure we can push to searchField value.
      newSearchField.value = searchField.value || [];
      // Don't add qs param values if they're already set in app state.
      // Push single values onto the searchField.value array.
      if (typeof param[1] !== 'object' && !searchField.value.find(item => item === param[1])) {
        newSearchField.value.push(decodeURI(param[1]));
      }
      // Concatenate existing searchField.value array with multivalue param array..
      if (typeof param[1] === 'object' && searchField.value !== param[1]) {
        // Decode param values.
        const decodedParam = param[1].map(item => decodeURI(item));
        // Set the searchField.value to the new decoded param values.
        newSearchField.value = [...decodedParam];
      }
    } else {
      // If the searchField does not have qs param present, clear its value in state.
      delete newSearchField.value;
    }

    return newSearchField;
  },
};

export default {
  highlightText,
  filterFieldsWithQsState,
  qs,
};
