# WhatsApp Session Management & Smart Template System
## Product Requirements Document (PRD)

---

## 📋 Executive Summary

**Product**: Intelligent WhatsApp Business API session management with progressive escalation for parking notifications

**Goal**: Deliver urgent parking notifications through WhatsApp while gracefully handling session expiration using smart templates, quick reply buttons, and intelligent escalation.

**Core Principle**: **Progressive Escalation** - Start smart, escalate urgently when needed.

---

## 🎯 Problem Statement

### Current Issues:
- ❌ **Session Expiry**: WhatsApp enforces 24-hour session windows
- ❌ **Poor UX**: Requiring users to reply "OK" is terrible design
- ❌ **Lost Notifications**: Critical parking alerts fail when sessions expire
- ❌ **No Fallback**: Single point of failure for urgent communications

### Business Impact:
- **Revenue Loss**: Failed notifications = frustrated users = churn
- **Emergency Risk**: Blocked emergency vehicles due to failed alerts
- **Poor Reputation**: Unreliable service damages brand trust

---

## 🏗️ Solution Architecture

### **1. Session Tracking Strategy**

**Decision: YES to Intelligent Session Tracking** ✅

**Why Session Tracking Makes Sense for Scale:**
- **🎯 Predictable Behavior**: Know exactly when sessions expire
- **⚡ Proactive Management**: Send keep-alive messages before expiration
- **📊 Better Analytics**: Track session health across user base
- **💰 Cost Optimization**: Avoid failed API calls and retries
- **🔮 Future-Proof**: Enables advanced features like scheduling

**Implementation:**
```javascript
// Session Data Structure (stored in n8n memory/database)
{
  phoneNumber: "+60123456789",
  lastUserMessage: "2024-01-15T10:30:00Z",
  sessionStatus: "active|expired|unknown",
  lastNotificationSent: "2024-01-15T09:15:00Z",
  preferredResponseTime: "5min|immediate|flexible",
  escalationHistory: []
}
```

### **2. Smart Template Design Philosophy**

**Primary Universal Template (Session Reactivator):**
```
🚗 PARKING ALERT: Your vehicle {{plate}} needs attention.

Quick actions:
👍 Moving now
⏰ Need 5 minutes  
❓ More details
❌ Can't move

Reply to activate instant notifications.
```

**Escalation Templates (Policy-Compliant Utility Category):**
```
parking_reactivate_v1 (Rage 1-2): "Vehicle {{plate}} needs attention at {{location}}."
parking_nudge_v1 (Rage 2-3): "URGENT: Access needed for {{plate}} at {{location}}."
parking_urgent_v1 (Rage 4): "CRITICAL: Emergency access required for {{plate}}."
parking_emergency_v1 (Rage 5): "EMERGENCY: Immediate access needed for {{plate}} - safety priority."
```

---

## 🔄 Elegant Flow Logic

### **Phase 1: Intelligent Attempt (Smart Approach)**
```mermaid
graph TD
    A[QR Scan + Rage Level] --> B[Check Session Status]
    B -->|Active < 24h| C[Send AI-Generated Message]
    B -->|Expired > 24h| D[Send Universal Smart Template]
    C --> E[Return Success + Direct Delivery]
    D --> F[Wait 5 Minutes for Response]
```

### **Phase 2: Progressive Escalation Logic**
```mermaid
graph TD
    F[Wait 5 Minutes] --> G{User Responded?}
    G -->|Yes| H[Send AI Message]
    G -->|No + Rage ≥ 4| I[Send Rage-Specific Template]
    G -->|No + Rage < 4| J[Log as Template-Only]
    I --> K[Wait 3 Minutes]
    K --> L{Still No Response?}
    L -->|No Response + Rage = 5| M[Send EMERGENCY Template]
    L -->|Response Received| H
    H --> N[Session Reactivated - Success]
    M --> O[Log as Maximum Escalation]
```

