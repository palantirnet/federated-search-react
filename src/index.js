// index.js
import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import { SolrClient } from "./solr-faceted-search-react/src/index";
import FederatedSolrComponentPack from "./components/federated_solr_component_pack";
import FederatedSolrFacetedSearch from "./components/federated-solr-faceted-search";

// import search app boilerplate styles
import './styles.css';

/**
 * Executes search query based on the value of URL querystring "q" param.
 *
 * @param solrClient
 *   Instantiated solrClient.
 */
const searchFromQuerystring = (solrClient) => {
  // Initialize with a search based on querystring term or else load blank search.
  const parsed = queryString.parse(window.location.search);
  // We assume the querystring key for search terms is q: i.e. ?q=search%20term
  if (Object.prototype.hasOwnProperty.call(parsed,'search')) {
    solrClient.setSearchFieldValue("tm_rendered_item", parsed.search);
  }
  // Reset search fields, fetches all results from solr. Note: results will be hidden
  // since there is no search term.  See: federated-solr-faceted-search where
  // ResultContainerComponent is rendered.
  else {
    solrClient.resetSearchFields();
  }
};

// Initialize the solr client + search app with settings.
const init = (settings) => {
  const defaults = {
    // The default solr backend must be assigned in ./.env.local.js and by the search app settings in the module.
    url: "",
    // The search fields and filterable facets.
    searchFields: [
      {label: "Enter Search Term:", field: "tm_rendered_item", type: "text"},
      {label: "Site Name", field: "ss_site_name", type: "list-facet", collapse: true},
      {label: "Type", field: "ss_federated_type", type: "list-facet", collapse: true},
      {label: "Date", field: "ds_federated_date", type: "range-facet", collapse: true},
      {label: "Federated Terms", field: "sm_federated_terms", type: "list-facet", hierarchy: true},
    ],
    // The solr field to use as the source for the main query param "q".
    mainQueryField: "tm_rendered_item",
    // The default site search facet value.
    siteSearch: null,
    // The options by which to sort results.
    sortFields: [
      {label: "Relevance", field: "score"},
      {label: "Date", field: "ds_federated_date"}
    ],
    // Enable highlighting in search results snippets.
    hl: {
      fl: 'tm_rendered_item', // the highlight snippet source field(s)
      usePhraseHighlighter: true // highlight phrase queries
    },
    pageStrategy: "paginate",
    rows: 20
  };

  const options = Object.assign(defaults, settings);

  // The client class
  const solrClient = new SolrClient({
    url: options.url,
    searchFields: options.searchFields,
    sortFields: options.sortFields,
    pageStrategy: options.pageStrategy,
    rows: options.rows,
    hl: options.hl,
    mainQueryField: options.mainQueryField,

    // The change handler passes the current query- and result state for render
    // as well as the default handlers for interaction with the search component
    onChange: (state, handlers) =>
      // Render the faceted search component
      ReactDOM.render(
        <FederatedSolrFacetedSearch
          {...state}
          {...handlers}
          customComponents={FederatedSolrComponentPack}
          bootstrapCss={false}
          onSelectDoc={(doc) => console.log(doc)}
          truncateFacetListsAt={-1}
          options={options}
        />,
        document.getElementById("root")
      )
  });

  // Check if there is a querystring param search term and make initial query.
  searchFromQuerystring(solrClient);

  // Listen for browser history changes and update querystring, make new query as necessary.
  // See https://developer.mozilla.org/en-US/docs/Web/Events/popstate
  window.onpopstate = function() {
    searchFromQuerystring(solrClient);
  };
};

// If we are in the production environment (i.e. using the build compiled js)
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables
if (process.env.NODE_ENV === 'production') {
  // The endpoint where production config options live.
  const url = '/search_api_federated_solr/settings?_format=json';

  // Get configuration settings from the endpoint.
  fetch(url)
    .then(res => res.json())
    .then(
      (result) => {
        init(result); // Load the app, passing in the config.
      },
      (error) => {
        console.error('search_api_federated_solr | Could not load configuration for search app: ', error);
      }
    );
}
// This is not production (i.e. not using the build compiled js)
else {
  // Get the local environment settings for the search app and initialize.
  import('./.env.local.js')
    .then(
      (settings) => {
        init(settings); // Load the app, passing in the ./.env.local.js config.
      },
      (error) => {
        console.error('search_api_federated_solr | Could not load local configuration for search app: ', error);
      }
    );
}
