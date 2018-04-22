import React from 'react';
import { Button,View, Text} from 'react-native';

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        title: 'Home',
        // headerStyle: {
        //     backgroundColor: '#f4511e',
        // },
        // headerTintColor: '#fff',
        // headerTitleStyle: {
        //     fontWeight: 'bold',
        // },
        // headerTitle: <LogoTitle />,
        headerRight: (
            <Button
                onPress={() => alert('This is a button!')}
                title="go"
            />
        ),
    };
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
                <Button
                    title="Let's go to Login"
                    onPress={() => this.props.navigation.navigate('Login')}
                />
                <Button
                    title="Let's go to Carrier"
                    onPress={() => this.props.navigation.navigate('Carrier')}
                />
                <Button
                    title="Let's go to Camera"
                    onPress={() => this.props.navigation.navigate('Camera')}
                />
            </View>
        );
    }
}

