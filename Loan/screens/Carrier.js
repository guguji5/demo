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
                source={{uri:"https://ida.webank.com/s/web/h5/#/entry"}}
                style={{marginTop: 0}}
                onMessage={this.fromWeb}
            />
        );
    }
}
