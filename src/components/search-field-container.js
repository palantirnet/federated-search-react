import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import AnimateHeight from 'react-animate-height';


class FederatedSearchFieldContainer extends React.Component {
  constructor(props) {
    super(props);

    // This will return the width of the viewport.
    let intFrameWidth = window.innerWidth;

    // Get our breakpoint option from env.
    const {breakpointDesktop='900'} = this.props.options.layoutAndClasses || {};

    this.state = {
      // Filters are visible for large / hidden for small screens by default.
      expanded: intFrameWidth > breakpointDesktop,
    };

    this.handleClick = this.handleClick.bind(this);

    window.addEventListener('resize', () => {
      // Desktop height.
      let height = 'auto';
      // In mobile view, when resized, lets close things.
      if (window.innerWidth < breakpointDesktop) {
        height = 0;
      }
      this.setState({
        expanded: height,
      });
    });
  }

  handleClick() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { onNewSearch } = this.props;
    const height = this.state.expanded ? 'auto' : 0;

    return (
      <div className="fs-search-filters">
        <button
          className={cx('fs-search-filters__trigger', {
            'js-fs-search-filters-open': this.state.expanded,
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
              { this.props.resultsCount > 0
                ? (<ul className="fs-search-accordion__group">{this.props.children}</ul>)
                : <div className="fs-search-filters__no-results">There are no results to filter.</div> }
            </section>

            { this.props.resultsCount > 0
              ? <div className="fs-search-filters__row"><button className="fs-search-filters__reset" type="button" onClick={onNewSearch}>Clear All</button></div>
              : null }
          </form>
        </AnimateHeight>
      </div>
    );
  }
}

FederatedSearchFieldContainer.propTypes = {
  children: PropTypes.array,
  onNewSearch: PropTypes.func,
  options: PropTypes.object,
};

export default FederatedSearchFieldContainer;
