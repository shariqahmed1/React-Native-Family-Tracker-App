import React from 'react';
import { StyleSheet } from 'react-native';
import { View, ToastAndroid } from "react-native";
import { Button as NativeBaseButton, Text as NativeBaseText, Item, Input, Content, Form, Left, Body, Right } from 'native-base';
import { FIREBASE_DATABASE } from '../../constants/Firebase';
import { RANDOM_STRING } from '../../constants/Functions';
import { connect } from 'react-redux';
import { Header } from 'react-native-elements';

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: undefined,
            circleName: '',
        }
    }

    static navigationOptions = {
        header: null
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
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: '#757575', onPress: () => this.props.navigation.goBack() }}
                centerComponent={{ text: 'CREATE CIRCLE', style: { color: '#757575' } }}
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
            <NativeBaseText style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 25, marginTop: 35 }}>CIRCLE NAME</NativeBaseText>
        )
    }

    _input = () => {
        const { circleName } = this.state;
        return (
            <Form style={{ paddingLeft: 30, paddingRight: 30 }}>
                <Item>
                    <Input textAlign={'center'} value={circleName} placeholder="Entire Circle Name" onChangeText={(e) => this.setState({ circleName: e })} />
                </Item>
            </Form>
        )
    }

    _setKey = (key) => {
        FIREBASE_DATABASE.ref('keys').push({
            key
        }).then((res) => {
            this._createCircle(res.key, key)
        })
    }

    _createCircle = (keysReference, key) => {
        const { circleName, user } = this.state;
        let myId = user.id;
        FIREBASE_DATABASE.ref('circles').push({
            key,
            admin: {
                id: myId
            },
            name: circleName,
            users:{
                [myId]:{
                    id: myId
                }
            },
            keysReference,
        })
        .then((res) => {
            FIREBASE_DATABASE.ref('users').child(myId).child('myCircles').child(res.key).update({
                circleKey:res.key
            })

        }).then(() => {
            this.setState({ circleName: '' })
            ToastAndroid.show('Circle create successfully!', ToastAndroid.SHORT);
            this.props.navigation.navigate('ShareCode', {
                data: {
                    key,
                    name: circleName,
                }
            });

        }).catch(err => console.log(err.message))
    }

    // _check = () => {
    //     FIREBASE_DATABASE.ref('check').push({
    //         data:"NAME"
    //     })
    //     .then((res) => {
    //         console.log(res.key);
    //     })
    // }

    _checkKey = () => {
        const { circleName } = this.state;
        if (!circleName) {
            ToastAndroid.show('Please enter circle name', ToastAndroid.SHORT);
            return;
        }
        let generateCode = RANDOM_STRING();
        FIREBASE_DATABASE.ref('keys').orderByChild('key').equalTo(generateCode).once('value', snap => {
            if (snap.exists()) {
                this._checkKey()
            } else {
                this._setKey(generateCode);
            }
        })
    }

    _createButton = () => {
        return (
            <Content>
                <Left />
                <Body>
                    <NativeBaseButton rounded style={{ backgroundColor: '#f7406a', marginTop: 25 }} onPress={this._checkKey}>
                        <NativeBaseText>CREATE</NativeBaseText>
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
                <Content>
                    {this._text()}
                    {this._input()}
                    {this._createButton()}
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
    },
    inputStyle: {
        width: '100%',
        paddingLeft: 25,
        paddingRight: 25
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
