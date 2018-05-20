import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import AnimateHeight from 'react-animate-height';


class FederatedListFacet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      truncateFacetListsAt: props.truncateFacetListsAt
    };
  }

  // This method runs once as the component first renders.
  componentWillMount() {
    // If we are in the Site name list facet.
    if (this.props.field === "ss_site_name") {
      // If there is a default search site option passed in.

      if (this.props.options.siteSearch) {
        this.handleClick(this.props.options.siteSearch);
      }
    }
  }

  handleClick(value) {
    const foundIdx = this.props.value.indexOf(value);
    if (foundIdx < 0) {
      this.props.onChange(this.props.field, this.props.value.concat(value));
    } else {
      this.props.onChange(this.props.field, this.props.value.filter((v, i) => i !== foundIdx));
    }
  }

  toggleExpand(hierarchyFacetValue) {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
    // If this is a hierarchical list facet.
    if (hierarchyFacetValue) {
      // Determine the current state of the expanded hierarchical list facets.
      const indexOfExpandedHierarchyFacetValue = this.props.expandedHierarchies.indexOf(hierarchyFacetValue);
      if (indexOfExpandedHierarchyFacetValue > -1) {
        // This accordion is currently expanded, so collapse it.
        this.props.expandedHierarchies.splice(indexOfExpandedHierarchyFacetValue,1);
      }
      else {
        // This accordion is currently collapsed, so expand it.
        this.props.expandedHierarchies.push(hierarchyFacetValue);
      }
    }
  }

  render() {
    const { query, label, facets, field, value, bootstrapCss, facetSort, collapse, hierarchy } = this.props;
    const { truncateFacetListsAt } = this.state;

    const facetCounts = facets.filter((facet, i) => i % 2 === 1);
    const facetValues = facets.filter((facet, i) => i % 2 === 0);
    // Create an object of facets {value: count} to keep consistent for inputs.
    const facetInputs = {};
    facetValues.forEach((value, i) => {
      const key = facetValues[i];
      facetInputs[key] = facetCounts[i];
    });

    const facetSortValue = facetSort ? facetSort :
      query.facetSort ? query.facetSort :
      (query.facetLimit && query.facetLimit > -1 ? "count" : "index");

    const expanded = !(collapse || false);
    const height = expanded ? 'auto' : 0;

    const showMoreLink = truncateFacetListsAt > -1 && truncateFacetListsAt < facetValues.length ?
      <li className={cx({"list-group-item": bootstrapCss})} onClick={() => this.setState({truncateFacetListsAt: -1})}>
        Show all ({facetValues.length})
      </li> : null;

    // If we need to generate multiple list-fact accordion groups from this list-facet field (i.e. sm_federated_terms).
    if (hierarchy) {
      // Iterate through sm_federated_terms array of values.
      // Each value is a string with the format Type>Term.
      // Define array of types which will render as accordion li links.
      const types = [];
      // Define object to hold data for each type:
      // {
      //   type: {
      //     items: [{
      //       term (the checkbox label),
      //       facetValue (the checkbox value, Type>Term),
      //       facetCount (the number of items with this value returned)
      //     },...],
      //     expanded: bool (whether or not this accordion is expanded)
      //   },...
      // }
      const terms = {};
      facetValues.forEach((facetValue, i) => {
        // Create array of [Type, Term] from Type>Term.
        const pieces = facetValue.split('>');
        types.push(pieces[0]);
        // If we don't already have terms.Type then create it.
        if (!Object.hasOwnProperty.call(terms, pieces[0])) {
          terms[pieces[0]] = {};
          terms[pieces[0]]['items'] = [];
          terms[pieces[0]]['expanded'] = (this.props.expandedHierarchies.indexOf(pieces[0]) > -1);
          terms[pieces[0]]['height'] = terms[pieces[0]]['expanded'] ? 'auto' : 0;
        }
        // Add the object for this facet value to the array of terms for this type.
        terms[pieces[0]]['items'].push({term: pieces[1], facetValue: facetValue, facetCount: facetCounts[i]});
      });

      // Remove duplicate types
      // So facet values of "Condition>Bones", "Condition>Bone growth" should only
      // Add "Condition" type once so we only render 1 Condition accordion group.
      const uniqueTypes = types.filter((value, index, self) => self.indexOf(value) === index);

      // Define array of accordion Lis which we'll populate with react fragments.
      let listFacetHierarchyLis = [];
      // Define array of checkbox Lis which we'll populate with react fragments, per type.
      let listFacetHierarchyTermsLis = [];
      // Iterate through types (accordion lis).
      uniqueTypes.forEach((type, i) => {
        // Populate the checkbox lis react fragments for each type.
        listFacetHierarchyTermsLis[type] = [];
        terms[type]['items'].forEach((termObj, i) => termObj.facetCount && listFacetHierarchyTermsLis[type].push(
          <li key={`${termObj.term}_${termObj.facetValue}_${i}`}>
            <label className="search-accordion__checkbox-label">
            <input
                type="checkbox"
                name={type}
                value={termObj.facetValue}
                checked={value.indexOf(termObj.facetValue) > -1}
                onChange={() => this.handleClick(termObj.facetValue)}
            /> {termObj.term}
            <span className="facet-item-amount"> ({termObj.facetCount})</span>
          </label>
        </li>));

        // Populate the accordion lis array with all of its checkboxes.
        listFacetHierarchyTermsLis[type].length && listFacetHierarchyLis.push(
          <li id={`solr-list-facet-${type}`} key={`solr-list-facet-${type}-${i}`}>
            <a
              tabIndex="0"
              className={cx("search-accordion__title", {"js-search-accordion-open": terms[type]['expanded']})}
              id={label.replace(/\s+/g, '-').toLowerCase()}
              onClick={this.toggleExpand.bind(this, type)}
            >{type}</a>
            <AnimateHeight
              duration={600}
              height={terms[type]['height']}
            >
              <ul className="search-accordion__content" key={`solr-list-facet-${type}-ul`}>
                {listFacetHierarchyTermsLis[type]}
              </ul>
            </AnimateHeight>
          </li>
        );
      });
      // Render the group of accordion lis with their facet value checkbox lists.
      return listFacetHierarchyLis;
    }
    // This is not a hierarchy of accordion groups,
    // just render the single list-facet accordion.
    return (
      <li id={`solr-list-facet-${field}`}>
        <a
            tabIndex="0"
            className={cx("search-accordion__title", {"js-search-accordion-open": expanded})}
            id={label.replace(/\s+/g, '-').toLowerCase()}
            onClick={this.toggleExpand.bind(this)}
        >{label}</a>
        <AnimateHeight
          duration={600}
          height={height}
        >
          <ul className="search-accordion__content" key={`solr-list-facet-${field}-ul`}>
            {facetValues.filter((facetValue, i) => facetInputs[facetValue] > 0 && truncateFacetListsAt < 0 || i < truncateFacetListsAt).map((facetValue, i) => this.state.filter.length === 0 || facetValue.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1 ? (<li key={`${facetValue}_${facetInputs[facetValue]}`}>
              <label className="search-accordion__checkbox-label">
              <input
                type="checkbox"
                name={field}
                value={facetValue}
                checked={value.indexOf(facetValue) > -1 ? true : false}
                onChange={() => this.handleClick(facetValue)}
              /> {facetValue}
              <span className="facet-item-amount"> ({facetInputs[facetValue]})</span>
            </label>
            </li>) : null)}
          </ul>
        </AnimateHeight>
      </li>
    );
  }
}

FederatedListFacet.defaultProps = {
  hierarchy: false,
  expandedHierarchies: [],
  value: []
};

FederatedListFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array,
  collapse: PropTypes.bool,
  expandedHierarchies: PropTypes.array,
  facetSort: PropTypes.string,
  facets: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  hierarchy: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFacetSortChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  query: PropTypes.object,
  truncateFacetListsAt: PropTypes.number,
  value: PropTypes.array
};

export default FederatedListFacet;
