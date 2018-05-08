import React from 'react';
import { Button,View, Text} from 'react-native';
import {Auth} from "./tools/Authorization";

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
    constructor(){
        super()
        let body ={
            address:"河北省石家庄市深泽县深泽镇小杜庄村富强街18号",
            authority: "",
            day: "2",
            gender: "男",
            month: "12",
            name: "杜宽",
            nation: "汉",
            number: "130128199012020036",
            requestId: "982ab639164140afa7feeeb9a0ae45e4",
            userId: "890",
            year: "1990"
        }
        let myHeaders = new Headers();
        myHeaders.append('Content-Type','application/json');
        myHeaders.append('Accept','application/json');
        fetch("http://39.106.198.9:8080/cashloanapi/liveBody/idCardAuthen", {
            method: 'post',
            headers:myHeaders,
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
    }
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

