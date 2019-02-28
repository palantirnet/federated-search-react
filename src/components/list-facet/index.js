import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import AnimateHeight from 'react-animate-height';
import helpers from '../../helpers';


class FederatedListFacet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      truncateFacetListsAt: props.truncateFacetListsAt,
    };
  }

  handleClick(value) {
    const {
      foundIdx,
      parsed,
      isQsParamField,
      param,
    } = helpers.qs.getFieldQsInfo({
      field: this.props.field,
      values: this.props.value,
      value,
    });

    // console.log(foundIdx, parsed, isQsParamField, param);

    // Define var for new parsed qs params object.
    let newParsed = parsed;

    if (foundIdx < 0) {
      if (isQsParamField && param) {
        // Add value to parsed qs params.
        newParsed = helpers.qs.addValueToQsParam({
          field: this.props.field,
          value,
          param,
          parsed,
        });
      }

      // Send new query based on app state.
      this.props.onChange(this.props.field, this.props.value.concat(value));
    } else {
      if (isQsParamField && param) {
        newParsed = helpers.qs.removeValueFromQsParam({
          field: this.props.field,
          value,
          param,
          parsed,
        });
      }

      // Send new query based on app state.
      this.props.onChange(this.props.field, this.props.value.filter((v, i) => i !== foundIdx));
    }

    if (isQsParamField) {
      helpers.qs.addNewUrlToBrowserHistory(newParsed);
    }
  }

  toggleExpand(hierarchyFacetValue) {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
    // If this is a hierarchical list facet.
    if (hierarchyFacetValue) {
      // Determine the current state of the expanded hierarchical list facets.
      const indexOfExpandedHierarchyFacetValue = this.props.expandedHierarchies
        .indexOf(hierarchyFacetValue);
      if (indexOfExpandedHierarchyFacetValue > -1) {
        // This accordion is currently expanded, so collapse it.
        this.props.expandedHierarchies.splice(indexOfExpandedHierarchyFacetValue,1);
      } else {
        // This accordion is currently collapsed, so expand it.
        this.props.expandedHierarchies.push(hierarchyFacetValue);
      }
    }
  }

  render() {
    const {
      label,
      facets,
      field,
      value,
      collapse,
      hierarchy,
    } = this.props;
    const { truncateFacetListsAt } = this.state;

    const facetCounts = facets.filter((facet, i) => i % 2 === 1);
    const facetValues = facets.filter((facet, i) => i % 2 === 0);
    // Create an object of facets {value: count} to keep consistent for inputs.
    const facetInputs = {};
    facetValues.forEach((v, i) => {
      const key = facetValues[i];
      facetInputs[key] = facetCounts[i];
    });

    const expanded = !(collapse || false);
    const height = expanded ? 'auto' : 0;

    // If we need to generate multiple list-fact accordion groups
    // from this list-facet field (i.e. sm_federated_terms).
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
          terms[pieces[0]].items = [];
          terms[pieces[0]].expanded = (this.props.expandedHierarchies.indexOf(pieces[0]) > -1);
          terms[pieces[0]].height = terms[pieces[0]].expanded ? 'auto' : 0;
        }
        // Add the object for this facet value to the array of terms for this type.
        terms[pieces[0]].items.push({
          term: pieces[1],
          facetValue,
          facetCount: facetCounts[i],
        });
      });

      // Remove duplicate types
      // So facet values of "Condition>Bones", "Condition>Bone growth" should only
      // Add "Condition" type once so we only render 1 Condition accordion group.
      const uniqueTypes = types.filter((v, i, self) => self.indexOf(v) === i).filter(String);

      // Define array of accordion Lis which we'll populate with react fragments.
      const listFacetHierarchyLis = [];
      // Define array of checkbox Lis which we'll populate with react fragments, per type.
      const listFacetHierarchyTermsLis = [];
      // Iterate through types (accordion lis).
      uniqueTypes.forEach((type, i) => {
        // Populate the checkbox lis react fragments for each type.
        listFacetHierarchyTermsLis[type] = [];
        terms[type].items.forEach((termObj, i) => termObj.facetCount
          && listFacetHierarchyTermsLis[type].push(<li key={`${termObj.term}_${termObj.facetValue}_${i}`}>
            <label className="search-accordion__checkbox-label">
            <input
              type="checkbox"
              name={type}
              value={termObj.facetValue}
              checked={value.indexOf(termObj.facetValue) > -1}
              onChange={() => this.handleClick(termObj.facetValue)}
            /> {termObj.term}
              <span className="facet-item-amount"> ({termObj.facetCount}
                <span className="element-invisible">results</span>)
              </span>
            </label>
          </li>));

        // Populate the accordion lis array with all of its checkboxes.
        listFacetHierarchyTermsLis[type].length && listFacetHierarchyLis.push(
          <li id={`solr-list-facet-${type}`} key={`solr-list-facet-${type}-${i}`}>
            <a
              tabIndex="0"
              className={cx('search-accordion__title', { 'js-search-accordion-open': terms[type].expanded })}
              id={label.replace(/\s+/g, '-').toLowerCase()}
              onClick={this.toggleExpand.bind(this, type)}
              onKeyDown={(event) => {
                if (event.keyCode === 13) {
                  this.toggleExpand(type);
                }
              }}
            >
              <span className="element-invisible">Toggle filter group for</span> {type}
            </a>
            <AnimateHeight
              duration={600}
              height={terms[type].height}
            >
              <ul className="search-accordion__content" key={`solr-list-facet-${type}-ul`}>
                {listFacetHierarchyTermsLis[type]}
              </ul>
            </AnimateHeight>
          </li>);
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
          className={cx('search-accordion__title', { 'js-search-accordion-open': expanded })}
          id={label.replace(/\s+/g, '-').toLowerCase()}
          onClick={this.toggleExpand.bind(this)}
          onKeyDown={(event) => {
            if (event.keyCode === 13) {
              this.toggleExpand();
            }
          }}
        >
          <span className="element-invisible">Toggle filter group for</span> {label}
        </a>
        <AnimateHeight
          duration={600}
          height={height}
        >
          <ul className="search-accordion__content" key={`solr-list-facet-${field}-ul`}>
            {facetValues.filter((facetValue, i) => facetInputs[facetValue] > 0
                && (truncateFacetListsAt < 0 || i < truncateFacetListsAt))
              .map((facetValue, i) => {
                if (this.state.filter.length === 0
                  || facetValue.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) {
                  return (
                    <li key={`${facetValue}_${facetInputs[facetValue]}`}>
                      <label className="search-accordion__checkbox-label">
                        <input
                          type="checkbox"
                          name={field}
                          value={facetValue}
                          checked={value.indexOf(facetValue) > -1}
                          onChange={() => this.handleClick(facetValue)}
                        /> {facetValue}
                        <span className="facet-item-amount"> ({facetInputs[facetValue]}
                          <span className="element-invisible">results</span>)
                        </span>
                      </label>
                    </li>
                  );
                }
                return null;
              })}
          </ul>
        </AnimateHeight>
      </li>
    );
  }
}

FederatedListFacet.defaultProps = {
  hierarchy: false,
  expandedHierarchies: [],
  value: [],
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
  value: PropTypes.array,
};

export default FederatedListFacet;
