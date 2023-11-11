// ==UserScript==
// @name        Auto Hide Composer When Empty
// @namespace   Zendesk Scripts
// @match       https://*.zendesk.com/*
// @grant       none
// @version     1.0
// @downloadURL https://raw.githubusercontent.com/BagToad/Auto-Hide-Zendesk-Composer/main/auto-hide-composers.user.js
// @author      Kynan Ware
// @description Automatically hide the composer if there is no draft reply text.
// @inject-into content
// ==/UserScript==


// By default, Zendesk Agent Workspace shows composers if you had them open on the previous ticket.
// This user script will force composers to be hidden when they contain no draft content.

console.log("Auto Hide Composer When Empty - loaded");

// Loop through all composers and close them if they contain no text.
function closeComposers() {
  const composers = document.querySelectorAll('.zendesk-editor--rich-text-container');

  console.log("checking for all composers and closing them");

  if (!composers) {
    // This means that the page is probably loading for the first time.
    console.log("no composers found");
    return;
  }
  composers.forEach((composer) => {

    // This ridiculous looking thing is a mechanism to find the "hide composer button" that corresponds to the composer.
    const composerHideBtn = composer
    .parentElement
    .parentElement
    .parentElement
    .parentElement
    .parentElement
    .querySelector('[aria-label="Hide composer"]');

    const numChars = composer.textContent.length;
    // If no characters, we'll go ahead and click on the hide button.
    if (numChars == 0) {
      // Only click on the hide button if it exists.
      // It may not exist if the composer is already hidden.
      if (composerHideBtn) {
        composerHideBtn.click();
      }
    }
  });
}


// Zendesk takes some time to start up, and it also supports multiple panes/tabs of tickets.
// This function is a series of mutation observers to detect when a pane/tab change occurs.
// If a pane/tab change occurs, then we will go and check if any composers need to be hidden.
const start = () => {
  const mainPanes = document.getElementById('main_panes');
  // If Zendesk has loaded, then the main panes will exist.
  if (mainPanes) {
    // Watch main panes for new workspaces.
    const mainPanesObserver = new MutationObserver((mutationsList, observer) => {

      // Check mutations for new workspaces.
      mutationsList.forEach((mutation) => {
        if (mutation.addedNodes.length == 0) {
          return;
        }

        // Add observer to new workspaces.
        mutation.addedNodes.forEach((node) => {
          const workspaceObserver = new MutationObserver((mutationsList, observer) => {
            // closeComposers();
            setTimeout(closeComposers, 1000);
          });
          workspaceObserver.observe(node, {attributes: true, attributeFilter: ['style']});
        });
        closeComposers();
      });
    });
    mainPanesObserver.observe(mainPanes, {childList: true});
  } else {
    // Wait for main panes to load to try again.
    window.setTimeout(start, 1000);
  }
};

// Start the mutation observers.
start();
