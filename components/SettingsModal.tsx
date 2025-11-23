import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onResetProgress,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, [visible]);

  const loadNotificationSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('notificationsEnabled');
      setNotificationsEnabled(value === 'true');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Could not save notification settings');
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      '🐍 Reset Progress?',
      'Are you sure? This will kill your snake and reset your streak to 0.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            onResetProgress();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modal}>
            <Text style={styles.title}>Game Options</Text>

            {/* Daily Reminders Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Daily Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified to check in daily
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#D3D3D3', true: Colors.coralOrange }}
                thumbColor={notificationsEnabled ? Colors.white : '#f4f3f4'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>

            {/* Reset Progress Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetProgress}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.limeGreen,
    borderRadius: 30,
    padding: 30,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 24,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.darkBrown,
    opacity: 0.7,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: Colors.coralOrange,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
