import PropTypes from 'prop-types';
import queryString from "query-string";
import React from "react";
import SearchIcon from "../icons/search";


class FederatedTextSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  handleInputChange(ev) {
    this.setState({
      value: ev.target.value
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
    let parsed = queryString.parse(window.location.search);
    // Update the search querystring param with the value from the search field.
    parsed.search = this.state.value;
    const stringified = queryString.stringify(parsed);
    // Update the querystring params in the browser, add path to history.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
    if (window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + stringified;
      window.history.pushState({path:newurl},'',newurl);
    }
    else {
      window.location.search = stringified;
    }
  }

  render() {
    const { label } = this.props;

    return (
      <React.Fragment>
        <label htmlFor="search" className="search-form__label">{label}</label>
        <div className="search-form__input-wrapper">
          <input type="search" name="search" id="search" className="search-form__input" autoFocus
                 onChange={this.handleInputChange.bind(this)}
                 onKeyDown={this.handleInputKeyDown.bind(this)}
                 value={this.state.value || ""} />
          <button type="submit" className="search-form__submit" onClick={this.handleSubmit.bind(this)}><span className="element-invisible">Perform Search</span><SearchIcon /></button>
        </div>
      </React.Fragment>
    );
  }
}

FederatedTextSearch.defaultProps = {
  field: null
};

FederatedTextSearch.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
};

export default FederatedTextSearch;
