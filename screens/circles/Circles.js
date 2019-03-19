import React from 'react';
import { StyleSheet } from 'react-native';
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Text as NativeBaseText, List, ListItem, Icon, Left, Body } from 'native-base';
import { FIREBASE_DATABASE } from '../../constants/Firebase';
import { connect } from 'react-redux';
import { Header, Avatar } from 'react-native-elements';
import Button from '../components/button/Button';



class Circles extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: undefined,
            circlesList: [],
            isCirclesFetch: true,
            myCircles:[],
            myCirclesData:[],
        }
    }

    static navigationOptions = {
        drawerLabel: "Circles",
        drawerIcon: (
            <Icon name='account-group' style={{ color: '#757575', fontSize:25 }} type="MaterialCommunityIcons" />
        ),
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            user: nextProps.user,
            myCircles:nextProps.myCircles
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
                centerComponent={{ text: 'CIRCLES', style: { color: '#757575' } }}
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
        this._fetchCirclesList();
    }

    _fetchCirclesList = () => {
        let { myCircles, myCirclesData } = this.state;
        if(myCircles.length){
            myCircles.map((v) => {
              FIREBASE_DATABASE.ref('circles').child(v).once('value', snap => {
                var obj = {};
                obj.key = snap.key;
                obj.data = snap.val()
                myCirclesData.push(obj);
                this.setState({ myCirclesData, isCirclesFetch: myCirclesData.length === myCircles.length ? false : true })
              })
            })
        }
    }

    _list = () => {
        const { isCirclesFetch, myCirclesData } = this.state;
        return (
            !isCirclesFetch ?
                !myCirclesData.length ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '50%', marginBottom: 30 }}>
                        <NativeBaseText style={{ textAlign: 'center', fontSize: 15 }}>NO CIRCLES YET</NativeBaseText>
                    </View>
                    :
                    <View style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}>
                        <List>
                            {
                                myCirclesData.map((v, i) => {
                                    return (
                                        <ListItem avatar onPress={() => {
                                            this.props.navigation.navigate('MembersList', {list: v})
                                        }}>
                                            <Left>
                                                <Avatar size="medium" 
                                                    rounded 
                                                    icon={{ name: 'group', color:"#3dbd9d", type:"material" }} 
                                                    containerStyle={{ marginBottom: 13 }} 
                                                    overlayContainerStyle={{ 
                                                        backgroundColor: 'white' 
                                                    }}
                                                />
                                            </Left>
                                            <Body>
                                                <NativeBaseText>
                                                    {`${v.data.name.toUpperCase()}${` `} CIRCLE`}
                                                </NativeBaseText>
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

    render() {
        return (
            <View style={styles.container}>
                {this._header()}
                <ScrollView style={{ height: '100%', paddingTop: 10 }}>
                    {
                        this._list()
                    }
                </ScrollView>
                <Button {...this.props} />
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
    }
})


const mapStateToProps = (state) => {
    return {
        user: state.AuthReducer.user,
        myCircles:state.AuthReducer.myCircles
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Circles);
