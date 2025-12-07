# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - navigation [ref=e3]:
    - generic [ref=e5]:
      - link "Need This Done" [ref=e6] [cursor=pointer]:
        - /url: /
      - generic [ref=e7]:
        - generic [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e10] [cursor=pointer]:
            - /url: /services
          - link "Pricing" [ref=e11] [cursor=pointer]:
            - /url: /pricing
          - link "How It Works" [ref=e12] [cursor=pointer]:
            - /url: /how-it-works
          - link "FAQ" [ref=e13] [cursor=pointer]:
            - /url: /faq
          - link "Contact" [ref=e14] [cursor=pointer]:
            - /url: /contact
        - link "Shopping cart with 0 items" [ref=e15] [cursor=pointer]:
          - /url: /cart
          - img [ref=e16]
        - button "Switch to dark mode" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - link "Login" [ref=e22] [cursor=pointer]:
          - /url: /login
  - main [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - heading "Shop Services" [level=1] [ref=e26]
        - paragraph [ref=e27]: Pick the perfect service for your project. From quick tasks to premium work.
      - paragraph [ref=e29]: Loading products...
  - alert [ref=e30]
```