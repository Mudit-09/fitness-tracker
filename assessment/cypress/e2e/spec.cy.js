describe('Health And Fitness Tracker Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Replace with your app's URL
  });

  it('should load the home page correctly', () => {
  cy.contains('Health And Fitness Tracker');
  cy.get('h1').should('have.text', 'Health And Fitness Tracker');
  });
  
  it('should display Form Title and a Button to Open Form', () => {
  cy.contains(`Update Today's Data`);
  cy.contains('+ Add data');
  });

  it('should have a button to add data and it should be styled correctly', () => {
    cy.contains('+ Add data').should('be.visible'); 
    cy.get('button').contains('+ Add data').should('not.be.disabled').click();
  });

  it('should be responsive for mobile view', () => {
    // Check mobile view (iPhone 6)
    cy.viewport('iphone-6');
    
    // Ensure key elements are visible in mobile view
    cy.get('h1').should('be.visible');
    cy.contains(`Update Today's Data`).should('be.visible');
    cy.contains('+ Add data').should('be.visible');
    cy.contains('Recent Health Statistics').should('be.visible');
    cy.contains('Overall Data').should('be.visible');
  });

  it('Should Only Show Last Weeks data in the Weekly Health Trends', () => {
    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type('2024-01-01');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('2000');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1300');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 0');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    // Assertions
    cy.contains('Weekly Health Trends').should('not.exist');
    cy.contains('Testing 0');
    cy.contains('2024-01-01')
  });

  it('Adds data successfully', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('2000');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1300');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 1');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    // Assertions
    cy.contains('Weekly Health Trends');
    cy.contains('Testing 1');
    cy.contains(today);
  });
  
  it('Displays added Trends in the Recent Health Statistics', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('2000');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1300');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 2');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    cy.contains('Recent Health Statistics').should('exist');
    cy.contains('Testing 2').should('exist');

    // for second 

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('3000');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1600');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 3');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    cy.contains('Recent Health Statistics').should('exist');
    cy.contains('Testing 3').should('exist'); 
  });

  it('Displays Calories Intake in the Recent Health Statistics', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('4000');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1700');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 4');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    cy.contains('Recent Health Statistics').should('exist');
    cy.contains('Testing 4').should('exist'); 
    cy.contains('Calories Intake = 4000').should('exist');
  });

  it('Displays Calories Burned in the Recent Health Statistics', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('4200');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1900');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 5');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();

    cy.contains('Recent Health Statistics').should('exist');
    cy.contains('Testing 5').should('exist'); 
    cy.contains('Calories Intake = 4200').should('exist');
    cy.contains('Calories Burned = 1900').should('exist');
  });
  
  it('Persists data in localStorage', () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    cy.contains('+ Add data').click();

    // Fill the form
    cy.get(`input[type="date"]`).type(today);
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Intake"]`).type('3800');
    cy.get(`input[type="number"][placeholder="Enter Today's Calorie Burned"]`).type('1100');
    cy.get(`input[type="text"][placeholder="Enter a short description"]`).type('Testing 6');

    // Submit the form
    cy.get('button[type="submit"]').contains('Submit').click();
  
    // Ensure data is persisted in localStorage
    cy.window().then((win) => {
      const localStorageData = win.localStorage.getItem('healthAndFitness'); 
      expect(localStorageData).to.not.be.null;
      const healthAndFitness = JSON.parse(localStorageData);
      expect(healthAndFitness).to.have.length.greaterThan(0);
    });
  
    // Reload the page
    cy.reload();
  
    // Check if data persists
    cy.contains('Testing 6').should('exist');
    cy.contains('Calories Intake = 3800').should('exist');
    cy.contains('Calories Burned = 1100').should('exist');
  });
});