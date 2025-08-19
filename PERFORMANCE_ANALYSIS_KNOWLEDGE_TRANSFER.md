# Block My Wheels - Performance Analysis & Knowledge Transfer

## 🚨 **Executive Summary**

This document details the comprehensive performance investigation and optimization efforts for the Block My Wheels application, specifically addressing critical slowdowns affecting both the scan page (`/t/[numberPlate]`) and stickers page (`/stickers`). The root causes were identified as database performance bottlenecks involving incident accumulation, missing indexes, and profile fetching timeouts.

---

## 📊 **Initial Problem Statement**

### **User Reports:**
- **ScanPage (`/t/[numberPlate]`)**: Loading times of 30+ seconds
- **StickerGenerator (`/stickers`)**: Loading times of 14+ seconds
- **Notify Driver Button**: Not working (related to webhook/session issues)
- **Urgency Counter**: Broken functionality

### **Performance Symptoms:**
```
Before Optimization:
- ScanPage: 30 seconds consistently
- StickerGenerator: 14 seconds (8s timeout + 6s retry)
- Profile Setup Card: Appearing intermittently due to timeouts
```

---

## 🔍 **Root Cause Analysis**

### **Phase 1: Database Diagnostics**

#### **Critical Discovery - 92 Open Incidents:**
```sql
-- Query results from check-database-performance.sql
{
  "total_incidents": 92,
  "recent_incidents": 6,
  "open_incidents": 92,
  "latest_incident": "2025-08-18 02:52:20.55315+00:00"
}
```

**Impact:** The `fetch_scan_page` RPC function was scanning all 92 open incidents without time-based filtering, causing massive performance degradation.

#### **Missing Critical Indexes:**
From index analysis, discovered missing performance-critical indexes:
```sql
-- ❌ MISSING: No owner_id index on stickers table
-- ❌ MISSING: No primary key index on user_profiles(id)
-- ✅ EXISTS: Basic incident indexes but no time-based optimization
```

### **Phase 2: Profile Fetching Bottleneck**

#### **The Common Thread:**
Both pages suffered from the **same profile fetching pattern**:

**AuthContext Profile Fetch Process:**
```typescript
// src/contexts/AuthContext.tsx lines 60-140
1. User authentication triggers profile fetch
2. Query: SELECT * FROM user_profiles WHERE id = userId
3. Initial timeout: 5 seconds → 8 seconds → 15 seconds (various attempts)
4. Retry logic: 2 attempts with 1-second delay
5. Fallback: Continue without profile (shows ProfileSetupCard)
```

**Performance Timeline:**
```
AuthContext Execution:
- Attempt 1: 8 seconds → timeout
- Retry delay: 1 second  
- Attempt 2: 6 seconds → success
- Total: 8 + 1 + 6 = 15 seconds profile loading
```

### **Phase 3: Page-Specific Bottlenecks**

#### **ScanPage Specific Issues:**
1. **RPC Function:** `fetch_scan_page(token)`
2. **Problem:** Query scanned all 92 open incidents without time filtering
3. **Query:** 
   ```sql
   SELECT id, rage_level, status, created_at, acknowledged_at, eta_minutes
   FROM incidents
   WHERE sticker_id = v_sticker.id
   AND status IN ('open', 'acknowledged')  -- No time filter!
   ORDER BY created_at DESC
   LIMIT 1;
   ```

#### **StickerGenerator Specific Issues:**
1. **Hook:** `useUserStickers(user?.id)` 
2. **Query:** Direct table query (not RPC)
   ```typescript
   // src/lib/hooks/useIncidents.ts lines 88-94
   const stickerQuery = supabase
     .from('stickers')
     .select('id, token, plate, style, status, created_at')
     .eq('owner_id', userId)
     .order('created_at', { ascending: false })
     .limit(20)
   ```
3. **Problem:** Missing `owner_id` index causing full table scans

---

## 🚀 **Optimization Implementation**

### **Phase 1: Incident Cleanup & Time-Based Filtering**

#### **1.1 Automatic Incident Cleanup**
**File:** `phase1b-app-level-cleanup.sql`
```sql
CREATE OR REPLACE FUNCTION cleanup_old_incidents()
RETURNS JSON AS $$
DECLARE
    expired_count INTEGER;
    stale_count INTEGER;
BEGIN
    -- Mark incidents as acknowledged after 4 hours
    UPDATE incidents 
    SET status = 'acknowledged'
    WHERE status = 'open'
        AND created_at < NOW() - INTERVAL '4 hours'
        AND created_at > NOW() - INTERVAL '6 hours';
    GET DIAGNOSTICS stale_count = ROW_COUNT;

    -- Auto-expire incidents older than 6 hours
    UPDATE incidents 
    SET status = 'expired', resolved_at = NOW()
    WHERE status IN ('open', 'acknowledged')
        AND created_at < NOW() - INTERVAL '6 hours'
        AND resolved_at IS NULL;
    GET DIAGNOSTICS expired_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'expired_count', expired_count,
        'stale_count', stale_count,
        'cleanup_time', NOW(),
        'message', format('Cleaned up %s expired and %s stale incidents', expired_count, stale_count)
    );
END;
$$ LANGUAGE plpgsql;
```

