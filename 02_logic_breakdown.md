# Entities

**Agency** – Organization that manages multiple clients and their marketing performance.

**Client** – Business or individual entity served by an agency for marketing services.

**Lead** – Potential client entity before conversion to active client status.

**Sales Call** – Individual logged interaction between agency and client for tracking show/close outcomes.

**Campaign** – Grouping mechanism for organizing calls, spend, and performance outcomes.

**Performance Metric** – Aggregated calculated values representing Show Rate, Close Rate, ROI, and other KPIs.

**Financial Record** – Individual ad spend entries and payment transactions.

**Integration Source** – External system or platform providing data to the dashboard.

**Role** – Access definition template specifying permissions and capabilities.

**Custom Stage** – Agency-defined pipeline step for lead or client progression.

**User Feedback** – Ratings, notes, or comments tied to specific calls or interactions.

**Report Template** – Saved dashboard configurations or recurring export definitions.

# Attributes vs Properties

## Agency
*Fixed Attributes:*
- Registration Date (when agency joined platform)
- Subscription Plan (tier of service)

*Variable Properties:*
- Agency Name
- Contact Information
- Billing Address
- Active Status

## Client
*Fixed Attributes:*
- Onboarding Date (when client relationship began)
- Contact Info (primary contact details)

*Variable Properties:*
- Client Name
- Industry Classification
- Account Status
- Billing Information

## Lead
*Fixed Attributes:*
- Lead Source (how lead was acquired)
- Initial Contact Date

*Variable Properties:*
- Lead Name
- Contact Information
- Qualification Status
- Conversion Probability

## Sales Call
*Fixed Attributes:*
- Scheduled Date/Time (planned meeting time)
- Duration (length of call)

*Variable Properties:*
- Call Outcome
- Notes and Comments
- Follow-up Actions
- Attendee List

## Campaign
*Fixed Attributes:*
- Start Date (campaign launch)
- End Date (campaign conclusion)

*Variable Properties:*
- Campaign Name
- Campaign Status
- Budget Allocation
- Target Metrics

## Performance Metric
*Fixed Attributes:*
- Calculation Method (formula used)
- Metric Type (Show Rate, Close Rate, etc.)

*Variable Properties:*
- Calculated Value
- Time Period
- Comparison Baseline
- Trend Direction

## Financial Record
*Fixed Attributes:*
- Transaction Date
- Amount

*Variable Properties:*
- Payment Status
- Transaction Type
- Currency
- Reference Number

## Integration Source
*Fixed Attributes:*
- Provider Name (Meta, Whop, Stripe, etc.)
- Connection ID (unique identifier)

*Variable Properties:*
- Data Sync Status
- Last Sync Time
- Authentication Status
- API Version

## Role
*Fixed Attributes:*
- Role Type (Admin, Agency User, Client User)
- Permissions (access rights)

*Variable Properties:*
- Role Name
- Description
- Active Status

## Custom Stage
*Fixed Attributes:*
- Stage Order (sequence in pipeline)

*Variable Properties:*
- Stage Name
- Stage Description
- Completion Criteria
- Active Status

## User Feedback
*Fixed Attributes:*
- Feedback Date
- Feedback Type

*Variable Properties:*
- Rating Score
- Comments
- Feedback Status
- Response Actions

## Report Template
*Fixed Attributes:*
- Template Type (dashboard, export, etc.)

*Variable Properties:*
- Template Name
- Configuration Settings
- Schedule Frequency
- Active Status

# Relations

**Agency —Manages→ Client** (1-N) - One agency can manage multiple clients

**Lead —Converts Into→ Client** (1-1) - One lead converts to one client (optional conversion)

**Client —Generates→ Sales Call** (1-N) - One client can have multiple sales calls

**Sales Call —Contributes to→ Performance Metric** (N-1) - Multiple calls contribute to one metric

**Campaign —Groups→ Sales Call** (1-N) - One campaign groups multiple sales calls

**Campaign —Groups→ Financial Record** (1-N) - One campaign groups multiple financial records

**Integration Source —Feeds Data→ Financial Record** (1-N) - One integration feeds multiple financial records

**Role —Grants Access→ User Data** (1-N) - One role grants access to multiple users

**Client —Provides→ User Feedback** (1-N) - One client can provide multiple feedback entries

**Custom Stage —Defines Path→ Lead** (1-N) - One stage can apply to multiple leads

**Custom Stage —Defines Path→ Client** (1-N) - One stage can apply to multiple clients

**Report Template —Summarizes→ Performance Metric** (1-N) - One template can include multiple metrics

**Report Template —Summarizes→ Financial Record** (1-N) - One template can include multiple financial records

**Agency —Defines→ Custom Stage** (1-N) - One agency can define multiple custom stages

**Agency —Creates→ Report Template** (1-N) - One agency can create multiple report templates

# Review Checklist [PENDING REVIEW]

**Entities with no attributes:**
- None identified - all entities have both fixed attributes and variable properties

**Attributes that might be properties (and vice-versa):**
- Agency Name could be considered fixed if it's legally registered
- Client Name might be fixed if it's the legal business name
- Campaign Name could be fixed once created
- Role Name might be fixed if it's a system-defined role

**Relations lacking clear cardinality:**
- All relations have clear cardinality defined
- Some relations could benefit from optionality clarification (e.g., Lead conversion is optional)

**Additional considerations:**
- Need to clarify if Performance Metrics are calculated in real-time or stored
- Integration Source relationships might need more detail about data flow direction
- User entity is referenced in relations but not explicitly defined in entity list
