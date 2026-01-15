# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "Create your account" [level=1] [ref=e5]
    - paragraph [ref=e6]: Join Tweeter and start sharing
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Username
        - textbox "Username" [ref=e11]:
          - /placeholder: johndoe
          - text: testuser176826751117
        - paragraph [ref=e12]: 3-20 characters, letters, numbers, and underscores only
      - generic [ref=e13]:
        - generic [ref=e14]: Email address
        - textbox "Email address" [ref=e15]:
          - /placeholder: you@example.com
          - text: testuser1768267511170@example.com
      - generic [ref=e16]:
        - generic [ref=e17]: Password
        - textbox "Password" [ref=e18]:
          - /placeholder: ••••••••
          - text: password123
        - paragraph [ref=e19]: At least 8 characters
      - generic [ref=e20]:
        - generic [ref=e21]: Confirm password
        - textbox "Confirm password" [ref=e22]:
          - /placeholder: ••••••••
          - text: password123
    - button "Creating account..." [disabled] [ref=e23]
    - paragraph [ref=e24]:
      - text: Already have an account?
      - link "Log in" [ref=e25] [cursor=pointer]:
        - /url: /login
```