import React, { Component } from 'react';
import { WebView } from 'react-native';

export  default class MyWeb extends Component {
    static navigationOptions = {
        title: '注册',
        headerStyle: {
            height:0
        },
    };
    constructor(props) {
        super(props);
        this.state = {text: ''};
        this.fromWeb = (event) =>{
            console.log(event.nativeEvent);
            if(event.nativeEvent.data==="ID"){
                this.props.navigation.navigate('IDTips',{
                    type: "front"
                })
            }else if(event.nativeEvent.data==="Face"){
                this.props.navigation.navigate('IDTips',{
                    type: "Face"
                })
            }else if(typeof(JSON.parse(event.nativeEvent.data))==="object" && JSON.parse(event.nativeEvent.data).userId){
                global.userId = JSON.parse(event.nativeEvent.data).userId;
            }
            console.log(userId)
        }
    }
    render() {
        return (
            <WebView
                source={{uri:"http://39.106.198.9:8080/loanpages/registerAndLogin.html"}}
                style={{marginTop: 0}}
                onMessage={this.fromWeb}
                javaScriptEnabled={true}
            />
        );
    }
}
