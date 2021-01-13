import React from 'react';
import PropTypes from 'prop-types';
import { LiveAnnouncer } from 'react-aria-live';
import FederatedSolrComponentPack from './federated_solr_component_pack';
import helpers from '../helpers';

const getFacetValues = function (type, results, field, lowerBound, upperBound) {
  let values = null;

  if (type === 'period-range-facet') {
    values = (results.facets[lowerBound] || []).concat(results.facets[upperBound] || []);
  } else if (type === 'list-facet' || type === 'range-facet') {
    values = results.facets[field] || [];
  }

  return values;
};

class FederatedSolrFacetedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.resetFilters = this.resetFilters.bind(this);
  }

  resetFilters() {
    const { query, onSearchFieldChange } = this.props;
    let searchTerm = '';
    // Keep only the value of the main search field.
    query.searchField.map((field) => {
      const newField = field;

      if (field.field !== query.mainQueryField) {
        // Remove the field value.
        delete (newField.value);
        // Collapse the sidebar filter toggle.
        newField.collapse = true;
        // Collapse the terms sidebar filter toggle.
        if (Object.hasOwnProperty.call(field, 'expandedHierarchies')) {
          newField.expandedHierarchies = [];
        }
      } else {
        // Extract the value of the main search term to use when setting new URL for this state.
        searchTerm = field.value;
      }

      return newField;
    });
    // Set new parsed params based on only search term value.
    const parsed = {
      search: searchTerm,
    };
    // Add new url to browser window history.
    helpers.qs.addNewUrlToBrowserHistory(parsed);

    // Execute search.
    onSearchFieldChange();
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
      sidebarFilters,
      onSelectDoc,
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

    /* eslint-disable react/jsx-props-no-spreading */

    const pagination = query.pageStrategy === 'paginate'
      ? <PaginateComponent {...this.props} bootstrapCss={bootstrapCss} onChange={onPageChange} />
      : null;

    const preloadListItem = query.pageStrategy === 'cursor'
    && results.docs.length < results.numFound
      ? <PreloadComponent {...this.props} />
      : null;

    let pageTitle;
    if (options.pageTitle != null) {
      pageTitle = <h1>{options.pageTitle}</h1>;
    }

    return (
      <LiveAnnouncer>
        <div className="fs-container">
          <aside className="fs-aside">
            <SearchFieldContainerComponent
              bootstrapCss={bootstrapCss}
              onNewSearch={this.resetFilters}
              resultsCount={results.numFound}
            >
              {/* Only render the visible facets / filters.
                  Note: their values may still be used in the query, if they were pre-set. */}
              {searchFields
                .filter((searchField) => sidebarFilters.indexOf(searchField.field) > -1
                  && !searchField.isHidden)
                .map((searchField) => {
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
                      key={searchField.field}
                      {...this.props}
                      {...searchField}
                      bootstrapCss={bootstrapCss}
                      facets={facets}
                      truncateFacetListsAt={truncateFacetListsAt}
                      onChange={onSearchFieldChange}
                    />
                  );
                })}
            </SearchFieldContainerComponent>
          </aside>
          <div className="fs-main">
            {pageTitle}
            <div className="fs-search-form" autoComplete="on">
              <FederatedTextSearch
                {...this.props}
                autocomplete={options.autocomplete}
                field="tm_rendered_item"
                label="Enter search term:"
                onSuggest={onTextInputChange}
                onChange={onSearchFieldChange}
                value={searchFields.find((sf) => sf.field === 'tm_rendered_item').value}
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
            <p className={(searchFields.find((sf) => sf.field === 'tm_rendered_item').value || options.showEmptySearchResults) ? 'solr-search-results-container__prompt fs-element-invisible' : 'solr-search-results-container__prompt'}>{options.searchPrompt || 'Please enter a search term.'}</p>
            <div className={(searchFields.find((sf) => sf.field === 'tm_rendered_item').value || options.showEmptySearchResults) ? 'solr-search-results-container__wrapper' : 'solr-search-results-container__wrapper fs-element-invisible'}>
              <ResultContainerComponent bootstrapCss={bootstrapCss}>
                <ResultHeaderComponent bootstrapCss={bootstrapCss}>
                  <ResultCount
                    bootstrapCss={bootstrapCss}
                    numFound={results.numFound}
                    start={start}
                    rows={rows}
                    onChange={onPageChange}
                    noResultsText={options.noResults || null}
                    termValue={searchFields.find((sf) => sf.field === 'tm_rendered_item').value}
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
                      onSelect={onSelectDoc}
                      resultIndex={i}
                      rows={rows}
                      start={start}
                      highlight={results.highlighting[doc.id]}
                      hostname={options.hostname}
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

    /* eslint-enable react/jsx-props-no-spreading */
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
  customComponents: PropTypes.shape(FederatedSolrComponentPack),
  pageStrategy: PropTypes.string,
  rows: PropTypes.number,
  searchFields: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    field: PropTypes.string,
  })),
  sortFields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    field: PropTypes.string,
  })),
  onCsvExport: PropTypes.func.isRequired,
  onNewSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSearchFieldChange: PropTypes.func.isRequired,
  onTextInputChange: PropTypes.func.isRequired,
  onSelectDoc: PropTypes.func.isRequired,
  onSortFieldChange: PropTypes.func.isRequired,
  query: PropTypes.shape({
    searchField: PropTypes.arrayOf(PropTypes.object),
    searchFields: PropTypes.arrayOf(PropTypes.object),
    mainQueryField: PropTypes.string,
    sortFields: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      field: PropTypes.string,
    })),
    rows: PropTypes.number,
    start: PropTypes.number,
    pageStrategy: PropTypes.string,
  }).isRequired,
  results: PropTypes.shape(FederatedSolrComponentPack.results).isRequired,
  showCsvExport: PropTypes.bool,
  truncateFacetListsAt: PropTypes.number,
  options: PropTypes.shape({
    pageTitle: PropTypes.string,
    autocomplete: PropTypes.bool,
    showEmptySearchResults: PropTypes.bool,
    searchPrompt: PropTypes.string,
    noResults: PropTypes.string,
    hostname: PropTypes.string,
  }),
  sidebarFilters: PropTypes.arrayOf(PropTypes.string),

};

export default FederatedSolrFacetedSearch;
