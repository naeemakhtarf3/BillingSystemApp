import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '../lib/tailwind';
import { useAuth } from '../context/AuthContext';
import { fetchAuditLogs } from '../api/auditApi';
import { AuditLogEntry, DisplayAuditEntry } from '../types/audit';
import { transformAuditEntries } from '../utils/auditTransform';

type LogItemProps = DisplayAuditEntry;

const LogItem: React.FC<LogItemProps> = ({ title, user, target, time, icon, type, details }) => {
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
                    {details && (
                        <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70 mt-1`}>{details}</Text>
                    )}
                </View>
                <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>{time}</Text>
            </View>
        </View>
    );
};

const AuditLogScreen = () => {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { tokens } = useAuth();
    const isDark = useColorScheme() === 'dark';
    const iconColor = isDark ? tw.color('text-dark') : tw.color('text-light');
    const placeholderColor = isDark ? tw.color('border-dark') : tw.color('border-light');

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!tokens?.access_token) {
                if (isMounted) {
                    setError('Authentication required');
                    setIsLoading(false);
                }
                return;
            }

            if (isMounted) {
                setIsLoading(true);
                setError(null);
            }

            try {
                const apiEntries = await fetchAuditLogs(tokens.access_token);
                if (isMounted) {
                    setEntries(apiEntries);
                }
            } catch (err) {
                if (!isMounted) return;
                
                console.error('Error loading audit logs:', err);
                
                if (err instanceof Error) {
                    if (err.message === 'Token expired') {
                        setError('Authentication expired. Please log in again.');
                    } else if (err.message === 'Network error') {
                        setError('Unable to connect to server. Please check your network connection.');
                    } else if (err.message === 'Server error') {
                        setError('Server error occurred. Please try again later.');
                    } else if (err.message.includes('401') || err.message.includes('403')) {
                        setError('You do not have permission to view audit logs.');
                    } else {
                        setError('Unable to load audit logs. Please try again.');
                    }
                } else {
                    setError('Unable to load audit logs. Please try again.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [tokens]);

    const loadAuditLogs = async () => {
        if (!tokens?.access_token) {
            setError('Authentication required');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const apiEntries = await fetchAuditLogs(tokens.access_token);
            setEntries(apiEntries);
        } catch (err) {
            console.error('Error loading audit logs:', err);
            
            if (err instanceof Error) {
                if (err.message === 'Token expired') {
                    setError('Authentication expired. Please log in again.');
                } else if (err.message === 'Network error') {
                    setError('Unable to connect to server. Please check your network connection.');
                } else if (err.message === 'Server error') {
                    setError('Server error occurred. Please try again later.');
                } else if (err.message.includes('401') || err.message.includes('403')) {
                    setError('You do not have permission to view audit logs.');
                } else {
                    setError('Unable to load audit logs. Please try again.');
                }
            } else {
                setError('Unable to load audit logs. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const displayEntries = transformAuditEntries(entries);

    return (
        <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
            <View style={tw`flex-row items-center p-4 border-b border-border-light/50 dark:border-border-dark/50`}>
                <Text style={tw`flex-1 text-lg font-bold text-text-light dark:text-text-dark`}>Audit Log</Text>
                <TouchableOpacity style={tw`w-12 items-end`}>
                    <Icon name="more-vert" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <ActivityIndicator size="large" color={tw.color('primary')} />
                    <Text style={tw`mt-4 text-text-light dark:text-text-dark`}>Loading audit logs...</Text>
                </View>
            ) : error ? (
                <View style={tw`flex-1 items-center justify-center p-8`}>
                    <Icon name="error-outline" size={48} color={tw.color('danger')} />
                    <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>{error}</Text>
                    {!error.includes('Authentication expired') && !error.includes('permission') && (
                        <TouchableOpacity 
                            style={tw`mt-4 px-6 py-3 bg-primary rounded-lg`}
                            onPress={loadAuditLogs}
                        >
                            <Text style={tw`text-white font-medium`}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
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
                    data={displayEntries}
                    renderItem={({ item }) => <LogItem {...item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                    ItemSeparatorComponent={() => <View style={tw`h-3`} />}
                    ListEmptyComponent={
                        <View style={tw`items-center justify-center p-8`}>
                            <Icon name="info-outline" size={48} color={iconColor} />
                            <Text style={tw`mt-4 text-center text-text-light dark:text-text-dark`}>
                                No audit entries available
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default AuditLogScreen;
