# Incident Lifecycle Management Strategy

## 🎯 Business Rules

### **Incident States & Timeouts:**
```
1. OPEN (0-4 hours)     → Active, driver should respond
2. STALE (4-6 hours)    → Auto-escalate, send reminder
3. EXPIRED (6+ hours)   → Auto-close, no further action
4. ACKNOWLEDGED        → Driver responded, ETA provided
5. RESOLVED            → Driver marked as resolved
```

### **Performance Impact:**
- ✅ **Query efficiency**: Only search recent incidents (< 6 hours)
- ✅ **Database size**: Auto-cleanup prevents infinite growth
- ✅ **User experience**: Clear expectations for response times

## 🚀 Implementation Options

### **Option A: Database Triggers (Recommended)**
```sql
-- Auto-expire incidents older than 6 hours
CREATE OR REPLACE FUNCTION auto_expire_incidents()
RETURNS void AS $$
BEGIN
    UPDATE incidents 
    SET status = 'expired', resolved_at = NOW()
    WHERE status IN ('open', 'acknowledged') 
      AND created_at < NOW() - INTERVAL '6 hours';
END;
$$ LANGUAGE plpgsql;

-- Run every hour via cron
SELECT cron.schedule('expire-incidents', '0 * * * *', 'SELECT auto_expire_incidents();');
```

### **Option B: Application-Level Cleanup**
- Run cleanup when app starts
- Background job every hour
- Manual cleanup endpoint

### **Option C: Supabase Edge Functions**
- Serverless function triggered by cron
- Better for multi-tenant scenarios
- More complex setup

## 🔍 Underlying Issues You Should Consider

### **1. Business Logic Questions:**
- **What's the driver SLA?** (We suggest 4-6 hours max)
- **Should we send reminders?** (Text driver at 4 hours?)
- **What about overnight incidents?** (Different rules?)
- **Peak hours vs off-hours?** (Adjust timeouts?)

### **2. User Experience Issues:**
- **Scanner expectations**: How long should they wait?
- **Driver notifications**: Multiple pings or just one?
- **Escalation path**: What if driver doesn't respond?

### **3. System Architecture Issues:**
- **Database growth**: Without cleanup, performance degrades
- **Query patterns**: Always filter by time for performance
- **Monitoring**: Track incident resolution rates
- **Analytics**: Which areas have most incidents?

### **4. Edge Cases:**
- **Driver on vacation**: Auto-expire to prevent infinite waiting
- **False reports**: Prevent spam/abuse
- **Emergency incidents**: Different rules for severity levels?

## 📊 Recommended Implementation

### **Phase 1: Immediate (This Week)**
1. ✅ Run the SQL cleanup (your 92 incidents)
2. ✅ Implement 6-hour auto-expiry function
3. ✅ Update queries to filter by time
4. ✅ Add cron job for daily cleanup

### **Phase 2: Enhanced (Next Sprint)**
1. Add 4-hour "stale" status
2. Send reminder notifications
3. Dashboard analytics
4. Better mobile notifications

### **Phase 3: Advanced (Future)**
1. ML-based incident categorization
2. Dynamic timeout based on location/time
3. Integration with city traffic systems
4. Automated resolution suggestions
