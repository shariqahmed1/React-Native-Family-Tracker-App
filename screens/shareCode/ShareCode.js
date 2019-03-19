import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Share, Image } from "react-native";
import { Button as NativeBaseButton, Text as NativeBaseText, } from 'native-base';
import { Header } from 'react-native-elements';

class ShareCode extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: undefined,
        }
    }

    static navigationOptions = {
        header: null
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            data: nextProps.navigation.state.params.data,
        };
    }

    _header = () => {
        return (
            <Header
                backgroundColor="#fff"
                leftContainerStyle={{
                    marginLeft: 15
                }}
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: '#757575', onPress: () => this.props.navigation.navigate('Home') }}
                centerComponent={{ text: 'INVITE A NEW MEMBER', style: { color: '#757575' } }}
                containerStyle={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 5
                }}
            />
        )
    }

    _image = () => {
        return (
            <Image source={require('../../images/rsz_user.png')} style={{ width:171, height:119 }} />
        )
    }

    _text = () => {
        return (
            <NativeBaseText style={{ fontWeight: 'bold', textAlign: 'center', marginTop:30 }}>Share this code with people you want to join your circle:</NativeBaseText>
        )
    }

    _code = () => {
        const { data } = this.state;
        return (
            <NativeBaseText style={{ fontWeight: 'bold', textAlign: 'center', marginTop:20, fontSize:30, color:'#38bb9d' }}>{data.key}</NativeBaseText>
        )
    }

    onShare = async () => {
        const { data } = this.state;
        try {
            const result = await Share.share({
                message: `Family Tracker App\n\nJoin us in ${data.name.toLowerCase()}'s circle thorugh this code ${data.key}`,
            })

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    _sendButton = () => {
        return (
            <View>
                <NativeBaseButton rounded style={{ backgroundColor: '#f7406a', marginTop: 25 }} onPress={this.onShare}>
                    <NativeBaseText> {` `} {` `} SEND {` `} {` `} </NativeBaseText>
                </NativeBaseButton>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this._header()}
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems:'center', marginTop:40 }}>
                    {this._image()}
                    {this._text()}
                    {this._code()}
                    {this._sendButton()}
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        backgroundColor: '#fff',
        color: '#3d3e3f',
    },
    wrapper: {
        marginTop: 30
    },
    innerWrapper: {
        marginTop: 20
    }
})

export default ShareCode;