### **Phase 3: Graceful Degradation**
```mermaid
graph TD
    O[Maximum Escalation] --> P[Mark User as Non-Responsive]
    J[Template-Only Success] --> Q[Update User Preference]
    P --> R[Future: Use Direct Templates Only]
    Q --> S[Future: Optimize Template Timing]
```

---

## 🎮 Detailed User Experience Flows

### **✅ Happy Path (Active Session)**
```
Scenario: User texted bot 2 hours ago

QR Scan (Rage 3) 
→ Session Check: ACTIVE 
→ Direct AI Message: 
   "Hey! Your BMW ABC-123 is blocking someone with MEDIUM urgency. 
    The blocked person is getting frustrated. Please move it when possible! 🚗"
→ Delivery Status: SUCCESS_DIRECT
```

### **🔄 Smart Recovery (Expired Session)**
```
Scenario: User hasn't texted bot for 3 days

QR Scan (Rage 3) 
→ Session Check: EXPIRED 
→ Smart Template:
   "🚗 PARKING ALERT: Your vehicle ABC-123 needs attention.
    Quick actions: 👍 Moving now | ⏰ Need 5 minutes | ❓ More details"
→ User Clicks: "❓ More details" 
→ Session Reactivated 
→ AI Message:
   "Thanks for responding! Someone is blocked by your BMW ABC-123 with MEDIUM urgency..."
→ Delivery Status: SUCCESS_TEMPLATE_RECOVERY
```

### **🚨 Escalation Path (Non-Responsive User)**
```
Scenario: High rage, user doesn't respond to smart template

QR Scan (Rage 4) 
→ Session Check: EXPIRED 
→ Smart Template: Sent
→ Wait 5 minutes: NO RESPONSE
→ Rage-Specific Template:
   "🔥 CRITICAL: ABC-123 causing major disruption. Move NOW:
    👍 Moving immediately | ⏰ Need 2 minutes | 🆘 Emergency situation"
→ Wait 3 minutes: STILL NO RESPONSE (Rage = 5)
→ Emergency Template:
   "💀 EMERGENCY: ABC-123 blocking emergency access. MOVE IMMEDIATELY.
    This is your final notification. Further action may be taken."
→ Delivery Status: MAXIMUM_ESCALATION_REACHED
```

---

## 📊 Scaling Architecture

### **Session Health Management (Policy-Compliant)**
```javascript
// Automated Session Maintenance (User-Controlled, Template-Based)
Monthly (User Opt-In Only):
  1. Check users who opted-in for maintenance messages
  2. Send approved UTILITY/MARKETING templates only:
     - "Monthly parking reminder: Your sticker {{plate}} is active ✅"
     - "Parking preferences: [Urgent only] [All alerts] [Stop]"
  3. Track opt-outs and response rates
  4. Respect user preferences (Urgent/All/Stop)

Session Analytics Dashboard:
  - Active Sessions: 1,247 users (73%)
  - Expiring Soon: 89 users (5%)
  - Template Recovery Rate: 67%
  - Escalation Prevention: 91%
  - Opt-in Rate: 45% (for maintenance messages)
```

### **Performance Optimization**
- **Cache Session Status**: Store in Redis for 1 hour
- **Batch Session Checks**: Update 100 users every 30 minutes
- **Rate Limit Templates**: Max 1 template per user per hour
- **Queue Management**: Prioritize by rage level (5 = immediate, 1 = 5min delay)
- **Template A/B Testing**: Optimize button text and success rates

---

## 🎯 Technical Implementation Details

### **n8n Workflow Architecture (Policy-Compliant Router)**
```javascript
// Main Notification Workflow
Nodes:
1. Webhook Trigger (receives: phoneNumber, rageLevel, plate, timestamp)
2. Session Status Check (query last user message + 72h free entry window)
3. Policy Gate (US number + Marketing template = block)
4. Router Decision:
   - if (in72hFreeEntryWindow || lastInbound < 24h) → FREEFORM
   - else → TEMPLATE(rage)
5. AI Message Generator (for active sessions)
6. Template Sender (UTILITY category, ≤3 buttons)
7. Response Monitor (5-minute timeout)
8. Escalation Engine (policy-safe templates)
9. Success Logger (analytics and metrics)
10. Response Node (structured JSON back to web app)

// Session Maintenance Workflow (Monthly, Opt-In Only)
Nodes:
1. Schedule Trigger (monthly)
2. Opt-In User Scanner (only users who consented)
3. Template Message Sender (UTILITY/MARKETING categories)
4. Opt-Out Handler ([Stop] button responses)
5. Preference Manager (Urgent/All/Stop settings)
```

