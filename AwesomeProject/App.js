import React from 'react';
import { Button,View, Text } from 'react-native';
import { StackNavigator } from 'react-navigation';
import HomeScreen from  './Home'
import DetailsScreen from './Details'

const RootStack = StackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        Details: {
            screen: DetailsScreen,
        },

    },{
        initialRouteName: 'Home',
        navigationOptions: {
            headerStyle: {
                backgroundColor: '#abcdef',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        },
    }
);

export default class App extends React.Component {
    render() {
        return <RootStack />;
    }
}
