// Load environment variables from .env file
import 'dotenv/config';

const IS_PRODUCTION = process.env.EXPO_NO_DEV_CLIENT === '1';

export default {
    "expo": {
        "name": "Heavenly Hub",
        "slug": "heavenlyhub",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/HB.png",
        "userInterfaceStyle": "light",
        "newArchEnabled": false,
        "privacy": "public",
        "privacyPolicyUrl": "https://a-heavenlyhub.com/privacy",
        "splash": {
            "image": "./assets/images/HBMAIN1.png",
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": IS_PRODUCTION ? "com.bsk3s.heavenlyhub" : "com.bsk3s.heavenlyhub.dev",
            "buildNumber": "251",
            "jsEngine": "hermes",
            "infoPlist": {
                "ITSAppUsesNonExemptEncryption": false,
                "NSCameraUsageDescription": "Heavenly Hub uses your camera to capture photos for personalizing your profile and sharing faith-based content with your community.",
                "NSMicrophoneUsageDescription": "Your microphone enables voice conversations with our AI spiritual guide, voice-to-text prayers, and interactive Bible study discussions to deepen your faith journey.",
                "NSPhotoLibraryUsageDescription": "Access your photo library to personalize your profile picture, add meaningful images to your journal entries, and share inspirational content.",
                "CFBundleURLTypes": [
                    {
                        "CFBundleURLName": "com.bsk3s.heavenlyhub",
                        "CFBundleURLSchemes": ["com.bsk3s.heavenlyhub"]
                    }
                ]
            },
            "config": {
                "usesNonExemptEncryption": false
            }
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            "edgeToEdgeEnabled": true,
            "package": IS_PRODUCTION ? "com.bsk3s.heavenlyhub-prod" : "com.bsk3s.heavenlyhub-dev",
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
        "linking": {
            "prefixes": ["com.bsk3s.heavenlyhub://"],
            "config": {
                "screens": {
                    "auth": {
                        "path": "/auth/callback",
                        "exact": true
                    }
                }
            }
        },
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
                        "newArchEnabled": false,
                        "xcodeProjectFile": {
                            "buildSettings": {
                                "GCC_TREAT_WARNINGS_AS_ERRORS": "NO",
                                "CLANG_WARNINGS_AS_ERRORS": "NO",
                                "GCC_WARN_ABOUT_DEPRECATED_FUNCTIONS": "NO",
                                "CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS": "NO",
                                "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF": "NO",
                                "CLANG_WARN_DEPRECATED_IMPLEMENTATIONS": "NO",
                                "WARNING_CFLAGS": "$(inherited) -Wno-deprecated-declarations -Wno-deprecated-implementations -Wno-deprecated",
                                "OTHER_CFLAGS": "$(inherited) -Wno-error=deprecated-declarations -Wno-deprecated-declarations -Wno-deprecated-implementations"
                            }
                        }
                    },
                    "android": {
                        "minSdkVersion": 24
                    }
                }
            ],
            // Always include LiveKit plugin but conditionally configure it
            ["@livekit/react-native-expo-plugin"],
            "expo-secure-store",
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
            "bibleApiKey": process.env.EXPO_PUBLIC_BIBLE_API_KEY,
            "apiUrl": process.env.EXPO_PUBLIC_API_URL,
            "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
            "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
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
