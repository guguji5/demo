import React, { Component } from 'react';
import {
    AppRegistry,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RNCamera } from 'react-native-camera';
// import Auth  from "../tools/Authorization"
// let authorization = Auth();

// console.log(new jsSHA("SHA-256", "TEXT"));

export  default class FaceRecognitionScreen extends Component {
    static navigationOptions = {
        headerStyle: {
            height:0
        },
    };
    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style = {styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                />
                <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
                    <TouchableOpacity
                        onPress={this.record.bind(this)}
                        style = {styles.capture}
                    >
                        <Text style={{fontSize: 14}}> 拍照 </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this.stopRecord.bind(this)}
                        style = {styles.capture}
                    >
                        <Text style={{fontSize: 14}}> stop </Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }

    takePicture = async function() {
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            const data = await this.camera.takePictureAsync(options)
            console.log("the uri of img is", data.uri);
            let image_form = new FormData();
            image_form.append('file', {
                uri:data.uri,
                type: 'image/jpg', // or photo.type
                name: 'testPhotoName'
            });
            fetch("http://zs.mtkan.cc/upload.php", {
                method: 'post',
                // mimeType: 'multipart/form-data',
                body: image_form,
            }).then(res => {
                console.log(res.json())
            });


        }
    };
    record = async function(){
        if (this.camera) {
            const options = { quality: RNCamera.Constants.VideoQuality['480p']};
            const data = await this.camera.recordAsync(options)
            console.log(data.uri);

            let image_form = new FormData();
            image_form.append('video_file', {
                uri:data.uri,
                type: 'video/mp4', // or photo.type
                name: 'testVideoName'
            });
            image_form.append('name',"杜宽");
            image_form.append('idnumber',"130128199012020036");

            let myHeaders = new Headers();
            myHeaders.append('Authorization', '');

            fetch("https://v2-auth-api.visioncloudapi.com/identity/silent_idnumber_verification/stateless", {
                method: 'post',
                // mimeType: 'multipart/form-data',
                body: image_form,
            }).then(res => {
                console.log(res.json())
            });

        }
    }
    stopRecord = function(){
        return this.camera.stopRecording()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
    }
});