// name: makerPage
// input: Express request (req) and response (res) objects.
// output: Renders the "home" page.
// description: Displays the main home page of the application.
const makerPage = async (req, res) => res.render('home');

// name: docsPage
// input: Express request (req) and response (res) objects.
// output: Renders the "documentation" page.
// description: Displays the documentation page for the application.
const docsPage = async (req, res) => res.render('documentation');

module.exports = {
  makerPage,
  docsPage,
};
