describe("ScrollIO", function() {
    it("Fires callback on enter while scrolling down", function() {
        cy.visit("./cypress/fixtures/scroll_down.html")
            .scrollTo("center", {
                duration: 1000,
            })
            .get(".element")
            .should("have.class", "element--green");
    });
});
