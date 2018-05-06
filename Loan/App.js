import React from 'react';
import { Button,View, Text } from 'react-native';
import { StackNavigator } from 'react-navigation';
import HomeScreen from  './Home'
import LoginScreen from './screens/Login'
import CertifyScreen from './screens/Certify'
import CarrierScreen from './screens/Carrier'
import CameraScreen from './screens/Camera'
import FaceRecognitionScreen from './screens/FaceRecognition'
import IDRecognitionScreen from './screens/IDRecognition'
import IDTipsScreen from './screens/IDTips'

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
        },
        Certify:{
            screen:CertifyScreen
        },
        FaceRecognition:{
            screen:FaceRecognitionScreen
        },
        IDRecognition:{
            screen:IDRecognitionScreen
        },
        IDTips:{
            screen:IDTipsScreen
        }
    },{
        initialRouteName: 'Certify',
        navigationOptions: {
            headerStyle: {
                backgroundColor: 'gray',
                height:0
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
