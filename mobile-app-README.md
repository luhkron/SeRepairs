# SeRepairs Mobile App

This is the mobile application for SeRepairs, designed for drivers to report maintenance issues and track their repair status.

## Features

- User Authentication (Login/Register)
- Report new maintenance issues with photos
- View reported issues and their status
- Push notifications for status updates
- Offline support for submitting reports

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native CLI
- Android Studio / Xcode (for running on emulator/device)
- Python 3.8+ (for backend)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd se-repairs-mobile
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=http://your-backend-url.com/api/v1
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Start the development server
```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

## Project Structure

```
se-repairs-mobile/
├── android/               # Android native code
├── ios/                   # iOS native code
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable components
│   ├── config/            # App configuration
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   │   ├── auth/          # Authentication screens
│   │   ├── home/          # Main app screens
│   │   └── reports/       # Report-related screens
│   ├── services/          # API and other services
│   ├── store/             # State management
│   └── utils/             # Utility functions
├── App.tsx               # Main app component
└── index.js              # Entry point
```

## Available Scripts

- `start`: Start the Metro bundler
- `android`: Run the app on Android
- `ios`: Run the app on iOS
- `test`: Run tests
- `lint`: Run ESLint
- `type-check`: Run TypeScript type checking

## API Documentation

The mobile app communicates with the backend API. See the [API Documentation](API_DOCS.md) for details on available endpoints and request/response formats.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@serepairs.com or open an issue in the repository.
