import React, { Component } from 'react';
import {
    AppRegistry,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import {Auth}  from "../tools/Authorization"
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
export  default class FaceRecognitionScreen extends Component {
    static navigationOptions = {
        headerStyle: {
            height:0
        },
    };
    constructor(){
        super();
        this.state = {isRecord: false,isSending: false};
    }
    render() {
        return (
            <View style={styles.container}>

                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style = {styles.preview}
                    type={RNCamera.Constants.Type.front}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                />

                <TouchableOpacity
                    onPress={this.record.bind(this)}
                    style = {styles.capture}
                >
                    {this.changeIcon()}
                </TouchableOpacity>
                {this.renderIndicator()}

            </View>
        );
    }

    record = async function() {
        if (!this.state.isRecord && this.camera) {
            this.setState({isRecord: true});
            const options = { quality: RNCamera.Constants.VideoQuality['480p']};
            const data = await this.camera.recordAsync(options)
            // console.log(data.uri);
            this.setState({isSending:true});
            let image_form = new FormData();
            image_form.append('video_file', {
                uri:data.uri,
                type: 'video/mp4', // or photo.type
                name: 'testVideoName'
            });
            image_form.append('name',"杜宽");
            // image_form.append('idnumber',"130128199108040023");
            image_form.append('idnumber',"130128199012020036");

            let myHeaders = new Headers();
            myHeaders.append('Authorization', Auth());
            let that = this;
            fetch("https://v2-auth-api.visioncloudapi.com/identity/silent_idnumber_verification/stateless", {
                method: 'post',
                // mimeType: 'multipart/form-data',
                headers:myHeaders,
                body: image_form,
            }).then(res => {
                that.setState({isSending:false});
                console.log(res.json())
                that.props.navigation.navigate('Certify')
            });

        } else {
            this.setState({isRecord: false});
            return this.camera.stopRecording()
        }
    }
    changeIcon (){
        console.log(this.state.isRecord);
        if(this.state.isRecord){
            return (
                <FontAwesome name="stop" size={30} color="#e1e1e1" />
            );
        }else{
            return (<Entypo name="video-camera" size={30} color="#e1e1e1" />);
        }
    }
    renderIndicator (){
        if(this.state.isSending){
            return (<View style={{position:"absolute",width:"100%",height:"100%",backgroundColor:'rgba(0, 0, 0, 0.7)',flex: 1,
                flexDirection: 'column'}}>
                <ActivityIndicator size="large" color="#0000ff" style = {{flex: 1,
                    justifyContent: 'center'}}/>
            </View>);
        }else{
            return null;
        }

    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        // backgroundColor: 'black'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        position: "absolute",
        bottom:0,
        // backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
    },
    indicator: {
        position: "absolute",
        bottom:"50%",
        left:"50%"
    }
});