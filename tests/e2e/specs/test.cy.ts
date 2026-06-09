describe('BolsiYa App', () => {
  it('Visits the app root and shows the home tab', () => {
    cy.visit('/')
    cy.get('ion-tab-bar').should('exist')
    cy.get('ion-tab-button[tab="home"]').should('exist')
  })
})
