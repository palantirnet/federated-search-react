import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import moment from 'moment';
import { LiveMessenger } from 'react-aria-live';
import helpers from '../../helpers';

// Create dumb component which can be configured by props.
const FacetType = ({ id, onClick, children }) => (
  <button className="fs-applied-filters__filter" key={id} onClick={onClick} type="submit">
    <span className="fs-element-invisible">
      Remove filter
    </span>
    {children}
  </button>
);
FacetType.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// Configure and render the FacetType component to render as list facet type.
const ListFacetType = function (props) {
  function removeListFacetValue(field, values, value) {
    const { announcePolite, onChange } = props;

    announcePolite(`Removed ${field.value} filter.`);

    const {
      foundIdx,
      parsed,
      isQsParamField,
      param,
    } = helpers.qs.getFieldQsInfo({
      field,
      values,
      value,
    });

    // Confirm the field value is set in state.
    if (foundIdx > -1) {
      // If the field is one whose state is tracked in qs and there is currently a param for it.
      if (isQsParamField && param) {
        const newParsed = helpers.qs.removeValueFromQsParam({
          field,
          value,
          param,
          parsed,
        });

        helpers.qs.addNewUrlToBrowserHistory(newParsed);
      }

      // Send query based on new state.
      onChange(field, values.filter((v, i) => i !== foundIdx));
    }
  }

  const { searchField } = props;
  return (searchField.value.map((val, i) => (
    <FacetType
      key={i}
      id={i}
      onClick={() => removeListFacetValue(searchField.field, searchField.value, val)}
    >
      {/* Add spacing to hierarchical facet values: Type>Term = Type > Term. */}
      {val.replace('>', ' > ')}
    </FacetType>
  )));
};
ListFacetType.propTypes = {
  announcePolite: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  searchField: PropTypes.shape({
    field: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

// Configure and render the FacetType component to render as range facet type.
const RangeFacetType = function (props) {
  function removeRangeFacetValue(field) {
    const { announcePolite, onChange } = props;
    announcePolite(`Removed ${field.value} filter.`);
    onChange(field, []);
  }

  const { searchField } = props;
  // Create a moment from the search start date.
  const start = moment(searchField.value[0]);
  // Use UTC.
  start.utc();
  // Create a formatted string from start date.
  const startFormatted = start.format('MM/DD/YYYY');
  // Create a moment from search end date.
  const end = moment(searchField.value[1]);
  // Use utc.
  end.utc();
  // Create a formatted string from end date.
  const endFormatted = end.format('MM/DD/YYYY');
  // Determine if we chose the same or different start / end dates.
  const diff = start.diff(end, 'days');
  // Only show the start date if the same date were chosen, otherwise: start - end.
  const filterValue = diff ? `${startFormatted} - ${endFormatted}` : startFormatted;
  return (
    <FacetType onClick={() => removeRangeFacetValue(searchField.field)}>
      {filterValue}
    </FacetType>
  );
};
RangeFacetType.propTypes = {
  announcePolite: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  searchField: PropTypes.shape({
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    field: PropTypes.string.isRequired,
  }).isRequired,
};

// Configure and render the FacetType component to render as text facet type.
class TextFacetType extends React.Component {
  removeTextValue(field) {
    const { announcePolite, onChange } = this.props;
    announcePolite(`Removed search term ${field.value}.`);
    // Setting this to '' or "" throws a fatal error.
    onChange(field, null);
    // Get current querystring params.
    const parsed = queryString.parse(window.location.search);
    // Remove the search term param, if it exists.
    if (parsed.search) {
      delete parsed.search;
    }
    const stringified = queryString.stringify(parsed);
    // Update the querystring params in the browser, add path to history.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
    if (window.history.pushState) {
      if (stringified) {
        const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${stringified}`;
        window.history.pushState({ path: newurl }, '', newurl);
      } else {
        const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.history.pushState({ path: newurl }, '', newurl);
      }
    } else {
      window.location.search = stringified;
    }
  }

  render() {
    const { searchField } = this.props;
    return (
      <FacetType onClick={() => this.removeTextValue(searchField.field)}>
        {searchField.value}
      </FacetType>
    );
  }
}
TextFacetType.propTypes = {
  announcePolite: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  searchField: PropTypes.shape({
    field: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

const FederatedCurrentQuery = (props) => {
  const { onChange, query } = props;

  const fields = query.searchFields.filter((searchField) => searchField.value
    && searchField.value.length > 0);

  // Create a map of known facet type child components which can be rendered dynamically.
  const facetTypes = {
    'list-facet': ListFacetType,
    'range-facet': RangeFacetType,
    text: TextFacetType,
  };

  return (
    <LiveMessenger>
      {({ announcePolite }) => (
        <>
          {fields.length > 0 // Only render this if there are filters applied.
            && (
            <div className="fs-applied-filters">
              <h2 className="fs-element-invisible">
                Currently Applied Search Filters.
              </h2>
              <p className="fs-element-invisible">
                Click a filter to remove it from your search query.
              </p>
              {/* Only render the values for visible facets / filters */}
              {fields.filter((searchField) => !searchField.isHidden).map((searchField, i) => {
                // Determine which child component to render.
                const MyFacetType = facetTypes[searchField.type];
                return (
                  <MyFacetType
                    key={i}
                    searchField={searchField}
                    announcePolite={announcePolite}
                    onChange={onChange}
                  />
                );
              })}
            </div>
            )}
        </>
      )}
    </LiveMessenger>
  );
};
FederatedCurrentQuery.propTypes = {
  onChange: PropTypes.func.isRequired,
  query: PropTypes.shape({
    searchFields: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default FederatedCurrentQuery;
