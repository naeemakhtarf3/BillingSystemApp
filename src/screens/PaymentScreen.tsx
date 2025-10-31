
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import tw from '../lib/tailwind';

const PaymentScreen = () => {
    const [saveCard, setSaveCard] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const navigation = useNavigation();
    const isDark = useColorScheme() === 'dark';
    
    const iconColor = isDark ? tw.color('text-dark') : tw.color('text-light');
    const placeholderTextColor = isDark ? tw.color('border-dark') : tw.color('border-light');
    const mutedIconColor = isDark ? tw.color('border-dark') : tw.color('border-light');
    const checkboxTintColor = isDark ? tw.color('text-dark') : tw.color('text-light');

    const handlePayment = () => {
        setSuccessModalVisible(true);
    };

    const closeModal = () => {
        setSuccessModalVisible(false);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
            <View style={tw`flex-row items-center p-4 border-b border-border-light/50 dark:border-border-dark/50`}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={iconColor} />
                </TouchableOpacity>
                <Text style={tw`flex-1 text-center text-lg font-bold text-text-light dark:text-text-dark`}>Process Payment</Text>
                <TouchableOpacity>
                    <Icon name="cloud-done" size={24} color="#00BFA5" />
                </TouchableOpacity>
            </View>
            <ScrollView style={tw`flex-1 px-4 pt-6`} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={tw`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm p-4 mb-6 border border-border-light/50 dark:border-border-dark/50`}>
                    <View style={tw`flex-row justify-between py-2 border-b border-border-light/50 dark:border-border-dark/50`}>
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Patient Name</Text>
                        <Text style={tw`text-sm font-semibold text-text-light dark:text-text-dark`}>Jessica Smith</Text>
                    </View>
                    <View style={tw`flex-row justify-between py-2 border-b border-border-light/50 dark:border-border-dark/50`}>
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Invoice #</Text>
                        <Text style={tw`text-sm font-semibold text-text-light dark:text-text-dark`}>INV-2024-00123</Text>
                    </View>
                    <View style={tw`flex-row justify-between py-2`}>
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Amount Due</Text>
                        <Text style={tw`text-sm font-bold text-primary`}>$150.00</Text>
                    </View>
                </View>
                <Text style={tw`text-lg font-bold pb-2 pt-4 text-text-light dark:text-text-dark`}>Payment Details</Text>
                <View style={tw`space-y-4`}>
                    <View>
                        <Text style={tw`text-base font-medium pb-2 text-text-light dark:text-text-dark`}>Card Number</Text>
                        <View style={tw`flex-row items-center w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-14 px-4`}>
                            <TextInput style={tw`flex-1 text-text-light dark:text-text-dark`} placeholder="0000 0000 0000 0000" placeholderTextColor={placeholderTextColor} keyboardType="numeric" />
                            <Icon name="credit-card" size={24} color={mutedIconColor} />
                        </View>
                    </View>
                    <View style={tw`flex-row gap-4`}>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-base font-medium pb-2 text-text-light dark:text-text-dark`}>Expiry Date</Text>
                            <TextInput style={tw`rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-14 px-4 text-text-light dark:text-text-dark`} placeholder="MM/YY" placeholderTextColor={placeholderTextColor} keyboardType="numeric" />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-base font-medium pb-2 text-text-light dark:text-text-dark`}>CVC</Text>
                            <TextInput style={tw`rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-14 px-4 text-text-light dark:text-text-dark`} placeholder="123" placeholderTextColor={placeholderTextColor} keyboardType="numeric" secureTextEntry />
                        </View>
                    </View>
                </View>
                <View style={tw`flex-row items-center gap-2 mt-6`}>
                    <CheckBox value={saveCard} onValueChange={setSaveCard} tintColors={{ true: tw.color('primary'), false: checkboxTintColor }} />
                    <Text style={tw`text-sm text-text-light dark:text-text-dark`}>Save card for future payments</Text>
                </View>
            </ScrollView>

            <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-border-light/50 dark:border-border-dark/50`}>
                <TouchableOpacity onPress={handlePayment} style={tw`w-full items-center justify-center rounded-xl h-14 px-6 bg-primary shadow-lg`}>
                    <Text style={tw`text-white text-base font-bold tracking-wide`}>Pay $150.00</Text>
                </TouchableOpacity>
            </View>
            
            <Modal transparent={true} visible={isSuccessModalVisible} animationType="fade">
                <View style={tw`flex-1 bg-black/40 items-center justify-center p-4`}>
                    <View style={tw`bg-background-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-sm p-6 items-center`}>
                        <View style={tw`flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-4`}>
                            <Icon name="check-circle" size={40} color="#00BFA5" />
                        </View>
                        <Text style={tw`text-xl font-bold text-text-light dark:text-text-dark`}>Payment Successful</Text>
                        <Text style={tw`text-4xl font-bold text-text-light dark:text-text-dark mt-4 mb-2`}>$150.00</Text>
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70 mb-6`}>Paid by Jessica Smith</Text>
                        <View style={tw`w-full text-left space-y-3 bg-background-light dark:bg-background-dark p-4 rounded-lg`}>
                            <View style={tw`flex-row justify-between`}><Text style={tw`text-text-light/70 dark:text-text-dark/70`}>Status</Text><Text style={tw`font-semibold text-success`}>Paid</Text></View>
                            <View style={tw`flex-row justify-between`}><Text style={tw`text-text-light/70 dark:text-text-dark/70`}>Transaction ID</Text><Text style={tw`font-semibold text-text-light dark:text-text-dark`}>ch_3Pq...aXg</Text></View>
                            <View style={tw`flex-row justify-between`}><Text style={tw`text-text-light/70 dark:text-text-dark/70`}>Date & Time</Text><Text style={tw`font-semibold text-text-light dark:text-text-dark`}>Oct 26, 2023, 10:30 AM</Text></View>
                            <View style={tw`flex-row justify-between`}><Text style={tw`text-text-light/70 dark:text-text-dark/70`}>Card</Text><Text style={tw`font-semibold text-text-light dark:text-text-dark`}>•••• 4242</Text></View>
                        </View>
                        <TouchableOpacity onPress={closeModal} style={tw`mt-6 w-full rounded-lg bg-primary/20 h-12 justify-center items-center`}>
                            <Text style={tw`text-primary font-bold`}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PaymentScreen;