import React from 'react';
import { StyleSheet } from 'react-native';
import { View, ToastAndroid, Keyboard } from "react-native";
import { Button as NativeBaseButton, Text as NativeBaseText, Icon, Item, Input, Content, Form, Left, Body, Right } from 'native-base';
import { Header } from 'react-native-elements';
import { FIREBASE_DATABASE } from '../../constants/Firebase';
import { connect } from 'react-redux';

class JoinCircle extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            code: '',
            user: undefined,
        }
    }

    static navigationOptions = {
        drawerLabel: "Join Circles",
        drawerIcon: (
            <Icon name='google-circles' style={{ color: '#757575', fontSize: 25 }} type="MaterialCommunityIcons" />
        ),
    }


    static getDerivedStateFromProps(nextProps) {
        return {
            user: nextProps.user,
        };
    }

    _header = () => {
        return (
            <Header
                backgroundColor="#fff"
                leftContainerStyle={{
                    marginLeft: 15
                }}
                leftComponent={{ icon: 'menu', color: '#757575', onPress: () => this.props.navigation.toggleDrawer() }}
                centerComponent={{ text: 'JOIN A CIRCLE', style: { color: '#757575' } }}
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


    _text = () => {
        return (
            <NativeBaseText style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 16, marginBottom: 20 }}>Please enter invite code</NativeBaseText>
        )
    }

    _codeText = () => {
        return (
            <NativeBaseText style={{ textAlign: 'center', marginTop: 30, fontSize: 16, color: '#757575', marginBottom: 10 }}>Get code from your Circle's admin</NativeBaseText>
        )
    }

    _input = () => {
        const { code } = this.state;
        return (
            <Form style={{ paddingLeft: 30, paddingRight: 30 }}>
                <Item>
                    <Input textAlign={'center'} ref={(ref) => this.input = ref} value={code} placeholder="XXXXXX" maxLength={6} onChangeText={(e) => this.setState({ code: e })} />
                </Item>
            </Form>
        )
    }

    _checkCode = () => {
        const { code } = this.state;
        FIREBASE_DATABASE.ref('circles').orderByChild('key').equalTo(code).once('value', snap => {
            if (snap.exists()) {
                this._checkAdminAlreadyJoinedCircle(Object.keys(snap.val()));
            }
            else {
                ToastAndroid.show("That code isn't valid. Make sure that you've typed in the correct code", ToastAndroid.LONG)
            }
        })
    }

    _checkAdminAlreadyJoinedCircle = (key) => {
        const { user } = this.state;
        let circleId = key[0];
        FIREBASE_DATABASE.ref('circles').child(circleId).once('value', snap => {
            var data = snap.val();
            if (data.admin.id === user.id) {
                ToastAndroid.show("You already ownered that circle", ToastAndroid.LONG)
            }
            else {
                if (snap.val().users) {
                    this._checkUserAlreadyJoinedCircle(circleId, user.id);
                }
                else {
                    this._joinCircle(circleId);
                }
            }
        })
    }

    _checkUserAlreadyJoinedCircle = (circleId, userId) => {
        FIREBASE_DATABASE.ref('circles').child(circleId).child('users').child(userId).once('value', snap => {
            if (snap.exists()) {
                ToastAndroid.show("You've already joined that circle", ToastAndroid.LONG)
            }
            else {
                this._joinCircle(circleId);
            }
        })
    }

    _joinCircle = (circleId) => {
        const { user } = this.state;
        let id = user.id;
        FIREBASE_DATABASE.ref('circles').child(circleId).child('users').child(id).update({
            id
        }).then(() => {
            FIREBASE_DATABASE.ref('users').child(id).child('myCircles').child(circleId).update({
                circleKey:circleId
            })
            
        }).then(() => {
            Keyboard.dismiss();
            this.setState({ code:'' })
            this.props.navigation.navigate('Home');
        
        }).catch(e => console.log(e.message));
    }

    _submitButton = () => {
        const { code } = this.state;
        return (
            <Content>
                <Left />
                <Body>
                    <NativeBaseButton rounded disabled={code.length < 6 ? true : false} style={{ backgroundColor: '#f7406a', marginTop: 25 }} onPress={this._checkCode}>
                        <NativeBaseText> {` `} {` `} SUBMIT {` `} {` `} </NativeBaseText>
                    </NativeBaseButton>
                </Body>
                <Right />
            </Content>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this._header()}
                <Content style={{ marginTop: 40 }}>
                    {this._text()}
                    {this._input()}
                    {this._codeText()}
                    {this._submitButton()}
                </Content>
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



const mapStateToProps = (state) => {
    return {
        user: state.AuthReducer.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinCircle);
