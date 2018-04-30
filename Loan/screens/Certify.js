import React, { Component } from 'react';
import { WebView } from 'react-native';

export  default class MyWeb extends Component {
    static navigationOptions = {
        title: '认证',
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
                source={{uri:"http://39.106.198.9:8080/loanpages/certify.html"}}
                style={{marginTop: 0}}
                onMessage={this.fromWeb}
            />
        );
    }
}