#### **1.2 Application-Level Cleanup Trigger**
**File:** `src/lib/hooks/useIncidents.ts` lines 10-26
```typescript
// Cleanup trigger in useScanPageData
const lastCleanup = localStorage.getItem('lastIncidentCleanup')
const now = Date.now()
const oneHour = 60 * 60 * 1000

if (!lastCleanup || now - parseInt(lastCleanup) > oneHour) {
  try {
    const cleanupResult = await rpcFunctions.cleanupOldIncidents()
    if (cleanupResult.success) {
      localStorage.setItem('lastIncidentCleanup', now.toString())
    }
  } catch (error) {
    console.warn('[CLEANUP] Cleanup failed, continuing with scan:', error)
  }
}
```

#### **1.3 Time-Based Query Optimization**
**File:** `phase1-safe-optimize-fetch-scan-page.sql`
```sql
-- Added time filter to incident query
SELECT id, rage_level, status, created_at, acknowledged_at, eta_minutes
FROM incidents
WHERE sticker_id = v_sticker.id
    AND status IN ('open', 'acknowledged')
    AND created_at > NOW() - INTERVAL '6 hours'  -- 🚀 KEY OPTIMIZATION
ORDER BY created_at DESC
LIMIT 1;
```

### **Phase 2: Critical Index Creation**

#### **2.1 Missing Indexes Added**
**File:** `fix-critical-missing-indexes.sql`
```sql
-- User stickers performance (StickerGenerator)
CREATE INDEX IF NOT EXISTS idx_stickers_owner_created 
ON stickers(owner_id, created_at DESC);

-- Profile fetching performance (Both pages)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id 
ON user_profiles(id);

-- Composite index (later removed due to conflicts)
CREATE INDEX IF NOT EXISTS idx_stickers_owner_status_created 
ON stickers(owner_id, status, created_at DESC) 
WHERE status = 'active';
```

#### **2.2 Index Conflict Resolution**
**Problem:** Composite index with `WHERE status = 'active'` confused query planner when not filtering by status.

**Solution:** Dropped problematic composite index:
```sql
DROP INDEX IF EXISTS idx_stickers_owner_status_created;
```

### **Phase 3: Profile Fetching Optimization**

#### **3.1 Client-Side Caching**
**File:** `src/contexts/AuthContext.tsx` lines 45-70
```typescript
const [profileCache, setProfileCache] = useState<Map<string, { 
  profile: UserProfile, 
  timestamp: number 
}>>(new Map())

// 5-minute cache check
const cached = profileCache.get(userId)
if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return cached.profile
}
```

#### **3.2 Enhanced Timeout & Retry Logic**
```typescript
const executeQuery = async (attempt: number = 1): Promise<{data: unknown, error: unknown}> => {
  const profileQuery = supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`Profile query timeout after 8 seconds (attempt ${attempt})`)), 8000)
  )
  
  try {
    return await Promise.race([profileQuery, timeoutPromise])
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout') && attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return executeQuery(attempt + 1)
    }
    throw error
  }
}
```

### **Phase 4: React Query Optimizations**

#### **4.1 Aggressive Caching Strategy**
**File:** `src/lib/hooks/useIncidents.ts`
```typescript
// useScanPageData optimizations
staleTime: 2 * 60 * 1000,     // 2 minutes cache
gcTime: 10 * 60 * 1000,       // 10 minutes garbage collection
refetchOnWindowFocus: false,   // Prevent unnecessary refetches
refetchOnMount: false,         // Use cached data when available
retry: 1,                      // Fail fast
retryDelay: 500               // Quick retry

// useUserStickers optimizations  
staleTime: 10 * 60 * 1000,    // 10 minutes cache
gcTime: 30 * 60 * 1000,       // 30 minutes garbage collection
refetchOnWindowFocus: false,
refetchOnMount: false,
retry: 1,
retryDelay: 1000
```

---

## 📈 **Performance Results**

### **ScanPage Optimization Results:**
```
Before: 30 seconds consistently
After:  6 seconds total (with cleanup + caching)
Improvement: 80% reduction in load time
```

### **StickerGenerator Current Status:**
```
Before: 14 seconds (8s profile + 6s stickers)
Current: Still broken - stickers query timing out
Expected: 1-2 seconds after final fix
```

---

## 🚨 **Current Outstanding Issues**

### **Issue 1: StickerGenerator Still Broken**

#### **Symptoms:**
- Page loads but shows "No stickers generated yet"
- Console shows: `[STICKERS] Query failed or timed out: Error: Stickers query timeout after 10 seconds`
- User definitely has multiple stickers in database

#### **Current Status:**
- ✅ Composite index dropped successfully
- ✅ Simple `idx_stickers_owner_created` index exists
- ❌ Direct table query still timing out

