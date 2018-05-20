import React, { Component } from 'react';
import { WebView } from 'react-native';

const patchPostMessageJsCode = `(${String(function() {
    var originalPostMessage = window.postMessage
    var patchedPostMessage = function(message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer)
    }
    patchedPostMessage.toString = function() {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
    }
    window.postMessage = patchedPostMessage
})})();`

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
            console.log(event.nativeEvent)
            if(event.nativeEvent.data=="ID"){
                this.props.navigation.navigate('IDTips',{
                    type: "front"
                })
            }else if(event.nativeEvent.data=="Face"){
                this.props.navigation.navigate('IDTips',{
                    type: "Face"
                })
            }
        }
    }
    render() {

        const patchPostMessageFunction = function() {
            var originalPostMessage = window.postMessage;

            var patchedPostMessage = function(message, targetOrigin, transfer) {
                originalPostMessage(message, targetOrigin, transfer);
            };

            patchedPostMessage.toString = function() {
                return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };

            window.postMessage = patchedPostMessage;
        };

        const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';

        return (
            <WebView
                source={{uri:"http://39.106.198.9:8080/loanpages/certify.html?userId="+userId}}
                style={{marginTop: 0}}
                onMessage={this.fromWeb}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                injectedJavaScript={patchPostMessageJsCode}
            />
        );
    }
}
