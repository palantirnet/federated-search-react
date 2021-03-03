import PropTypes from 'prop-types';
import React from 'react';

class FederatedSortMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sort: 'score',
    };
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(event) {
    this.setState({ sort: event.target.value });

    const { sortFields, onChange } = this.props;
    const sortField = event.target.value;
    const foundIdx = sortFields.indexOf(sortField);
    if (foundIdx < 0) {
      onChange(sortField, 'desc');
    } else {
      onChange(sortField, null);
    }
  }

  render() {
    const { sortFields } = this.props;
    const { sort } = this.state;
    if (sortFields.length === 0) { return null; }

    return (
      <div className="fs-search-scope">
        <div className="fs-search-scope__filter">
          {/* eslint jsx-a11y/label-has-associated-control: ["error", { assert: "either" } ] */}
          <label className="fs-search-scope__label" htmlFor="sort-by">Sort By</label>
          <select className="fs-search-scope__select" id="sort-by" name="sort-by" onChange={this.onSelect} value={sort}>
            {sortFields.map((sortField, i) => (
              /* eslint-disable-next-line react/no-array-index-key */
              <option value={sortField.field} key={i}>{sortField.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

FederatedSortMenu.defaultProps = {
  sortFields: [],
};

FederatedSortMenu.propTypes = {
  onChange: PropTypes.func.isRequired,
  sortFields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    field: PropTypes.string,
  })),
};

export default FederatedSortMenu;
