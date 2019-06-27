// index.js
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { SolrClient } from './solr-faceted-search-react/src/index';
import FederatedSolrComponentPack from './components/federated_solr_component_pack';
import FederatedSolrFacetedSearch from './components/federated-solr-faceted-search';
import helpers from './helpers';

// import search app boilerplate styles
import './styles.css';

/**
 * Executes search query based on the value of URL querystring params.
 *
 * @param solrClient
 *   Instantiated solrClient.
 * @param options
 *   Config options, used to determine initial site search name
 */
const searchFromQuerystring = (solrClient, options = {}) => {
  // Get existing querystring params.
  const { parsed, params } = helpers.qs.getParsedQsAndParams();

  let searchFieldsState = solrClient.state.query.searchFields;

  // Set the state for searchFields based on qs params.
  searchFieldsState.forEach((searchField) => {
    // Get the field machine name for the main query field.
    if (Object.prototype.hasOwnProperty.call(options,'mainQueryField') && searchField.field === options.mainQueryField) {
      // Set the state of the main query field to the value of the search qs param
      searchField.value = parsed.search;
    }
    // If the searchField is one for which we preserve state through qs.
    if (helpers.filterFieldsWithQsState.find((filterField) => filterField === searchField.field )) {
      searchField = helpers.qs.setFieldStateFromQs({
        params,
        searchField
      }) // this resets our initial state of search sites
    }
    // Account for default site search configuration, if present and no site
    // has been selected.
    if (searchField.field === 'sm_site_name' && searchField.value === undefined && options.siteList.length > 0) {
      searchField.value = options.siteList;
    }
    // If restricted to the current site by configuration, enforce it here.
    if (searchField.field === 'sm_site_name' && searchField.value === undefined && options.siteSearch !== undefined) {
      searchField.value = [options.siteSearch];
    }
  });

  // Ensure the initial query succeeds by setting a default start value.
  solrClient.state.query.start = solrClient.state.query.start || 0;
  // Send query based on state derived from querystring.
  solrClient.sendQuery(solrClient.state.query);
};

// Initialize the solr client + search app with settings.
const init = (settings) => {
  const defaults = {
    isD7: false,
    // Whether or not we should be querying the solr backend directly.
    proxyIsDisabled: false,
    // The query request endpoint url must be assigned in ./.env.local.js and by the search app settings in the module.
    url: "",
    // The search fields and filterable facets.
    searchFields: [
      {label: "Enter Search Term:", field: "tm_rendered_item", type: "text", isHidden: false},
      {label: "Site Name", field: "sm_site_name", type: "list-facet", collapse: true, isHidden: false},
      {label: "Type", field: "ss_federated_type", type: "list-facet", collapse: true, isHidden: false},
      {label: "Date", field: "ds_federated_date", type: "range-facet", collapse: true, isHidden: false},
      {label: "Federated Terms", field: "sm_federated_terms", type: "list-facet", hierarchy: true, expandedHierarchies: [], isHidden: false},
    ],
    // The solr field to use as the source for the main query param "q".
    mainQueryField: "tm_rendered_item",
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
    rows: 20,
    // Hostname overridable in ./.env.local.js for testing purposes.
    hostname: window.location.hostname,
    autocomplete: false,
  };

  const options = Object.assign(defaults, settings);

  // Update searchFields to indicate which facets or filters should be hidden in the UI.
  // Note: these facets and filters may still be used in the query.
  settings.hiddenSearchFields = settings.hiddenSearchFields || [];
  options.searchFields = options.searchFields.map(searchField => {
    if (settings.hiddenSearchFields.includes(searchField.field)) {
      searchField.isHidden = true;
    }
    return searchField;
  });

  // Set sm_site_name default values from config
  // @TODO honor this even when no param present in QS @~L#36
  const sm_site_name_value = settings.sm_site_name || false;
  options.siteList = sm_site_name_value;
  if (sm_site_name_value) {
    options.searchFields.forEach(searchField => {
      if (searchField.field === 'sm_site_name') {
        searchField.value = sm_site_name_value;
      }
    });
  }

  // The client class.
  const solrClient = new SolrClient({
    isD7: options.isD7,
    proxyIsDisabled: options.proxyIsDisabled,
    url: options.url,
    userpass: options.userpass,
    searchFields: options.searchFields,
    sortFields: options.sortFields,
    pageStrategy: options.pageStrategy,
    rows: options.rows,
    hl: options.hl,
    mainQueryField: options.mainQueryField,
    siteList: options.siteList,

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
          //onSelectDoc={(doc) => console.log(doc)}
          onSelectDoc={()=>{}}
          truncateFacetListsAt={-1}
          options={options}
        />,
        document.getElementById("root")
      )
  });

  // Check if there is a querystring param search term and make initial query.
  searchFromQuerystring(solrClient, options);

  // Listen for browser history changes / updated querystring, make new query.
  // See https://developer.mozilla.org/en-US/docs/Web/Events/popstate
  window.onpopstate = function() {
    searchFromQuerystring(solrClient, options);
  };
};

// If we are in the production environment (i.e. using the build compiled js)
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables
if (process.env.NODE_ENV === 'production') {
  // Get the root element where the app will be rendered.
  const root = document.getElementById("root");

  if (root) {
    // Get the data attribute which has the stringified configuration data json object.
    if (Object.hasOwnProperty.call(root.dataset, 'federatedSearchAppConfig')) {
      const settings = JSON.parse(root.dataset.federatedSearchAppConfig);
      init(settings);
    }
    else {
      console.error('Federated Search React | Could not find a data-federated-search-app-config attribute on div#root.  Please populate data-federated-search-app-config with search app configuration data.');
    }
  }
  else {
    console.error('Federated Search React | Could not find div#root in which to load the search app.');
  }
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
        console.error('Federated Search React | Could not load local configuration for search app: ', error);
      }
    );
}