#### **Debugging Steps Needed:**
1. Test exact query in Supabase SQL editor:
   ```sql
   EXPLAIN ANALYZE
   SELECT id, token, plate, style, status, created_at 
   FROM stickers 
   WHERE owner_id = 'c4dfa896-fcbe-4e6f-9b43-2dbbb4b37cfd'
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

2. Check if timeout wrapper is masking real errors
3. Verify user has stickers with correct `owner_id`

### **Issue 2: Profile Fetching Still Bottleneck**

#### **Pattern Observed:**
```
Logs show consistent pattern:
1. First attempt: 8 second timeout
2. Retry: 6 seconds success
3. Subsequent loads: Fast (cached)
```

#### **Root Cause Theories:**
1. **Database connection latency:** Initial connections are slow
2. **Index not being used:** `user_profiles(id)` query still doing sequential scan
3. **Supabase infrastructure:** Cold start or geographic latency

---

## 🔧 **Technical Architecture Insights**

### **Query Execution Patterns:**

#### **ScanPage Flow:**
```
1. useAuth() → Profile fetch (8s timeout + 6s retry)
2. useScanPageData() → RPC call (now fast with cleanup + time filter)
3. Page renders → Total ~6-8 seconds (mostly profile)
```

#### **StickerGenerator Flow:**
```
1. useAuth() → Profile fetch (8s timeout + 6s retry)  
2. useUserStickers() → Direct table query (currently broken)
3. Page renders → Currently fails at step 2
```

### **Database Index Strategy:**

#### **Working Indexes:**
```sql
-- Incidents (optimized)
idx_incidents_sticker_status_created ON incidents(sticker_id, status, created_at DESC)

-- Stickers (functional)  
idx_stickers_owner_created ON stickers(owner_id, created_at DESC)
idx_stickers_token ON stickers(token) WHERE status = 'active'

-- User Profiles (added)
idx_user_profiles_id ON user_profiles(id)
```

### **Caching Strategy:**

#### **Client-Side Caching:**
- **Profile Cache:** 5-minute localStorage + Map cache
- **React Query:** Aggressive staleTime settings
- **Incident Cleanup:** 1-hour localStorage tracking

#### **Database Caching:**
- **Supabase:** Built-in connection pooling
- **Query Plans:** Postgres query planner optimization

---

## 📋 **Next Steps & Recommendations**

### **Immediate Actions Required:**

1. **Debug StickerGenerator Query:**
   - Run EXPLAIN ANALYZE on exact failing query
   - Check if index is being used correctly
   - Verify data exists for user

2. **Profile Fetching Investigation:**
   - Test direct SQL query performance in Supabase
   - Consider connection pooling optimization
   - Evaluate geographic latency factors

3. **Error Handling Improvement:**
   - Remove timeout wrapper temporarily to see real errors
   - Add detailed logging for query execution times
   - Implement graceful degradation

### **Long-Term Optimizations:**

1. **Database Architecture:**
   - Implement automatic incident cleanup via scheduled functions
   - Add database-level performance monitoring
   - Consider read replicas for heavy queries

2. **Application Architecture:**
   - Implement service worker caching
   - Add progressive loading patterns
   - Consider GraphQL for complex queries

3. **Monitoring & Alerting:**
   - Add performance metrics tracking
   - Implement error rate monitoring
   - Set up automated performance regression detection

---

## 📚 **Files Modified During Investigation**

### **Database Scripts:**
- `phase1b-app-level-cleanup.sql` - Incident cleanup function
- `fix-critical-missing-indexes.sql` - Essential index creation
- `fix-stickers-index-conflict.sql` - Composite index removal
- `phase1-safe-optimize-fetch-scan-page.sql` - Time-based filtering

### **Application Code:**
- `src/contexts/AuthContext.tsx` - Profile caching & timeout logic
- `src/lib/hooks/useIncidents.ts` - Query optimizations & cleanup trigger
- `src/components/dashboard/IncidentsList.tsx` - Dark theme fixes
- `src/pages/utilities/ScanPage.tsx` - Animation optimization
- `src/interfaces/database.ts` - Interface centralization

### **Performance Metrics:**
- **Before:** 30s (ScanPage), 14s (StickerGenerator)
- **Current:** 6s (ScanPage), Broken (StickerGenerator)
- **Target:** 1-2s (Both pages)

---

## 🎯 **Key Learnings**

1. **Database Performance:** Missing indexes can cause 10x+ performance degradation
2. **Incident Lifecycle:** Automatic cleanup is essential for long-running applications
3. **Profile Fetching:** Cold start latency requires aggressive caching strategies
4. **Index Conflicts:** Composite indexes with WHERE clauses can confuse query planners
5. **Debugging Approach:** Always verify assumptions with EXPLAIN ANALYZE

This knowledge transfer document serves as a comprehensive reference for understanding the performance optimization journey and current technical debt in the Block My Wheels application.
