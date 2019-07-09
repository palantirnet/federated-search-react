import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import moment from 'moment';
import { LiveMessenger } from 'react-aria-live';
import helpers from '../../helpers';


// Create dumb component which can be configured by props.
const FacetType = props => (
  <button className="applied-filters__filter" key={props.id} onClick={props.onClick}>
    <span className="element-invisible">
      Remove filter
    </span>
    {props.children}
  </button>
);

// Configure and render the FacetType component to render as list facet type.
class ListFacetType extends React.Component {
  removeListFacetValue(field, values, value) {
    this.props.announcePolite(`Removed ${field.value} filter.`);

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

    // Define var for new parsed qs params object.
    let newParsed = {};
    let options = this.props.options;

    // Confirm the field value is set in state.
    if (foundIdx > -1) {
      if (field === 'sm_site_name' &&
          value.length === 1 &&
          options.sm_site_name !== undefined)
      {
        // @TODO -- THIS IS THE LOGIC TO WORK ON.
        options.sm_site_name.forEach((name) => {
          value = name;
          // Add new qs param for field + value.
          if (param) {
            newParsed = helpers.qs.addValueToQsParam({
              field: field,
              value,
              param,
              parsed,
            });
          }
          else {
            newParsed = helpers.qs.addQsParam({
              field: field,
              value,
              parsed,
            });
          }
        });
      }
      // If the field is one whose state is tracked in qs and there is currently a param for it.
      else if (isQsParamField && param) {
        const newParsed = helpers.qs.removeValueFromQsParam({
          field,
          value,
          param,
          parsed,
        });

        helpers.qs.addNewUrlToBrowserHistory(newParsed);
      }

      // Send new query based on app state.
      if (field === 'sm_site_name') {
        this.props.onChange(field, newParsed.sm_site_name);
        helpers.qs.addNewUrlToBrowserHistory(newParsed);
      }
      else {
        this.props.onChange(field, values.filter((v, i) => i !== foundIdx));
      }
    }
  }

  render() {
    const { searchField } = this.props;
    return (searchField.value.map((val, i) => (
      <FacetType
        key={i}
        id={i}
        onClick={() => this.removeListFacetValue(searchField.field, searchField.value, val)}
      >
        {/* Add spacing to hierarchical facet values: Type>Term = Type > Term. */}
        {val.replace('>', ' > ')}
      </FacetType>
    )));
  }
}

// Configure and render the FacetType component to render as range facet type.
class RangeFacetType extends React.Component {
  removeRangeFacetValue(field) {
    this.props.announcePolite(`Removed ${field.value} filter.`);
    this.props.onChange(field, []);
  }

  render() {
    const { searchField } = this.props;
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
      <FacetType onClick={() => this.removeRangeFacetValue(searchField.field)}>
        {filterValue}
      </FacetType>
    );
  }
}

// Configure and render the FacetType component to render as text facet type.
class TextFacetType extends React.Component {
  removeTextValue(field) {
    this.props.announcePolite(`Removed search term ${field.value}.`);
    this.props.onChange(field, '');
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

class FederatedCurrentQuery extends React.Component {
  render() {
    const { query } = this.props;

    const fields = query.searchFields.filter(searchField => searchField.value
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
          <React.Fragment>
            {fields.length > 0 && // Only render this if there are filters applied.
              <div className="applied-filters">
                <h2 className="element-invisible">
                  Currently Applied Search Filters.
                </h2>
                <p className="element-invisible">
                  Click a filter to remove it from your search query.
                </p>
                {/* Only render the values for visible facets / filters */}
                {fields.filter(searchField => !searchField.isHidden).map((searchField, i) => {
                  // Determine which child component to render.
                  const MyFacetType = facetTypes[searchField.type];
                  return (
                    <MyFacetType
                      {...this.props}
                      key={i}
                      searchField={searchField}
                      announcePolite={announcePolite}
                    />
                  );
                })}
              </div>
            }
          </React.Fragment>
        )}
      </LiveMessenger>
    );
  }
}

FederatedCurrentQuery.propTypes = {
  onChange: PropTypes.func,
  query: PropTypes.object,
};

export default FederatedCurrentQuery;