### **Expected n8n Response Format**
```javascript
// Successful Direct Delivery
{
  "status": "success",
  "deliveryMethod": "direct",
  "sessionStatus": "active",
  "messageId": "wamid.xxx...",
  "escalationLevel": 0,
  "aiMessage": "Generated message content...",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Template Recovery Success
{
  "status": "success", 
  "deliveryMethod": "smart_template",
  "sessionStatus": "reactivated",
  "messageId": "wamid.yyy...",
  "escalationLevel": 1,
  "templateUsed": "universal_smart",
  "userResponse": "more_details",
  "followUpSent": true,
  "timestamp": "2024-01-15T10:35:00Z"
}

// Maximum Escalation Reached
{
  "status": "delivered_with_escalation",
  "deliveryMethod": "emergency_template", 
  "sessionStatus": "expired",
  "messageId": "wamid.zzz...",
  "escalationLevel": 3,
  "templateUsed": "emergency_level_5",
  "userResponse": null,
  "maxEscalationReached": true,
  "timestamp": "2024-01-15T10:43:00Z"
}
```

---

## 🎨 Template Content Strategy

### **Smart Template Features**
- **🎯 Variable Substitution**: {{plate}}, {{urgency}}, {{location}}
- **👆 Quick Reply Buttons**: Reduce typing friction
- **⚡ Action-Oriented Language**: Clear next steps
- **🔥 Urgency Indicators**: Visual cues for importance
- **🔄 Response Incentives**: "Reply to activate instant notifications"

### **Quick Reply Button Strategy (≤3 Buttons Per Message)**
```javascript
Universal Template Buttons (Max 3):
👍 "Moving now" → Response: immediate_action
⏰ "Need 5 min" → Response: short_delay  
❓ "More details" → Response: want_info

Escalation Template Buttons (Max 3):
🚨 "Moving now" → Response: emergency_action
⏰ "Need 5 min" → Response: minimal_delay
❌ "Can't move" → Response: unable_comply

Note: Meta enforces ≤3 quick-reply buttons per message for universal compatibility
```

### **Template Approval Strategy (Policy-Compliant Categories)**
```
Template Categories for WhatsApp Approval (Meta Official Categories Only):
1. UTILITY - All parking alerts & rage-based escalations
   - parking_reactivate_v1, parking_nudge_v1, parking_urgent_v1, parking_emergency_v1
2. MARKETING - User preferences & opt-in management (Malaysia OK, US gated from Apr 2025)
   - prefs_update_v1

Approval Timeline: 
- Submit all templates: Week 1
- WhatsApp review: 3-5 business days
- Revisions if needed: 2-3 days
- Go-live: Week 2

Note: Malaysia users unaffected by US Marketing template pause
```

---

## 📈 Success Metrics & KPIs

### **Primary KPIs**
- **📊 Session Recovery Rate**: % users who respond to smart template (Target: >60%)
- **⚡ Escalation Prevention**: % resolved without rage templates (Target: >85%) 
- **⏱️ Response Time**: Avg time from QR scan to user action (Target: <3 minutes)
- **✅ Template Effectiveness**: Which buttons get clicked most (Optimize monthly)
- **💰 Cost Efficiency**: Cost per successful notification (Target: <$0.05)

