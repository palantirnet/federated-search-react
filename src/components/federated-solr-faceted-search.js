import React from "react";
import PropTypes from 'prop-types';
import cx from "classnames";

//import componentPack from "./component-pack";
import FederatedSolrComponentPack from "./federated_solr_component_pack";

const getFacetValues = (type, results, field, lowerBound, upperBound) =>
    type === "period-range-facet" ? (results.facets[lowerBound] || []).concat(results.facets[upperBound] || []) :
        type === "list-facet" || type === "range-facet" ? results.facets[field] || [] : null;


class FederatedSolrFacetedSearch extends React.Component {

  render() {
    const { customComponents, bootstrapCss, query, results, truncateFacetListsAt } = this.props;
    const { onSearchFieldChange, onSortFieldChange, onPageChange, onCsvExport } = this.props;

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
    const CsvExportComponent = customComponents.results.csvExport;
    const CurrentQueryComponent = customComponents.searchFields.currentQuery;
    const SortComponent = customComponents.sortFields.menu;
    const resultPending = results.pending ? (<ResultPendingComponent bootstrapCss={bootstrapCss} />) : null;
    const FederatedTextSearch = FederatedSolrComponentPack.searchFields.text;

    const pagination = query.pageStrategy === "paginate" ?
        <PaginateComponent {...this.props} bootstrapCss={bootstrapCss} onChange={onPageChange} /> :
        null;

    const preloadListItem = query.pageStrategy === "cursor" && results.docs.length < results.numFound ?
        <PreloadComponent {...this.props} /> : null;

    return (
        <div className="container">
          <aside className="l-25-75--1">
            <SearchFieldContainerComponent bootstrapCss={bootstrapCss} onNewSearch={this.props.onNewSearch}>
              {searchFields.filter((searchFields) => this.props.sidebarFilters.indexOf(searchFields.field) > -1).map((searchField, i) => {
                const { type, field, lowerBound, upperBound } = searchField;
                const SearchComponent = customComponents.searchFields[type];
                const facets = getFacetValues(type, results, field, lowerBound, upperBound);

                return (<SearchComponent
                        key={i} {...this.props} {...searchField}
                        bootstrapCss={bootstrapCss}
                        facets={facets}
                        truncateFacetListsAt={truncateFacetListsAt}
                        onChange={onSearchFieldChange} />
                );
              })}
            </SearchFieldContainerComponent>
          </aside>
          <div className="l-25-75--2">
            <h1>Sitewide Search</h1>
            <div className="search-form" autoComplete="on">
              <FederatedTextSearch
                  field="tm_rendered_item"
                  label="Enter search term:"
                  onChange={onSearchFieldChange}
                  value={searchFields.find((sf) => sf.field === "tm_rendered_item").value }
              />
              <CurrentQueryComponent {...this.props} onChange={onSearchFieldChange} />
              <SortComponent bootstrapCss={bootstrapCss} onChange={onSortFieldChange} sortFields={sortFields} />
            </div>
            <p className={searchFields.find((sf) => sf.field === "tm_rendered_item").value ? 'solr-search-results-container__prompt element-invisible' : 'solr-search-results-container__prompt'}>{this.props.options.searchPrompt || 'Please enter a search term.'}</p>
            <div className={searchFields.find((sf) => sf.field === "tm_rendered_item").value ? 'solr-search-results-container__wrapper' : 'solr-search-results-container__wrapper element-invisible'}>
              <ResultContainerComponent bootstrapCss={bootstrapCss}>
              <ResultHeaderComponent bootstrapCss={bootstrapCss}>
                <ResultCount bootstrapCss={bootstrapCss} numFound={results.numFound} start={start} rows={rows} onChange={onPageChange} noResultsText={this.props.options.noResults || null} />
                {resultPending}
              </ResultHeaderComponent>
              <ResultListComponent bootstrapCss={bootstrapCss}>
                {results.docs.map((doc, i) => (
                    <ResultComponent bootstrapCss={bootstrapCss}
                                     doc={doc}
                                     fields={searchFields}
                                     key={doc.id || i}
                                     onSelect={this.props.onSelectDoc}
                                     resultIndex={i}
                                     rows={rows}
                                     start={start}
                                     highlight={results.highlighting[doc.id]}
                    />
                ))}
                {preloadListItem}
              </ResultListComponent>
              {pagination}
            </ResultContainerComponent>
            </div>
          </div>
        </div>
    );
  }
}

FederatedSolrFacetedSearch.defaultProps = {
  bootstrapCss: true,
  customComponents: FederatedSolrComponentPack,
  pageStrategy: "paginate",
  rows: 20,
  searchFields: [
    {type: "text", field: "*"}
  ],
  sortFields: [],
  truncateFacetListsAt: -1,
  showCsvExport: false,
  sidebarFilters: ['ss_site_name', 'ss_federated_type', 'ds_federated_date', 'sm_federated_terms'],
  options: {}
};

FederatedSolrFacetedSearch.propTypes = {
  bootstrapCss: PropTypes.bool,
  customComponents: PropTypes.object,
  onCsvExport: PropTypes.func,
  onNewSearch: PropTypes.func,
  onPageChange: PropTypes.func,
  onSearchFieldChange: PropTypes.func.isRequired,
  onSelectDoc: PropTypes.func,
  onSortFieldChange: PropTypes.func.isRequired,
  query: PropTypes.object,
  results: PropTypes.object,
  showCsvExport: PropTypes.bool,
  truncateFacetListsAt: PropTypes.number,
  options: PropTypes.object
};

export default FederatedSolrFacetedSearch;
