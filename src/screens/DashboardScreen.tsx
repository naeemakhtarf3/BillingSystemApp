
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import tw from '../lib/tailwind';

const kpiData = [
  { title: 'Outstanding', value: '$12,450', trend: '+2.5%', trendColor: 'danger', icon: 'hourglass-top' },
  { title: 'Paid (Last 30 Days)', value: '$89,320', trend: '+15.1%', trendColor: 'success', icon: 'task-alt' },
  { title: 'Total Revenue', value: '$542,800', trend: '+8.2%', trendColor: 'success', icon: 'trending-up' },
];

const timeRanges = ['7D', '30D', '90D', '1Y'];

const DashboardScreen = () => {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('30D');
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`}>
      <View style={tw`sticky top-0 z-10 flex-row items-center justify-between bg-primary p-4 shadow-md`}>
        <TouchableOpacity style={tw`flex size-10 items-center justify-center rounded-full`}>
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-white`}>Dashboard</Text>
        <TouchableOpacity style={tw`flex size-10 items-center justify-center rounded-full`}>
          <Icon name="account-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={tw`p-4`}>
            <View style={tw`flex flex-col md:flex-row gap-4`}>
            {kpiData.map((item, index) => {
                const iconColor = tw.color(item.trendColor as 'danger' | 'success');

                return (
                    <View key={index} style={tw`flex-1 flex-col gap-2 rounded-xl border border-border-light/50 bg-surface-light dark:border-border-dark/50 dark:bg-surface-dark p-6 shadow-sm`}>
                        <View style={tw`flex-row items-center gap-3`}>
                            <View style={tw`flex size-10 items-center justify-center rounded-full bg-${item.trendColor}/10`}>
                                <Icon name={item.icon} size={24} color={iconColor} />
                            </View>
                            <Text style={tw`text-base font-medium text-text-light/80 dark:text-text-dark/80`}>{item.title}</Text>
                        </View>
                        <Text style={tw`text-3xl font-bold tracking-tight text-text-light dark:text-text-dark`}>{item.value}</Text>
                        <View style={tw`flex-row items-center gap-1`}>
                            <Icon name="arrow-upward" size={14} color={iconColor} />
                            <Text style={tw`text-sm font-medium text-${item.trendColor}`}>{item.trend}</Text>
                        </View>
                    </View>
                )
            })}
            </View>
        </View>
        <View style={tw`p-4`}>
            <View style={tw`rounded-xl border border-border-light/50 bg-surface-light dark:border-border-dark/50 dark:bg-surface-dark p-2 shadow-sm`}>
                <View style={tw`p-4 pb-0`}>
                    <Text style={tw`text-xl font-bold text-text-light dark:text-text-dark`}>Revenue Trend</Text>
                    <Text style={tw`text-text-light/70 dark:text-text-dark/70`}>Last 30 Days</Text>
                </View>
                <View style={tw`p-4`}>
                    <View style={tw`flex-row h-10 w-full items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1`}>
                        {timeRanges.map(range => (
                            <TouchableOpacity
                                key={range}
                                onPress={() => setSelectedTimeRange(range)}
                                style={tw`flex-1 h-full rounded-md items-center justify-center px-2 ${selectedTimeRange === range ? 'bg-surface-light dark:bg-surface-dark shadow-sm' : ''}`}
                            >
                                <Text
                                    style={tw`text-sm font-medium ${selectedTimeRange === range ? 'text-primary' : 'text-text-light/70 dark:text-text-dark/70'}`}
                                >
                                    {range}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                 <View style={tw`h-[220px] p-4 pt-2`}>
                    <Svg width="100%" height="100%" viewBox="0 0 475 150" preserveAspectRatio="none">
                        <Defs>
                            <LinearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="100%">
                                <Stop offset="0" stopColor="#4A90E2" stopOpacity="0.2"/>
                                <Stop offset="1" stopColor="#4A90E2" stopOpacity="0"/>
                            </LinearGradient>
                        </Defs>
                        <Path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z" fill="url(#chart-gradient)"/>
                        <Path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round"/>
                    </Svg>
                </View>
            </View>
        </View>
      </ScrollView>
      <View style={tw`absolute bottom-6 right-6 z-10 flex flex-col items-end gap-4`}>
        <TouchableOpacity style={tw`flex h-14 items-center flex-row gap-3 rounded-2xl bg-primary px-4 shadow-lg`}>
            <Icon name="add" size={24} color="#FFFFFF"/>
            <Text style={tw`text-sm font-medium text-white`}>New Invoice</Text>
        </TouchableOpacity>
         <TouchableOpacity style={tw`flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light dark:bg-surface-dark shadow-lg`}>
            <Icon name="person-add" size={24} color={isDark ? tw.color('text-dark') : tw.color('text-light')}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;