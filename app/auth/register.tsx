import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Briefcase, Users } from 'lucide-react-native';
import { supabase, UserRole } from '../../lib/supabase';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // التحقق من البيانات
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: formData.role,
          },
        },
      });

      if (error) {
        Alert.alert('خطأ في التسجيل', error.message);
        return;
      }

      Alert.alert(
        'تم التسجيل بنجاح', 
        'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.',
        [
          {
            text: 'حسناً',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );

    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#64748b" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>انضم إلينا</Text>
          <Text style={styles.welcomeSubtitle}>أنشئ حسابك للبدء</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>نوع الحساب</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'candidate' && styles.roleButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, role: 'candidate' }))}
            >
              <User color={formData.role === 'candidate' ? '#fff' : '#64748b'} size={20} />
              <Text style={[
                styles.roleButtonText,
                formData.role === 'candidate' && styles.roleButtonTextActive
              ]}>
                مرشح
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'employer' && styles.roleButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, role: 'employer' }))}
            >
              <Briefcase color={formData.role === 'employer' ? '#fff' : '#64748b'} size={20} />
              <Text style={[
                styles.roleButtonText,
                formData.role === 'employer' && styles.roleButtonTextActive
              ]}>
                صاحب عمل
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الاسم الكامل</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسمك الكامل"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              textAlign="right"
            />
            <User color="#64748b" size={20} />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="أدخل بريدك الإلكتروني"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
            />
            <Mail color="#64748b" size={20} />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>كلمة المرور</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="أدخل كلمة المرور"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry={!showPassword}
              textAlign="right"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff color="#64748b" size={20} />
              ) : (
                <Eye color="#64748b" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="أعد إدخال كلمة المرور"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!showConfirmPassword}
              textAlign="right"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff color="#64748b" size={20} />
              ) : (
                <Eye color="#64748b" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 8,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    marginRight: 12,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
