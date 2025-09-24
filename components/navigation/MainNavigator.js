import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import the production TopTabBar
import TopTabBar from './TopTabBar';

// Import screens
import HomeScreen from '../../screens/HomeScreen';
import ChatScreen from '../../screens/ChatScreen';
import BibleScreen from '../../screens/BibleScreen';
import StudyScreen from '../../screens/StudyScreen';

export default function MainNavigator() {
    const [activeTab, setActiveTab] = useState('Home');

    const renderActiveScreen = () => {
        switch (activeTab) {
            case 'Chat':
                return <ChatScreen onTabChange={setActiveTab} />;
            case 'Home':
                return <HomeScreen />;
            case 'Bible':
                return <BibleScreen />;
            case 'Study':
                return <StudyScreen />;
            default:
                return <HomeScreen />;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="dark" />

            {/* Top Tab Bar */}
            <TopTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Screen Content */}
            <View style={{ flex: 1 }}>
                {renderActiveScreen()}
            </View>
        </SafeAreaView>
    );
}

