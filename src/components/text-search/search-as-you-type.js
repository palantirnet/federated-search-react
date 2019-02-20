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
      value: nextProps.value,
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

  // Will be called every time you need to recalculate suggestions.
  onSuggestionsFetchRequested({ value }) {
    this.loadSuggestions(value);
  }

  // Will be called every time suggestion is selected via mouse or keyboard.
  static onSuggestionSelected(event, suggestion) {
    if (event.keyCode === 13) {
      event.preventDefault(); // don't submit the search query
      window.location.replace(suggestion.suggestion.sm_urls[0]); // redirect to the selected item
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
  loadSuggestions(value) {
    const { url, queryField } = this.props.autocomplete;

    fetch(`${url}?q=${value}&rows=10&df=${queryField}&wt=json`)
      .then(response => response.json())
      .then((responseJson) => {
        this.setState({
          suggestions: responseJson.response.docs,
        });
      });
  }

  // Calls submit handler when enter is pressed while text input
  // has focused.  This functionality is overridden in the
  // onSuggestionSelected method.
  handleInputKeyDown(ev) {
    if (ev.keyCode === 13) {
      this.handleSubmit();
    }
  }

  // Triggers search query execution by updating the current URL based
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
    const { suggestions } = this.state;
    const inputProps = {
      type: 'search',
      name: 'search',
      id: 'search',
      className: 'react-autosuggest__input',
      onChange: this.onChange,
      onKeyDown: this.handleInputKeyDown,
      value: this.state.value || '',
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
    method: PropTypes.string,
    url: PropTypes.string,
    queryField: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default FederatedTextSearchAsYouType;
