// <reference types="cypress" />

describe('App is loading', () => {
  it('Verify Federated Search App is loading basic markup.', () => {
    cy.visit('/');
    cy.get('#fs-root');

    // Text field search.
    cy.contains('Enter search term:');
    cy.get('#fs-root #search');
    cy.get('.fs-search-form__submit');

    // Sort by field.
    cy.contains('Sort By');
    cy.get('#sort-by');

    // Fitler fields.
    cy.contains('Filter Results');
    cy.get('form.fs-search-filters__form').find('.fs-search-accordion');
    cy.get('.fs-search-filters').find('.fs-search-accordion__group-item');
    cy.get('.fs-search-filters').find('.fs-search-accordion__content-item');
    cy.get('.fs-search-filters__reset').should('be.visible');

    // Default message text when app is loaded.
    cy.get('.solr-search-results-container__prompt').contains('Please enter a search term.');
  });
});
