import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, TextInput, Subheading} from 'react-native-paper';
import styles from './styles';
import { firebase } from '../../firebase/config'

const SeparatorContainer = ({children, separation}) => {
    var output = []
    
    const shouldComponentUpdate = (nextProps, nextState) => {
        return false
      }

    children.forEach((child) => {
        output.push(child)
        output.push(<View style={{height: separation}} />)
    })

    output.pop()

    return output
}

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onFooterLinkPress = () => {
        navigation.navigate('Registration')
    }

    const onLoginPress = () => {
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((response) => {
                const uid = response.user.uid
                const usersRef = firebase.firestore().collection('users')
                usersRef
                    .doc(uid)
                    .get()
                    .then(firestoreDocument => {
                        if (!firestoreDocument.exists) {
                            alert("User does not exist anymore.")
                            return;
                        }
                        const user = firestoreDocument.data()
                    })
                    .catch(error => {
                        alert(error)
                    });
            })
            .catch(error => {
                alert(error)
            })
    }

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%', padding: 16}}
                keyboardShouldPersistTaps="always">
                <Image
                    style={styles.logo}
                    source={require('../../../assets/icon.png')}
                />
                <SeparatorContainer separation={12}>
                    <TextInput
                        placeholder='E-mail'
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                    />
                    <TextInput
                        secureTextEntry
                        placeholder='Password'
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                    />
                    <Button onPress={onLoginPress} mode='contained'>
                    Log In
                    </Button>
                    <View style={styles.footer}><Subheading>Don't have an account? <Subheading onPress={onFooterLinkPress} style={styles.footerLink}>Sign up</Subheading></Subheading></View>
                </SeparatorContainer>
            </KeyboardAwareScrollView>
        </View>
    )
}
