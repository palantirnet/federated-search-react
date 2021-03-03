import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import AnimateHeight from 'react-animate-height';

class FederatedSearchFieldContainer extends React.Component {
  constructor(props) {
    super(props);

    // This will return the width of the viewport.
    const intFrameWidth = window.innerWidth;

    this.state = {
      // Filters are visible for large / hidden for small screens by default.
      expanded: intFrameWidth > 900,
    };

    this.handleClick = this.handleClick.bind(this);

    window.addEventListener('resize', () => {
      // Desktop height.
      let height = 'auto';
      // In mobile view, when resized, lets close things.
      if (window.innerWidth < 900) {
        height = 0;
      }
      this.setState({
        expanded: height,
      });
    });
  }

  handleClick() {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  }

  render() {
    const { onNewSearch, resultsCount, children } = this.props;
    const { expanded } = this.state;
    const height = expanded ? 'auto' : 0;

    return (
      <div className="fs-search-filters">
        <button
          type="submit"
          className={cx('fs-search-filters__trigger', {
            'js-fs-search-filters-open': expanded,
          })}
          onClick={this.handleClick}
        >
          Filter Results
        </button>
        <AnimateHeight
          duration={450}
          height={height}
        >
          <form className="fs-search-filters__form">
            <section className="fs-search-accordion" aria-labelledby="fs-section-title">
              <div className="fs-search-filters__row">
                <h2 className="fs-search-filters__title" id="fs-section-title">Filter Results</h2>
              </div>
              { resultsCount > 0
                ? (<ul className="fs-search-accordion__group">{children}</ul>)
                : <div className="fs-search-filters__no-results">There are no results to filter.</div> }
            </section>

            { resultsCount > 0
              ? <div className="fs-search-filters__row"><button className="fs-search-filters__reset" type="button" onClick={onNewSearch}>Clear All</button></div>
              : null }
          </form>
        </AnimateHeight>
      </div>
    );
  }
}

FederatedSearchFieldContainer.defaultProps = {
  children: [],
};

FederatedSearchFieldContainer.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object),
  onNewSearch: PropTypes.func.isRequired,
  resultsCount: PropTypes.number.isRequired,
};

export default FederatedSearchFieldContainer;
