// <reference types="cypress" />

describe('Keyword search', () => {
  const keyword = 'Terrier';
  const resultCount = 4;
  const pagerCount = 1;

  it(`Keyword search is ran using the word "${keyword}" to load "${resultCount}" search result items.`, () => {
    cy.visit('/');

    // Search for "terrier" and click search icon.
    cy.get('#search').type(' ' + keyword);
    cy.get('.fs-search-form__submit').click();

    // Verify word search is returing terrier related results and confirming count.
    cy.get('.fs-applied-filters__filter').contains(keyword);
    cy.get('#stat').contains('Showing ' + resultCount + ' results');
    cy.get('.fs-search-results__heading')
      .should('have.length', resultCount);

    // Verify pager page link/count.
    cy.get('.fs-search-pager__item.is-active .fs-search-pager__item-button')
      .contains(pagerCount)
      .should('be.visible');
  });
});
