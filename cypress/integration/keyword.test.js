// <reference types="cypress" />

describe('Keyword search', () => {
  const keyword = 'Terrier';
  const resultCount = 5;
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
    cy.get('.fs-search-accordion__content-item').should('have.text',' Drupal 8 (2results) Drupal 8 - Three (1results) Search Drupal 7 (2results) Article (3results) Page (2results)-Toggle filter group for Age Adult (1results) Mature (2results) Puppy (2results) Adult (1results) Mature (2results) Puppy (2results)Toggle filter group for Color Brown (1results) Gold (1results) Yellow (1results) Brown (1results) Gold (1results) Yellow (1results)Toggle filter group for Traits Athletic (1results) Curious (1results) Energetic (1results) Loyal (3results) Athletic (1results) Curious (1results) Energetic (1results) Loyal (3results)');

    // Verify pager page link/count.
    cy.get('.fs-search-pager__item.is-active .fs-search-pager__item-button')
      .contains(pagerCount)
      .should('be.visible');
  });
});