### **Secondary Metrics**
- **❤️ Session Health**: % active sessions over time (Target: >70%)
- **🎯 User Satisfaction**: Complaint rates and positive feedback (Target: <2% complaints)
- **📱 Keep-Alive Success**: Response rate to maintenance messages (Target: >30%)
- **🔄 Template Recovery**: Time to reactivate expired sessions (Target: <2 minutes)
- **🚨 Emergency Effectiveness**: Rage 5 resolution rate (Target: >95%)

### **Analytics Dashboard**
```javascript
Real-Time Metrics:
- Active Sessions: 1,247 users (73% of total)
- Templates Sent Today: 89 (67% recovery rate)
- Escalations Today: 12 (8% of total notifications)
- Average Response Time: 2.3 minutes
- Cost per Notification: $0.03

Weekly Trends:
- Session Recovery: ↑ 5% from last week
- Template Performance: Smart template 89% effective
- Escalation Prevention: ↑ 12% improvement
- User Satisfaction: 4.6/5 average rating
- Emergency Response: 97% resolution rate
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**
**MVP Core Features**
- ✅ Session tracking in n8n database
- ✅ Universal smart template creation & WhatsApp approval
- ✅ Basic session check → direct message OR smart template flow
- ✅ Web app payload enhancement (add session fields)
- ✅ n8n response handling in frontend

**Deliverables:**
- Session tracking database schema
- 1 approved universal smart template
- Basic n8n workflow (session check + routing)
- Updated web app webhook integration
- Basic success/failure response handling

### **Phase 2: Intelligence (Week 2-3)**
**Progressive Escalation Engine**
- ✅ Rage-based escalation templates (3-5 templates)
- ✅ 5-minute wait + escalation logic
- ✅ Response monitoring and routing
- ✅ User response categorization (moving, delay, unable)
- ✅ Analytics dashboard (basic metrics)

**Deliverables:**
- 5 rage-specific templates (approved)
- Complete escalation workflow in n8n
- Response categorization logic
- Basic analytics tracking
- Escalation success measurement

### **Phase 3: Optimization (Week 3-4)**
**Advanced Features & Polish**
- ✅ Keep-alive automation (session maintenance)
- ✅ Performance tuning and caching
- ✅ Advanced analytics dashboard
- ✅ A/B testing framework for templates
- ✅ Edge case handling and error recovery

**Deliverables:**
- Automated keep-alive system
- Performance optimizations (caching, batching)
- Complete analytics dashboard
- Template A/B testing capability
- Production monitoring and alerting

### **Phase 4: Scale & Enhance (Week 4+)**
**Enterprise Features**
- ✅ Multi-language template support
- ✅ Advanced user preference learning
- ✅ Integration with parking enforcement systems
- ✅ Predictive session management
- ✅ Advanced escalation rules engine

---

## 🛡️ Risk Mitigation

### **Technical Risks**
- **WhatsApp Template Rejection**: Have backup templates ready, start approval early
- **n8n Performance**: Implement caching and queue management
- **Session Tracking Accuracy**: Use multiple validation sources
- **Webhook Failures**: Implement retry logic with exponential backoff

### **Business Risks & Compliance**
- **User Fatigue**: Monthly opt-in templates only, respect preferences
- **Policy Violations**: Use UTILITY/MARKETING categories only, ≤3 buttons
- **US Marketing Gate**: Block Marketing templates to US numbers (Apr 2025+)
- **Cost Variations**: Treat pricing as config-driven (24h/72h free, templates vary by region)
- **Quality Score**: Maintain opt-in practices and value-adding content

### **User Experience Risks**
- **Template Spam**: Smart frequency limits and user preferences
- **Irrelevant Notifications**: Better location and context awareness
- **Language Barriers**: Multi-language templates for diverse user base
- **Accessibility**: Voice-friendly templates for disabled users

---

## 💰 Business Case

### **Current State (Problems)**
- **Lost Revenue**: 30% notification failures = frustrated users = 15% churn
- **Support Costs**: Manual intervention for failed notifications = $2000/month
- **Emergency Risk**: Failed emergency notifications = potential liability
- **Poor NPS**: Unreliable service = 3.2/5 rating

### **Future State (With Smart Templates)**
- **Improved Delivery**: 95% notification success rate (+65% improvement)
- **Reduced Support**: Automated recovery = $1500/month savings
- **Better Safety**: 99.5% emergency notification delivery
- **Higher Satisfaction**: Reliable service = 4.5/5 rating target

### **ROI Calculation**
```
Development Cost: 2 weeks @ $3000/week = $6,000
WhatsApp Template Costs: $0.02/template × 500/day = $300/month
Operational Savings: $1500/month (reduced support)
Revenue Protection: $5000/month (reduced churn)

