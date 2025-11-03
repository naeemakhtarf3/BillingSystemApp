
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import tw from '../lib/tailwind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchInvoices } from '../api/invoiceApi';
import { Invoice } from '../types/invoice';
import { loadInvoiceCache, saveInvoiceCache } from '../utils/invoiceCache';

const filters = ['All', 'Paid', 'Pending', 'Overdue'];

// FIX: Define a strict type for invoice statuses to ensure type safety.
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

// Display invoice data structure
interface DisplayInvoice {
    id: string;
    number: string;
    amount: string;
    patientId: string;
    dueDate: string;
    status: InvoiceStatus;
}

// Map API status to display status
const mapApiStatusToDisplay = (status: string, dueDate?: string): InvoiceStatus => {
    const now = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    
    if (status === 'paid') {
        return 'Paid';
    }
    
    // Check if overdue (unpaid/pending and past due date)
    if ((status === 'unpaid' || status === 'pending') && due && due < now) {
        return 'Overdue';
    }
    
    if (status === 'pending') {
        return 'Pending';
    }
    
    // Default for unpaid (if not overdue)
    return 'Pending';
};

// Format date from ISO string to readable format
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch {
        return 'Invalid Date';
    }
};

// Format amount from cents to dollars
const formatAmount = (cents: number): string => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(dollars);
};

// Convert API invoice to display format
const convertInvoiceToDisplay = (invoice: Invoice): DisplayInvoice => {
    return {
        id: invoice.id.toString(),
        number: `#${invoice.invoice_number}`,
        amount: formatAmount(invoice.total_amount_cents),
        patientId: `P-${invoice.patient_id}`,
        dueDate: formatDate(invoice.due_date),
        status: mapApiStatusToDisplay(invoice.status, invoice.due_date),
    };
};

// FIX: Use the `InvoiceStatus` type to ensure the `statusStyles` record covers all possible statuses.
const statusStyles: Record<InvoiceStatus, { bg: string, text: string }> = {
    Paid: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300' },
    Overdue: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300' },
    Pending: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300' },
};

