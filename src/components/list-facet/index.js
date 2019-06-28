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

  handleClick(value, options) {
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
            field: this.props.field,
            value,
            param,
            parsed,
          });
        } else { // If there is not already a qs param for this field value.
          // Add new qs param for field + value.
          newParsed = helpers.qs.addQsParam({
            field: this.props.field,
            value,
            parsed,
          });
        }

        // Send new query based on app state.
        this.props.onChange(this.props.field, this.props.value.concat(value));
      } else { // If the click is removing this field value.
          // Special case: if the sm_site_name setting is present and we enforce
          // a default siteSearch value, unchecking the siteSearch enables
          // results from all available sites.
          // @TODO: We need to set the click state of each Filter to checked.
          if (this.props.field === 'sm_site_name' &&
              this.props.value.length === 1 &&
              options.sm_site_name !== undefined)
          {
            options.sm_site_name.forEach((name) => {
              value = name;
              // Add new qs param for field + value.
              if (param) {
                newParsed = helpers.qs.addValueToQsParam({
                  field: this.props.field,
                  value,
                  param,
                  parsed,
                });
              }
              // @TODO: This almost works but only sets one value.
              else {
                newParsed = helpers.qs.addQsParam({
                  field: this.props.field,
                  value,
                  parsed,
                });
              }
            });
          }
          else {
            // If there is already a qs param for this field value.
            if (param) {
              newParsed = helpers.qs.removeValueFromQsParam({
              field: this.props.field,
              value,
              param,
              parsed,
            });
          }
        }
        // Send new query based on app state.
        this.props.onChange(this.props.field, this.props.value.filter((v, i) => i !== foundIdx));
      }

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
      options,
    } = this.props;
    const { truncateFacetListsAt } = this.state;

    const siteList = options.siteList;
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
      // If only one option exists, don't show it.
      if (Object.keys(facetInputs).length < 2) {
        return null;
      }
    }
    else {
      facetValues.forEach((v, i) => {
        const key = facetValues[i];
        facetInputs[key] = facetCounts[i];
      });
    }

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
              onChange={() => this.handleClick(termObj.facetValue, options)}
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
                          onChange={() => this.handleClick(facetValue, options)}
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
