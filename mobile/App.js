import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
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

  useEffect(() => {
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

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Electricity Monitor Mobile</Text>
      <Text style={styles.subtitle}>API Host</Text>
      <TextInput
        style={styles.input}
        value={apiBase}
        onChangeText={setApiBase}
        autoCapitalize="none"
        keyboardType="url"
        placeholder="http://192.168.1.100:5000"
      />
      <Button title="Load Stats" onPress={loadStats} disabled={loading} />

      {loading && <ActivityIndicator size="large" style={styles.loading} />}

      {stats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Stats</Text>
          <Text style={styles.statText}>Daily: {stats.daily?.toFixed(2)} kWh</Text>
          <Text style={styles.statText}>Monthly: {stats.monthly?.toFixed(2)} kWh</Text>
          <Text style={styles.statText}>Yearly: {stats.yearly?.toFixed(2)} kWh</Text>
          <Text style={styles.statText}>Previous Reading: {stats.lastReading?.reading ?? 'N/A'} kWh</Text>
          <Text style={styles.cardSmall}>Last timestamp: {stats.lastReading?.timestamp ?? '-'}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add New Reading</Text>
        <TextInput
          style={styles.input}
          value={currentReading}
          onChangeText={setCurrentReading}
          placeholder="Current meter reading"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={stats?.lastReading?.reading?.toString() ?? ''}
          editable={false}
          placeholder="Previous meter reading"
        />
        <TextInput
          style={styles.input}
          value={timestamp}
          onChangeText={setTimestamp}
          placeholder="YYYY-MM-DDTHH:mm"
        />
        <Button title="Save Reading" onPress={saveReading} disabled={loading} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Use emulator host settings on Android: 10.0.2.2</Text>
      </View>
      <StatusBar style="auto" />
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
});
