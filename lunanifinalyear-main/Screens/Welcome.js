import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import Button from '../components/Button'; // Ensure this path is correct

const Welcome = ({ navigation }) => {
    return (
        <LinearGradient
            style={styles.container}
            colors={[COLORS.secondary, COLORS.primary]}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Hi welcome to</Text>
                <Text style={styles.subtitle}>online Bidding app</Text>

                <View style={styles.description}>
                    <Text style={styles.descriptionText}>you can bid on various</Text>
                    <Text style={styles.descriptionText}>products and services</Text>
                </View>

                <Button
                    title="Join Us Now"
                    onPress={() => navigation.navigate("Signup")}
                    style={styles.button}
                />

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already a member?</Text>
                    <Pressable onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.loginLink}>Login</Text>
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 22,
        position: 'absolute',
        top: 400,
        width: '100%',
    },
    title: {
        fontSize: 50,
        fontWeight: '800',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: 46,
        fontWeight: '800',
        color: COLORS.white,
    },
    description: {
        marginVertical: 22,
    },
    descriptionText: {
        fontSize: 16,
        color: COLORS.white,
        marginVertical: 4,
    },
    button: {
        marginTop: 22,
        width: '100%',
    },
    loginContainer: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 16,
        color: COLORS.white,
    },
    loginLink: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default Welcome;
