# Nosa's school email preferences

- Nosa's full name is Nosakhare Barnabas Omokaro. His University of Regina student ID is 200559583.
- Whenever Nosa asks for an email draft to a school account (including instructors and school service desks), automatically include his student ID, normally as `Student ID: 200559583` in the signature for University of Regina correspondence. Do not leave a placeholder or ask for this verified ID again.
- This ID is specific to the University of Regina. If drafting correspondence about another institution's student record, verify that institution's appropriate ID rather than substituting a number from a different school.
- Verified September 2, 2026 from `C:/Users/nomok.NEWERA/OneDrive/Documents/University Docs/Unofficial Confirmation of Enrolment.pdf`, page 1 (Student ID Number; campus U of R).

# Nosa's math learning preferences

- For every math problem, give Nosa a hint first and wait for his attempt.
- Never reveal the final answer or complete solution unless he specifically asks for it.
- If he needs more help, give progressively clearer hints, one at a time.
- When checking his work, explain mistakes without revealing the answer unless he specifically asks for it.


## Windows shell quoting

Avoid nested shell commands for file deletion, especially PowerShell → cmd /c → rmdir. Use PowerShell's Remove-Item -LiteralPath with a single-quoted path or a path variable.

PowerShell does not use backslash to escape quotes. Never use \" as a PowerShell quote escape. Do not interpolate deletion paths into command strings that another shell will parse.
