import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import {DoubleChevronLeft, ChevronLeft, ChevronRight, DoubleChevronRight} from "../icons/chevrons";

class FederatedPagination extends React.Component {

  onPageChange(page, pageAmt) {
    if (page >= pageAmt || page < 0) { return; }
    this.props.onChange(page);

    if(document.getElementById("stat") != null) {
      document.getElementById("stat").focus({preventScroll: false});
    }
  }

  buildHandleEnterKeyPress = (onClick) => ({ key }) => {
    if (key === 'Enter') {
      onClick();
    }
  };

  renderPage(page, currentPage, key) {
    let isCurrentPage = page === currentPage;
    return (
      <li className={cx("fs-search-pager__item", (isCurrentPage ? 'is-active' : 'not-active'))} key={key}>
        <a className={cx("fs-search-pager__item-link fs-search-pager__item-link--number")} role="button" tabIndex="0" onClick={this.onPageChange.bind(this, page)} onKeyPress={this.buildHandleEnterKeyPress(this.onPageChange.bind(this, page))} title={isCurrentPage ? "Current page" : `Go to page ${page + 1}`} aria-current={isCurrentPage ? page + 1 : undefined}>
          <span className="fs-element-invisible">Page</span>{page + 1}
        </a>
      </li>
    );
  }

  render() {
    const { query, results } = this.props;
    const { start, rows } = query;
    const { numFound } = results;
    const pageAmt = Math.ceil(numFound / rows);
    const currentPage = start / rows;
    const numButtons = this.props.options.paginationButtons || 5;

    let rangeStart = currentPage - 2 < 0 ? 0 : currentPage - 2;
    let rangeEnd = rangeStart + numButtons > pageAmt ? pageAmt : rangeStart + numButtons;

    if (rangeEnd - rangeStart < numButtons && rangeStart > 0) {
      rangeStart = rangeEnd - numButtons;
      if (rangeStart < 0) { rangeStart = 0; }
    }

    let pages = [];
    for (let page = rangeStart; page < rangeEnd; page++) {
      if (pages.indexOf(page) < 0) {
        pages.push(page);
      }
    }

    let firstPageHidden = (currentPage === 0);
    let prevPageHidden = (currentPage - 1 < 0);
    let nextPageHidden = (currentPage + 1 >= pageAmt);
    let lastPageHidden = (pageAmt === 0 || currentPage === pageAmt - 1);

    return (
      <nav className="fs-search-pager" aria-labelledby="fs-pagination-heading">
        <h4 id="fs-pagination-heading" className="fs-element-invisible">Pagination</h4>
        <ul className="fs-search-pager__items">
          <li className={cx("fs-search-pager__item fs-search-pager__item--first", {"fs-element-invisible": firstPageHidden})} key="start">
            <a className={cx("fs-search-pager__item-link")} role="button" tabIndex={firstPageHidden ? "-1" : "0"} onClick={this.onPageChange.bind(this, 0)} onKeyPress={ this.buildHandleEnterKeyPress(this.onPageChange.bind(this, 0)) } title="Go to first page">
              <span className="fs-element-invisible">First page</span>
              <span aria-hidden={firstPageHidden ? "true" : "false"}>
                <DoubleChevronLeft/>
              </span>
            </a>
          </li>
          <li className={cx("fs-search-pager__item search-pager__item--previous", {"fs-element-invisible": prevPageHidden})} key="prev">
            <a className={cx("fs-search-pager__item-link")} role="button" tabIndex={prevPageHidden ? "-1" : "0"} onClick={this.onPageChange.bind(this, currentPage - 1)} onKeyPress={ this.buildHandleEnterKeyPress(this.onPageChange.bind(this, currentPage - 1)) }title="Go to previous page" rel="next">
              <span className="fs-element-invisible">Previous page</span>
              <span aria-hidden={prevPageHidden  ? "true" : "false"}>
                <ChevronLeft/>
              </span>
            </a>
          </li>
          {pages.map((page, idx) => this.renderPage(page, currentPage, idx))}
          <li className={cx("fs-search-pager__item fs-search-pager__item--next", {"fs-element-invisible": nextPageHidden})} key="next">
            <a className={cx("fs-search-pager__item-link")} role="button" tabIndex={nextPageHidden ? "-1" : "0"} onClick={this.onPageChange.bind(this, currentPage + 1, pageAmt)} onKeyPress={ this.buildHandleEnterKeyPress(this.onPageChange.bind(this, currentPage + 1, pageAmt)) } title="Go to next page" rel="next">
              <span className="fs-element-invisible">Next page</span>
              <span aria-hidden={nextPageHidden ? "true" : "false"}>
                <ChevronRight/>
              </span>
            </a>
          </li>
          <li className={cx("fs-search-pager__item search-pager__item--last", {"fs-element-invisible": lastPageHidden})} key="end">
            <a className={cx("fs-search-pager__item-link")} role="button" tabIndex={lastPageHidden ? "-1" : "0"} onClick={this.onPageChange.bind(this, pageAmt - 1)} onKeyPress={ this.buildHandleEnterKeyPress(this.onPageChange.bind(this, pageAmt - 1)) } title="Go to last page">
              <span className="fs-element-invisible">Last page</span>
              <span aria-hidden={lastPageHidden ? "true" : "false"}>
                <DoubleChevronRight/>
              </span>
            </a>
          </li>
        </ul>
      </nav>
    );
  }
}

FederatedPagination.propTypes = {
  onChange: PropTypes.func,
  query: PropTypes.object,
  results: PropTypes.object
};

export default FederatedPagination;
