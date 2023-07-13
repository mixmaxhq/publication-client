<!-- Author/Reviewer expectations are described in the last comment -->

## 🕵️‍♀️ Issue Tracking
<!--
  Where is the progress of this issue being tracked?
  Where can one find the requirements for this issue?
  Where did this issue originated from?

  E.g. Jira ticket, Sentry issue, Slack message, PagerDuty alarm, etc.
-->

## 📚 Context/Description Behind The Change
<!--
  What changes have you made to the code, and why?

  As skilled engineers, we all know how to read and interpret code, so take this opportunity
  to be a bit more verbal about your changes.

  Giving the context behind your changes will make your PR review quicker,
  as the reviewer will not need to guess your intent.
-->

## 🚨 Potential Risks & What To Monitor After Deployment
<!--
  What can go wrong with this deploy?
  Does it touch any critical services?
  How will these changes affect adjacent code/features?
  How will we handle any adverse issues?
  Have you posted those steps in #eng-alerts if this has safety belts/steps?

  Imagine: You pull the trigger on the merge of the PR and step out for a coffee, what the on-call
  engineer should be aware of?
-->

## 🧑‍🔬 How Has This Been Tested?
<!--
  Imagine: How do I (and the Reviewer):
  How do we know this PR does what it's supposed to do?
  How do we ensure that adjacent code/features are still working?
  How do we evaluate the performance implications of this PR?

  Unless some rare exceptions, we shouldn't ship any code without testing it **locally** before.
  We should **always** test on Staging.
-->

## 🚚 Release Plan
<!--
  Imagine: If you had to leave in a rush, what should the backup engineer do to deploy this?

  Add any tasks that need to be done before/during/after release (i.e, creating indices, deploying
  other services, bumping modules, notifying PM or other engineers, etc).
-->



<!--
  ## 🤝 Expectations

  > This is a tl;dr; — full (and updated) version on https://www.notion.so/mixmax/Code-review-c0dafc9c862b4d4dad083bce21702d94

  When Opening/Reviewing a PR, please keep in mind:

  ### As the PR Author
  - Provide all the necessary context on "Why" you have performed your changes
  - Assume that the reviewer has just joined the company: would he/she be able to review this the
    way it is right now?
  - If changes are extensive, break them into smaller commits that tell a story, instead of 1 commit
    with 15 files changed.
  - Split Refactors and New-Code-Changes into different commits, ideally: different PRs.
  - Test your code before requesting review — unless some rare exceptions, we shouldn't ship any code
    without testing it **locally** before. We should always test on Staging.
  - If your PR is UI related, consider adding screenshots/videos with the behavior and before/after.

  ### As the PR Reviewer
  - Be kind. Don't nitpick.
  - Expect to have all the necessary context to review the PR on (or linked on) the PR itself.
  - When in doubt: ask.
  - Validate if the author's tests have any missing coverage points. Do not approve an untested PR.
  - Pay extra attention to the "Potential Risks" and "Release Plan" sections.
  - If the PR alters the product UI, consider checking out the branch to visually inspect it.
-->
