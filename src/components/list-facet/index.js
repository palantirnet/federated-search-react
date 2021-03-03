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

  handleClick(clickValue) {
    const { field, value, onChange } = this.props;

    const {
      foundIdx,
      parsed,
      isQsParamField,
      param,
    } = helpers.qs.getFieldQsInfo({
      field,
      values: value,
      value: clickValue,
    });

    // Define var for new parsed qs params object.
    let newParsed = parsed;

    // If the clicked list facet field is one whose state is tracked in the qs.
    if (isQsParamField) {
      // If the click is adding the field value.
      if (foundIdx < 0) {
        // If there is already a qs param for this field value.
        if (param) {
          // Add value to parsed qs params.
          newParsed = helpers.qs.addValueToQsParam({
            field,
            value: clickValue,
            param,
            parsed,
          });
        } else { // If there is not already a qs param for this field value.
          // Add new qs param for field + value.
          newParsed = helpers.qs.addQsParam({
            field,
            value: clickValue,
            parsed,
          });
        }

        // Send new query based on app state.
        onChange(field, value.concat(clickValue));
      } else { // If the click is removing this field value.
        // If their is already a qs param for this field value.
        if (param) {
          newParsed = helpers.qs.removeValueFromQsParam({
            field,
            value: clickValue,
            param,
            parsed,
          });
        }

        // Send new query based on app state.
        onChange(field, value.filter((v, i) => i !== foundIdx));
      }

      helpers.qs.addNewUrlToBrowserHistory(newParsed);
    }
  }

  toggleExpand(hierarchyFacetValue) {
    const {
      onSetCollapse,
      field,
      collapse,
      expandedHierarchies,
    } = this.props;

    onSetCollapse(field, !collapse);
    // If this is a hierarchical list facet.
    if (hierarchyFacetValue) {
      // Determine the current state of the expanded hierarchical list facets.
      const indexOfExpandedHierarchyFacetValue = expandedHierarchies
        .indexOf(hierarchyFacetValue);
      if (indexOfExpandedHierarchyFacetValue > -1) {
        // This accordion is currently expanded, so collapse it.
        expandedHierarchies.splice(indexOfExpandedHierarchyFacetValue, 1);
      } else {
        // This accordion is currently collapsed, so expand it.
        expandedHierarchies.push(hierarchyFacetValue);
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
      options,
    } = this.props;
    const { truncateFacetListsAt, filter } = this.state;

    const { siteList } = options;
    const facetCounts = facets.filter((facet, i) => i % 2 === 1);
    const facetValues = facets.filter((facet, i) => i % 2 === 0);
    // Create an object of facets {value: count} to keep consistent for inputs.
    const facetInputs = {};

    // Handle site name restrictions.
    if (field === 'sm_site_name' && siteList.length > 0) {
      facetValues.forEach((v, i) => {
        const key = facetValues[i];
        if (siteList.indexOf(v) > -1) {
          facetInputs[key] = facetCounts[i];
        }
      });
      // If only one option exists and nothing is selected, don't show it.
      if (value.length < 1 && Object.keys(facetInputs).length < 2) {
        return null;
      }
    } else {
      facetValues.forEach((v, i) => {
        const key = facetValues[i];
        facetInputs[key] = facetCounts[i];
      });
    }

    const expanded = !collapse;
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
        const { expandedHierarchies } = this.props;

        // Create array of [Type, Term] from Type>Term.
        const pieces = facetValue.split('>');
        types.push(pieces[0]);
        // If we don't already have terms.Type then create it.
        if (!Object.hasOwnProperty.call(terms, pieces[0])) {
          terms[pieces[0]] = {};
          terms[pieces[0]].items = [];
          terms[pieces[0]].expanded = (expandedHierarchies.indexOf(pieces[0]) > -1);
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

      /* eslint-disable react/no-array-index-key */

      // Iterate through types (accordion lis).
      uniqueTypes.forEach((type, i) => {
        // Populate the checkbox lis react fragments for each type.
        listFacetHierarchyTermsLis[type] = [];
        terms[type].items.forEach((termObj, j) => termObj.facetCount
          && listFacetHierarchyTermsLis[type].push(
            <li className="fs-search-accordion__content-item" key={`${termObj.term}_${termObj.facetValue}_${j}`}>
              {/* eslint jsx-a11y/label-has-associated-control: ["error", { assert: "either" } ] */}
              <label className="fs-search-accordion__checkbox-label">
                <input
                  type="checkbox"
                  name={type}
                  className="fs-search-accordion__checkbox-input"
                  value={termObj.facetValue}
                  checked={value.indexOf(termObj.facetValue) > -1}
                  onChange={() => this.handleClick(termObj.facetValue)}
                />
                {` ${termObj.term}`}
                <span className="facet-item-amount">
                  {` (${termObj.facetCount})`}
                  <span className="fs-element-invisible">results</span>
                </span>
              </label>
            </li>,
          ));

        // Populate the accordion lis array with all of its checkboxes.
        /* eslint no-unused-expressions: [2, { allowShortCircuit: true }] */
        listFacetHierarchyTermsLis[type].length && listFacetHierarchyLis.push(
          <li className="fs-search-accordion__content-item" id={`solr-list-facet-${type}`} key={`solr-list-facet-${type}-${i}`}>
            <div
              role="button"
              tabIndex="0"
              className={cx('fs-search-accordion__title', { 'js-fs-search-accordion-open': terms[type].expanded })}
              id={label.replace(/\s+/g, '-').toLowerCase()}
              onClick={this.toggleExpand.bind(this, type)}
              onKeyDown={(event) => {
                if (event.keyCode === 13) {
                  this.toggleExpand(type);
                }
              }}
            >
              <span className="fs-element-invisible">Toggle filter group for</span>
              {type}
            </div>
            <AnimateHeight
              duration={600}
              height={terms[type].height}
            >
              <ul className="fs-search-accordion__content" key={`solr-list-facet-${type}-ul`}>
                {listFacetHierarchyTermsLis[type]}
              </ul>
            </AnimateHeight>
          </li>,
        );
      });

      /* eslint-enable react/no-array-index-key */

      // Render the group of accordion lis with their facet value checkbox lists.
      return listFacetHierarchyLis;
    }
    // This is not a hierarchy of accordion groups,
    // just render the single list-facet accordion.
    return (
      <li className="fs-search-accordion__group-item" id={`solr-list-facet-${field}`}>
        <div
          role="button"
          tabIndex="0"
          className={cx('fs-search-accordion__title', { 'js-fs-search-accordion-open': expanded })}
          id={label.replace(/\s+/g, '-').toLowerCase()}
          onClick={this.toggleExpand.bind(this)}
          onKeyDown={(event) => {
            if (event.keyCode === 13) {
              this.toggleExpand();
            }
          }}
        >
          <span className="fs-element-invisible">Toggle filter group for</span>
          {label}
        </div>
        <AnimateHeight
          duration={600}
          height={height}
        >
          <ul className="fs-search-accordion__content" key={`solr-list-facet-${field}-ul`}>
            {facetValues.filter((facetValue, i) => facetInputs[facetValue] > 0
                && (truncateFacetListsAt < 0 || i < truncateFacetListsAt))
              .map((facetValue) => {
                if (filter.length === 0
                  || facetValue.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
                  return (
                    <li className="fs-search-accordion__content-item" key={`${facetValue}_${facetInputs[facetValue]}`}>
                      <label className="fs-search-accordion__checkbox-label">
                        <input
                          type="checkbox"
                          name={field}
                          value={facetValue}
                          checked={value.indexOf(facetValue) > -1}
                          onChange={() => this.handleClick(facetValue)}
                        />
                        {` ${facetValue}`}
                        <span className="facet-item-amount">
                          {` (${facetInputs[facetValue]})`}
                          <span className="fs-element-invisible">results</span>
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
  collapse: false,
};

FederatedListFacet.propTypes = {
  collapse: PropTypes.bool,
  expandedHierarchies: PropTypes.arrayOf(PropTypes.string),
  facets: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ).isRequired,
  field: PropTypes.string.isRequired,
  hierarchy: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSetCollapse: PropTypes.func.isRequired,
  truncateFacetListsAt: PropTypes.number.isRequired,
  value: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.shape({
    siteList: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
      length: PropTypes.number,
      indexOf: PropTypes.func,
    })]),
  }).isRequired,
};

export default FederatedListFacet;
