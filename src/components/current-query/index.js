import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import moment from "moment";

class FederatedCurrentQuery extends React.Component {
  constructor(props){
    super(props);
  }

	render() {
		const { query } = this.props;

    const fields = query.searchFields
        .filter((searchField) => searchField.value && searchField.value.length > 0);

    // Create a map of known facet type child components which can be rendered dynamically.
    const facetTypes = {
      "list-facet": ListFacetType,
      "range-facet": RangeFacetType,
      "text": TextFacetType
    };

		return (
        <React.Fragment>
          {fields.length > 0 && // Only render this if there are filters applied.
            <div className="applied-filters">
              <h2 className="element-invisible">Currently Applied Search
                Filters.</h2>
              <p className="element-invisible">Click a filter to remove it from
                your search query.</p>
              {fields.map((searchField, i) => {
               // Determine which child component to render.
                const MyFacetType = facetTypes[searchField.type];
                return <MyFacetType key={i} searchField={searchField} {...this.props}/>
              })}
            </div>
          }
        </React.Fragment>
		);
	}
}

FederatedCurrentQuery.propTypes = {
	onChange: PropTypes.func,
	query: PropTypes.object
};

// Create dumb component which can be configured by props.
const FacetType = (props) => {
  return (
    <span className="applied-filters__filter" key={props.id} onClick={props.onClick}>
			{props.children}
		</span>
  )
};

// Configure and render the FacetType component to render as list facet type.
class ListFacetType extends React.Component {
  constructor(props){
    super(props);
  }

  removeListFacetValue(field, values, value) {
    const foundIdx = values.indexOf(value);
    if (foundIdx > -1) {
      this.props.onChange(field, values.filter((v, i) => i !== foundIdx));
    }
  }

  render() {
    const {searchField} = this.props;
    return ( searchField.value.map((val, i) => (
        <FacetType key={i} id={i} onClick={() => this.removeListFacetValue(searchField.field, searchField.value, val)}>
          {/* Add spacing to hierarchical facet values: Type>Term = Type > Term. */}
          {val.replace('>',' > ')}
        </FacetType>
    )))
  }
}

// Configure and render the FacetType component to render as range facet type.
class RangeFacetType extends React.Component {
  constructor(props){
    super(props);
  }

  removeRangeFacetValue(field) {
    this.props.onChange(field, []);
  }

  render() {
    const {searchField} = this.props;
    // Create a moment from the search start date.
    const start = moment(searchField.value[0]);
    // Use UTC.
    start.utc();
    // Create a formatted string from start date.
    const startFormatted = start.format("MM/DD/YYYY");
    // Create a moment from search end date.
    const end = moment(searchField.value[1]);
    // Use utc.
    end.utc();
    // Create a formatted string from end date.
    const endFormatted = end.format("MM/DD/YYYY");
    // Determine if we chose the same or different start / end dates.
    const diff = start.diff(end,'days');
    // Only show the start date if the same date were chosen, otherwise: start - end.
    const filterValue = diff ? startFormatted + ' - ' + endFormatted : startFormatted;
    return (
      <FacetType onClick={() => this.removeRangeFacetValue(searchField.field)}>
        {filterValue}
      </FacetType>
    )
  }
}

// Configure and render the FacetType component to render as text facet type.
class TextFacetType extends React.Component {
  constructor(props){
    super(props);
  }

  removeTextValue(field) {
    this.props.onChange(field, "");
    // Get current querystring params.
    let parsed = queryString.parse(window.location.search);
    // Remove the search term param, if it exists.
    if (parsed.search) {
      delete parsed.search;
    }
    const stringified = queryString.stringify(parsed);
    // Update the querystring params in the browser, add path to history.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
    if (window.history.pushState) {
      if (stringified) {
        const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + stringified;
        window.history.pushState({path:newurl},'',newurl);
      }
      else {
        const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newurl},'',newurl);
      }
    }
    else {
      window.location.search = stringified;
    }
  }

  render() {
    const {searchField} = this.props;
    return (
        <FacetType onClick={() => this.removeTextValue(searchField.field)}>
          {searchField.value}
        </FacetType>
    )
  }
}

export default FederatedCurrentQuery;
