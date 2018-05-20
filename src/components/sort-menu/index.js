import PropTypes from 'prop-types';
import React from "react";

class FederatedSortMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
      sort: 'score'
		};
    this.onSelect = this.onSelect.bind(this);
	}

	onSelect(event) {
	  this.setState({sort: event.target.value});

	  const sortField = event.target.value;
		const foundIdx = this.props.sortFields.indexOf(sortField);
		if (foundIdx < 0) {
			this.props.onChange(sortField, "desc");
		} else {
			this.props.onChange(sortField, null);
		}
	}

	render() {
		const { sortFields } = this.props;
		if (sortFields.length === 0) { return null; }

		return (
			<div className="search-scope">
        <div className="search-scope__filter">
          <label className="search-scope__label" htmlFor="sort-by">Sort By</label>
          <select className="search-scope__select" id="sort-by" name="sort-by" onChange={this.onSelect} value={this.state.sort}>
						{sortFields.map((sortField, i) => (
                <option value={sortField.field} key={i}>{sortField.label}</option>
						))}
          </select>
        </div>
			</div>
		);
	}
}

FederatedSortMenu.propTypes = {
	bootstrapCss: PropTypes.bool,
	onChange: PropTypes.func,
	sortFields: PropTypes.array
};

export default FederatedSortMenu;