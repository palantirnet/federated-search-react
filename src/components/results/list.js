import PropTypes from 'prop-types';
import React from "react";

class FederatedResultList extends React.Component {

	render() {
		return (
			<React.Fragment>
				<h2 className="element-invisible">Search results</h2>
				<ul className="search-results">
					{this.props.children}
				</ul>
			</React.Fragment>
		);
	}
}

FederatedResultList.propTypes = {
	children: PropTypes.array
};

export default FederatedResultList;
