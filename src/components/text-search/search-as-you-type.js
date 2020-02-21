import React from 'react';
import queryString from 'query-string';
import he from 'he';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import helpers from '../../helpers';
import SearchIcon from '../icons/search';

// Renders autocomplete text input and submit button for text search.
// Rendered when env config autocomplete is present.
// @see /env.local.js.example
class FederatedTextSearchAsYouType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
    };

    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadSuggestions = this.loadSuggestions.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.renderSuggestionsContainer = this.renderSuggestionsContainer.bind(this);
    this.shouldRenderSuggestions = this.shouldRenderSuggestions.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.suggestQuery && nextProps.suggestQuery.value
        ? nextProps.suggestQuery.value
        : nextProps.value,
      suggestions: nextProps.suggestions ? nextProps.suggestions.docs : this.state.suggestions,
    });
  }

  /**
   * Called every time the input value changes
   *
   * @param event
   *   Event object
   * @param newValue
   *   The new value of the input
   * @param method
   *   String describing how the change has occurred. The possible values are:
   *     'down' - user pressed Down
   *     'up' - user pressed Up
   *     'escape' - user pressed Escape
   *     'enter' - user pressed Enter
   *     'click' - user clicked (or tapped) on suggestion
   *     'type' - none of the methods above (usually means that user typed something,
   *       but can also be that they pressed Backspace, pasted something into the input, etc.)
   */
  onChange(event, { newValue, method }) {
    if (method === 'type') {
      this.setState({
        value: newValue,
      });

      // Ensure that the suggestQuery.value prop gets cleared on backspace / cut.
      this.props.suggestQuery.value = newValue;
    }
  }

  // Called every time you need to recalculate suggestions.
  onSuggestionsFetchRequested({ value }) {
    this.loadSuggestions(value);
  }

  /**
   * Called every time suggestion is selected via mouse or keyboard.
   *
   * @param event
   *   Event object
   * @param suggestion
   *   The selected suggestion
   *   Unused: suggestionValue
   *     The value of the selected suggestion
   *     (equivalent to getSuggestionValue(suggestion))
   *   Unused: suggestionIndex
   *     The index of the selected suggestion in the suggestions array
   *   Unused: sectionIndex
   *     When rendering multiple sections,this will be the section index
   *     (in suggestions) of the selected suggestion. Otherwise, it will be null.
   * @param method
   *   String describing how user selected the suggestion. The possible values are:
   *     'click' - user clicked (or tapped) on the suggestion
   *     'enter' - user selected the suggestion using Enter
   */
  onSuggestionSelected(event, { suggestion, method }) {
    const { mode } = this.props.autocomplete;
    // If results are rendered, redirect to the result url and prevent search execution.
    if (mode === 'result' && (event.keyCode === 13 || method === 'click')) {
      event.preventDefault(); // don't submit the search query
      event.stopPropagation(); // don't bubble up event
      window.location.assign(suggestion.sm_urls[0]); // redirect to the selected item
    }
  }

  // Called every time you need to set suggestions to [].
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  // For search term autocomplete mode:
  // When user navigates the suggestions using the Up and Down keys,
  // the input value should be set according to the highlighted suggestion.
  getSuggestionValue(suggestion) {
    const { mode } = this.props.autocomplete;
    if (mode === 'result') return false;
    if (mode === 'term') {
      return suggestion.ss_federated_title; // @todo get the value of the term
    }
    return false;
  }

  // Gets search suggestions based on input.
  // @todo support different modes: term, results
  loadSuggestions(value) {
    // Run typeahead search query based on the autocomplete config and current value.
    this.props.onSuggest(this.props.query, this.props.autocomplete, value);
  }

  handleInputKeyDown(event) {
    // Call submit handler when enter is pressed while text input
    // has focused.  This functionality is prevented by the
    // onSuggestionSelected method.
    if (event.keyCode === 13 && !event.defaultPrevented) {
      this.handleSubmit();
    }

    // Clear and close suggetsions.
    if (event.keyCode === 27) {
      this.onSuggestionsClearRequested();
    }
  }

  // Trigger search query execution by updating the current URL based
  // on current state.
  handleSubmit() {
    this.props.onChange(this.props.field, this.state.value);
    // Get existing querystring params.
    const parsed = queryString.parse(window.location.search);
    // Update the search querystring param with the value from the search field.
    parsed.search = this.state.value;
    const stringified = queryString.stringify(parsed);
    // Update the querystring params in the browser, add path to history.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
    if (window.history.pushState) {
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${stringified}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      window.location.search = stringified;
    }
  }

  // When the input is focused, Autosuggest will consult this function
  // when to render suggestions. Use it, for example, if you want to
  // display suggestions when input value is at least 2 characters long.
  shouldRenderSuggestions(value) {
    const numChars = this.props.autocomplete.numChars || 2;
    return value.trim().length > numChars;
  }

  renderSuggestionsContainer({ containerProps, children, query }) {
    const { mode } = this.props.autocomplete;
    const hasResultModeConfig = Object.hasOwnProperty.call(this.props.autocomplete, 'result');
    const hasTermModeConfig = Object.hasOwnProperty.call(this.props.autocomplete, 'term');
    const resultTitleText = hasResultModeConfig && this.props.autocomplete.result.titleText
      ? this.props.autocomplete.result.titleText
      : 'What are you looking for?';
    const resultShowDirectionsText = hasResultModeConfig
      && Object.hasOwnProperty.call(this.props.autocomplete.result, 'showDirectionsText')
      ? this.props.autocomplete.result.showDirectionsText
      : true;
    const termTitleText = hasTermModeConfig && this.props.autocomplete.term.titleText
      ? this.props.autocomplete.term.titleText
      : 'Suggested search terms';
    const termShowDirectionsText = hasTermModeConfig
      && Object.hasOwnProperty.call(this.props.autocomplete.term, 'showDirectionsText')
      ? this.props.autocomplete.term.showDirectionsText
      : true;

    const titleText = mode === 'term' ? termTitleText : resultTitleText;
    const directionsText = mode === 'term' ? termShowDirectionsText : resultShowDirectionsText;

    const suggestionsWrapperClasses = directionsText
      ? 'fs-react-autosuggest__suggestions-itemslist-wrapper fs-react-autosuggest__suggestions-itemslist-wrapper--with-directions'
      : 'fs-react-autosuggest__suggestions-itemslist-wrapper';

    return (
      <div {... containerProps}>
        <div className="fs-react-autosuggest__container-title">
          {titleText}
          <button className="fs-react-autosuggest__container-close-button" onClick={this.onSuggestionsClearRequested}>x</button>
        </div>
        <div className={suggestionsWrapperClasses}>
          {children}
        </div>
        {/* @todo add logic for suggestion mode and alter directionsText accordingly */}
        {directionsText &&
          <div className="fs-react-autosuggest__container-directions">
            <span className="fs-react-autosuggest__container-directions-item">Press <code>ENTER</code> to search for <strong>{query}</strong> or <code>ESC</code> to close.</span>
            <span className="fs-react-autosuggest__container-directions-item">Press ↑ and ↓ to highlight a suggestion then <code>ENTER</code> to be redirected to that suggestion.</span>
          </div>
        }
      </div>
    );
  }

  /**
   * Define how suggestions are rendered.
   * Note: must be a pure function.
   *
   * @param suggestion
   *   The suggestion to render
   *
   * @param query
   *   Used to highlight the matching string. As user types in the input,
   *   query will be equal to the trimmed value of the input. Then, if user
   *   interacts using the Up or Down keys, the input will get the value of
   *   the highlighted suggestion, but query will remain to be equal to the
   *   trimmed value of the input prior to the Up and Down interactions.
   *
   * unused - isHighlighted
   *   Whether or not the suggestion is highlighted.
   *
   * @return a ReactElement
   */
  renderSuggestion(suggestion, { query }) {
    // Determine if we are returning results or terms. @todo or both
    const { mode } = this.props.autocomplete;
    // Decode any html entities that come from title.
    const decodedTitle = he.decode(suggestion.ss_federated_title);
    // Wrap the query partial string in <b>.
    const highlightedTitle = helpers.highlightText(decodedTitle, query);
    // Define a11y message i.e. (1 of 3) to append to suggestion text.
    const currentHumanIndex = this.state.suggestions.indexOf(suggestion) + 1;
    const suggestionsLength = this.state.suggestions.length;

    // Render plain text for search term suggestions.
    // @todo update this when we have a return structure for terms.
    if (mode === 'term') {
      return (<span>highlightedTitle</span>);
    }

    // Defaults to result based autosuggestion.
    // Render a link for search result suggestions.
    return (
      <a
        className="fs-react-autosuggest__suggestion-link"
        href={suggestion.sm_urls[0]}
      >
        {highlightedTitle}
        <span className="fs-element-invisible">
          {` (${currentHumanIndex} of ${suggestionsLength})`}
        </span>
      </a>
    );
  }

  // Wrap the input component with our expected wrapper.
  static renderInputComponent(inputProps) {
    return (
      <div className="fs-search-form__input-wrapper">
        <input {...inputProps} />
      </div>
    );
  }

  render() {
    const { label, suggestQuery } = this.props;
    const { suggestions, value } = this.state;
    // Define props for autocomplete input element.
    const inputProps = {
      type: 'search',
      name: 'search',
      id: 'search',
      className: 'fs-react-autosuggest__input',
      onChange: this.onChange,
      onKeyDown: this.handleInputKeyDown,
      value: value || '',
      role: 'combobox',
      'aria-autocomplete': 'both',
    };

    return (
      <React.Fragment>
        <label htmlFor="search" className="fs-search-form__label">{label}</label>
        <div className="fs-search-form__autocomplete-container">
          {/* @see: https://github.com/moroshko/react-autosuggest#react-autosuggest */}
          <Autosuggest
            focusInputOnSuggestionClick={false}
            getSuggestionValue={this.getSuggestionValue}
            inputProps={inputProps}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            renderInputComponent={FederatedTextSearchAsYouType.renderInputComponent}
            renderSuggestion={this.renderSuggestion}
            renderSuggestionsContainer={this.renderSuggestionsContainer}
            shouldRenderSuggestions={this.shouldRenderSuggestions}
            suggestQuery={suggestQuery}
            suggestions={suggestions}
          />
          <button
            type="submit"
            className="fs-search-form__submit"
            onClick={this.handleSubmit}
          >
            <span className="fs-element-invisible">Perform Search</span>
            <SearchIcon />
          </button>
        </div>
      </React.Fragment>
    );
  }
}

FederatedTextSearchAsYouType.defaultProps = {
  label: 'Enter a search term',
  value: '',
  suggestQuery: {
    value: '',
  },
};

FederatedTextSearchAsYouType.propTypes = {
  autocomplete: PropTypes.oneOfType([
    PropTypes.shape({
      mode: PropTypes.string,
      method: PropTypes.string,
      url: PropTypes.string,
      queryField: PropTypes.string,
      suggestionRows: PropTypes.number,
      numChars: PropTypes.number,
      result: PropTypes.shape({
        titleText: PropTypes.string,
        showDirectionsText: PropTypes.bool,
      }),
      term: PropTypes.shape({
        titleText: PropTypes.string,
        showDirectionsText: PropTypes.bool,
      }),
    }),
    PropTypes.bool,
  ]).isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSuggest: PropTypes.func.isRequired,
  suggestQuery: PropTypes.shape({
    value: PropTypes.string,
  }),
  value: PropTypes.string,
};

export default FederatedTextSearchAsYouType;