type InvoiceCardProps = DisplayInvoice;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const InvoiceCard: React.FC<InvoiceCardProps> = ({ number, amount, patientId, dueDate, status }) => {
    const navigation = useNavigation<NavigationProp>();
    // FIX: Accessing statusStyles with a typed `status` guarantees a result, removing the need for a fallback object `|| {}`.
    // This resolves the error where `styles.bg` or `styles.text` could be accessed on an empty object.
    const styles = statusStyles[status];
    
    return (
        <View style={tw`flex-col rounded-xl shadow-sm bg-surface-light dark:bg-surface-dark p-4 space-y-2`}>
            <View style={tw`flex-row items-start justify-between`}>
                <Text style={tw`text-lg font-bold text-text-light dark:text-text-dark`}>{number}</Text>
                <Text style={tw`text-base font-bold text-text-light dark:text-text-dark`}>{amount}</Text>
            </View>
            <View style={tw`flex-col gap-1`}>
                <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Patient ID: {patientId}</Text>
                <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Due Date: {dueDate}</Text>
            </View>
            <View style={tw`mt-2 flex-row items-center justify-between`}>
                <View style={tw`items-center rounded-full px-3 py-1 ${styles.bg}`}>
                    <Text style={tw`text-xs font-medium ${styles.text}`}>{status}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Payment')} style={tw`min-w-[84px] items-center justify-center rounded-lg h-8 px-4 bg-primary`}>
                    <Text style={tw`text-white text-sm font-medium`}>View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const InvoicesScreen = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [invoices, setInvoices] = useState<DisplayInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { tokens } = useAuth();
    const isDark = useColorScheme() === 'dark';
    const iconColor = isDark ? tw.color('text-dark') : tw.color('text-light');
    const mutedIconColor = isDark ? tw.color('border-dark') : tw.color('border-light');

    useEffect(() => {
        loadInvoices();
    }, [tokens]);

    const loadInvoices = async (isRefresh = false) => {
        if (!tokens?.access_token) {
            setIsLoading(false);
            return;
        }

        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            // Try to load from cache first for instant display (skip on refresh)
            if (!isRefresh) {
                const cachedInvoices = await loadInvoiceCache();
                if (cachedInvoices) {
                    const displayInvoices = cachedInvoices.map(convertInvoiceToDisplay);
                    setInvoices(displayInvoices);
                }
            }

            // Fetch fresh data
            const apiInvoices = await fetchInvoices(tokens.access_token);
            await saveInvoiceCache(apiInvoices);
            const displayInvoices = apiInvoices.map(convertInvoiceToDisplay);
            setInvoices(displayInvoices);
        } catch (err) {
            console.error('Error loading invoices:', err);
            
            // Try to use cache if fetch failed
            const cachedInvoices = await loadInvoiceCache();
            if (cachedInvoices) {
                const displayInvoices = cachedInvoices.map(convertInvoiceToDisplay);
                setInvoices(displayInvoices);
            } else {
                setError('Unable to load invoices');
                setInvoices([]);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Filter invoices based on active filter
    const filteredInvoices = invoices.filter(invoice => {
        if (activeFilter === 'All') return true;
        return invoice.status === activeFilter;
    });

    return (
        <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
            <View style={tw`sticky top-0 z-10 flex-row items-center justify-between p-4 bg-background-light dark:bg-background-dark`}>
                <Icon name="menu" size={24} color={iconColor} />
                <Text style={tw`flex-1 text-center text-lg font-bold text-text-light dark:text-text-dark`}>Invoices</Text>
                <Icon name="search" size={24} color={iconColor} />
            </View>
            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={tw`mb-4 px-4`}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row gap-2`}>
                                {filters.map(filter => (
                                    <TouchableOpacity
                                        key={filter}
                                        onPress={() => setActiveFilter(filter)}
                                        style={tw`h-8 items-center justify-center rounded-lg px-4 ${activeFilter === filter ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <Text
                                            style={tw`text-sm font-medium ${activeFilter === filter ? 'text-primary' : 'text-text-light/80 dark:text-text-dark/80'}`}
                                        >{filter}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={tw`mt-4 flex-row items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3 min-h-14`}>
                                <View style={tw`flex-row items-center gap-4`}>
                                    <Icon name="calendar-today" size={24} color={iconColor} />
                                    <Text style={tw`text-base text-text-light/70 dark:text-text-dark/70`}>Filter by Date Range</Text>
                                </View>
                                <Icon name="arrow-drop-down" size={24} color={mutedIconColor} />
                            </TouchableOpacity>
                        </View>
                        {isLoading && (
                            <View style={tw`items-center justify-center py-8`}>
                                <ActivityIndicator size="large" color={tw.color('primary')} />
                                <Text style={tw`mt-4 text-text-light/70 dark:text-text-dark/70`}>Loading invoices...</Text>
                            </View>
                        )}
                        {error && !isLoading && (
                            <View style={tw`mx-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-4`}>
                                <Text style={tw`text-red-800 dark:text-red-300`}>{error}</Text>
                            </View>
                        )}
                        {!isLoading && !error && filteredInvoices.length === 0 && (
                            <View style={tw`mx-4 mb-4 items-center justify-center py-8`}>
                                <Icon name="inbox" size={48} color={mutedIconColor} />
                                <Text style={tw`mt-4 text-base text-text-light/70 dark:text-text-dark/70`}>
                                    No invoices found
                                </Text>
                            </View>
                        )}
                    </>
                }
                data={filteredInvoices}
                renderItem={({ item }) => <InvoiceCard {...item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ItemSeparatorComponent={() => <View style={tw`h-4`} />}
                refreshing={isRefreshing}
                onRefresh={() => loadInvoices(true)}
            />
            <TouchableOpacity style={tw`absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg`}>
                <Icon name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default InvoicesScreen;