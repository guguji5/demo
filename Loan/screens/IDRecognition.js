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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
export  default class IDRecognitionScreen extends Component {
    static navigationOptions = {
        headerStyle: {
            height:0
        },
    };
    constructor(props){
        super(props);
        const params = this.props.navigation.state.params;
        const type = params ? params.type : null;
        this.state = {isRecord: false,isSending: false,type:type};
        console.log("the type in IDRecognitionScreen is",type);
    }
    render() {
        return (
            <View style={styles.container}>

                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style = {styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                />

                <TouchableOpacity
                    onPress={this.takePicture.bind(this)}
                    style = {styles.capture}
                >
                    <MaterialIcons name="photo-camera" size={30} color="#e1e1e1" />
                </TouchableOpacity>

                {this.renderIndicator()}
            </View>
        );
    }

    takePicture = async function() {
        console.log("call in idrecognition");
        const options = { quality: 0.5, base64: true };
        const data = await this.camera.takePictureAsync(options);
        console.log("called in idrecognition");
        console.log(data.uri);

        this.setState({isSending:true});

        let image_form = new FormData();
        image_form.append('image_file', {
            uri:data.uri,
            type: 'image/jpg', // or photo.type
            name: 'testPhotoName'
        });
        image_form.append('auto_rotate',true);
        image_form.append('side',"auto");
        image_form.append('classify',true);
        let myHeaders = new Headers();
        myHeaders.append('Authorization', Auth());
        myHeaders.append('Content-Type','multipart/form-data');
        let that = this;
        fetch("https://v2-auth-api.visioncloudapi.com/ocr/idcard/stateless", {
            method: 'post',
            headers:myHeaders,
            body: image_form,
        }).then(res => {
            console.log(res.json());
            that.setState({isSending:false});
            if(that.state.type == "front"){
                that.props.navigation.navigate('IDTips',{
                    type: "back"
                });
            }else if(that.state.type == "back"){
                that.props.navigation.navigate('Certify');
            }

        });

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