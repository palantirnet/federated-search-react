import cx from "classnames";
import PropTypes from 'prop-types';
import React from "react";
import AnimateHeight from 'react-animate-height';

class FederatedSortMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sort: 'score',
    };
    this.onSelect = this.onSelect.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
  }
  toggleExpand() {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
  }

  onSelect(event) {
    console.log(event.target.value);
    this.setState({sort: event.target.value});

    const sortField = event.target.value;
    const foundIdx = this.props.sortFields.indexOf(sortField);

    console.log(foundIdx);
    if (foundIdx < 0) {
      this.props.onChange(sortField, "desc");
    } else {
      this.props.onChange(sortField, null);
    }
  }

  render() {
    const { sortFields, sortFilterInAccordion, collapse } = this.props;
    const expanded = !(collapse || false);
    const height = expanded ? 'auto' : 0;
    if (sortFields.length === 0) { return null; }

    return (
      sortFilterInAccordion
        ? (
          <li className={'fs-search-accordion__group-item'} id={`solr-list-facet-sort-by`}>
            <div
              tabIndex="0"
              className={cx("fs-search-accordion__title", {"js-fs-search-accordion-open": expanded})}
              id={'sort-by'}
              onClick={this.toggleExpand.bind(this)}
              onKeyDown={(event)=>{if (event.keyCode === 13) {this.toggleExpand()}}}
            >Sort by</div>
            <AnimateHeight
              duration={600}
              height={height}
            >
            <ul className="fs-search-accordion__content">
              <li className="fs-search-accordion__content-item">
              <div className="fs-search-scope__filter">
                <select className="fs-search-scope__select" id="sort-by" name="sort-by" onChange={this.onSelect} value={this.state.sort}>
                  {sortFields.map((sortField, i) => (
                    <option value={sortField.field} key={i}>{sortField.label}</option>
                  ))}
                </select>
              </div>
              </li>
            </ul>
            </AnimateHeight>
          </li>
        )
        : (
          <div className="fs-search-scope">
            <div className="fs-search-scope__filter">
              <label className="fs-search-scope__label" htmlFor="sort-by">Sort By</label>
              <input className="fs-search-scope__select" id="sort" name="sort" type="checkbox" value="ds_federated_date" onChange={this.onSelect.bind(this)} />
            </div>
          </div>
        )
    );
  }
}

FederatedSortMenu.propTypes = {
  bootstrapCss: PropTypes.bool,
  onChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  sortFields: PropTypes.array,
  sortFilterInAccordion: PropTypes.bool,
  collapse: PropTypes.bool,
};

export default FederatedSortMenu;
