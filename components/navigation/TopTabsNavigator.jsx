import React, { useState } from 'react';
import { View } from 'react-native';
import TopTabBar from './TopTabBar';

import ChatScreen from '../../screens/ChatScreen';
import HomeScreen from '../../screens/HomeScreen';
import BibleScreen from '../../screens/BibleScreen';
import StudyHomeScreen from '../../screens/study/StudyHomeScreen';

const tabs = [
    { id: 'Chat', Component: ChatScreen },
    { id: 'Home', Component: HomeScreen },
    { id: 'Bible', Component: BibleScreen },
    { id: 'Study', Component: StudyHomeScreen },
];

export default function TopTabsNavigator() {
    const [activeTab, setActiveTab] = useState('Home');
    const Active = tabs.find(t => t.id === activeTab)?.Component ?? HomeScreen;

    return (
        <View style={{ flex: 1 }}>
            {/* Top tabs bar (your styled component) */}
            <TopTabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Active scene */}
            <View style={{ flex: 1 }}>
                <Active />
            </View>
        </View>
    );
}


