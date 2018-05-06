import React, { Component } from 'react';
import { AppRegistry, View ,Button,Text } from 'react-native';

export default class IDTipsScreen extends Component {
    constructor(props){
        super(props);
        const params = this.props.navigation.state.params;
        const type = params ? params.type : null;
        this.state = {type:type}
        console.log("the type in idtips screen is",type);
    }
    render() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
            }}>
                {this.renderText()}
                <Button
                    onPress={this.navigate.bind(this)}
                    title="下一步"
                    color="#82E3CA"
                    accessibilityLabel="Learn more about this purple button"
                />
            </View>
        );
    }
    renderText() {
        switch(this.state.type){
            case "front":
                return (<Text>下一步为拍摄身份证正面照</Text>);
                break;
            case "back":
                return (<Text>下一步为拍摄身份证反面照</Text>);
                break;
            case "Face":
                return (<Text>下一步人脸识别，请左右转头</Text>);
                break;
        }
    }
    navigate(){
        switch(this.state.type){
            case "front":
                console.log("idtips front called");
                this.props.navigation.navigate('IDRecognition',{
                    type:"front"
                })
                break;
            case "back":
                console.log("idtips back called");
                this.props.navigation.navigate('IDRecognition',{
                    type:"back"
                })
                break;
            case "Face":
                console.log("face screen called");
                this.props.navigation.navigate('FaceRecognition')
                break;
            default :
                this.props.navigation.navigate('Login')
        }

    }
};