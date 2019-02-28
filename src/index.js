// index.js
import 'babel-polyfill';
import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import { SolrClient } from "./solr-faceted-search-react/src/index";
import FederatedSolrComponentPack from "./components/federated_solr_component_pack";
import FederatedSolrFacetedSearch from "./components/federated-solr-faceted-search";

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
  // Get the qs params, break into array of [key,value] pairs.
  // Params with multiple values (i.e. federated terms) use the following syntax:
  // ...&sm_federated_terms[]=value1&sm_federated_terms[]=value2
  const parsed = queryString.parse(window.location.search, { arrayFormat: 'bracket' });
  const params = Object.entries(parsed);

  let searchFieldsState = solrClient.state.query.searchFields;

  // The querystring key for search terms is 'search' (i.e. ?search=search%20term)
  if (Object.prototype.hasOwnProperty.call(parsed,'search')) {

    // Set the state for searchFields based on qs params.
    searchFieldsState.forEach((searchField) => {
      // Get the field machine name for the main query field.
      if (Object.prototype.hasOwnProperty.call(options,'mainQueryField') && searchField.field === options.mainQueryField) {
        // Set the state of the main query field to the value of the search qs param
        searchField.value = parsed.search;
      }

      // Define those filter fields for which we want to preserve state in qs.
      // @todo handle parsing of terms and dates
      // @todo store this in app config?
      const filterFieldsWithQsState = [
        "sm_site_name",
        "ss_federated_type",
        "sm_federated_terms",
      ];

      // If the searchField is one for which we preserve state through qs.
      if (filterFieldsWithQsState.find((filterField) => filterField === searchField.field )) {
        // Check if the filter field exists in qs params.
        const param = params.find((item) => item[0] === searchField.field);
        // If searchField has corresponding qs param present.
        if (param) {
          // Ensure we can push to searchField value.
          searchField.value = searchField.value || [];
          // Don't add qs param values if they're already set in app state.
          // i.e. don't set the value twice
          // Push single values onto the searchField.value array.
          if (typeof param[1] !== 'object' && !searchField.value.find((item) => item === param[1])) {
            searchField.value.push(decodeURI(param[1]));
          }
          // Concatenate existing searchField.value array with multivalue param array..
          if (typeof param[1] === 'object' && searchField.value !== param[1]) {
            // Decode param values.
            const decodedParam = param[1].map(item => decodeURI(item));
            // Set the searchField.value to the new decoded param values.
            searchField.value = [...decodedParam];
          }
        }
        // If the searchField does not have qs param present, clear its value in state.
        else {
          delete searchField.value;
        }
      }
    });

    // Ensure the initial query succeeds by setting a default start value.
    solrClient.state.query.start = solrClient.state.query.start || 0;
    // Send query based on state derived from querystring.
    solrClient.sendQuery(solrClient.state.query);
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
      {label: "Enter Search Term:", field: "tm_rendered_item", type: "text", isHidden: false},
      {label: "Site Name", field: "sm_site_name", type: "list-facet", collapse: true, isHidden: false},
      {label: "Type", field: "ss_federated_type", type: "list-facet", collapse: true, isHidden: false},
      {label: "Date", field: "ds_federated_date", type: "range-facet", collapse: true, isHidden: false},
      {label: "Federated Terms", field: "sm_federated_terms", type: "list-facet", hierarchy: true, isHidden: false},
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

  // The client class
  const solrClient = new SolrClient({
    url: options.url,
    userpass: options.userpass,
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
