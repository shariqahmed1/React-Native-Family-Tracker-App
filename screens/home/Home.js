import React from 'react';
import { View, Dimensions, Image, StyleSheet, ToastAndroid, ActivityIndicator, Linking } from "react-native";
import { MapView, Location, Permissions, TaskManager, Notifications } from 'expo';
import { Text as NativeBaseText, List, ListItem, Icon,  Left, Body } from 'native-base';
import { connect } from 'react-redux';
import { updateUser, myCircles } from '../../redux/actions/actions';
import { Header, Icon as NativeElementIcon, Avatar } from 'react-native-elements';
import { FIREBASE_DATABASE } from '../../constants/Firebase';
import Button from '../components/button/Button';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0700;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: undefined,
      isList: false,
      getLocation: false,
      locations: undefined,
      isFetchSelectedCircelPeoples: false,
      selectedCircle: undefined,
      isDidUpdate: false,
      circleData: [],
      isCircleLocationRender: true,
      navigationProps: undefined,
      keys: [],
      myCircles: [],
      myCirclesList: [],
      isUpdateLocationRun:true,
      isFetchingMyCircles: true,
    }
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
    // this._updateMyLocation();
  }

  static navigationOptions = {
    drawerLabel: "Home",
    drawerIcon: (
      <Icon name='home' style={{ color: '#757575', fontSize: 25 }} type="MaterialCommunityIcons" />
    ),
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      user: nextProps.user,
    };
  }

  _handleNotification(notification) {
    if (notification.origin === "selected") {
      Linking.openURL(`http://maps.google.com/?daddr=${notification.data.location.latitude},${notification.data.location.longitude}`);
    }
  }

  componentDidMount() {
    this._getLocationAsync();
    this.registerForPushNotificationsAsync();
    this._fetchMyCircles();
  }

  _fetchMyCircles = () => {
    let { user, myCirclesList } = this.state;
    FIREBASE_DATABASE.ref('users').child(user.id).child('myCircles').on('value', snap => {
      myCirclesList = [];
      if (snap.exists()) {
        snap.forEach(snapshot => {
          myCirclesList.push(snapshot.val().circleKey)
        })
        this._fetchMyCirclesList(myCirclesList);
        this.props.onDispatchMyCircles(myCirclesList);
      } else {
        this.setState({ isFetchingMyCircles: false, myCirclesList, myCircles: [] })
      }
    })
  }

  _fetchMyCirclesList = (myCirclesList) => {
    let { myCircles } = this.state;
    myCircles = [];
    myCirclesList.map((v, i) => {
      FIREBASE_DATABASE.ref('circles').child(v).once('value', snap => {
        var obj = {};
        obj.key = snap.key;
        obj.data = snap.val()
        myCircles.push(obj);
        this.setState({ myCircles, isFetchingMyCircles: myCircles.length === myCirclesList.length ? false : true })
      })
    })
  }

  registerForPushNotificationsAsync = async () => {
    const { user } = this.state;
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    FIREBASE_DATABASE.ref('users').child(user.id).update({
      token
    })
  }

  componentDidUpdate() {
    const { isDidUpdate } = this.state;
    if (isDidUpdate) {
      this._fetchSelectedCirclesData()
      this.setState({ isDidUpdate: false })
    }
  }

  _getLocationAsync = async () => {
    const { user, isUpdateLocationRun } = this.state;
    let check = await Location.hasServicesEnabledAsync();
    if (!check) {
      navigator.geolocation.clearWatch(this.watchId);
      ToastAndroid.show('Please enable location service', ToastAndroid.SHORT);
      return;
    }

    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      ToastAndroid.show('Permission denied, Try again !', ToastAndroid.SHORT);
    }
    try {
      let locations = await Location.getCurrentPositionAsync({});
      this.setState({ locations })
      FIREBASE_DATABASE.ref('users').child(user.id).update({
        locations
      })

      if(isUpdateLocationRun){
        this._updateLocation();
        this.setState({ isUpdateLocationRun:false })
      }
    }
    catch (e) {
      console.log(e.message)
    }
  };

  _header = () => {
    const { selectedCircle } = this.state;
    return (
      <Header
        backgroundColor="#fff"
        leftContainerStyle={{
          marginLeft: 15
        }}
        leftComponent={{ icon: 'menu', color: '#757575', onPress: () => this.props.navigation.toggleDrawer() }}
        centerComponent={{ text: selectedCircle ? `${selectedCircle.data.name.toUpperCase() + "'S CIRCLE"}` : "TRACKER", style: { color: '#757575' } }}
        rightComponent={{ icon: 'down', type: "antdesign", color: '#757575', onPress: () => this.setState({ isList: !this.state.isList }) }}
        containerStyle={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5
        }}
        rightContainerStyle={{
          marginRight: 15
        }}
      />
    )
  }

  _fetchSelectedCirclesData = async () => {
    let { selectedCircle, circleData } = this.state;
    circleData = [];
    let keys = Object.keys(selectedCircle.data.users);
    this.setState({ keys })
    keys.map((v, i) => {
      FIREBASE_DATABASE.ref('users').child(v).on('value', snap => {
        if (keys.length === circleData.length) {
          for (var i = 0; i < keys.length; i++) {
            if (snap.val().id === circleData[i].id) {
              circleData[i] = snap.val();
              this.setState({ circleData });
            }
          }
        }
        else {
          circleData.push(snap.val())
          this.setState({ circleData, isCircleLocationRender: false, isFetchSelectedCircelPeoples: false });
        }
      })
    })
  }

  _removeListener = () => {
    let { keys } = this.state;
    if (keys.length) {
      keys.map((v, i) => {
        FIREBASE_DATABASE.ref('users').child(v).off('value');
      })
    }
  }


  _list = () => {
    const { isFetchingMyCircles, myCircles } = this.state;
    return (
      !isFetchingMyCircles ?
        !myCircles.length ?
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '50%', marginBottom: 30 }}>
            <NativeBaseText style={{ textAlign: 'center', fontSize: 15 }}>NO CIRCLES YET</NativeBaseText>
          </View>
          :
          <View style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}>
            <List>
              {
                myCircles.map((v, i) => {
                  return (
                    <ListItem avatar onPress={() => {
                      this._removeListener()
                      this.setState({ selectedCircle: v, isFetchSelectedCircelPeoples: true, isList: false, isDidUpdate: true })
                    }}>
                      <Left>
                        <Avatar size="medium"
                          rounded
                          icon={{ name: 'group', color: "#3dbd9d", type: "material" }}
                          containerStyle={{ marginBottom: 13 }}
                          overlayContainerStyle={{
                            backgroundColor: 'white'
                          }}
                        />
                      </Left>
                      <Body>
                        <NativeBaseText>
                          {`${v.data.name.toUpperCase()}'S ${` `} CIRCLE`}
                        </NativeBaseText>
                      </Body>
                    </ListItem>
                  )
                })
              }
              {
                <ListItem avatar onPress={() => {
                  this._removeListener()
                  this.setState({ selectedCircle: undefined, circleData: [], isList: false, isCircleLocationRender: true })
                }}>
                  <Left>
                    <Avatar size="medium"
                      rounded
                      icon={{ name: 'arrow-back', color: "#262726", type: "material" }}
                      containerStyle={{ marginBottom: 13 }}
                      overlayContainerStyle={{
                        backgroundColor: 'white'
                      }}
                    />
                  </Left>
                  <Body>
                    <NativeBaseText>
                      NONE
                    </NativeBaseText>
                  </Body>
                </ListItem>
              }
            </List>
          </View>
        :
        // <View style={{ width: '100%', marginTop:15 }}>
        //   <NativeBaseText style={{ textAlign: 'center' }}>Loading...</NativeBaseText>
        // </View>
        <ActivityIndicator size="large" color="#757575" />
    )
  }

  _getLocationRender = () => {
    return (
      <View style={{ position: 'absolute', bottom: 30, left: 10 }}>
        <NativeElementIcon
          raised
          name='my-location'
          color='#757575'
          type="material"
          size={30}
          onPress={this._getLocationAsync}
        />
      </View>
    )
  }

  _notificationSenderRender = () => {
    return (
      <View style={{ position: 'absolute', bottom: 30, right: 10 }}>
        <NativeElementIcon
          raised
          name='alert-outline'
          color='#ce2029'
          type="material-community"
          size={28}
          onPress={this._notificationSender}
        />
      </View>
    )
  }

  _updateLocation = () => {
    const { user } = this.state;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        FIREBASE_DATABASE.ref('users').child(user.id).update({
          locations: position
        })
      },
      (error) => this.setState({ error: error.message }),
      { 
        enableHighAccuracy: true, 
        timeInterval: 10000, 
        maximumAge: 0, 
        distanceInterval: 0.2
      },
    );
  }

  componentWillUnmount() {
    const { user } = this.state;
    this.props.onDispatchUpdateUser(user.id);
    navigator.geolocation.clearWatch(this.watchId);
  }


  _updateMyLocation = async () => {
    const { user } = this.state;
    let that = this;
    const BACKGROUND_LOCATION_UPDATES_TASK = "background-location-updates";
    TaskManager.defineTask(
      BACKGROUND_LOCATION_UPDATES_TASK,
      async function handleLocationUpdate({ data, error }) {
        if (error) {
          return;
        }
        if (data) {
          try {
            locations = data.locations;
            let location = locations[0];
            that.setState({ locations: location });
            FIREBASE_DATABASE.ref('users').child(user.id).update({
              locations: location
            })
          } catch (error) {
            console.log("the error", error);
          }
        }
      }
    );

    let isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_UPDATES_TASK
    );
    if (!isRegistered)
      await Location.startLocationUpdatesAsync(
        BACKGROUND_LOCATION_UPDATES_TASK,
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 0.5
        }
      );
  }

  _mapView = () => {
    const { locations, user, isCircleLocationRender, circleData } = this.state;
    return (
      <MapView
        initialRegion={{
          latitude: isCircleLocationRender
            ?
            locations
              ?
              locations.coords.latitude
              :
              user.locations
                ?
                user.locations.coords.latitude
                :
                30.0682968
            :
            user.locations
              ?
              user.locations.coords.latitude
              :
              circleData[0].locations.coords.latitude,

          longitude: isCircleLocationRender
            ?
            locations
              ?
              locations.coords.longitude
              :
              user.locations
                ?
                user.locations.coords.longitude
                :
                60.3259596
            :
            user.locations
              ?
              user.locations.coords.longitude
              :
              circleData[0].locations.coords.longitude,

          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        provider="google"
        style={StyleSheet.absoluteFill}
        ref={c => this.mapView = c}
        loadingEnabled={true}
      >
        {
          (isCircleLocationRender) ?
            locations
              ?
              <MapView.Marker coordinate={{
                latitude: locations.coords.latitude,
                longitude: locations.coords.longitude,
              }}>
                <Image
                  source={{ uri: user.photo }}
                  style={{ width: 50, height: 50, borderRadius: 100 }}
                />
              </MapView.Marker>
              :
              user.locations
                ?
                <MapView.Marker coordinate={{
                  latitude: user.locations.coords.latitude,
                  longitude: user.locations.coords.longitude,
                }}>
                  <Image
                    source={{ uri: user.photo }}
                    style={{ width: 50, height: 50, borderRadius: 100 }}
                  />
                </MapView.Marker>
                :
                <MapView.Marker coordinate={{
                  latitude: 30.0682968,
                  longitude: 60.3259596,
                }}>
                  <Image
                    source={{ uri: user.photo }}
                    style={{ width: 50, height: 50, borderRadius: 100 }}
                  />
                </MapView.Marker>
            :
            circleData.map((v, i) => {
              return (
                <MapView.Marker key={"indexMap-" + i} coordinate={{
                  latitude: Number(v.locations.coords.latitude),
                  longitude: Number(v.locations.coords.longitude),
                }}>
                  <Image
                    source={{ uri: v.photo }}
                    style={{ width: 50, height: 50, borderRadius: 100 }}
                  />
                </MapView.Marker>
              )
            })
        }

      </MapView>
    )
  }

  _notification = (token) => {
    let { user, locations } = this.state;

    let lat = locations ? locations.coords.latitude : user.locations.coords.latitude;
    let lng = locations ? locations.coords.longitude : user.locations.coords.longitude;

    let time = `${moment().format('L')} ${moment().format('LT')}`;

    fetch('https://exp.host/--/api/v2/push/send', {
      mode: 'no-cors',
      method: 'POST',
      headers: {
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        to: token,
        title: 'Emergency Alert',
        body: `${user.name} activated emergency.\nLast known location at ${time}. click to see last location\nSent from Family Tracker`,
        data: {
          location: {
            latitude: lat,
            longitude: lng,
          }
        },
        sound: "default",
        priority: "high",
      }),
    });
  }

  _notificationSender = () => {
    let { selectedCircle, circleData, user } = this.state;
    let myId = user.id;
    if (selectedCircle) {
      if (circleData.length) {
        circleData.map((v, i) => {
          if (myId !== v.id) {
            this._notification(v.token);
          }
        })
      }
    }
  }

  _loader = () => {
    return (
      <View style={{ position: 'absolute', top: '45%', left: '45%' }}>
        <ActivityIndicator size="large" color="#757575" />
      </View>
    )
  }

  render() {
    const { isList, isFetchSelectedCircelPeoples, selectedCircle } = this.state;
    return (
      <View style={styles.container}>
        {
          this._header()
        }
        {
          isList ? this._list() :
            <View style={{ width: '100%', height: '100%' }}>
              {this._mapView()}
            </View>
        }

        {
          selectedCircle ? !isList && this._notificationSenderRender() : !isList && <Button  {...this.props} />
        }
        {
          !isList && this._getLocationRender()
        }
        {isFetchSelectedCircelPeoples && this._loader()}
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
  list: {
    width: '100%',
    height: 160,
    backgroundColor: '#ee6e73',
    position: 'absolute',
    bottom: 10,
    right: 10,
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
    onDispatchMyCircles: (param) => dispatch(myCircles(param)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
