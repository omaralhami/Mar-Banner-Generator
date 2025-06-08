# MBG Banner Generator

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/729486981268111441/1130868679500894208/download_3.gif" alt="banner" />
</p>

**MBG Banner Generator** is a powerful, modern web application that creates stunning animated GIF banners with advanced customization options. Perfect for Discord profiles, social media, and personal branding.

## ✨ Features

- **🎨 Advanced Customization**
  - Choose from 20+ premium fonts
  - Custom colors and gradients
  - Adjustable animation speed
  - Multiple animation effects
  - Real-time preview

- **🚀 Modern UI/UX**
  - Responsive design for all devices
  - Dark/Light theme support
  - Intuitive controls with tooltips
  - Smooth animations and transitions
  - Accessibility features

- **⚡ Performance Optimized**
  - Fast font loading with preloading
  - Efficient GIF encoding
  - Optimized file sizes
  - Progressive enhancement

- **🛠️ Developer Features**
  - Clean, modular code architecture
  - TypeScript support
  - Modern CSS with variables
  - Comprehensive error handling
  - Performance monitoring

- **🔔 Analytics & Notifications**
  - Discord webhook integration
  - Real-time generation tracking
  - Usage analytics and monitoring
  - Automatic notification system

## 🔔 Webhook Integration

This project includes Discord webhook notifications that alert you whenever someone generates a banner:

### Features:
- **Real-time Notifications**: Get instant Discord alerts when banners are generated
- **Rich Embeds**: Beautiful formatted messages with user details
- **Generated Text Tracking**: See exactly what text users are creating banners with
- **Non-intrusive**: Webhook failures don't affect banner generation
- **Privacy-focused**: Only tracks generated text, no personal user data

### Webhook Payload Example:
```json
{
  "username": "MBG Log",
  "embeds": [{
    "title": "🎨 New Banner Generated!",
    "description": "Someone just generated a banner with the text: **Hello World**",
    "color": 6366241,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "fields": [
      {
        "name": "📝 Generated Text",
        "value": "Hello World",
        "inline": true
      }
    ]
  }]
}
```

## 🚀 Usage

Download or clone the repository to use MBG Banner Generator locally.

## 🎯 How to Use

1. **Enter Your Text** - Type the text you want in your banner
2. **Choose Style** - Select fonts, colors, and animation effects
3. **Customize** - Adjust speed, size, and other parameters
4. **Preview** - See your banner in real-time
5. **Download** - Get your high-quality animated GIF

## 🏗️ Installation

```bash
# Clone the repository
git clone https://github.com/omaralhami/Mar-Banner-Generator.git

# Navigate to the project directory
cd Mar-Banner-Generator

# Open in your browser
# Simply open index.html in your preferred browser
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is open-source and available under the MIT License.

## 🙏 Credits

**Maintained by:** [mar](https://github.com/omaralhami)

### Acknowledgements
- Thanks to [jsgif](https://github.com/antimatter15/jsgif/tree/master) for GIF encoding
- Thanks to [Osorina Irina](https://codepen.io/osorina) for background animation inspiration
- Thanks to [uiverse.io](https://uiverse.io) for UI component inspiration

## 🌟 Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

<p align="center">
  Made with ❤️ by <strong>mar</strong>
</p>
