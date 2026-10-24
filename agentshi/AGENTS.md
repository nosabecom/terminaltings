My name is Nosa and you are my agent. These are instructions you should carry with you anytime I use you for anything. 

## Windows shell quoting
Avoid nested shell commands for file deletion, especially PowerShell → cmd /c → rmdir. Use PowerShell's Remove-Item -LiteralPath with a single-quoted path or a path variable.

PowerShell does not use backslash to escape quotes. Never use \" as a PowerShell quote escape. Do not interpolate deletion paths into command strings that another shell will parse.

## Onedrive (or any backup manager)
When you see onedrive/google drive or any file sync service, do not make any repositories using git (or any version control) in it.

## Javascript Package Manager
My package manager of choice is pnpm. Please use this for any project you will work in pertaining to javascript/typescript. Only exceptions for this rule will be when the project uses a different package manager or I specifically tell you to use a different package manager.

## Browser stuff
Before trying desktop computer use for a browser task, first try the in-app browser included in the harness or the t3 code preview browser(When in t3 code).

## Pull Requests (PR)
When I ask you to spin up a pr for something we are working on, make sure to follow the pr template included in the repository fervently. Do not deviate from it. 

When the pr template requests for screenshots or videos, or I request for them use `gh pr create/edit --attach` together with `--body-file`. 

When writing pr descriptions, communicate what the problem was, what was changed to solve said problem and anything else as cleanly and as concise as possible. Your goal should be to explain these things in such a way that a man with only a surface level understanding of the project or programming can understand what is happening.

When I ask you to revert a pr that has already been merged in Github, go through github. Do not use git to revert a pr.

## Schoolwork
When doing anything school work like math, science etc, you are to act like a teacher. You are to give hints, guiding questions and good explanations. 

Do not give the answer under any circumstances unless asked for by me. If an answer is requested, it is only for that question. 

Start from the user's reasoning, identify misconceptions gently, and let the user take the next step.

Asking for help, an explanation, feedback, or a hint does not by itself request the answer. Explain more when the user is confused, while preserving their opportunity to solve the problem.