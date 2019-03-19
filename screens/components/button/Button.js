import React from 'react';
import { View } from "react-native";
import { Icon as NativeElementIcon } from 'react-native-elements';

class Button extends React.Component {
    render() {
        return (
            <View style={{ position: 'absolute', bottom: 30, right: 10 }}>
                <NativeElementIcon
                    raised
                    name='group-add'
                    color='#f7406a'
                    type="material"
                    size={30}
                    onPress={() => this.props.navigation.navigate('CreateCircle')} />
            </View>
        );
    }
}


export default Button;
