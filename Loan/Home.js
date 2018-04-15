import React from 'react';
import { Button,View, Text} from 'react-native';
import CarrierScreen from "./screens/Carrier";

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
                <Text>This is the Home Screen</Text>
                <Button
                    title="Let's go to Details"
                    onPress={() => this.props.navigation.navigate('Details')}
                />
                <Button
                    title="Let's go to Login"
                    onPress={() => this.props.navigation.navigate('Login')}
                />
                <Button
                    title="Let's go to Carrier"
                    onPress={() => this.props.navigation.navigate('Carrier')}
                />
                <Button
                    title="Contacts"
                    onPress={showFirstContactAsync}
                />
                <Button
                    title="Camera"
                    onPress={() => this.props.navigation.navigate('Camera')}
                />
            </View>
        );
    }
}
async function showFirstContactAsync() {
    // Ask for permission to query contacts.
    const permission = await Expo.Permissions.askAsync(Expo.Permissions.CONTACTS);
    if (permission.status !== 'granted') {
        // Permission was denied...
        return;
    }
    const contacts = await Expo.Contacts.getContactsAsync({
        fields: [
            Expo.Contacts.PHONE_NUMBERS,
            Expo.Contacts.EMAILS,
        ],
        pageSize: 10,
        pageOffset: 0,
    });
    if (contacts.total > 0) {
        console.log(
            // 'Your first contact is...',
            `Name: ${contacts.data[1].name}
` +
            `Phone numbers: ${JSON.stringify(contacts.data[1].phoneNumbers)}
` +
            `Emails: ${JSON.stringify(contacts.data[0].emails)}`
        );
    }
}
