import PropTypes from 'prop-types';
import React from 'react';
import 'intl';
import 'intl/locale-data/jsonp/en';
import url from 'url';

// Custom class for the result component
class FederatedResult extends React.Component {
  static dateFormat(date) {
    if (typeof date !== 'undefined') {
      const prettyDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(Date.parse(date));
      const separator = '  ·  ';
      return separator + prettyDate;
    }

    return null;
  }

  static intersperse(arr, sep) {
    if (arr.length === 0) {
      return [];
    }

    return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
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
        const myUrl = url.parse(item);
        return myUrl.hostname === hostname;
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

  static renderValue(field, doc) {
    const value = [].concat(doc[field] || null).filter((v) => v !== null);

    return value.join(', ');
  }

  static renderSitenameLinks(sitenames, urls, originalSitename) {
    if (sitenames != null && urls != null) {
      const sites = [];
      for (let i = 0; i < sitenames.length; i += 1) {
        sites.push(<a className="fs-search-results__site-name" href={urls[i]} key={i}>{sitenames[i]}</a>);
      }
      return FederatedResult.intersperse(sites, ' | ');
    }

    if (originalSitename != null) {
      return originalSitename;
    }

    return null;
  }

  render() {
    const { doc, highlight, onSelect } = this.props;

    // The link text in the returned result gets set by React.
    // TODO: move onClick to interactive element and add key event.
    /* eslint-disable jsx-a11y/control-has-associated-label, jsx-a11y/click-events-have-key-events,
       jsx-a11y/no-noninteractive-element-interactions */
    return (
      <li className="fs-search-results__item" onClick={() => onSelect(doc)}>
        {doc.ss_federated_image
        && (
        <div className="fs-search-results__container--left">
          <img className="fs-search-results__image" src={doc.ss_federated_image} alt="" />
        </div>
        )}
        <div className="fs-search-results__container--right">
          <span className="fs-search-results__label">{doc.ss_federated_type}</span>
          <h3 className="fs-search-results__heading"><a href={this.getCanonicalLink(doc)} dangerouslySetInnerHTML={{ __html: doc.ss_federated_title }} /></h3>
          <div className="fs-search-results__meta">
            <cite className="fs-search-results__citation">{FederatedResult.renderSitenameLinks(doc.sm_site_name, doc.sm_urls, doc.ss_site_name)}</cite>
            <span className="fs-search-results__date">{FederatedResult.dateFormat(doc.ds_federated_date)}</span>
          </div>
          <p className="fs-search-results__teaser" dangerouslySetInnerHTML={{ __html: highlight.tm_rendered_item }} />
        </div>
      </li>
    );
    /* eslint-enable jsx-a11y/control-has-associated-label */
  }
}

FederatedResult.propTypes = {
  doc: PropTypes.shape({
    ss_canonical_url: PropTypes.string,
    sm_urls: PropTypes.arrayOf(PropTypes.string),
    ss_url: PropTypes.string,
    ss_federated_image: PropTypes.string,
    ss_federated_type: PropTypes.string,
    ss_federated_title: PropTypes.string,
    sm_site_name: PropTypes.arrayOf(PropTypes.string),
    ss_site_name: PropTypes.string,
    ds_federated_date: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  hostname: PropTypes.string.isRequired,
  highlight: PropTypes.shape({
    tm_rendered_item: PropTypes.string,
  }).isRequired,
};

export default FederatedResult;
