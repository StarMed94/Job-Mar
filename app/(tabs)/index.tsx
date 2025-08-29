import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Search, Briefcase, Users, Clock, TrendingUp } from 'lucide-react-native';
import { supabase, Job, Company } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<(Job & { company: Company })[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalCandidates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // جلب الوظائف المميزة
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (jobsError) throw jobsError;
      
      setFeaturedJobs(jobs || []);

      // جلب الإحصائيات
      const [jobsCount, companiesCount, candidatesCount] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('candidates').select('id', { count: 'exact' })
      ]);

      setStats({
        totalJobs: jobsCount.count || 0,
        totalCompanies: companiesCount.count || 0,
        totalCandidates: candidatesCount.count || 0
      });

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    router.push({
      pathname: '/jobs',
      params: { search: searchQuery }
    });
  };

  const formatJobType = (type: string) => {
    return type === 'fulltime' ? 'دوام كامل' : 'عمل حر';
  };

  const formatSalary = (job: Job) => {
    if (job.type === 'fulltime' && job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ريال/شهر`;
    } else if (job.type === 'freelance' && job.hourly_rate_min && job.hourly_rate_max) {
      return `${job.hourly_rate_min} - ${job.hourly_rate_max} ريال/ساعة`;
    }
    return 'الراتب قابل للتفاوض';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>منصة التوظيف</Text>
          <Text style={styles.headerSubtitle}>اربط بين أصحاب العمل والمواهب</Text>
          
          {/* شريط البحث */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن الوظائف، المهارات، أو الشركات..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Search color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* الإحصائيات */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Briefcase color="#3B82F6" size={24} />
          <Text style={styles.statNumber}>{stats.totalJobs.toLocaleString()}</Text>
          <Text style={styles.statLabel}>وظيفة متاحة</Text>
        </View>
        
        <View style={styles.statCard}>
          <Users color="#10B981" size={24} />
          <Text style={styles.statNumber}>{stats.totalCompanies.toLocaleString()}</Text>
          <Text style={styles.statLabel}>شركة</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp color="#F59E0B" size={24} />
          <Text style={styles.statNumber}>{stats.totalCandidates.toLocaleString()}</Text>
          <Text style={styles.statLabel}>مرشح</Text>
        </View>
      </View>

      {/* روابط سريعة */}
      <View style={styles.quickLinksContainer}>
        <TouchableOpacity 
          style={[styles.quickLinkCard, { backgroundColor: '#3B82F6' }]}
          onPress={() => router.push('/(tabs)/jobs')}
        >
          <Briefcase color="#fff" size={24} />
          <Text style={styles.quickLinkText}>تصفح الوظائف</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickLinkCard, { backgroundColor: '#10B981' }]}
          onPress={() => router.push('/auth/login')}
        >
          <Users color="#fff" size={24} />
          <Text style={styles.quickLinkText}>انضم كمرشح</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickLinkCard, { backgroundColor: '#8B5CF6' }]}
          onPress={() => router.push('/auth/login')}
        >
          <Clock color="#fff" size={24} />
          <Text style={styles.quickLinkText}>انضم كشركة</Text>
        </TouchableOpacity>
      </View>

      {/* الوظائف المميزة */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>الوظائف المميزة</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.sectionLink}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jobsScroll}>
            {featuredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push(`/jobs/${job.id}`)}
              >
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company?.name}</Text>
                </View>
                
                <View style={styles.jobDetails}>
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>{formatJobType(job.type)}</Text>
                  </View>
                  <Text style={styles.jobLocation}>{job.location || 'عن بُعد'}</Text>
                </View>
                
                <Text style={styles.jobSalary}>{formatSalary(job)}</Text>
                
                {job.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {job.skills.length > 3 && (
                      <Text style={styles.moreSkills}>+{job.skills.length - 3}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* معلومات إضافية */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>لماذا تختار منصتنا؟</Text>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Briefcase color="#3B82F6" size={20} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>وظائف متنوعة</Text>
            <Text style={styles.featureDescription}>دوام كامل وعمل حر في جميع المجالات</Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Users color="#10B981" size={20} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>شركات موثوقة</Text>
            <Text style={styles.featureDescription}>نختار الشركات بعناية لضمان جودة التجربة</Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Clock color="#F59E0B" size={20} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>مقابلات مجدولة</Text>
            <Text style={styles.featureDescription}>نظام ذكي لجدولة المقابلات وإدارتها</Text>
          </View>
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
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: width * 0.25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickLinkCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  jobsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#64748b',
  },
  jobDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  jobTagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  jobLocation: {
    fontSize: 12,
    color: '#64748b',
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: '#475569',
  },
  moreSkills: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
