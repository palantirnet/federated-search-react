// Create a custom component pack from the default component pack
import {defaultComponentPack} from "../solr-faceted-search-react/src/index";
import FederatedResult from "./results/result";
import FederatedTextSearch from "./text-search/index";
import FederatedListFacet from "./list-facet/index";
import FederatedRangeFacet from "./range-facet/index";
import FederatedSearchFieldContainer from "./search-field-container";
import FederatedResultList from "./results/list";
import FederatedPagination from "./results/pagination";
import FederatedCountLabel from "./results/count-label";
import FederatedCurrentQuery from "./current-query";
import FederatedSortMenu from "./sort-menu";

const FederatedSolrComponentPack = {
  ...defaultComponentPack,
  searchFields: {
    ...defaultComponentPack.searchFields,
    text: FederatedTextSearch,
    "list-facet": FederatedListFacet,
    "range-facet": FederatedRangeFacet,
    container: FederatedSearchFieldContainer,
    currentQuery: FederatedCurrentQuery
  },
  results: {
    ...defaultComponentPack.results,
    result: FederatedResult,
    list: FederatedResultList,
    paginate: FederatedPagination,
    resultCount: FederatedCountLabel
  },
  sortFields: {
    menu: FederatedSortMenu
  }
}

export default FederatedSolrComponentPack;
