let client;
try {
  client = chrome;
} catch {
  client = browser;
}

client.storage.sync.get({ projects: '[]' }, function(options) {
  const { projects } = options;
  const projectsParsed = JSON.parse(projects);
  const mainScript = () => {
    const hrefArr = window.location.href.split('/');
    const coveredProject = getCoveredProject(hrefArr, projectsParsed);
    if (
      hrefArr[5] === 'pull' &&
      coveredProject &&
      !document.querySelector('#gitHubJiraLink__a')
    ) {
      const partialDiscussionHeader = document.querySelector(
        '#partial-discussion-header'
      );
      const tableObjectItem =
        partialDiscussionHeader &&
        partialDiscussionHeader.querySelector('.TableObject-item--primary');
      const branchNameSpan =
        tableObjectItem &&
        tableObjectItem.querySelector(
          '.commit-ref.css-truncate.user-select-contain.expandable.head-ref'
        );
      const branchName = branchNameSpan && branchNameSpan.getAttribute('title');

      const jiraNumbers =
        branchName &&
        branchName
          .split('/')
          .filter(
            fragment =>
              fragment
                .slice(0, coveredProject.jiraPrefix.length)
                .toUpperCase() === coveredProject.jiraPrefix.toUpperCase()
          );

      if (!jiraNumbers || !jiraNumbers.length) return;
      jiraNumbers.forEach(jiraNumber => {
        const jiraUrl = `https://${
          coveredProject.jiraOrganization
        }.atlassian.net/browse/${jiraNumber}`;

        const aEl = document.createElement('a');
        aEl.setAttribute('id', 'gitHubJiraLink__a');
        aEl.setAttribute('href', jiraUrl);
        aEl.setAttribute('target', '_blank');
        aEl.innerHTML = `JIRA ${jiraNumber.toUpperCase()}`;
        const spanEl = document.createElement('span');
        spanEl.setAttribute('id', 'gitHubJiraLink__span');
        spanEl.appendChild(aEl);

        tableObjectItem.appendChild(spanEl);
      });
    }
  };

  setInterval(mainScript, 500);
});

function getCoveredProject(hrefArr, projectsParsed) {
  return projectsParsed.find(
    project =>
      hrefArr[3] === project.gitHubOrganization &&
      hrefArr[4] === project.gitHubRepo
  );
}
