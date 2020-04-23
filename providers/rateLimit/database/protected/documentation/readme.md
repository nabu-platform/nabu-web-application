Example

Stop login attempts:

- 1 user can attempt multiple accounts one time
	- identity: ip
	- context: action (login)
- 1 user can attempt a single account multiple times
 	- identity: ip
	- context: actionAndContext (login::alias)
- multiple users can attempt one account multiple times
	- identiy: none
	- context: actionAndContext

We can simplify this to eliminating the second rule. It works together with the third rule.


These are the questions we want to have answered:

- how many times can a user do any action?
- how many times can a user do a specific action?
- how many times can a user do a specific action on a specific context?
- how many times can many users do an action on a specific context?