ROI: ($6500/month - $300/month - $6000/4.3) / $6000 = 80% monthly ROI
Break-even: 1.2 months
Annual Benefit: $74,400
```

---

## 🎯 Success Definition

### **Must-Have Success Criteria**
- ✅ **95% Notification Delivery Rate**: Including template recovery
- ✅ **<3 Minute Average Response Time**: From QR scan to user action
- ✅ **60% Template Recovery Rate**: Users respond to smart templates
- ✅ **<$0.05 Cost Per Notification**: Including all template costs
- ✅ **Zero Emergency Failures**: 100% delivery for rage level 5

### **Nice-to-Have Success Criteria**
- ✅ **70% Session Health**: Users maintain active sessions
- ✅ **4.5/5 User Satisfaction**: Positive feedback on reliability
- ✅ **30% Keep-Alive Response**: Users engage with maintenance messages
- ✅ **<2% Escalation Rate**: Most issues resolved with smart templates
- ✅ **Multi-Language Support**: Templates in 3+ languages

---

## 📋 Policy-Safe Template Examples (Drop-In Ready)

### **parking_urgent_v1 (UTILITY Category)**
```json
{
  "category": "UTILITY",
  "name": "parking_urgent_v1",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "URGENT: Access needed for {{1}} at {{2}}."
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {"type": "QUICK_REPLY", "text": "Moving now"},
        {"type": "QUICK_REPLY", "text": "Need 5 min"}, 
        {"type": "QUICK_REPLY", "text": "Can't move"}
      ]
    }
  ]
}
```

### **prefs_update_v1 (MARKETING Category - Malaysia OK)**
```json
{
  "category": "MARKETING", 
  "name": "prefs_update_v1",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Choose alert preferences for {{1}}."
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {"type": "QUICK_REPLY", "text": "Urgent only"},
        {"type": "QUICK_REPLY", "text": "All alerts"},
        {"type": "QUICK_REPLY", "text": "Stop"}
      ]
    }
  ]
}
```

## 🛡️ Final Compliance Checklist (Pre-Launch)

- ✅ **Template Categories**: Only UTILITY/MARKETING (no custom categories)
- ✅ **Button Limits**: ≤3 quick-reply buttons per message
- ✅ **US Marketing Gate**: Block Marketing templates to US numbers (Apr 2025+)
- ✅ **Session Windows**: 24h + 72h free-entry windows for free-form routing
- ✅ **Keep-Alive**: Monthly, opt-in only, template-based messages
- ✅ **Safe Copy**: Factual, non-threatening language in all templates
- ✅ **Pricing**: Config-driven costs (24h/72h free, regional template pricing)

## 📝 Conclusion

This PRD outlines an **elegant, scalable, and policy-compliant** approach to WhatsApp session management that:

- **🎯 Respects Meta's Rules**: Proper categories, button limits, session windows
- **⚡ Delivers Excellent UX**: Smart templates with quick reply buttons  
- **🔥 Handles Emergencies**: Progressive escalation with safe language
- **📊 Scales Beautifully**: Session tracking with opt-in automation
- **💰 Drives Business Value**: Higher delivery rates and user satisfaction
- **🇲🇾 Malaysia-Optimized**: No US Marketing restrictions affect your users

**Ready to build this policy-proof notification system that works reliably for every user, every time!** 🚀

---

*Document Version: 1.0*  
*Last Updated: January 2024*  
*Author: AI Engineering Team*
