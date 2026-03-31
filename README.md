# Eid Cute Snaps Photobooth 🌙✨

A beautiful, feature-rich Eid-themed photobooth web app built with pure HTML, CSS, and JavaScript. No Electron required - runs directly in the browser!

## ✨ Features

### 📸 Camera & Capture
- Live camera feed using MediaDevices API
- 4-photo session with countdown timer
- Real-time filter preview
- Sticker placement before capture

### 🎨 Advanced Filters (8+)
- **Basic**: Normal, Pink Tone, Retro, B&W
- **Eid Special**: Golden Glow, Mint Fresh, Sparkle Star, Eid Radiance
- **Adjustable Intensity**: Brightness, Contrast, Saturation, Hue Rotate, Blur

### 🖼️ Frames (6+)
- Eid Moon 🌙
- Lantern 🏮
- Floral 🌸
- Sparkle ✨
- Hearts 💕
- No Frame option
- **Opacity Slider**: 0-100% control

### 🎀 Stickers (15+)
- Drag & drop placement
- Resize with corner handles
- Individual opacity control
- Layer ordering (bring to front/send back)
- Delete individual stickers
- Eid-themed stickers included

### 📝 Text Tool
- Custom text input
- 5 font options (Comic Neue, Poppins, Dancing Script, Pacifico, Quicksand)
- Color picker
- Size slider (12-72px)
- Opacity control
- Drag to reposition

### 📐 Collage Layouts
- 2×2 Grid
- Vertical Strip
- Heart Shape
- Polaroid Style
- Random Fun Layout

### ✨ Extra Features
- **Sparkle/Glitter Overlay**: Toggle with intensity control
- **Dark/Light Mode**: Pink theme vs Eid Mint-Gold theme
- **Download Options**: Single photo or ZIP of all 4
- **Share**: Web Share API integration
- **Print**: Direct print functionality

### 🎨 Design
- Girly Eid theme with pastel colors
- Animated elements (floating, twinkling)
- Responsive design for all devices
- Beautiful UI with rounded corners and soft shadows

## 🚀 Quick Start

### Option 1: Simple Python Server
```bash
python -m http.server 3000
```
Then open `http://localhost:3000`

### Option 2: Node.js http-server
```bash
npm install
npm start
```

### Option 3: Live Server (with hot reload)
```bash
npm run dev
```

### Option 4: Just open the file
Simply open `index.html` in your browser!

## 📁 Project Structure

```
photobooth-app-main/
├── index.html          # Complete single-page app
├── package.json        # Web dependencies
├── README.md          # This file
├── assests/           # Stickers and assets
│   ├── stickers/      # Crown, bunny, etc.
│   └── eid/          # Eid-themed stickers
└── public/            # (Optional) Additional assets
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repo
5. Click "Deploy"
6. Done! Get a link like `https://eid-cute-snaps.vercel.app`

### Deploy to Netlify
1. Drag and drop your project folder to [netlify.com](https://netlify.com)
2. Get instant deployment URL

### Deploy to GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select source branch
4. Access at `https://username.github.io/repo-name`

## 🎯 How to Use

1. **Welcome Screen**: Click "Start Photo Session"
2. **Capture Screen**: 
   - Choose a filter
   - Add stickers (optional)
   - Adjust filter intensity
   - Click "Take Photo" (4 times)
3. **Editing Screen**:
   - Navigate between photos
   - Add frames, stickers, text
   - Adjust everything with sliders
   - Add sparkle overlay
4. **Finalize**:
   - Download as ZIP
   - Share to social media
   - Print photos
   - Start new session

## 🛠️ Technologies Used

- **HTML5 Canvas**: Photo manipulation and editing
- **MediaDevices API**: Camera access
- **Pointer Events**: Drag, resize, rotate interactions
- **CSS3**: Animations, gradients, responsive design
- **JavaScript ES6+**: Modern async/await, classes
- **JSZip**: ZIP file creation for downloads
- **HTML2Canvas**: Canvas manipulation

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Opera 47+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Color Palette

- **Primary Pink**: #ec4899
- **Rose**: #f472b6
- **Lavender**: #c084fc
- **Mint**: #a8e6cf
- **Gold**: #ffd700
- **Eid Moon**: #ffb6e6

## 📄 License

MIT License - feel free to use and modify!

## 👩‍💻 Author

**Rimla** - Created with 💕

## 🙏 Acknowledgments

- Inspired by the joy of Eid celebrations
- Built to make photo memories magical
- Designed with love for the community

---

**Eid Mubarak! 🌙✨ May your photos be as beautiful as your memories!**