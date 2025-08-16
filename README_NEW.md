# Financial Tracker PWA

A mobile-optimized Progressive Web App for personal budget tracking built with React, TypeScript, and Bun.

## Features

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for mobile devices with touch-friendly controls
- **Bottom Navigation**: Easy thumb navigation with three main sections
- **PWA Support**: Installable as a native app with offline functionality

### 💰 Budget Management
- **Category Tracking**: Create colored categories with allocated and spent amounts
- **Free Money Calculation**: Automatic calculation of remaining budget
- **Smart Warnings**: Alerts when spending exceeds allocations or limits

### 📊 Three Main Pages

#### 1. **Main (Budget)**
- Month picker with automatic budget cloning from previous months
- Spending limit management
- Category creation and editing with color selection
- Real-time budget summary
- Progress bars for category spending

#### 2. **History**
- View all previous months' budget data
- Quick navigation to any historical month
- Summary statistics for each month
- Category overview with color coding

#### 3. **Settings**
- **Currency Support**: KZT (₸), USD ($), RUB (₽)
- **Data Management**: Import/Export budget data as JSON
- **History Retention**: Configurable storage duration (3-36 months)
- **Reset Function**: Complete data wipe with confirmation

### 🔒 Data & Privacy
- **Local Storage**: All data stored in IndexedDB (no external servers)
- **Offline First**: Works completely offline
- **Data Export/Import**: Full backup and restore functionality
- **Auto-cleanup**: Automatic old data removal based on retention settings

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Bun (fast JavaScript runtime and package manager)
- **Storage**: IndexedDB for offline data persistence
- **Styling**: Vanilla CSS with mobile-first responsive design
- **PWA**: Service Worker for offline functionality
- **Deployment**: GitHub Pages compatible

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-tracker
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
bun run build
```

This creates a `dist` folder with the production build, including:
- Minified JavaScript and CSS
- PWA manifest and service worker
- All static assets

### Deploying to GitHub Pages

1. **Set up GitHub Pages in your repository settings**
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

2. **Deploy**
   ```bash
   bun run deploy
   ```

This will build the app and push it to the `gh-pages` branch.

## Usage Guide

### Getting Started
1. **Set Your Currency**: Go to Settings and select your preferred currency
2. **Create First Budget**: On the main page, set your monthly spending limit
3. **Add Categories**: Create categories like "Food", "Transport", "Entertainment"
4. **Track Spending**: Update spent amounts as you make purchases

### Monthly Workflow
1. **Start New Month**: Select next month from the dropdown
2. **Clone Previous Budget**: Accept the prompt to copy categories from last month
3. **Adjust Allocations**: Modify category budgets as needed
4. **Track Progress**: Monitor spending throughout the month

### Data Management
- **Export Regularly**: Back up your data from Settings > Export Data
- **Import When Needed**: Restore from backup using Settings > Import Data
- **Adjust Retention**: Set how long to keep history in Settings

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Bottom navigation bar
│   ├── Modal.tsx        # Modal dialog component
│   ├── MonthPicker.tsx  # Month selection dropdown
│   ├── CategoryCard.tsx # Category display card
│   └── CategoryModal.tsx # Category add/edit form
├── pages/              # Main application pages
│   ├── MainPage.tsx    # Budget management page
│   ├── HistoryPage.tsx # Historical data view
│   └── SettingsPage.tsx # App configuration
├── context.tsx         # React Context for state management
├── database.ts         # IndexedDB service layer
├── types.ts           # TypeScript type definitions
├── styles.css         # Global styles
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
```

## Key Features Explained

### Smart Budget Logic
- **Free Money**: `Spending Limit - Total Allocated + Unspent Amounts`
- **Overspending Alerts**: Visual indicators when categories exceed allocations
- **Budget Warnings**: Alerts when total allocations exceed spending limit

### Mobile Optimization
- **Touch Targets**: All interactive elements meet 44px minimum size
- **Viewport Meta**: Proper mobile viewport configuration
- **Responsive Design**: Adapts to different screen sizes
- **Bottom Navigation**: Thumb-friendly navigation placement

### Data Persistence
- **IndexedDB**: Client-side database for structured data storage
- **Automatic Saves**: Changes saved immediately to local storage
- **Data Validation**: Import validation to prevent data corruption
- **Retention Management**: Automatic cleanup of old data

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (recent versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **PWA Features**: Requires browser with service worker support
- **IndexedDB**: Required for data storage (supported in all modern browsers)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Troubleshooting

### Common Issues

**App not installing as PWA**
- Ensure you're accessing via HTTPS (required for PWA)
- Check browser console for service worker errors

**Data not persisting**
- Verify IndexedDB is enabled in browser settings
- Check for private browsing mode restrictions

**Import/Export not working**
- Ensure JSON file format is correct
- Check file size limits in browser

**Build fails**
- Verify Bun is properly installed
- Clear node_modules and reinstall dependencies

### Development Tips

- Use browser dev tools to inspect IndexedDB data
- Test PWA features in production build, not development
- Use mobile device simulation for accurate touch testing
- Monitor bundle size with build output analysis
