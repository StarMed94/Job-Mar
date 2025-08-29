import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { User, Settings, LogIn, UserPlus, HelpCircle, Shield } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* حالة عدم تسجيل الدخول */}
        <View style={styles.authSection}>
          <View style={styles.authIcon}>
            <User color="#64748b" size={48} />
          </View>
          <Text style={styles.authTitle}>مرحباً بك في منصة التوظيف</Text>
          <Text style={styles.authDescription}>
            سجل دخولك أو أنشئ حساباً جديداً للاستفادة من جميع الميزات
          </Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/auth/login')}
            >
              <LogIn color="#fff" size={20} />
              <Text style={styles.primaryButtonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/register')}
            >
              <UserPlus color="#3B82F6" size={20} />
              <Text style={styles.secondaryButtonText}>إنشاء حساب جديد</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الخيارات العامة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Settings color="#64748b" size={20} />
              </View>
              <Text style={styles.menuItemText}>الإعدادات العامة</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Shield color="#64748b" size={20} />
              </View>
              <Text style={styles.menuItemText}>الخصوصية والأمان</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <HelpCircle color="#64748b" size={20} />
              </View>
              <Text style={styles.menuItemText}>المساعدة والدعم</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* معلومات التطبيق */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حول التطبيق</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>الإصدار: 1.0.0</Text>
            <Text style={styles.infoText}>© 2025 منصة التوظيف</Text>
            <Text style={styles.infoText}>جميع الحقوق محفوظة</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  authSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authIcon: {
    backgroundColor: '#f1f5f9',
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authButtons: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
});
