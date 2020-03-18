
describe('App is loading', () => {
  it('Verify Federated Search App is loading basic markup.', () => {
    cy.visit('/');
    cy.contains('Please enter a search term.');
  });
});
