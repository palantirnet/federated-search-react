import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';
import SearchIcon from '../icons/search';

// Renders plain text input and submit button for text search.
// Rendered when env config autocomplete is not present or set to false.
// @see /env.local.js.example
class FederatedTextSearchNoAutocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(nextProps) {
    this.setState({
      value: nextProps.value,
    });
  }

  handleInputChange(ev) {
    this.setState({
      value: ev.target.value,
    });
  }

  handleInputKeyDown(ev) {
    if (ev.keyCode === 13) {
      this.handleSubmit();
    }
  }

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

  render() {
    const { label } = this.props;

    return (
      <React.Fragment>
        <label htmlFor="search" className="search-form__label">{label}</label>
        <div className="search-form__input-wrapper">
          <input
            type="search"
            name="search"
            id="search"
            className="search-form__input"
            autoFocus
            onChange={this.handleInputChange}
            onKeyDown={this.handleInputKeyDown}
            value={this.state.value || ''}
          />
          <button
            type="submit"
            className="search-form__submit"
            onClick={this.handleSubmit}>
            <span className="element-invisible">Perform Search</span>
            <SearchIcon />
          </button>
        </div>
      </React.Fragment>
    );
  }
}

FederatedTextSearchNoAutocomplete.defaultProps = {
  label: '',
  onChange: () => {},
  value: '',
};

FederatedTextSearchNoAutocomplete.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default FederatedTextSearchNoAutocomplete;
