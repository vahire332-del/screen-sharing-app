# Screen Share Test App

A modern web application built with Next.js that allows users to test and verify their screen sharing capabilities before important meetings or presentations. No software installation required - runs entirely in your browser.

![Screen Share Test App](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **🖥️ Screen Testing**: Test screen sharing capabilities with real-time preview
- **📊 Quality Monitoring**: Monitor stream quality, resolution, and frame rate
- **🌐 Network Analysis**: Real-time network quality assessment
- **📸 Snapshot Capture**: Take screenshots during screen sharing sessions
- **🔍 Technical Metadata**: View detailed technical information about your screen share
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface with dark/light theme support
- **⚡ Real-time Stats**: Live connection metrics and performance indicators

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/screen-share-app.git
cd screen-share-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## 🌐 Browser Support

This application requires browsers that support the `navigator.mediaDevices.getDisplayMedia` API:

- ✅ Chrome 72+
- ✅ Edge 79+
- ✅ Firefox 66+
- ❌ Safari (limited support)
- ❌ Mobile browsers (limited support)

## 📋 How to Use

1. **Start the Test**: Click "Start Screen Test" on the home page
2. **Grant Permission**: Allow browser access to your screen when prompted
3. **Select Source**: Choose to share your entire screen, a specific window, or a browser tab
4. **Monitor Quality**: View real-time metrics including resolution, frame rate, and network quality
5. **Take Snapshots**: Capture screenshots during the session
6. **Stop Sharing**: End the test and view session results

## 📸 Application Screenshots

### Home Page
![Home Page](https://github.com/yourusername/screen-share-app/blob/main/public/images/Homepage.png?raw=true)
*Clean, modern interface with clear call-to-action and browser compatibility check*

### Alternative Home View
![Alternative Home View](https://github.com/yourusername/screen-share-app/blob/main/public/images/Homepage2.png?raw=true)
*Different layout option showcasing responsive design*

### Permission Dialog
![Permission Dialog](https://github.com/yourusername/screen-share-app/blob/main/public/images/permission.png?raw=true)
*Browser permission prompt for screen sharing access*

### Screen Test Interface
![Screen Test](https://github.com/yourusername/screen-share-app/blob/main/public/images/screen-test.png?raw=true)
*Real-time screen sharing with quality monitoring and technical metadata*

### Results Page
![Results Page](https://github.com/yourusername/screen-share-app/blob/main/public/images/result.png?raw=true)
*Session summary with duration, resolution, and captured frame*

### Full Application View
![Full View](https://github.com/yourusername/screen-share-app/blob/main/public/images/viewpage.png?raw=true)
*Complete application workflow showing all features*

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── screen-test/
│   │   └── page.tsx         # Screen test interface
│   └── screen-result/
│       └── page.tsx         # Test results page
├── components/
│   ├── Button.tsx           # Reusable button component
│   ├── Card.tsx             # Card component
│   ├── Footer.tsx           # Footer component
│   └── NavBar.tsx           # Navigation bar
└── hooks/
    └── useScreenShare.ts    # Screen sharing logic hook
```

## 🎯 Key Features Explained

### Screen Testing
- Tests browser compatibility for screen sharing
- Provides real-time preview of shared content
- Monitors stream quality and performance

### Network Quality Monitoring
- Real-time assessment of connection quality
- Packet loss and latency monitoring
- Adaptive quality indicators

### Technical Metadata
- Display surface type (monitor, window, browser tab)
- Native resolution and frame rate
- WebRTC protocol information
- Track labels and identifiers

## 🔧 Technology Stack

- **Frontend Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Icons**: React Icons 5.5.0
- **Screen Capture**: WebRTC getDisplayMedia API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Privacy Notice

- **No Recording**: The app does not record or store your screen content
- **Local Processing**: All screen sharing processing happens locally in your browser
- **No Data Transmission**: No screen data is transmitted to external servers
- **Temporary Storage**: Session metadata is stored temporarily in browser localStorage

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure you grant screen sharing permissions when prompted
2. **Browser Not Supported**: Use a supported browser (Chrome, Edge, or Firefox)
3. **Black Screen**: Try selecting a different screen or window source
4. **Poor Quality**: Check your network connection and close bandwidth-heavy applications

### Debug Information

The app provides detailed technical metadata to help diagnose issues:
- Connection status and quality metrics
- Stream resolution and frame rate
- Browser compatibility information

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Include browser version and error details

---

**Built with ❤️ using Next.js and WebRTC**
