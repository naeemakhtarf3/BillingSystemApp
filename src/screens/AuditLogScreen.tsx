
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '../lib/tailwind';

const logData = [
    { id: '1', title: 'Invoice Generated', user: 'Dr. Emily Carter', target: 'Patient ID 12345', time: '10:45 AM', icon: 'receipt-long', type: 'info' },
    { id: '2', title: 'Patient Record Viewed', user: 'Admin User', target: 'Patient ID 56789', time: '09:30 AM', icon: 'visibility', type: 'info' },
    { id: '3', title: 'Login Attempt Failed', user: 'Unknown User', target: 'IP: 192.168.1.101', time: '09:28 AM', icon: 'lock', type: 'danger' },
    { id: '4', title: 'Bill Sent', user: 'System Automation', target: 'Invoice #INV-001', time: 'Yesterday', icon: 'send', type: 'info' },
];

type LogItemProps = typeof logData[0];

const LogItem: React.FC<LogItemProps> = ({ title, user, target, time, icon, type }) => {
    const isDark = useColorScheme() === 'dark';
    const isDanger = type === 'danger';
    const iconColor = isDanger ? tw.color('danger') : (isDark ? tw.color('text-dark') : tw.color('text-light'));
    const iconBg = isDanger ? 'bg-danger/10' : 'bg-primary/20';

    return (
        <View style={tw`flex-col gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-sm border border-border-light/50 dark:border-border-dark/50`}>
            <View style={tw`flex-row items-start gap-4`}>
                <View style={tw`items-center justify-center rounded-full shrink-0 size-10 ${iconBg}`}>
                    <Icon name={icon} size={24} color={iconColor} />
                </View>
                <View style={tw`flex-1 flex-col justify-center`}>
                    <Text style={tw`text-base font-medium text-text-light dark:text-text-dark`}>{title}</Text>
                    <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>by {user}</Text>
                    <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Target: {target}</Text>
                </View>
                <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>{time}</Text>
            </View>
        </View>
    );
};

const AuditLogScreen = () => {
    const isDark = useColorScheme() === 'dark';
    const iconColor = isDark ? tw.color('text-dark') : tw.color('text-light');
    const placeholderColor = isDark ? tw.color('border-dark') : tw.color('border-light');

    return (
        <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
            <View style={tw`flex-row items-center p-4 border-b border-border-light/50 dark:border-border-dark/50`}>
                <Text style={tw`flex-1 text-lg font-bold text-text-light dark:text-text-dark`}>Audit Log</Text>
                <TouchableOpacity style={tw`w-12 items-end`}>
                    <Icon name="more-vert" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={tw`px-4 py-3`}>
                            <View style={tw`flex-row items-center rounded-lg bg-slate-200 dark:bg-slate-800 h-12 px-4`}>
                                <Icon name="search" size={24} color={placeholderColor} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={tw`flex-1 h-full text-base text-text-light dark:text-text-dark`}
                                    placeholder="Search by user, action, or resource..."
                                    placeholderTextColor={placeholderColor}
                                />
                            </View>
                        </View>
                        <View style={tw`flex-row gap-3 px-4 py-2`}>
                            <TouchableOpacity style={tw`flex-row h-8 items-center justify-center gap-x-2 rounded-lg bg-primary/20 pl-2 pr-4`}>
                                <Icon name="tune" size={18} color={tw.color('primary')} />
                                <Text style={tw`text-primary text-sm font-medium`}>Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={tw`flex-row h-8 items-center justify-center gap-x-2 rounded-lg bg-slate-200 dark:bg-slate-800 pl-2 pr-4`}>
                                <Icon name="file-download" size={18} color={iconColor} />
                                <Text style={tw`text-sm font-medium text-text-light dark:text-text-dark`}>Export</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={tw`p-4 pt-2`}>
                            <View style={tw`w-full border-t border-border-light/50 dark:border-border-dark/50`}></View>
                        </View>
                    </>
                }
                data={logData}
                renderItem={({ item }) => <LogItem {...item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ItemSeparatorComponent={() => <View style={tw`h-3`} />}
            />
        </SafeAreaView>
    );
};

export default AuditLogScreen;