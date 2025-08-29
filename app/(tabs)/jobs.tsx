import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { Search, Filter, MapPin, Clock, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase, Job, Company } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type JobWithCompany = Job & { company: Company };

export default function JobsScreen() {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'fulltime' | 'freelance'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadJobs(true);
  }, [selectedType, searchQuery]);

  const loadJobs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      }

      const currentPage = reset ? 0 : page;
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(currentPage * 10, (currentPage + 1) * 10 - 1);

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setJobs(data || []);
      } else {
        setJobs(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === 10);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('خطأ في تحميل الوظائف:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الوظائف');
    } finally {
      setLoading(false);
    }
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

  const formatLocation = (job: Job) => {
    if (job.location_mode === 'remote') return 'عن بُعد';
    if (job.location_mode === 'hybrid') return `هجين - ${job.location || ''}`;
    return job.location || 'في الموقع';
  };

  const renderJobCard = ({ item: job }: { item: JobWithCompany }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/jobs/${job.id}`)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.jobCompany}>{job.company?.name}</Text>
        </View>
        <View style={styles.jobTypeTag}>
          <Text style={styles.jobTypeText}>{formatJobType(job.type)}</Text>
        </View>
      </View>

      <Text style={styles.jobDescription} numberOfLines={3}>
        {job.description}
      </Text>

      <View style={styles.jobDetails}>
        <View style={styles.jobDetailItem}>
          <MapPin color="#64748b" size={14} />
          <Text style={styles.jobDetailText}>{formatLocation(job)}</Text>
        </View>
        
        <View style={styles.jobDetailItem}>
          <DollarSign color="#64748b" size={14} />
          <Text style={styles.jobDetailText}>{formatSalary(job)}</Text>
        </View>
        
        <View style={styles.jobDetailItem}>
          <Clock color="#64748b" size={14} />
          <Text style={styles.jobDetailText}>
            {new Date(job.created_at).toLocaleDateString('ar-SA')}
          </Text>
        </View>
      </View>

      {job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 4).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {job.skills.length > 4 && (
            <Text style={styles.moreSkills}>+{job.skills.length - 4}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الوظائف المتاحة</Text>
        
        {/* شريط البحث */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن الوظائف..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
          <View style={styles.searchIcon}>
            <Search color="#64748b" size={20} />
          </View>
        </View>

        {/* فلاتر نوع الوظيفة */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {[
            { key: 'all', label: 'الكل' },
            { key: 'fulltime', label: 'دوام كامل' },
            { key: 'freelance', label: 'عمل حر' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedType === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedType(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === filter.key && styles.filterButtonTextActive
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* قائمة الوظائف */}
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMore && !loading) {
            loadJobs(false);
          }
        }}
        onEndReachedThreshold={0.5}
        refreshing={loading && page === 0}
        onRefresh={() => loadJobs(true)}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد وظائف متاحة</Text>
              <Text style={styles.emptySubtext}>جرب تغيير معايير البحث</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && page > 0 ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>جاري تحميل المزيد...</Text>
            </View>
          ) : null
        }
      />
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
    color: '#1e293b',
  },
  searchIcon: {
    marginLeft: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  jobsList: {
    padding: 20,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
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
  jobTypeTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    marginBottom: 12,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobDetailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#475569',
  },
  moreSkills: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
});
