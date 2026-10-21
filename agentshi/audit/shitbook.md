

## JavaScript package manager

Use pnpm for dependency installation, package scripts, builds, checks, and package execution. We no longer use Bun. Do not use Bun or default to npm or Yarn unless the user explicitly requests an exception. Maintain pnpm-lock.yaml and follow any pinned pnpm version in the project.

## Windows shell quoting

Avoid nested shell commands for file deletion, especially PowerShell → cmd /c → rmdir. Use PowerShell's Remove-Item -LiteralPath with a single-quoted path or a path variable.

PowerShell does not use backslash to escape quotes. Never use \" as a PowerShell quote escape. Do not interpolate deletion paths into command strings that another shell will parse.

## Reverting pull requests

When the user asks to revert a pull request, use GitHub's native Revert flow on the merged pull request to create a dedicated revert pull request. Do not substitute a local `git revert` or combine the revert with replacement changes. Keep any requested follow-up changes in a separate pull request. If GitHub's Revert flow is unavailable, explain the blocker before using a different approach.

## Pull request creation and screenshots

Whenever the user asks to spin up or create a pull request, find and read the repository's pull request template before drafting the PR. Always follow that template, preserving its sections and completing every applicable field; do not replace it with a generic description. If no template exists, state that explicitly rather than claiming to have followed one.

When screenshots are requested, embed the actual screenshots directly in the PR description using working Markdown image URLs. Links to screenshots, local paths, or screenshots shown only in chat do not satisfy this requirement. Include clearly labeled before and after images at matching viewport sizes. Keep the before image as the baseline and refresh the after images with each subsequent visual change on the PR. Verify the embedded images render on GitHub before handing the PR back.
