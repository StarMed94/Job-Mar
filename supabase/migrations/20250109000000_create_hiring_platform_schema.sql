/*
# منصة مقابلات التوظيف - إنشاء قاعدة البيانات الأساسية
إنشاء جميع الجداول المطلوبة لمنصة ربط أصحاب العمل بالمواهب مع دعم الدوام الكامل والعمل الحر

## Query Description: 
هذا الاستعلام سينشئ قاعدة بيانات شاملة للمنصة تتضمن إدارة المستخدمين، الشركات، الوظائف، 
المقابلات، العقود، والمدفوعات. يُنصح بأخذ نسخة احتياطية قبل التطبيق في بيئة الإنتاج.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- إنشاء جداول: users، candidates، companies، jobs، applications، interviews، offers، contracts، payments، messages، reviews، analytics
- إضافة فهارس للبحث السريع
- تعريف علاقات المفاتيح الخارجية
- إنشاء وظائف مساعدة

## Security Implications:
- RLS Status: Enabled لجميع الجداول
- Policy Changes: Yes - إضافة سياسات أمان شاملة
- Auth Requirements: تكامل مع Supabase Auth

## Performance Impact:
- Indexes: متعددة للبحث والفلترة
- Triggers: إنشاء ملفات تعريف تلقائية
- Estimated Impact: متوسط - تحسين الأداء للاستعلامات
*/

-- تمكين RLS على مستوى القاعدة
ALTER DATABASE postgres SET row_security = on;

-- إنشاء أنواع البيانات المخصصة
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('fulltime', 'freelance');
CREATE TYPE location_mode AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'interview', 'offer', 'rejected', 'hired');
CREATE TYPE interview_location AS ENUM ('video', 'onsite');
CREATE TYPE offer_status AS ENUM ('sent', 'accepted', 'declined', 'expired');
CREATE TYPE contract_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE work_mode AS ENUM ('freelance', 'fulltime', 'both');

-- جدول المستخدمين الأساسي (يرتبط مع auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    avatar_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المرشحين
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    headline TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    work_modes work_mode[] DEFAULT '{both}',
    hourly_rate_min DECIMAL(10,2),
    hourly_rate_max DECIMAL(10,2),
    location TEXT,
    portfolio_links TEXT[] DEFAULT '{}',
    cv_url TEXT,
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الشركات
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    about TEXT,
    website TEXT,
    logo_url TEXT,
    size_range TEXT,
    location TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الوظائف
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type job_type NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    skills TEXT[] DEFAULT '{}',
    seniority_level TEXT,
    location_mode location_mode DEFAULT 'remote',
    location TEXT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    hourly_rate_min DECIMAL(10,2),
    hourly_rate_max DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التقديمات
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    status application_status DEFAULT 'applied',
    cv_url TEXT,
    cover_letter TEXT,
    portfolio_links TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- جدول المقابلات
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    interviewer_user_id UUID REFERENCES public.users(id),
    title TEXT,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location_type interview_location DEFAULT 'video',
    location_details TEXT,
    meeting_link TEXT,
    notes TEXT,
    outcome TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول العروض
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    type job_type NOT NULL,
    details JSONB,
    salary_amount DECIMAL(12,2),
    hourly_rate DECIMAL(10,2),
    benefits TEXT,
    start_date DATE,
    status offer_status DEFAULT 'sent',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول العقود (للعمل الحر)
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    milestones JSONB DEFAULT '[]',
    total_amount DECIMAL(12,2) NOT NULL,
    escrow_enabled BOOLEAN DEFAULT TRUE,
    commission_percent DECIMAL(5,2) DEFAULT 12.50,
    status contract_status DEFAULT 'active',
    signed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المدفوعات
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    milestone_id TEXT,
    amount_gross DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    amount_net DECIMAL(12,2) NOT NULL,
    payment_provider TEXT DEFAULT 'stripe',
    provider_payment_id TEXT,
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الرسائل
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التقييمات
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES public.contracts(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((to_user_id IS NOT NULL AND to_company_id IS NULL) OR (to_user_id IS NULL AND to_company_id IS NOT NULL))
);

-- جدول الإحصائيات
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'platform', 'company', 'candidate'
    entity_id UUID,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للأداء
CREATE INDEX idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX idx_candidates_skills ON public.candidates USING GIN(skills);
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_type ON public.jobs(type);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills);
CREATE INDEX idx_jobs_active ON public.jobs(is_active);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_start_at ON public.interviews(start_at);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_reviews_from_user_id ON public.reviews(from_user_id);
CREATE INDEX idx_analytics_entity ON public.analytics(entity_type, entity_id);

-- تمكين RLS على جميع الجداول
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمستخدمين
CREATE POLICY "المستخدمون يمكنهم مشاهدة ملفاتهم الشخصية" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "المستخدمون يمكنهم تحديث ملفاتهم الشخصية" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- سياسات RLS للمرشحين
CREATE POLICY "المرشحون يمكنهم مشاهدة ملفاتهم" ON public.candidates
    FOR SELECT USING (user_id = auth.uid() OR TRUE); -- يمكن لأصحاب العمل رؤية المرشحين

CREATE POLICY "المرشحون يمكنهم تحديث ملفاتهم" ON public.candidates
    FOR ALL USING (user_id = auth.uid());

-- سياسات RLS للشركات
CREATE POLICY "الشركات يمكن لأصحابها إدارتها" ON public.companies
    FOR ALL USING (owner_user_id = auth.uid());

CREATE POLICY "الجميع يمكنهم مشاهدة الشركات" ON public.companies
    FOR SELECT USING (TRUE);

-- سياسات RLS للوظائف
CREATE POLICY "أصحاب الشركات يمكنهم إدارة وظائفهم" ON public.jobs
    FOR ALL USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "الجميع يمكنهم مشاهدة الوظائف النشطة" ON public.jobs
    FOR SELECT USING (is_active = TRUE);

-- سياسات RLS للتقديمات
CREATE POLICY "المرشحون يمكنهم رؤية تقديماتهم" ON public.applications
    FOR SELECT USING (
        candidate_id IN (
            SELECT id FROM public.candidates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "أصحاب العمل يمكنهم رؤية تقديمات وظائفهم" ON public.applications
    FOR SELECT USING (
        job_id IN (
            SELECT j.id FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE c.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "المرشحون يمكنهم التقديم للوظائف" ON public.applications
    FOR INSERT WITH CHECK (
        candidate_id IN (
            SELECT id FROM public.candidates WHERE user_id = auth.uid()
        )
    );

-- وظيفة لإنشاء ملف المستخدم تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate')
    );
    
    -- إنشاء ملف مرشح إذا كان الدور candidate
    IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate') = 'candidate' THEN
        INSERT INTO public.candidates (user_id, headline)
        VALUES (NEW.id, 'مرشح جديد');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تشغيل الوظيفة عند إنشاء مستخدم جديد
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- وظيفة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتحديث updated_at على الجداول ذات الصلة
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
