import React from 'react';
import { StyleSheet } from 'react-native';
import { View, ScrollView, ActivityIndicator, Share } from "react-native";
import { Button, Text as NativeBaseText, List, ListItem, Left, Body, Icon, Thumbnail } from 'native-base';
import { FIREBASE_DATABASE } from '../../constants/Firebase';
import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/actions';
import { Header } from 'react-native-elements';
import _ from 'lodash';

class MembersList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: undefined,
            isMembersFetch: true,
            membersList: [],
            membersData: [],
            circleData: undefined,
            isShowBtn: false,
        }
    }

    static navigationOptions = {
        header: null
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            user: nextProps.user,
            key: nextProps.key,
            circleData: nextProps.navigation.state.params.list
        };
    }

    _leave = () => {
        const { circleData, user } = this.state;
        let circleKey = circleData.key;
        let userKey = user.id;
        FIREBASE_DATABASE
            .ref('circles')
            .child(circleKey)
            .child('users')
            .child(userKey)
            .remove()
            .then(() => {
                FIREBASE_DATABASE
                    .ref('users')
                    .child(userKey)
                    .child('myCircles')
                    .child(circleKey)
                    .remove()
            })
            .then(() => this._leaveCircleNotification())
            .then(() => this.props.navigation.navigate('Home'))
            .catch((e) => console.log(e.message))
    }

    _delete = () => {
        const { circleData } = this.state;
        let circleKey = circleData.key;
        let keyReference = circleData.data.keyReference;
        FIREBASE_DATABASE
            .ref('circles')
            .child(circleKey)
            .remove()
            .then(() => {
                FIREBASE_DATABASE
                    .ref('users')
                    .child(userKey)
                    .child('myCircles')
                    .child(circleKey)
                    .remove()
            })
            .then(() => {
                FIREBASE_DATABASE
                    .ref('keys')
                    .child(keyReference)
                    .remove()
            })
            .then(() => this._deleteCircleNotification())
            .then(() => this.props.navigation.navigate('Home'))
            .catch((e) => console.log(e.message))
    }

    _header = () => {
        const { circleData } = this.state;
        return (
            <Header
                backgroundColor="#fff"
                leftContainerStyle={{
                    marginLeft: 15
                }}
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: '#757575', onPress: () => this.props.navigation.goBack() }}
                centerComponent={{ text: `${circleData.data.name.toUpperCase()} MEMBER'S LIST`, style: { color: '#757575' } }}
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

    componentDidMount() {
        this._fetchCircleMember()
    }

    _fetchCircleMember = () => {
        let { circleData, membersList } = this.state;
        FIREBASE_DATABASE.ref('circles').child(circleData.key).child('users').on('value', snap => {
            membersList = []
            snap.forEach(snapshot => {
                membersList.push(snapshot.val().id);
            })
            this.setState({ membersList })
            this._fetchMembersData(membersList);
        })
    }

    _fetchMembersData = (membersList) => {
        let { circleData, membersData } = this.state;
        membersData = [];
        let adminKey = circleData.data.admin.id;
        membersList.map((val, i) => {
            FIREBASE_DATABASE.ref('users').child(val).once('value', snap => {
                var obj = {};
                obj.key = snap.key;
                obj.data = snap.val();
                obj.admin = snap.val().id === adminKey;
                membersData.push(obj)
            }).then(() => {
                this.setState({ membersData, isMembersFetch: membersList.length >= i + 1 ? false : true });
                membersList.length >= i + 1 && this._showBtn();
            })
        })
    }

    _showBtn = () => {
        this.setState({ isShowBtn: true })

        // setTimeout(() => {
        // }, 100)
    }

    _list = () => {
        let { isMembersFetch, membersData } = this.state;
        let sortedData = _.sortBy(membersData, [function (o) { return !o.admin; }]);
        return (
            !isMembersFetch ?
                <View style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}>
                    <List>
                        {
                            sortedData.map((v, i) => {
                                return (
                                    <ListItem avatar>
                                        <Left>
                                            <Thumbnail source={{ uri: v.data.photo }} style={{ width: 40, height: 40, marginBottom: 7 }} />
                                        </Left>
                                        <Body >
                                            <NativeBaseText>
                                                {v.data.name}
                                            </NativeBaseText>
                                            {!i &&
                                                <NativeBaseText style={{ marginTop: 7 }} note>
                                                    <NativeBaseText note>
                                                        <Icon name='star' style={{ color: '#f7406a', fontSize: 15 }} type="MaterialCommunityIcons" />
                                                    </NativeBaseText> Circle Owner
                                                </NativeBaseText>
                                            }
                                        </Body>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </View>
                :
                <ActivityIndicator size="large" color="#757575" />
        )
    }

    onShare = async () => {
        let { circleData } = this.state;
        try {
            const result = await Share.share({
                message:
                    `Family Tracker App\n\nJoin us in ${circleData.data.name.toLowerCase()}'s circle thorugh this code ${circleData.data.key}`,
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

    _leaveCircleNotification = () => {
        let { circleData, membersData, user } = this.state;
        membersData.map(v => {
            fetch('https://exp.host/--/api/v2/push/send', {
                mode: 'no-cors',
                method: 'POST',
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    to: v.token,
                    body: `${user.name} has left the ${circleData.data.name}'s circle`,
                    data: {
                    },
                    sound: "default",
                    priority: "high",
                }),
            });
        })
    }

    _deleteCircleNotification = () => {
        let { circleData, membersData, user } = this.state;
        membersData.map(v => {
            fetch('https://exp.host/--/api/v2/push/send', {
                mode: 'no-cors',
                method: 'POST',
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    to: v.token,
                    body: `${user.name} has deleted the ${circleData.data.name}'s circle`,
                    data: {
                    },
                    sound: "default",
                    priority: "high",
                }),
            });
        })
    }

    _inviteBtnRender = () => (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 20 }}>
            <Button iconLeft onPress={this.onShare} rounded transparent>
                <Icon name='plus' style={{ color: "#f7406a" }} type="MaterialCommunityIcons" />
                <NativeBaseText style={{ color: '#f7406a' }}>Invite Friend</NativeBaseText>
            </Button>
        </View>
    )

    _leaveCircleRender = () => (
        <View style={styles.actionBtn}>
            <Button rounded onPress={this._leave} style={{ backgroundColor: '#949494' }}>
                <NativeBaseText style={{ color: '#fff' }}>Leave Circle</NativeBaseText>
            </Button>
        </View>
    )

    _deleteCircleRender = () => (
        <View style={styles.actionBtn}>
            <Button rounded onPress={this._delete} style={{ backgroundColor: '#ce3c3e' }}>
                <NativeBaseText style={{ color: '#fff' }}>Delete Circle</NativeBaseText>
            </Button>
        </View>
    )

    render() {
        const { circleData, user, isShowBtn } = this.state;
        let adminId = circleData.data.admin.id;
        let myId = user.id;
        return (
            <View style={styles.container}>
                {this._header()}
                <ScrollView style={{ paddingTop: 10 }}>
                    {
                        this._list()
                    }
                    {
                        isShowBtn &&
                        adminId === myId &&
                        this._inviteBtnRender()
                    }
                </ScrollView>

                {
                    isShowBtn ?
                        adminId !== myId ?
                            this._leaveCircleRender()
                            :
                            this._deleteCircleRender()
                        :
                        <View />
                }
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
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 20
    }
})


const mapStateToProps = (state) => {
    return {
        user: state.AuthReducer.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onDispatchUpdateUser: (id) => dispatch(updateUser(id)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);
