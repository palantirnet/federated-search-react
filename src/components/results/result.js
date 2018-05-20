import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

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

  render() {
    const { doc, fields, highlight } = this.props;

    return (
      <li onClick={() => this.props.onSelect(doc)}>
        {doc.ss_federated_image &&
        <div className="search-results__container--left">
          <img src={doc.ss_federated_image} alt=""/>
        </div>
        }
        <div className="search-results__container--right">
          <span className="search-results__label">{doc.ss_federated_type}</span>
          <h3 className="search-results__heading"><a href={doc.ss_url}>{doc.ss_federated_title}</a></h3>
          <div className="search-results__meta">
            <cite className="search-results__citation">{doc.ss_site_name}</cite>
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
	onSelect: PropTypes.func.isRequired
};

export default FederatedResult;
