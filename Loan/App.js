import React from 'react';
import { Button,View, Text } from 'react-native';
import { StackNavigator } from 'react-navigation';
import HomeScreen from  './Home'
import LoginScreen from './screens/Login'
import CarrierScreen from './screens/Carrier'
import CameraScreen from './screens/Camera'


const RootStack = StackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        Login:{
            screen:LoginScreen
        },
        Carrier:{
            screen:CarrierScreen
        },
        Camera:{
            screen:CameraScreen
        }
    },{
        initialRouteName: 'Home',
        navigationOptions: {
            headerStyle: {
                backgroundColor: 'gray',
            },
            headerTintColor: '#98FB98',
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
