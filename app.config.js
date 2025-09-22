const IS_PRODUCTION = process.env.EAS_BUILD_PROFILE === 'production';

export default {
  "expo": {
    "name": "Heavenly Hub",
    "slug": "heavenlyhub",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/HB.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "splash": {
      "image": "./assets/images/HBMAIN1.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bsk3s.heavenlyhub",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "This app uses the camera for video calls",
        "NSMicrophoneUsageDescription": "This app uses the microphone for voice calls"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.bsk3s.heavenlyhub",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "a-heavenlyhub.com",
              "pathPrefix": "/"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "scheme": "com.bsk3s.heavenlyhub",
    "updates": {
      "enabled": false
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "17.0",
            "useFrameworks": "static",
            "newArchEnabled": false
          },
          "android": {
            "minSdkVersion": 24
          }
        }
      ],
      "@livekit/react-native-expo-plugin",
      // Only include expo-dev-client in development builds
      ...(IS_PRODUCTION ? [] : ["expo-dev-client"])
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "a858d93a-8c2b-48aa-8c5c-2ac5f8411618"
      },
      "bibleApiKey": "c9afcb2ed06b4d336db834d2e03526cf",
      "apiUrl": "https://livekit-voice-agent-0jz0.onrender.com"
    },
    "owner": "bstr",
    "developer": {
      "tool": "expo-cli"
    },
    "packagerOpts": {
      "host": "0.0.0.0"
    }
  }
};
