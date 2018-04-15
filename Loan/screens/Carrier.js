import React, { Component } from 'react';
import { WebView } from 'react-native';

export  default class CarrierScreen extends Component {
    static navigationOptions = {
        headerStyle: {
            height:0
        },
    };
    constructor(props) {
        super(props);
        this.state = {text: ''};
        this.fromWeb = (event) =>{
            alert(event.nativeEvent.data)
            this.props.navigation.navigate('Login')
        }
    }
    render() {
        return (
            <WebView
                source={{uri:"https://api.51datakey.com/h5/importV3/index.html#/carrier?apiKey=72a94c205c434107be76c5d1bf531259&userId=18903393333&backUrl=http%3A%2F%2F39.106.198.9%3A8080%2Fwebapi%2Fpages%2Fregister.html&themeColor=abcdef"}}
                style={{marginTop: 0}}
                onMessage={this.fromWeb}
            />
        );
    }
}
