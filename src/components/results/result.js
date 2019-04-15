import PropTypes from 'prop-types';
import React from "react";
import 'intl';
import 'intl/locale-data/jsonp/en';

// Custom class for the result component
class FederatedResult extends React.Component {
  renderValue(field, doc) {
    const value = [].concat(doc[field] || null).filter((v) => v !== null);

    return value.join(", ");
  }

  dateFormat(date){
    if (typeof date !== 'undefined') {
      const prettyDate =  new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(Date.parse(date));
      const separator = "  ·  ";
      return separator + prettyDate;
    }
  }

  /**
   * Returns the appropriate link for a given search result.
   * 1. Use the canonical url if present.
   * 2. Next, attempt to find a url from the current host.
   * 3. Then, use the first url returned in the array of urls.
   * 4. Fall back to the legacy url field.
   * 5. Send an empty string if none of these options work.
   *
   * @param doc
   *   Search result object
   * @returns string
   */
  getCanonicalLink(doc) {
    const { hostname } = this.props;

    // 1. Use the canonical url as a first option
    if (Object.hasOwnProperty.call(doc, 'ss_canonical_url') && doc.ss_canonical_url) {
      return doc.ss_canonical_url;
    }

    // Use a url from the current host, if present.  Otherwise use the first Url.
    if (Object.hasOwnProperty.call(doc, 'sm_urls') && Array.isArray(doc.sm_urls)) {
      // Attempt to find a url from the current host.
      const currentHostUrl = doc.sm_urls.find((item) => {
        const url = new URL(item);
        return url.hostname === hostname;
      });

      // 2. Use the url from the current host.
      if (currentHostUrl) {
        return currentHostUrl;
      }

      // 3. Use the first url.
      return doc.sm_urls[0];
    }

    // 4. Fall back to the single url (which will be relative)
    if (Object.hasOwnProperty.call(doc, 'ss_url') && doc.ss_url) {
      return doc.ss_url;
    }

    // 5. If no valid urls are passed, return nothing. This will result in an
    // unlinked title, but at least it won't crash.
    return '';
  }

  intersperse(arr, sep) {
    if (arr.length === 0) {
      return [];
    }

    return arr.slice(1).reduce(function(xs, x, i) {
      return xs.concat([sep, x]);
    }, [arr[0]]);
  }

  renderSitenameLinks(sitenames, urls, originalSitename) {
    if (sitenames != null && urls != null) {

      var sites = [];
      for (var i = 0; i < sitenames.length; i++) {
        sites.push(<a href={urls[i]} key={i}>{sitenames[i]}</a>);
        if (i !== (sitenames.length - 1)) {

        }
      }
      return this.intersperse(sites, " | ");
    }

    if (originalSitename != null) {
      return originalSitename;
    }

    return null;
  }

  render() {
    const { doc, highlight } = this.props;

    return (
      <li onClick={() => this.props.onSelect(doc)}>
        {doc.ss_federated_image &&
        <div className="search-results__container--left">
          <img src={doc.ss_federated_image} alt=""/>
        </div>
        }
        <div className="search-results__container--right">
          <span className="search-results__label">{doc.ss_federated_type}</span>
          <h3 className="search-results__heading"><a href={this.getCanonicalLink(doc)} dangerouslySetInnerHTML={{__html: doc.ss_federated_title}} /></h3>
          <div className="search-results__meta">
            <cite className="search-results__citation">{this.renderSitenameLinks(doc.sm_site_name, doc.sm_urls, doc.ss_site_name)}</cite>
            {this.dateFormat(doc.ds_federated_date)}
          </div>
          <p className="search-results__teaser" dangerouslySetInnerHTML={{__html: highlight.tm_rendered_item}} />
        </div>
      </li>
    )
  }
}

FederatedResult.propTypes = {
	doc: PropTypes.object,
	fields: PropTypes.array,
	onSelect: PropTypes.func.isRequired,
    hostname: PropTypes.string,
};

export default FederatedResult;
