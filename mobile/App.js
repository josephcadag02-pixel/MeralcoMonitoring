import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, Button, ScrollView, ActivityIndicator, Alert, Switch, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export default function App() {
  const [apiBase, setApiBase] = useState(defaultBaseUrl);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentReading, setCurrentReading] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0,16));
  const [message, setMessage] = useState('');
  const [ratePerKwh, setRatePerKwh] = useState(13.0);
  const [currency, setCurrency] = useState('PHP');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedRate, storedCurrency, storedTimezone, storedDarkMode] = await Promise.all([
          AsyncStorage.getItem('@meralcoRate'),
          AsyncStorage.getItem('@currency'),
          AsyncStorage.getItem('@timezone'),
          AsyncStorage.getItem('@darkMode')
        ]);

        if (storedRate !== null) {
          const parsed = parseFloat(storedRate);
          if (!Number.isNaN(parsed)) {
            setRatePerKwh(parsed);
          }
        }
        if (storedCurrency) {
          setCurrency(storedCurrency);
        }
        if (storedTimezone) {
          setTimezone(storedTimezone);
        }
        if (storedDarkMode !== null) {
          setIsDarkMode(storedDarkMode === 'true');
        }
      } catch (error) {
        console.warn('Unable to load saved settings', error);
      }
    };

    loadSettings();
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase.replace(/\/$/, '')}/api/stats`);
      setStats(response.data);
    } catch (error) {
      Alert.alert('Unable to load stats', 'Check the backend URL and network connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveReading = async () => {
    if (!currentReading) {
      setMessage('Enter the current meter reading.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${apiBase.replace(/\/$/, '')}/api/readings`, {
        reading: parseFloat(currentReading),
        previousReading: stats?.lastReading?.reading,
        timestamp: new Date(timestamp).toISOString()
      });
      setMessage('Reading saved successfully.');
      setCurrentReading('');
      await loadStats();
    } catch (error) {
      Alert.alert('Save failed', 'Could not save the reading. Check the backend URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (iso) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(iso));
    } catch (error) {
      return new Date(iso).toLocaleString();
    }
  };

  useEffect(() => {
    const saveSettings = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('@meralcoRate', String(ratePerKwh)),
          AsyncStorage.setItem('@currency', currency),
          AsyncStorage.setItem('@timezone', timezone),
          AsyncStorage.setItem('@darkMode', String(isDarkMode))
        ]);
      } catch (error) {
        console.warn('Unable to save settings', error);
      }
    };

    saveSettings();
  }, [ratePerKwh, currency, timezone, isDarkMode]);

  const saveSettingsButton = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('@meralcoRate', String(ratePerKwh)),
        AsyncStorage.setItem('@currency', currency),
        AsyncStorage.setItem('@timezone', timezone),
        AsyncStorage.setItem('@darkMode', String(isDarkMode))
      ]);
      setSettingsMessage('Settings saved');
      setTimeout(() => setSettingsMessage(''), 2500);
    } catch (error) {
      console.warn('Unable to save settings', error);
    }
  };

  const themeStyles = {
    container: {
      backgroundColor: isDarkMode ? '#121212' : '#f5f7fb'
    },
    text: {
      color: isDarkMode ? '#f5f7f9' : '#333'
    },
    subtitle: {
      color: isDarkMode ? '#c7c7c7' : '#555'
    },
    input: {
      backgroundColor: isDarkMode ? '#222' : '#fff',
      borderColor: isDarkMode ? '#444' : '#ddd',
      color: isDarkMode ? '#fff' : '#333'
    },
    card: {
      backgroundColor: isDarkMode ? '#1f1f1f' : '#fff'
    },
    cardTitle: {
      color: isDarkMode ? '#fff' : '#222'
    },
    statText: {
      color: isDarkMode ? '#ddd' : '#444'
    },
    cardSmall: {
      color: isDarkMode ? '#aaa' : '#888'
    },
    footerText: {
      color: isDarkMode ? '#999' : '#666'
    },
    settingsPanel: {
      backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
      borderColor: isDarkMode ? '#333' : '#ddd'
    },
    settingsLabel: {
      color: isDarkMode ? '#ddd' : '#444'
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]} keyboardShouldPersistTaps="handled">
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.title, themeStyles.text]}>Electricity Monitor Mobile</Text>
          <Text style={[styles.subtitle, themeStyles.subtitle]}>API Host</Text>
        </View>
        <Pressable
          style={[styles.settingsIconButton, themeStyles.settingsPanel]}
          onPress={() => setSettingsOpen(!settingsOpen)}
        >
          <Text style={[styles.settingsIconText, themeStyles.settingsLabel]}>⚙️</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, themeStyles.input]}
        value={apiBase}
        onChangeText={setApiBase}
        autoCapitalize="none"
        keyboardType="url"
        placeholder="http://192.168.1.100:5000"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />
      <Button title="Load Stats" onPress={loadStats} disabled={loading} color={isDarkMode ? '#4ECDC4' : '#667eea'} />

      {loading && <ActivityIndicator size="large" style={styles.loading} />}

      {settingsOpen && (
        <View style={[styles.card, themeStyles.settingsPanel]}>
          <Text style={[styles.cardTitle, themeStyles.cardTitle]}>Settings</Text>
          <View style={styles.settingsRow}>
            <View style={styles.settingsField}>
              <Text style={[styles.settingsLabel, themeStyles.settingsLabel]}>Rate per kWh</Text>
              <TextInput
                style={[styles.input, themeStyles.input]}
                value={String(ratePerKwh)}
                onChangeText={(value) => setRatePerKwh(parseFloat(value) || 0)}
                keyboardType="numeric"
                placeholder="13.0"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
            </View>
            <View style={styles.settingsField}>
              <Text style={[styles.settingsLabel, themeStyles.settingsLabel]}>Currency</Text>
              <TextInput
                style={[styles.input, themeStyles.input]}
                value={currency}
                onChangeText={setCurrency}
                placeholder="PHP"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
            </View>
          </View>
          <View style={[styles.settingsRow, styles.settingsRowBottom]}>
            <View style={styles.settingsField}>
              <Text style={[styles.settingsLabel, themeStyles.settingsLabel]}>Timezone</Text>
              <TextInput
                style={[styles.input, themeStyles.input]}
                value={timezone}
                onChangeText={setTimezone}
                placeholder="Asia/Manila"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
            </View>
            <View style={[styles.settingsRow, { alignItems: 'center', justifyContent: 'space-between' }]}> 
              <Text style={[styles.settingsLabel, themeStyles.settingsLabel]}>Dark Mode</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
            </View>
          </View>
          <View style={styles.settingsSaveContainer}>
            <Button
              title="Save Settings"
              onPress={saveSettingsButton}
              color={isDarkMode ? '#4ECDC4' : '#667eea'}
            />
            {settingsMessage ? <Text style={[styles.settingsMessage, themeStyles.statText]}>{settingsMessage}</Text> : null}
          </View>
        </View>
      )}

      {stats && (
        <View style={[styles.card, themeStyles.card]}>
          <Text style={[styles.cardTitle, themeStyles.cardTitle]}>Current Stats</Text>
          <Text style={[styles.statText, themeStyles.statText]}>Daily: {stats.daily?.toFixed(2)} kWh</Text>
          <Text style={[styles.statText, themeStyles.statText]}>Monthly: {stats.monthly?.toFixed(2)} kWh</Text>
          <Text style={[styles.statText, themeStyles.statText]}>Monthly Cost: {(stats.monthly * ratePerKwh).toFixed(2)} {currency}</Text>
          <Text style={[styles.statText, themeStyles.statText]}>Yearly: {stats.yearly?.toFixed(2)} kWh</Text>
          <Text style={[styles.statText, themeStyles.statText]}>Previous Reading: {stats.lastReading?.reading ?? 'N/A'} kWh</Text>
          <Text style={[styles.cardSmall, themeStyles.cardSmall]}>Last timestamp: {stats.lastReading?.timestamp ? formatTimestamp(stats.lastReading.timestamp) : '-'}</Text>
        </View>
      )}

      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.cardTitle, themeStyles.cardTitle]}>Add New Reading</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={currentReading}
          onChangeText={setCurrentReading}
          placeholder="Current meter reading"
          keyboardType="numeric"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
        />
        <TextInput
          style={[styles.input, styles.disabledInput, themeStyles.input]}
          value={stats?.lastReading?.reading?.toString() ?? ''}
          editable={false}
          placeholder="Previous meter reading"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={timestamp}
          onChangeText={setTimestamp}
          placeholder="YYYY-MM-DDTHH:mm"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
        />
        <Button title="Save Reading" onPress={saveReading} disabled={loading} color={isDarkMode ? '#82e9ff' : '#667eea'} />
        {message ? <Text style={[styles.message, { color: isDarkMode ? '#a3f9ff' : '#2a7b2a' }]}>{message}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, themeStyles.footerText]}>Use emulator host settings on Android: 10.0.2.2</Text>
      </View>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fb',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#ececec',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  statText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  cardSmall: {
    fontSize: 13,
    color: '#888',
  },
  loading: {
    marginTop: 20,
  },
  message: {
    marginTop: 12,
    color: '#2a7b2a',
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 13,
  },
  settingsSaveContainer: {
    marginTop: 18,
    alignItems: 'flex-start'
  },
  settingsMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#2a7b2a'
  },
  titleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  settingsIconButton: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconText: {
    fontSize: 18,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between'
  },
  settingsRowBottom: {
    marginTop: 16
  },
  settingsField: {
    flex: 1
  },
  settingsLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444'
  }
});
