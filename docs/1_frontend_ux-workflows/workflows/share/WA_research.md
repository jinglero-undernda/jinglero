# Share on WhatsApp

Adding a "Share on WhatsApp" button is a great way to drive engagement. Since WhatsApp uses a specific URL scheme, you can achieve this easily using a standard anchor tag (<a>).

The base structure for the WhatsApp "send" API is: https://wa.me/?text=[YOUR_ENCODED_TEXT]

## 1. The Basic Implementation

To make this work across different browsers and devices, you need to ensure your text and URL are URL-encoded (e.g., spaces become %20).

### HTML Example

```html
<a
  href="https://wa.me/?text=Check%20out%20this%20awesome%20site:%20https://yourwebsite.com"
  target="_blank"
  rel="noopener noreferrer"
>
  Share on WhatsApp
</a>
```

## 2. Making it Dynamic (JavaScript)

Since you want to share the current page route, it's best to use JavaScript to grab the URL automatically so you don't have to hardcode it for every page.

### The Code Snippet

You can add this to your site's script file or within a <script> tag:

```javascript
function shareOnWhatsApp() {
  // Get the current page URL
  const currentUrl = window.location.href;

  // Define your custom message
  const message = "Hey! Check out this page: ";

  // Encode the message and URL to be URL-safe
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    message + currentUrl
  )}`;

  // Open WhatsApp in a new tab
  window.open(whatsappUrl, "_blank");
}
```

### The Button

```html
<button onclick="shareOnWhatsApp()">Share on WhatsApp</button>
```

## 3. Best Practices

Use encodeURIComponent(): This is crucial. It converts symbols like ?, &, and spaces into a format the browser can read without breaking the link.

Accessibility: If you use an icon instead of text, make sure to add an aria-label="Share on WhatsApp" to the button.

Social Preview: Ensure your website has Open Graph (OG) tags in the <head>. When the user shares the link, WhatsApp will use these tags to pull a preview image and a title.

<meta property="og:title" content="Your Site Title" />

<meta property="og:image" content="https://yourwebsite.com/preview.jpg" />

## Branding

To give your button that professional, official look, you can use the WhatsApp brand colors and an SVG icon. Using an SVG is better than an image because it stays crisp on all screen sizes and loads instantly.

1. The Styled Button Code
   Here is a clean, modern implementation using the official WhatsApp green (#25D366).

```html
<button onclick="shareOnWhatsApp()" class="whatsapp-btn">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.104-1.076a7.858 7.858 0 0 0 3.889 1.029h.001c4.367 0 7.926-3.559 7.93-7.93a7.856 7.856 0 0 0-2.322-5.697zM7.994 14.527a6.525 6.525 0 0 1-3.309-.902l-.237-.14-2.464.647.658-2.404-.154-.245a6.525 6.525 0 0 1-1.003-3.493c0-3.6 2.933-6.533 6.533-6.533a6.525 6.525 0 0 1 4.619 1.913 6.525 6.525 0 0 1 1.912 4.62c-.002 3.6-2.933 6.533-6.533 6.533zM11.53 9.476c-.193-.096-1.14-.564-1.317-.627-.177-.063-.306-.095-.434.096-.128.192-.497.627-.609.75-.112.124-.224.139-.417.042-.192-.096-.813-.3-1.549-.957-.573-.512-.96-1.143-1.072-1.336-.113-.192-.012-.296.084-.393.087-.087.193-.224.289-.336.097-.113.129-.192.193-.32.064-.129.032-.241-.016-.337-.048-.096-.434-1.046-.594-1.432-.156-.379-.311-.328-.434-.334l-.37-.006c-.128 0-.337.048-.513.24-.176.193-.674.659-.674 1.606 0 .947.689 1.861.785 1.99.096.128 1.356 2.071 3.286 2.903.46.198.818.316 1.099.405.461.147.88.126 1.211.077.37-.054 1.14-.467 1.299-.918.159-.452.159-.838.111-.918-.048-.08-.177-.128-.37-.224z"
    />
  </svg>
  Share on WhatsApp
</button>
```

## 2. The CSS (Brand Styling)

This CSS adds the specific WhatsApp green, creates a nice hover effect, and aligns the icon perfectly with the text.

```css
.whatsapp-btn {
  background-color: #25d366; /* Official WhatsApp Green */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  font-family: Arial, sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px; /* Space between icon and text */
  transition: background-color 0.3s ease;
}

.whatsapp-btn:hover {
  background-color: #1ebd59; /* Slightly darker green on hover */
}

.whatsapp-btn svg {
  display: inline-block;
  vertical-align: middle;
}
```

## 3. Visual Reference

Why use the API instead of a plugin?
Performance: Plugins often load heavy external libraries; this code is lightweight.

Privacy: No third-party scripts are tracking your users.

Customization: You have total control over the message and the design.

Note: If you are testing this on a desktop, it will attempt to open WhatsApp Web or the WhatsApp Desktop app. On mobile, it will automatically open the native WhatsApp app.
