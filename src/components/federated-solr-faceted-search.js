import React from 'react';
import PropTypes from 'prop-types';
import { LiveAnnouncer } from 'react-aria-live';
import FederatedSolrComponentPack from './federated_solr_component_pack';
import helpers from '../helpers';
//import componentPack from "./component-pack";

const getFacetValues = (type, results, field, lowerBound, upperBound) => {
  return type === 'period-range-facet'
    ? (results.facets[lowerBound] || []).concat(results.facets[upperBound] || [])
    : type === 'list-facet' || type === 'range-facet'
      ? results.facets[field] || []
      : null;
};

class FederatedSolrFacetedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.resetFilters = this.resetFilters.bind(this);
  }

  resetFilters() {
    let { query } = this.props;
    let searchTerm = '';
    // Keep only the value of the main search field.
    for (const field of query.searchFields) {
      if (field.field !== query.mainQueryField) {
        // Remove the field value.
        delete (field.value);
        // Collapse the sidebar filter toggle.
        field.collapse = true;
        // Collapse the terms sidebar filter toggle.
        if (Object.hasOwnProperty.call(field, 'expandedHierarchies')) {
          field.expandedHierarchies = [];
        }
      } else {
        // Extract the value of the main search term to use when setting new URL for this state.
        searchTerm = field.value;
      }
    }
    // Set new parsed params based on only search term value.
    const parsed = {
      search: searchTerm,
    };
    // Add new url to browser window history.
    helpers.qs.addNewUrlToBrowserHistory(parsed);

    // Update state to remove the filter field values.
    this.setState({ query });
    // Execute search.
    this.props.onSearchFieldChange();
  }

  render() {
    const {
      customComponents,
      bootstrapCss,
      query,
      results,
      truncateFacetListsAt,
      options,
      onSearchFieldChange,
      onTextInputChange,
      onSortFieldChange,
      onPageChange,
    } = this.props;
    const { searchFields, sortFields, rows } = query;
    const start = query.start ? query.start : 0;
    const SearchFieldContainerComponent = customComponents.searchFields.container;
    const ResultContainerComponent = customComponents.results.container;
    const ResultComponent = customComponents.results.result;
    const ResultCount = customComponents.results.resultCount;
    const ResultHeaderComponent = customComponents.results.header;
    const ResultListComponent = customComponents.results.list;
    const ResultPendingComponent = customComponents.results.pending;
    const PaginateComponent = customComponents.results.paginate;
    const PreloadComponent = customComponents.results.preloadIndicator;
    const CurrentQueryComponent = customComponents.searchFields.currentQuery;
    const SortComponent = customComponents.sortFields.menu;
    const FederatedTextSearch = FederatedSolrComponentPack.searchFields.text;

    const resultPending = results.pending
      ? (<ResultPendingComponent bootstrapCss={bootstrapCss} />)
      : null;

    const pagination = query.pageStrategy === 'paginate' ?
      <PaginateComponent {...this.props} bootstrapCss={bootstrapCss} onChange={onPageChange} /> :
      null;

    const preloadListItem = query.pageStrategy === 'cursor'
    && results.docs.length < results.numFound
      ? <PreloadComponent {...this.props} />
      : null;

    let pageTitle;
    if (this.props.options.pageTitle != null) {
      pageTitle = <h1>{this.props.options.pageTitle}</h1>;
    }

    return (
      <LiveAnnouncer>
        <div className={`fs-container ${this.props.options.layoutAndClasses.containerClass}`} style={{ gridTemplateColumns: this.props.options.layoutAndClasses.layout }}>
          <aside className={`fs-aside ${this.props.options.layoutAndClasses.asideClass}`}>
            <SearchFieldContainerComponent
              bootstrapCss={bootstrapCss}
              onNewSearch={this.resetFilters}
              resultsCount={this.props.results.numFound}
            >
              {/* Only render the visible facets / filters.
                  Note: their values may still be used in the query, if they were pre-set. */}
              {searchFields
                .filter(searchField => this.props.sidebarFilters.indexOf(searchField.field) > -1
                  && !searchField.isHidden)
                .map((searchField, i) => {
                  const {
                    type,
                    field,
                    lowerBound,
                    upperBound,
                  } = searchField;
                  const SearchComponent = customComponents.searchFields[type];
                  const facets = getFacetValues(type, results, field, lowerBound, upperBound);

                  return (
                    <SearchComponent
                      key={i}
                      {...this.props}
                      {...searchField}
                      bootstrapCss={bootstrapCss}
                      facets={facets}
                      truncateFacetListsAt={truncateFacetListsAt}
                      onChange={onSearchFieldChange}
                    />
                  );
                })
              }
            </SearchFieldContainerComponent>
          </aside>
          <div className={`fs-main ${this.props.options.layoutAndClasses.mainClass}`}>
            {pageTitle}
            <div className="fs-search-form" autoComplete="on">
              <FederatedTextSearch
                {...this.props}
                autocomplete={options.autocomplete}
                field="tm_rendered_item"
                label="Enter search term:"
                onSuggest={onTextInputChange}
                onChange={onSearchFieldChange}
                value={searchFields.find(sf => sf.field === 'tm_rendered_item').value}
              />
              <CurrentQueryComponent
                {...this.props}
                onChange={onSearchFieldChange}
              />
              <SortComponent
                bootstrapCss={bootstrapCss}
                onChange={onSortFieldChange}
                sortFields={sortFields}
              />
            </div>
            <p className={(searchFields.find(sf => sf.field === 'tm_rendered_item').value || this.props.options.showEmptySearchResults) ? 'solr-search-results-container__prompt fs-element-invisible' : 'solr-search-results-container__prompt'}>{this.props.options.searchPrompt || 'Please enter a search term.'}</p>
            <div className={(searchFields.find(sf => sf.field === 'tm_rendered_item').value || this.props.options.showEmptySearchResults) ? 'solr-search-results-container__wrapper' : 'solr-search-results-container__wrapper fs-element-invisible'}>
              <ResultContainerComponent bootstrapCss={bootstrapCss}>
                <ResultHeaderComponent bootstrapCss={bootstrapCss}>
                  <ResultCount
                    bootstrapCss={bootstrapCss}
                    numFound={results.numFound}
                    start={start}
                    rows={rows}
                    onChange={onPageChange}
                    noResultsText={this.props.options.noResults || null}
                    termValue={searchFields.find(sf => sf.field === 'tm_rendered_item').value}
                  />
                  {resultPending}
                </ResultHeaderComponent>
                <ResultListComponent bootstrapCss={bootstrapCss}>
                  {results.docs.map((doc, i) => (
                    <ResultComponent
                      bootstrapCss={bootstrapCss}
                      doc={doc}
                      fields={searchFields}
                      key={doc.id || i}
                      onSelect={this.props.onSelectDoc}
                      resultIndex={i}
                      rows={rows}
                      start={start}
                      highlight={results.highlighting[doc.id]}
                      hostname={this.props.options.hostname}
                    />
                  ))}
                  {preloadListItem}
                </ResultListComponent>
                {pagination}
              </ResultContainerComponent>
            </div>
          </div>
        </div>
      </LiveAnnouncer>
    );
  }
}

FederatedSolrFacetedSearch.defaultProps = {
  bootstrapCss: true,
  customComponents: FederatedSolrComponentPack,
  pageStrategy: 'paginate',
  rows: 20,
  searchFields: [
    {
      type: 'text', field: '*',
    },
  ],
  sortFields: [],
  truncateFacetListsAt: -1,
  showCsvExport: false,
  sidebarFilters: ['sm_site_name', 'ss_federated_type', 'ds_federated_date', 'sm_federated_terms'],
  options: {},
};

FederatedSolrFacetedSearch.propTypes = {
  bootstrapCss: PropTypes.bool,
  customComponents: PropTypes.object,
  onCsvExport: PropTypes.func,
  onNewSearch: PropTypes.func,
  onPageChange: PropTypes.func,
  onSearchFieldChange: PropTypes.func.isRequired,
  onTextInputChange: PropTypes.func,
  onSelectDoc: PropTypes.func,
  onSortFieldChange: PropTypes.func.isRequired,
  query: PropTypes.object,
  results: PropTypes.object,
  showCsvExport: PropTypes.bool,
  truncateFacetListsAt: PropTypes.number,
  options: PropTypes.object,
};

export default FederatedSolrFacetedSearch;
