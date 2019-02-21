import React from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import SearchIcon from '../icons/search';

class FederatedTextSearchAsYouType extends React.Component {
  // When the input is focused, Autosuggest will consult this function
  // when to render suggestions. Use it, for example, if you want to
  // display suggestions when input value is at least 2 characters long.
  static shouldRenderSuggestions(value) {
    return value.trim().length >= 2;
  }

  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
    };

    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadSuggestions = this.loadSuggestions.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.suggestQuery ? nextProps.suggestQuery.value : nextProps.value,
      suggestions: nextProps.suggestions ? nextProps.suggestions.docs : this.state.suggestions,
    });
  }

  /**
   *
   * @param event
   *   called every time the input value changes
   * @param newValue
   *   the new value of the input
   * @param method
   *   string describing how the change has occurred. The possible values are:
   *   'down' - user pressed Down
   *   'up' - user pressed Up
   *   'escape' - user pressed Escape
   *   'enter' - user pressed Enter
   *   'click' - user clicked (or tapped) on suggestion
   *   'type' - none of the methods above (usually means that user typed something,
   *     but can also be that they pressed Backspace, pasted something into the input, etc.)
   */
  onChange(event, { newValue, method }) {
    if (method === 'type') {
      this.setState({
        value: newValue,
      });
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

  // Will be called every time you need to set suggestions to [].
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  static getSuggestionValue(suggestion) {
    return suggestion;
  }

  // Gets search suggestions based on input.
  // @todo support different modes: term, results
  loadSuggestions(value) {
    // Run typeahead search query based on the autocomplete config and current value.
    this.props.onSuggest(this.props.autocomplete, value);
  }

  // Call submit handler when enter is pressed while text input
  // has focused.  This functionality is prevented by the
  // onSuggestionSelected method.
  handleInputKeyDown(event) {
    if (event.keyCode === 13 && !event.defaultPrevented) {
      this.handleSubmit();
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

  renderSuggestion(suggestion) {
    const { autocomplete } = this.props;
    return (
      <a
        className="react-autosuggest__suggestion-link"
        href={suggestion.sm_urls[0]}
        dangerouslySetInnerHTML={{ __html: suggestion.ss_federated_title }}
      />
    );
  }

  static renderInputComponent(inputProps) {
    return (
      <div className="search-form__input-wrapper">
        <input {...inputProps} />
      </div>
    );
  }

  render() {
    const { label } = this.props;
    const { suggestions, value } = this.state;
    // Define props for autocomplete input element.
    const inputProps = {
      type: 'search',
      name: 'search',
      id: 'search',
      className: 'react-autosuggest__input',
      onChange: this.onChange,
      onKeyDown: this.handleInputKeyDown,
      value: value || '',
    };

    return (
      <React.Fragment>
        <label htmlFor="search" className="search-form__label">{label}</label>
        <div className="search-form__autocomplete-container">
          {/* @see: https://github.com/moroshko/react-autosuggest#react-autosuggest */}
          <Autosuggest
            focusInputOnSuggestionClick={false}
            getSuggestionValue={FederatedTextSearchAsYouType.getSuggestionValue}
            inputProps={inputProps}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionSelected={FederatedTextSearchAsYouType.onSuggestionSelected}
            renderInputComponent={FederatedTextSearchAsYouType.renderInputComponent}
            renderSuggestion={this.renderSuggestion}
            shouldRenderSuggestions={FederatedTextSearchAsYouType.shouldRenderSuggestions}
            suggestions={suggestions}
          />
          <button
            type="submit"
            className="search-form__submit"
            onClick={this.handleSubmit}
          >
            <span className="element-invisible">Perform Search</span>
            <SearchIcon />
          </button>
        </div>
      </React.Fragment>
    );
  }
}

FederatedTextSearchAsYouType.defaultProps = {
  label: 'Enter a search term',
  onChange: () => {},
  value: '',
};

FederatedTextSearchAsYouType.propTypes = {
  autocomplete: PropTypes.shape({
    mode: PropTypes.string,
    method: PropTypes.string,
    url: PropTypes.string,
    queryField: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSuggest: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default FederatedTextSearchAsYouType;
