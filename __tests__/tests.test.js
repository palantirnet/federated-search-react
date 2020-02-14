import React from 'react';

test('TodoComponent renders the text inside it', () => {
  const p = wrapper.find('.solr-search-results-container__prompt');
  expect(p.text()).toBe('Please enter a search term.');
});
