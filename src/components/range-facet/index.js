import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import moment from "moment";
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import AnimateHeight from 'react-animate-height';

class FederatedRangeFacet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      truncateFacetListsAt: props.truncateFacetListsAt,
      startDate: null,
      endDate: null,
      focusedInput: null,
    };
  }

  toggleExpand() {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
  }

  handleCalendarClose(value) {
    // If there are not start/end dates, we've likely just cleared them, so update props.
    if (value.startDate !== null && value.endDate !== null) {
      // The default time is noon, so start date should start at midnight.
      const momentToSolrStart = moment(value.startDate).subtract({hours:12}).format("YYYY-MM-DDTHH:mm:ss") + 'Z';
      // The default time is noon, so end date should end at 11:59:59.
      const momentToSolrEnd = moment(value.endDate).add({hours:11, minutes:59, seconds: 59}).format("YYYY-MM-DDTHH:mm:ss") + 'Z';
      this.props.onChange(this.props.field, [momentToSolrStart, momentToSolrEnd]);
    }
  }

  handleDatesChange(startDate,endDate) {
    this.setState({startDate, endDate});
    // If there are no start/end dates, something has just cleared them, so update props.
    if (startDate === null && endDate === null) {
      this.props.onChange(this.props.field, []);
    }
  }

  // See: https://reactjs.org/docs/react-component.html#the-component-lifecycle
  componentWillReceiveProps(nextProps) {
    // Clear component inputs when rangeFacet value transitions from populated->empty.
    if (this.props.value.length && !nextProps.value.length) {
      this.setState({
        startDate: null,
        endDate: null
      });
    }
  }

  render() {
    const { query, label, facets, field, value, bootstrapCss, facetSort, collapse } = this.props;

    const expanded = !(collapse || false);
    const height = expanded ? 'auto' : 0;

    // Set better react date props for responsive behavior.
    // See: https://github.com/airbnb/react-dates/issues/262
    let calendarOrientation = undefined; // prop will not be added unless set.
    let calendarFullScreen = undefined; // prop will not be added unless set.
    let calendarMonths = 2; // view 2 months on large screens
    // When viewing 2 months, the last month should be the current.
    let getLastMonth = () => moment().subtract(1, 'months');

    // Set prop values for mobile.
    if (window.matchMedia("(max-width: 600px)").matches) {
      /* the viewport is less than 600 pixels wide */
      calendarMonths = 1;
      calendarOrientation = "vertical";
      calendarFullScreen = true;
      getLastMonth = undefined; // prop will not be added on mobile.
    }

    return (
      <li id={`solr-list-facet-${field}`}>
        <a
          tabIndex="0"
          className={cx("search-accordion__title", {"js-search-accordion-open": expanded})}
          id={label.replace(/\s+/g, '-').toLowerCase()}
          onClick={this.toggleExpand.bind(this)}
        >{label}</a>
        <AnimateHeight
          duration={600}
          height={height}
        >
          <ul className="search-accordion__content">
            <li>
              {/* See: https://github.com/airbnb/react-dates#daterangepicker */}
              <DateRangePicker
                startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                startDateId="solr-start-date" // PropTypes.string.isRequired,
                endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                endDateId="solr-end-date" // PropTypes.string.isRequired,
                onDatesChange={({ startDate, endDate }) => this.handleDatesChange(startDate,endDate)} // PropTypes.func.isRequired,
                focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                isOutsideRange={(day) => {
                  const today = moment().format('YYYY-MM-DD');
                  return day.diff(today, 'days') > 0 || moment(day).isBefore(facets[0])
                }} // allow only past dates & dates after earliest facet value
                minimumNights={0} // allow just 1 day (same start/end date)
                small={true} // use the smaller theme
                showClearDates // show the clear dates button
                onClose={(value)=> this.handleCalendarClose(value)}
                // custom phrases for screenreader
                phrases={{
                  calendarLabel: "Calendar",
                  chooseAvailableStartDate: ({ date }) => `Choose ${date} as your search filter start date.`,
                  chooseAvailableEndDate: ({ date }) => `Choose ${date} as your search filter end date.`,
                  clearDates: "Clear Dates",
                  closeDatePicker: "Close",
                  dateIsSelected: ({ date }) => `You have selected ${date}.`,
                  dateIsUnavailable: ({ date }) => `Sorry, ${date} is unavailable.`,
                  enterKey: "Enter key",
                  escape: "Escape key",
                  focusStartDate: "Interact with the calendar and add the check-in date for your trip.",
                  hideKeyboardShortcutsPanel: "Close the shortcuts panel.",
                  homeEnd: "Home and end keys",
                  jumpToNextMonth: "Move forward to switch to the next month.",
                  jumpToPrevMonth: "Move backward to switch to the previous month.",
                  keyboardNavigationInstructions: "Press the down arrow key to interact with the calendar and\n  select a date. Press the question mark key to get the keyboard shortcuts for changing dates.",
                  keyboardShortcuts: "Keyboard Shortcuts",
                  leftArrowRightArrow: "Right and left arrow keys",
                  moveFocusByOneDay: "Move backward (left) and forward (right) by one day.",
                  moveFocusByOneMonth: "Switch months.",
                  moveFocusByOneWeek: "Move backward (up) and forward (down) by one week.",
                  moveFocustoStartAndEndOfWeek: "Go to the first or last day of a week.",
                  openThisPanel: "Open this panel.",
                  pageUpPageDown: "page up and page down keys",
                  questionMark: "Question mark",
                  returnFocusToInput: "Return to the date input field.",
                  selectFocusedDate: "Select the date in focus.",
                  showKeyboardShortcutsPanel: "Open the keyboard shortcuts panel.",
                  upArrowDownArrow: "up and down arrow keys"
                }}
                // > mobile only props
                initialVisibleMonth={getLastMonth} // large viewports only
                // mobile only props
                numberOfMonths={calendarMonths} // view one month at a time
                orientation={calendarOrientation} // use vertical orientation
                withFullScreenPortal={calendarFullScreen} // use full screen
              />
            </li>
          </ul>
        </AnimateHeight>
      </li>
    );
  }
}

FederatedRangeFacet.defaultProps = {
  value: []
};

FederatedRangeFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array,
  collapse: PropTypes.bool,
  facetSort: PropTypes.string,
  facets: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFacetSortChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  query: PropTypes.object,
  truncateFacetListsAt: PropTypes.number,
  value: PropTypes.array
};

export default FederatedRangeFacet;
